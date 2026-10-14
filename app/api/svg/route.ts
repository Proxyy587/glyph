import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  DEFAULT_ENGINE,
  MAX_PACK_SIZE,
  MAX_PROMPT_LENGTH,
  PACK_CONCURRENCY,
  svgGenerateBodySchema,
  type SvgGenerateBody,
} from "@/lib/api/svg-schema";
import db from "@/lib/db";
import { svgGeneration, type SvgPackItem } from "@/lib/db/svg-schema";
import { extractStyleTokens, generateGlyph, STYLE_GUIDE } from "@/lib/glyph";
import { countPriorRolls, tracePack, traceSingle } from "@/lib/glyph/trace";
import { checkGenerationRateLimit, mapWithConcurrency } from "@/lib/rate-limit";

export const maxDuration = 60;

type Remaining = { minute: number; hour: number; day: number };

function toControls(body: SvgGenerateBody, prompt: string, styleLock?: string) {
  const style =
    body.style && STYLE_GUIDE[body.style] ? String(body.style) : "outline";

  return {
    prompt,
    style,
    strokeWidth: body.strokeWidth ?? 1.5,
    cornerRadius: body.cornerRadius ?? 0,
    padding: body.padding ?? 2,
    viewBoxSize: body.viewBoxSize ?? 24,
    styleLock,
  };
}

/** Postgres undefined_column / undefined_table, possibly wrapped by Drizzle. */
function isMissingSchemaError(error: unknown): boolean {
  for (let e = error, depth = 0; e && depth < 4; depth++) {
    const code = (e as { code?: unknown }).code;
    if (code === "42703" || code === "42P01") return true;
    e = (e as { cause?: unknown }).cause;
  }
  return false;
}

function rateLimitHeaders(remaining: Remaining) {
  return {
    "X-RateLimit-Remaining-Minute": String(remaining.minute),
    "X-RateLimit-Remaining-Hour": String(remaining.hour),
    "X-RateLimit-Remaining-Day": String(remaining.day),
  };
}

// ── Trace engine: image → vector ─────────────────────────────────────────────

async function traceSingleResponse(
  userId: string,
  prompt: string,
  body: SvgGenerateBody,
  remaining: Remaining,
) {
  const roll = await countPriorRolls(userId, prompt);
  const traced = await traceSingle(prompt, body, { userId, roll });

  const [row] = await db
    .insert(svgGeneration)
    .values({
      userId,
      prompt,
      mode: "single",
      generatedSvg: traced.variants[0],
      variants: traced.variants,
      engine: "trace",
      costUsd: traced.costUsd,
    })
    .returning({ id: svgGeneration.id });

  return NextResponse.json(
    {
      id: row?.id,
      svg: traced.variants[0],
      variants: traced.variants,
      saved: true,
    },
    { headers: rateLimitHeaders(remaining) },
  );
}

async function tracePackResponse(
  userId: string,
  packPrompts: string[],
  body: SvgGenerateBody,
  remaining: Remaining,
) {
  const joined = packPrompts.join("\n");
  const roll = await countPriorRolls(userId, joined);
  const traced = await tracePack(packPrompts, body, { userId, roll });

  const allResults: SvgPackItem[] = packPrompts.map((prompt, i) =>
    traced.items[i]
      ? { prompt, svg: traced.items[i] }
      : {
          prompt,
          svg: null,
          error: "Couldn't draw this icon cleanly. Try regenerating the pack.",
        },
  );
  const successCount = allResults.filter((r) => r.svg !== null).length;
  if (successCount === 0) throw new Error("Trace pack produced no icons");

  await db.insert(svgGeneration).values({
    userId,
    prompt: joined,
    mode: "pack",
    generatedSvg: null,
    generatedPack: allResults,
    engine: "trace",
    costUsd: traced.costUsd,
  });

  return NextResponse.json(
    {
      packResults: allResults,
      successCount,
      totalCount: allResults.length,
      saved: true,
    },
    { headers: rateLimitHeaders(remaining) },
  );
}

// ── Code engine: LLM writes SVG ──────────────────────────────────────────────

async function codeSingleResponse(
  userId: string,
  prompt: string,
  body: SvgGenerateBody,
  remaining: Remaining,
) {
  const result = await generateGlyph(toControls(body, prompt));

  if (!result.svg) {
    // Persist attempt so failed calls still count toward rate limits.
    await db.insert(svgGeneration).values({
      userId,
      prompt,
      mode: "single",
      generatedSvg: null,
      generatedPack: null,
    });

    return NextResponse.json(
      {
        error:
          "Could not generate a valid SVG. Please try rephrasing your prompt.",
      },
      { status: 422, headers: rateLimitHeaders(remaining) },
    );
  }

  const [row] = await db
    .insert(svgGeneration)
    .values({
      userId,
      prompt,
      mode: "single",
      generatedSvg: result.svg,
      generatedPack: null,
    })
    .returning({ id: svgGeneration.id });

  return NextResponse.json(
    {
      id: row?.id,
      svg: result.svg,
      variants: [result.svg],
      saved: true,
    },
    { headers: rateLimitHeaders(remaining) },
  );
}

async function codePackResponse(
  userId: string,
  packPrompts: string[],
  body: SvgGenerateBody,
  remaining: Remaining,
) {
  const [firstPrompt, ...restPrompts] = packPrompts;

  const firstResult = await generateGlyph(toControls(body, firstPrompt));

  const styleTokens = firstResult.svg
    ? extractStyleTokens(firstResult.svg)
    : "";

  const firstPackItem: SvgPackItem = firstResult.svg
    ? { prompt: firstPrompt, svg: firstResult.svg }
    : {
        prompt: firstPrompt,
        svg: null,
        error: "Could not generate a valid SVG for this prompt.",
      };

  const restResults = await mapWithConcurrency(
    restPrompts,
    PACK_CONCURRENCY,
    async (packPrompt): Promise<SvgPackItem> => {
      try {
        const result = await generateGlyph(
          toControls(body, packPrompt, styleTokens || undefined),
        );
        if (!result.svg) {
          return {
            prompt: packPrompt,
            svg: null,
            error: "Could not generate a valid SVG for this prompt.",
          };
        }
        return { prompt: packPrompt, svg: result.svg };
      } catch (error) {
        console.error("[SVG API] Pack item failed:", error);
        return { prompt: packPrompt, svg: null, error: "Generation failed" };
      }
    },
  );

  const allResults = [firstPackItem, ...restResults];
  const successCount = allResults.filter((r) => r.svg !== null).length;

  await db.insert(svgGeneration).values({
    userId,
    prompt: packPrompts.join("\n"),
    mode: "pack",
    generatedSvg: null,
    generatedPack: allResults,
  });

  return NextResponse.json(
    {
      packResults: allResults,
      successCount,
      totalCount: allResults.length,
      saved: true,
    },
    { headers: rateLimitHeaders(remaining) },
  );
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to generate icons." },
        { status: 401 },
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "Generation is temporarily unavailable." },
        { status: 503 },
      );
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    const parsed = svgGenerateBodySchema.safeParse(json);
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ??
        `Invalid request (prompt ≤ ${MAX_PROMPT_LENGTH} chars, pack ≤ ${MAX_PACK_SIZE}).`;
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const body = parsed.data;
    const userId = session.user.id;
    const engine = DEFAULT_ENGINE;
    const packPrompts = (body.packPrompts ?? [])
      .map((p) => p.trim())
      .filter(Boolean);
    const prompt = body.prompt?.trim() ?? "";
    const requestedUnits = packPrompts.length > 0 ? packPrompts.length : 1;

    const limit = await checkGenerationRateLimit(userId, requestedUnits);
    if (!limit.ok) {
      return NextResponse.json(
        { error: limit.message, limit: limit.limit },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfterSec),
            "X-RateLimit-Limit": limit.limit,
          },
        },
      );
    }

    if (packPrompts.length > 0) {
      if (engine === "trace") {
        try {
          return await tracePackResponse(
            userId,
            packPrompts,
            body,
            limit.remaining,
          );
        } catch (error) {
          console.warn(
            "[SVG API] Trace pack failed, using code engine:",
            error,
          );
        }
      }
      return await codePackResponse(userId, packPrompts, body, limit.remaining);
    }

    if (engine === "trace") {
      try {
        return await traceSingleResponse(userId, prompt, body, limit.remaining);
      } catch (error) {
        console.warn("[SVG API] Trace failed, using code engine:", error);
      }
    }
    return await codeSingleResponse(userId, prompt, body, limit.remaining);
  } catch (e) {
    console.error("[SVG API] Unhandled error:", e);
    if (isMissingSchemaError(e)) {
      console.error(
        "[SVG API] Database schema is behind the code. Run `npm run db:push`.",
      );
    }
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 },
    );
  }
}

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  MAX_PACK_SIZE,
  MAX_PROMPT_LENGTH,
  PACK_CONCURRENCY,
  svgGenerateBodySchema,
} from "@/lib/api/svg-schema";
import db from "@/lib/db";
import { svgGeneration, type SvgPackItem } from "@/lib/db/svg-schema";
import { extractStyleTokens, generateGlyph, STYLE_GUIDE } from "@/lib/glyph";
import {
  checkGenerationRateLimit,
  mapWithConcurrency,
} from "@/lib/rate-limit";

function toControls(
  body: {
    style?: string;
    strokeWidth?: number;
    cornerRadius?: number;
    padding?: number;
    viewBoxSize?: 16 | 24 | 32;
  },
  prompt: string,
  styleLock?: string,
) {
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

function rateLimitHeaders(remaining: {
  minute: number;
  hour: number;
  day: number;
}) {
  return {
    "X-RateLimit-Remaining-Minute": String(remaining.minute),
    "X-RateLimit-Remaining-Hour": String(remaining.hour),
    "X-RateLimit-Remaining-Day": String(remaining.day),
  };
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
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = svgGenerateBodySchema.safeParse(json);
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ??
        `Invalid request (prompt ≤ ${MAX_PROMPT_LENGTH} chars, pack ≤ ${MAX_PACK_SIZE}).`;
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const body = parsed.data;
    const packPrompts = (body.packPrompts ?? [])
      .map((p) => p.trim())
      .filter(Boolean);
    const prompt = body.prompt?.trim() ?? "";
    const requestedUnits = packPrompts.length > 0 ? packPrompts.length : 1;

    const limit = await checkGenerationRateLimit(
      session.user.id,
      requestedUnits,
    );
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

    // ── Pack Mode ────────────────────────────────────────────────────────────
    if (packPrompts.length > 0) {
      const [firstPrompt, ...restPrompts] = packPrompts;

      const firstResult = await generateGlyph(toControls(body, firstPrompt), {
        model: body.model,
      });

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
              { model: body.model },
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
            return {
              prompt: packPrompt,
              svg: null,
              error: "Generation failed",
            };
          }
        },
      );

      const allResults = [firstPackItem, ...restResults];
      const successCount = allResults.filter((r) => r.svg !== null).length;

      await db.insert(svgGeneration).values({
        userId: session.user.id,
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
          stages: firstResult.stages,
          intent: firstResult.intent,
          saved: true,
        },
        { headers: rateLimitHeaders(limit.remaining) },
      );
    }

    // ── Single Mode ──────────────────────────────────────────────────────────
    const result = await generateGlyph(toControls(body, prompt), {
      model: body.model,
    });

    if (!result.svg) {
      // Persist attempt so failed calls still count toward rate limits.
      await db.insert(svgGeneration).values({
        userId: session.user.id,
        prompt,
        mode: "single",
        generatedSvg: null,
        generatedPack: null,
      });

      return NextResponse.json(
        {
          error:
            "Could not generate a valid SVG. Please try rephrasing your prompt.",
          intent: result.intent,
          stages: result.stages,
        },
        { status: 422, headers: rateLimitHeaders(limit.remaining) },
      );
    }

    await db.insert(svgGeneration).values({
      userId: session.user.id,
      prompt,
      mode: "single",
      generatedSvg: result.svg,
      generatedPack: null,
    });

    return NextResponse.json(
      {
        svg: result.svg,
        model: result.usedModel,
        provider: result.provider,
        intent: result.intent,
        stages: result.stages,
        planSource: result.planSource,
        saved: true,
      },
      { headers: rateLimitHeaders(limit.remaining) },
    );
  } catch (e) {
    console.error("[SVG API] Unhandled error:", e);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 },
    );
  }
}

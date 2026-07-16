import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { svgGeneration, type SvgPackItem } from "@/lib/db/svg-schema";
import { extractStyleTokens, generateGlyph, STYLE_GUIDE } from "@/lib/glyph";

export interface SvgApiBody {
  prompt: string;
  style?: keyof typeof STYLE_GUIDE | string;
  strokeWidth?: number;
  cornerRadius?: number;
  padding?: number;
  viewBoxSize?: 16 | 24 | 32;
  packPrompts?: string[];
  model?: string;
}

function toControls(body: SvgApiBody, prompt: string, styleLock?: string) {
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SvgApiBody;

    const packPrompts = (body.packPrompts ?? [])
      .map((p) => p.trim())
      .filter(Boolean);
    const prompt = body.prompt?.trim();

    if (!prompt && packPrompts.length === 0) {
      return NextResponse.json(
        { error: "Enter a prompt and click Generate to see your icon." },
        { status: 400 },
      );
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to generate icons." },
        { status: 401 },
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "Server missing OPENROUTER_API_KEY." },
        { status: 500 },
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
            error: `Invalid SVG: ${firstResult.raw.slice(0, 120)}`,
          };

      const restResults = await Promise.all(
        restPrompts.map(async (packPrompt): Promise<SvgPackItem> => {
          try {
            const result = await generateGlyph(
              toControls(body, packPrompt, styleTokens || undefined),
              { model: body.model },
            );
            if (!result.svg) {
              return {
                prompt: packPrompt,
                svg: null,
                error: `Invalid SVG: ${result.raw.slice(0, 120)}`,
              };
            }
            return { prompt: packPrompt, svg: result.svg };
          } catch (error) {
            return {
              prompt: packPrompt,
              svg: null,
              error:
                error instanceof Error ? error.message : "Generation failed",
            };
          }
        }),
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

      return NextResponse.json({
        packResults: allResults,
        successCount,
        totalCount: allResults.length,
        stages: firstResult.stages,
        intent: firstResult.intent,
        saved: true,
      });
    }

    // ── Single Mode ──────────────────────────────────────────────────────────
    const result = await generateGlyph(toControls(body, prompt!), {
      model: body.model,
    });

    if (!result.svg) {
      return NextResponse.json(
        {
          error:
            "Could not generate a valid SVG. Please try rephrasing your prompt.",
          raw: result.raw.slice(0, 500),
          model: result.usedModel,
          provider: result.provider,
          intent: result.intent,
          stages: result.stages,
        },
        { status: 422 },
      );
    }

    await db.insert(svgGeneration).values({
      userId: session.user.id,
      prompt: prompt!,
      mode: "single",
      generatedSvg: result.svg,
      generatedPack: null,
    });

    return NextResponse.json({
      svg: result.svg,
      model: result.usedModel,
      provider: result.provider,
      intent: result.intent,
      stages: result.stages,
      saved: true,
    });
  } catch (e) {
    console.error("[SVG API] Unhandled error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Generation failed" },
      { status: 500 },
    );
  }
}

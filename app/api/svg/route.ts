import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { cleanupSvg } from "@/lib/svg-cleanup";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { svgGeneration, type SvgPackItem } from "@/lib/db/svg-schema";
import {
  STYLE_GUIDE,
  SYSTEM_PROMPT,
  AMPLIFIER_PROMPT,
  findRelevantExample,
} from "@/lib/svg-prompts";
import {
  OPENROUTER_FREE_MODELS,
  type OpenRouterModelId,
} from "@/lib/openrouter-models";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export interface SvgApiBody {
  prompt: string;
  style?: keyof typeof STYLE_GUIDE;
  strokeWidth?: number;
  cornerRadius?: number;
  padding?: number;
  viewBoxSize?: 16 | 24 | 32;
  packPrompts?: string[];
  model?: string;
}


function buildUserPrompt(body: SvgApiBody, designBrief: string): string {
  const style = body.style && STYLE_GUIDE[body.style] ? body.style : "outline";
  const styleDesc = STYLE_GUIDE[style];
  const size = body.viewBoxSize ?? 24;
  const stroke = body.strokeWidth ?? 1.5;
  const radius = body.cornerRadius ?? 0;
  const padding = body.padding ?? 0;

  const relevantExample = findRelevantExample(body.prompt);
  const isAnimatedRequest =
    /\b(animated|animation|loading|loader|loop|motion|morph)\b/i.test(
      body.prompt,
    );

  let spec = `User request: "${body.prompt.trim()}"\n\n`;
  spec += `Design brief from icon designer:\n${designBrief.trim()}\n\n`;

  if (relevantExample) {
    spec += `${relevantExample}\n`;
  }

  spec += `Icon constraints:\n`;
  spec += `- Style: ${styleDesc}\n`;
  spec += `- ViewBox: 0 0 ${size} ${size}. Icon must be centered`;
  if (padding > 0)
    spec += ` with ${padding}px inner padding (safe area: ${padding} to ${size - padding})`;
  spec += ".\n";
  spec += `- Stroke width: ${stroke}. Use this value for ALL strokes.\n`;
  if (radius > 0) spec += `- Corner radius: ${radius} for all rect elements.\n`;
  spec += `- Use currentColor only. No hardcoded colors.\n`;
  if (isAnimatedRequest) {
    spec += `- This is an animated icon request. Build premium, smooth motion with native SVG animation.\n`;
    spec += `- Prefer 3-9 geometric blocks/segments with staggered timing and gentle ease curves.\n`;
    spec += `- Keep loop seamless and lightweight; avoid visual chaos.\n`;
    spec += `- Optional internal <style> block is allowed only for animation classes/timing.\n`;
  }
  spec += `\nOutput ONLY the single <svg> element. No explanation, no markdown, no code fences.`;
  return spec;
}

async function amplifyPrompt(body: SvgApiBody): Promise<string> {
  const basePrompt = body.prompt?.trim();
  if (!basePrompt) return "";

  try {
    const result = await generateText({
      model: openrouter("openai/gpt-oss-20b:free"),
      system: AMPLIFIER_PROMPT,
      prompt: basePrompt,
      temperature: 0.3,
    });
    return result.text?.trim() || "";
  } catch (error) {
    console.error("[amplifyPrompt] failed:", error);
    return "";
  }
}

function resolveOpenRouterModel(requested?: string): OpenRouterModelId {
  const allowed = new Set<string>(OPENROUTER_FREE_MODELS.map((m) => m.id));
  if (requested && allowed.has(requested)) return requested as OpenRouterModelId;
  return OPENROUTER_FREE_MODELS[0].id;
}

async function generateSingleSvg(body: SvgApiBody) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const provider = "openrouter";
  let raw = "";
  const usedModel = resolveOpenRouterModel(body.model);

  const designBrief = await amplifyPrompt(body);
  const userPrompt = buildUserPrompt(body, designBrief || body.prompt);

  try {
    const response = await generateText({
      model: openrouter(usedModel),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.2,
    });
    raw = response.text ?? "";
  } catch (primaryError) {
    // Fallback router keeps app functional when a chosen free model is temporarily unavailable.
    const fallback = await generateText({
      model: openrouter("openrouter/free"),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.2,
    });
    raw = fallback.text ?? "";
    console.warn(
      `[OpenRouter] Primary model failed (${usedModel}), used openrouter/free fallback.`,
      primaryError,
    );
  }

  const cleaned = cleanupSvg(raw, {
    viewBoxSize: body.viewBoxSize ?? 24,
    strokeWidth: body.strokeWidth,
    cornerRadius: body.cornerRadius,
  });

  return { cleaned, raw, usedModel, provider };
}

async function generateSingleSvgWithRetry(
  body: SvgApiBody,
  retries = 1,
): Promise<{
  cleaned: string | null;
  raw: string;
  usedModel: string;
  provider: string;
}> {
  let lastRaw = "";
  let lastResult: {
    cleaned: string | null;
    raw: string;
    usedModel: string;
    provider: string;
  } | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const bodyForAttempt =
      attempt === 0
        ? body
        : {
            ...body,
            prompt:
              `${body.prompt}\n\n[RETRY INSTRUCTION: Your previous attempt produced invalid or broken SVG. ` +
              `Here is what you output: ${lastRaw.slice(0, 300)}. ` +
              `Fix all structural issues. Ensure paths close correctly, coordinates are within 2–22, ` +
              `and the <svg> element is the only root element.]`,
          };

    try {
      const result = await generateSingleSvg(bodyForAttempt);
      lastResult = result;
      lastRaw = result.raw;

      if (result.cleaned && result.cleaned.includes("<svg")) {
        return result; // Success — return immediately
      }
    } catch (error) {
      console.error(`[attempt ${attempt + 1}] SVG generation error:`, error);
    }
  }

  // Return whatever we have, even if imperfect
  if (lastResult) return lastResult;
  throw new Error("SVG generation failed after all retries");
}

function extractStyleTokens(svg: string): string {
  const strokeWidthMatch = svg.match(/stroke-width="([^"]+)"/);
  const strokeLinecapMatch = svg.match(/stroke-linecap="([^"]+)"/);
  const strokeLinejoinMatch = svg.match(/stroke-linejoin="([^"]+)"/);
  const rxMatch = svg.match(/rx="([^"]+)"/);

  const tokens: string[] = [];
  if (strokeWidthMatch) tokens.push(`stroke-width: ${strokeWidthMatch[1]}`);
  if (strokeLinecapMatch)
    tokens.push(`stroke-linecap: ${strokeLinecapMatch[1]}`);
  if (strokeLinejoinMatch)
    tokens.push(`stroke-linejoin: ${strokeLinejoinMatch[1]}`);
  if (rxMatch) tokens.push(`corner radius (rx): ${rxMatch[1]}`);

  if (tokens.length === 0) return "";

  return (
    `\n[PACK CONSISTENCY: This icon is part of a set. You MUST use these exact style values to match the other icons: ${tokens.join(", ")}. ` +
    `Do not deviate from these values.]`
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SvgApiBody;

    const packPrompts = (body.packPrompts ?? [])
      .map((p) => p.trim())
      .filter(Boolean);
    const prompt = body.prompt?.trim();

    // Validate input
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

    if (packPrompts.length > 0) {
      let styleTokens = "";

      const [firstPrompt, ...restPrompts] = packPrompts;

      const firstResult = await generateSingleSvgWithRetry(
        { ...body, prompt: firstPrompt, packPrompts: undefined },
        1,
      );

      if (firstResult.cleaned) {
        styleTokens = extractStyleTokens(firstResult.cleaned);
      }

      const firstPackItem: SvgPackItem = firstResult.cleaned
        ? { prompt: firstPrompt, svg: firstResult.cleaned }
        : {
            prompt: firstPrompt,
            svg: null,
            error: `Invalid SVG: ${firstResult.raw.slice(0, 120)}`,
          };

      const restResults = await Promise.all(
        restPrompts.map(async (packPrompt): Promise<SvgPackItem> => {
          try {
            const bodyWithStyleLock = {
              ...body,
              prompt: packPrompt + styleTokens,
              packPrompts: undefined,
            };
            const { cleaned, raw } = await generateSingleSvgWithRetry(
              bodyWithStyleLock,
              1,
            );

            if (!cleaned) {
              return {
                prompt: packPrompt,
                svg: null,
                error: `Invalid SVG: ${raw.slice(0, 120)}`,
              };
            }
            return { prompt: packPrompt, svg: cleaned };
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
        saved: true,
      });
    }

    // ── Single Mode ────────────────────────────────────────────────────────────
    const { cleaned, raw, usedModel, provider } =
      await generateSingleSvgWithRetry({ ...body, prompt: prompt! }, 1);

    if (!cleaned) {
      return NextResponse.json(
        {
          error:
            "Could not generate a valid SVG. Please try rephrasing your prompt.",
          raw: raw.slice(0, 500),
          model: usedModel,
          provider,
        },
        { status: 422 },
      );
    }

    // Save to DB
    await db.insert(svgGeneration).values({
      userId: session.user.id,
      prompt: prompt!,
      mode: "single",
      generatedSvg: cleaned,
      generatedPack: null,
    });

    return NextResponse.json({
      svg: cleaned,
      model: usedModel,
      provider,
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

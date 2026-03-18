import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { cleanupSvg } from "@/lib/svg-cleanup";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { svgGeneration, type SvgPackItem } from "@/lib/db/svg-schema";
import {
  STYLE_GUIDE,
  SYSTEM_PROMPT,
  AMPLIFIER_PROMPT,
  findRelevantExample,
} from "@/lib/svg-prompts";

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface SvgApiBody {
  prompt: string;
  style?: keyof typeof STYLE_GUIDE;
  strokeWidth?: number;
  cornerRadius?: number;
  padding?: number;
  viewBoxSize?: 16 | 24 | 32;
  packPrompts?: string[];
  provider?: "openai" | "gemini" | "anthropic";
  model?: string;
}

// const SYSTEM_PROMPT = `You are a world-class SVG icon engineer. You output ONLY valid SVG markup — no markdown, no code fences, no explanation, no comments outside the SVG.

// ABSOLUTE RULES:
// - Output a SINGLE <svg> element. Nothing before or after it.
// - Icons only: simple, recognizable symbols (Lucide / Heroicons / Tabler style). NOT illustrations or realistic art.
// - NO gradients, NO shadows, NO filters (<filter>), NO <image>, NO <foreignObject>.
// - NO width or height attributes on the <svg> element.
// - NO fill="black", stroke="black", fill="white", or any hardcoded colors.
// - ONLY use stroke="currentColor" and/or fill="currentColor".
// - NO scripts, NO event handlers, NO <style> blocks.
// - The <svg> MUST have xmlns="http://www.w3.org/2000/svg" and viewBox="0 0 24 24" (or as specified).
// - Output valid XML that can be directly inlined in HTML.

// GEOMETRY RULES (24×24 grid):
// - Center point is always (12, 12).
// - Standard safe area: x=2 to x=22, y=2 to y=22 (2px padding all sides).
// - Large shapes: rects from ~(3,3) to ~(21,21). Circles: center (12,12) r=8–10.
// - Small detail elements: r=2–3 for dots, r=3–4 for small circles.
// - Horizontal lines: from x=4 or x=5 to x=19 or x=20, centered at y=12.
// - Bezier control points: typically 4–6px from their anchor point.
// - Stroke width 1.5 is the standard. NEVER mix stroke widths in a single icon.
// - ALL shapes must be visually centered — verify the bounding box center ≈ (12, 12).
// - Use as FEW path nodes as possible. Simpler = better. Max 4–6 paths per icon.
// - Prefer <path> over multiple <rect>, <circle>, <line> unless those primitives are cleaner.
// - Rounded corners on rects: use rx="2" as default unless told otherwise.

// QUALITY CHECKLIST before outputting:
// ✓ Is every path closed correctly (Z where needed)?
// ✓ Are all coordinates within the 2–22 safe area?
// ✓ Is the icon visually centered at (12,12)?
// ✓ Is there only one stroke-width value used?
// ✓ Does it use currentColor only?
// ✓ Is it recognizable at 16×16px?

// ${FEW_SHOT_EXAMPLES}`;

// const AMPLIFIER_PROMPT = `You are a senior icon designer who works with developer icon systems like Lucide, Heroicons, and Tabler Icons.

// Your job: take a vague user request and write a PRECISE DESIGN BRIEF that a separate SVG code generator will use.

// Your output must describe:
// 1. The core concept and the simplest visual metaphor for it
// 2. Exact shapes needed (e.g. "a rounded rect 4,4 to 20,20" or "circle centered at 12,12 r=8")
// 3. Stroke style (outline with 1.5px stroke / solid fill), cap and join style
// 4. Specific details to INCLUDE and details to AVOID (no tiny gaps, no more than 5 paths)
// 5. How shapes should be composed and centered on a 24×24 grid

// RULES:
// - Do NOT write any SVG or code whatsoever.
// - Be specific about coordinates and proportions.
// - 3–5 bullet points maximum. Be concise.
// - Think in terms of geometry, not art.
// - Assume Lucide/Heroicons visual language: minimal, clean, 1.5px stroke, rounded caps.`;

function buildUserPrompt(body: SvgApiBody, designBrief: string): string {
  const style = body.style && STYLE_GUIDE[body.style] ? body.style : "outline";
  const styleDesc = STYLE_GUIDE[style];
  const size = body.viewBoxSize ?? 24;
  const stroke = body.strokeWidth ?? 1.5;
  const radius = body.cornerRadius ?? 0;
  const padding = body.padding ?? 0;

  const relevantExample = findRelevantExample(body.prompt);

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
  spec += `\nOutput ONLY the single <svg> element. No explanation, no markdown, no code fences.`;
  return spec;
}

async function amplifyPrompt(body: SvgApiBody): Promise<string> {
  const basePrompt = body.prompt?.trim();
  if (!basePrompt) return "";

  const provider = body.provider || "gemini";

  try {
    if (provider === "openai") {
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        system: AMPLIFIER_PROMPT,
        prompt: basePrompt,
        temperature: 0.3,
      });
      return result.text?.trim() || "";
    }

    if (provider === "anthropic") {
      if (
        !process.env.GEMINI_API_KEY &&
        !process.env.GOOGLE_GENERATIVE_AI_API_KEY
      ) {
        throw new Error("Missing Gemini API key");
      }
      const result = await generateText({
        model: google("gemini-2.5-flash-lite"),
        system: AMPLIFIER_PROMPT,
        prompt: basePrompt,
        temperature: 0.3,
      });
      return result.text?.trim() || "";
    }

    if (
      !process.env.GEMINI_API_KEY &&
      !process.env.GOOGLE_GENERATIVE_AI_API_KEY
    ) {
      throw new Error("Missing Gemini API key");
    }
    const result = await generateText({
      model: google("gemini-2.5-flash-lite"),
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

async function generateSingleSvg(body: SvgApiBody) {
  const provider = body.provider || "gemini";
  let raw = "";
  let usedModel = "";

  const designBrief = await amplifyPrompt(body);
  const userPrompt = buildUserPrompt(body, designBrief || body.prompt);

  if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
    const model = body.model || "gpt-4o";
    usedModel = model;
    const completion = await generateText({
      model: openai(model),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.2,
    });
    raw = completion.text ?? "";
  } else if (provider === "anthropic") {
    if (
      !process.env.GEMINI_API_KEY &&
      !process.env.GOOGLE_GENERATIVE_AI_API_KEY
    ) {
      throw new Error("Missing Gemini API key");
    }
    const model = body.model || "gemini-2.5-flash";
    usedModel = model;
    const response = await generateText({
      model: google(model),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.2,
    });
    raw = response.text ?? "";
  } else if (provider === "gemini") {
    if (
      !process.env.GEMINI_API_KEY &&
      !process.env.GOOGLE_GENERATIVE_AI_API_KEY
    ) {
      throw new Error("Missing Gemini API key");
    }
    const model = body.model || "gemini-2.5-flash";
    usedModel = model;
    const response = await generateText({
      model: google(model),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.2,
    });
    raw = response.text ?? "";
  } else {
    throw new Error(`Unknown provider: ${provider}`);
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

      // Generate all icons in parallel for speed
      // Style lock: inject style tokens from icon #1 into icons #2–N
      // We do a two-phase approach: first icon alone, rest with style lock
      const [firstPrompt, ...restPrompts] = packPrompts;

      // Generate first icon
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

      // Generate remaining icons in parallel, all with style lock
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

      // Save to DB
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

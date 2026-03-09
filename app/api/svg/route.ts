import { NextResponse } from "next/server";
import { cleanupSvg } from "@/lib/svg-cleanup";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const STYLE_GUIDE: Record<string, string> = {
  outline:
    "Outline style: single stroke, no fill. Use path with stroke, no fill. Clean single-weight lines like Lucide or Heroicons outline.",
  solid:
    "Solid style: filled shapes, no stroke. Use path with fill, minimal or no stroke. Like Lucide solid or Phosphor fill.",
  rounded:
    "Rounded style: outline with rounded line caps and joins. stroke-linecap='round' stroke-linejoin='round'. Soft, friendly look.",
  sharp:
    "Sharp style: outline with square caps and miter joins. stroke-linecap='square' stroke-linejoin='miter'. Crisp, technical look.",
  duotone:
    "Duotone style: two colors. Primary fill for main shape, secondary for accent (e.g. inner detail). Use two distinct fill colors.",
};

export interface SvgApiBody {
  prompt: string;
  style?: keyof typeof STYLE_GUIDE;
  strokeWidth?: number;
  cornerRadius?: number;
  padding?: number;
  viewBoxSize?: 16 | 24 | 32;
  // NEW: allow frontend to pick provider/model
  provider?: "openai" | "gemini";
  model?: string; // For openai: "gpt-4o", "gpt-3.5-turbo", etc. For gemini: "gemini-1.5-flash", etc.
}

const SYSTEM_PROMPT = `You are an SVG icon generator. You output ONLY valid SVG markup—no markdown, no code fences, no explanation.

Rules:
- Output a single <svg> element. No wrapping div or text.
- Icons only: simple, recognizable symbols (like Lucide/Phosphor). NOT illustrations, NOT realistic art.
- NO gradients, NO shadows, NO filters, NO images.
- Use minimal paths. Prefer path over many shapes.
- Use stroke for outline icons, fill for solid. One consistent stroke width.
- Use currentColor for stroke/fill so the icon inherits text color.
- viewBox: use 0 0 24 24 unless told otherwise. Keep content centered.
- No script, no event handlers.
- The <svg> element MUST be the root and appear exactly once.
- Do NOT include width or height attributes.
- Do NOT include fill="black" or stroke="black".
- Use stroke="currentColor" and/or fill="currentColor" only.
- If unsure, output the simplest possible icon using basic geometry.
- Output valid XML that can be inlined in HTML.`;

function buildUserPrompt(body: SvgApiBody): string {
  const style = body.style && STYLE_GUIDE[body.style] ? body.style : "outline";
  const styleDesc = STYLE_GUIDE[style];
  const size = body.viewBoxSize ?? 24;
  const stroke = body.strokeWidth ?? 1.5;
  const radius = body.cornerRadius ?? 0;
  const padding = body.padding ?? 0;

  let spec = `Icon: ${body.prompt.trim()}\n`;
  spec += `Style: ${styleDesc}\n`;
  spec += `ViewBox: 0 0 ${size} ${size}. Keep icon centered`;
  if (padding > 0) spec += ` with ${padding}px padding`;
  spec += ".\n";
  spec += `Stroke width: ${stroke}.`;
  if (radius > 0) spec += ` Use corner radius ${radius} for rects.`;
  spec += "\n\nOutput only the single <svg> element, nothing else.";
  return spec;
}

export async function POST(request: Request) {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    const body = (await request.json()) as SvgApiBody;
    if (!body?.prompt?.trim()) {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      );
    }

    const provider = body.provider || "gemini";
    let raw = "";
    let usedModel = "";

    if (provider === "openai") {
      if (!openaiApiKey) {
        return NextResponse.json(
          { error: "Missing OPENAI_API_KEY" },
          { status: 500 }
        );
      }

      const model = body.model || "gpt-4o-mini";
      usedModel = model;

      const userPrompt = buildUserPrompt(body);
      const completion = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: `${SYSTEM_PROMPT}\n\n---\n\n${userPrompt}`,
      });

      console.log("completion", completion);

      raw = completion.text ?? "";
    } else if (provider === "gemini") {
      if (!geminiApiKey) {
        return NextResponse.json(
          { error: "Missing GEMINI_API_KEY" },
          { status: 500 }
        );
      }

      const model = body.model || "gemini-2.5-flash-lite";
      usedModel = model;
      const userPrompt = buildUserPrompt(body);
      const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\n${userPrompt}`;
      const response = await generateText({
        model: google("gemini-2.5-flash-lite"),
        prompt: fullPrompt,
      });

      console.log("response", response);
      raw = response.text ?? "";
    } else {
      return NextResponse.json(
        { error: `Invalid provider: ${provider}` },
        { status: 400 }
      );
    }

    const cleaned = cleanupSvg(raw, {
      viewBoxSize: body.viewBoxSize ?? 24,
      strokeWidth: body.strokeWidth,
      cornerRadius: body.cornerRadius,
    });

    if (!cleaned) {
      return NextResponse.json(
        {
          error: "Model did not return valid SVG",
          raw: raw.slice(0, 500),
          model: usedModel,
          provider,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ svg: cleaned, model: usedModel, provider });
  } catch (e) {
    console.error("SVG API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Generation failed" },
      { status: 500 }
    );
  }
}

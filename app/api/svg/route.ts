import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { cleanupSvg } from "@/lib/svg-cleanup";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { svgGeneration, type SvgPackItem } from "@/lib/db/svg-schema";

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
  packPrompts?: string[];
  provider?: "openai" | "gemini";
  model?: string;
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
-- Output valid XML that can be inlined in HTML.`;

const AMPLIFIER_PROMPT = `You are an expert icon designer and SVG engineer.

Given a short user request for an SVG icon, rewrite it into a precise design brief that describes:
- the core concept and metaphor of the icon
- the key shapes and their composition (for a 24x24 icon grid)
- stroke style (outline or solid), stroke width, corner style
- which visual details to AVOID (too many details, tiny gaps, visual noise)

Rules:
- Do NOT write SVG or code.
- Use 2–4 short paragraphs or bullet points.
- Focus on geometry and composition, not colors or branding.
- Assume a developer-grade icon system (Lucide / Heroicons / Tabler style).`;

function buildUserPrompt(body: SvgApiBody, designBrief: string): string {
  const style = body.style && STYLE_GUIDE[body.style] ? body.style : "outline";
  const styleDesc = STYLE_GUIDE[style];
  const size = body.viewBoxSize ?? 24;
  const stroke = body.strokeWidth ?? 1.5;
  const radius = body.cornerRadius ?? 0;
  const padding = body.padding ?? 0;

  let spec = `User request: ${body.prompt.trim()}\n\n`;
  spec += `Design brief:\n${designBrief.trim()}\n\n`;
  spec += `Icon constraints:\n`;
  spec += `Style: ${styleDesc}\n`;
  spec += `ViewBox: 0 0 ${size} ${size}. Keep icon centered`;
  if (padding > 0) spec += ` with ${padding}px padding`;
  spec += ".\n";
  spec += `Stroke width: ${stroke}.`;
  if (radius > 0) spec += ` Use corner radius ${radius} for rects.`;
  spec += "\n\nOutput only the single <svg> element, nothing else.";
  return spec;
}

async function amplifyPrompt(body: SvgApiBody): Promise<string> {
  const basePrompt = body.prompt?.trim();
  if (!basePrompt) return "";

  const geminiApiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const provider = body.provider || "gemini";

  try {
    if (provider === "openai" && openaiApiKey) {
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: `${AMPLIFIER_PROMPT}\n\nUser request: ${basePrompt}`,
      });
      return result.text?.trim() || "";
    }

    if (provider === "gemini") {
      if (!geminiApiKey) {
        throw new Error(
          "Google Generative AI API key is missing. Pass it using the 'apiKey' parameter or the GOOGLE_GENERATIVE_AI_API_KEY environment variable.",
        );
      }
      const result = await generateText({
        model: google("gemini-2.5-flash-lite"),
        temperature: 0.5,
        system: SYSTEM_PROMPT,
        prompt: `${AMPLIFIER_PROMPT}\n\nUser request: ${basePrompt}`,
      });
      return result.text?.trim() || "";
    }
  } catch (error) {
    console.error("Prompt amplifier failed:", error);
  }

  return "";
}

async function generateSingleSvg(body: SvgApiBody) {
  const geminiApiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const provider = body.provider || "gemini";
  let raw = "";
  let usedModel = "";

  const designBrief = await amplifyPrompt(body);

  if (provider === "openai") {
    if (!openaiApiKey) {
      throw new Error("Missing OPENAI_API_KEY");
    }

    const model = body.model || "gpt-4o-mini";
    usedModel = model;
    const userPrompt = buildUserPrompt(body, designBrief || body.prompt);
    const completion = await generateText({
      model: openai(model),
      prompt: `${SYSTEM_PROMPT}\n\n---\n\n${userPrompt}`,
    });

    raw = completion.text ?? "";
  } else if (provider === "gemini") {
    if (!geminiApiKey) {
      throw new Error(
        "Google Generative AI API key is missing. Pass it using the 'apiKey' parameter or the GOOGLE_GENERATIVE_AI_API_KEY environment variable.",
      );
    }

    const model = body.model || "gemini-2.5-flash-lite";
    usedModel = model;
    const userPrompt = buildUserPrompt(body, designBrief || body.prompt);
    const response = await generateText({
      model: google(model),
      prompt: `${SYSTEM_PROMPT}\n\n---\n\n${userPrompt}`,
    });

    raw = response.text ?? "";
  } else {
    throw new Error(`Invalid provider: ${provider}`);
  }

  const cleaned = cleanupSvg(raw, {
    viewBoxSize: body.viewBoxSize ?? 24,
    strokeWidth: body.strokeWidth,
    cornerRadius: body.cornerRadius,
  });

  return { cleaned, raw, usedModel, provider };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SvgApiBody;
    const packPrompts = (body.packPrompts ?? [])
      .map((value) => value.trim())
      .filter(Boolean);
    const prompt = body.prompt?.trim();

    if (!prompt && packPrompts.length === 0) {
      return NextResponse.json(
        {
          error: "Enter a prompt and click Generate to see your icon.",
        },
        { status: 400 },
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (packPrompts.length > 0) {
      const packResults: SvgPackItem[] = [];
      let lastModel = "";
      let lastProvider = body.provider || "gemini";

      for (const packPrompt of packPrompts) {
        try {
          const { cleaned, raw, usedModel, provider } = await generateSingleSvg(
            {
              ...body,
              prompt: packPrompt,
              packPrompts: undefined,
            },
          );

          lastModel = usedModel;
          lastProvider = provider;

          if (!cleaned) {
            packResults.push({
              prompt: packPrompt,
              svg: null,
              error: `Model did not return valid SVG: ${raw.slice(0, 120)}`,
            });
            continue;
          }

          packResults.push({
            prompt: packPrompt,
            svg: cleaned,
          });
        } catch (error) {
          packResults.push({
            prompt: packPrompt,
            svg: null,
            error: error instanceof Error ? error.message : "Generation failed",
          });
        }
      }

      if (session?.user?.id) {
        await db.insert(svgGeneration).values({
          userId: session.user.id,
          prompt: packPrompts.join("\n"),
          mode: "pack",
          generatedSvg: null,
          generatedPack: packResults,
        });
      }

      return NextResponse.json({
        packResults,
        model: lastModel,
        provider: lastProvider,
        saved: Boolean(session?.user?.id),
      });
    }

    const { cleaned, raw, usedModel, provider } = await generateSingleSvg({
      ...body,
      prompt: prompt!,
    });

    if (!cleaned) {
      return NextResponse.json(
        {
          error: "Model did not return valid SVG",
          raw: raw.slice(0, 500),
          model: usedModel,
          provider,
        },
        { status: 422 },
      );
    }

    if (session?.user?.id) {
      await db.insert(svgGeneration).values({
        userId: session.user.id,
        prompt: prompt!,
        mode: "single",
        generatedSvg: cleaned,
        generatedPack: null,
      });
    }

    return NextResponse.json({
      svg: cleaned,
      model: usedModel,
      provider,
      saved: Boolean(session?.user?.id),
    });
  } catch (e) {
    console.error("SVG API error:", e);
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Generation failed",
      },
      { status: 500 },
    );
  }
}

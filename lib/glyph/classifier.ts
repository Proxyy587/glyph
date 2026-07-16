import { generateObject } from "ai";
import { z } from "zod";
import { GLYPH_CLASSIFY_MODEL, openrouter } from "./provider";

export const IntentSchema = z.object({
  type: z.enum(["icon", "illustration", "logo", "animation", "pattern"]),
  style: z.enum(["outline", "solid", "duotone", "gradient", "animated"]),
  complexity: z.enum(["simple", "medium", "complex"]),
  hasAnimation: z.boolean(),
  colorScheme: z.enum(["monochrome", "brand", "colorful", "gradient"]),
  subject: z.string(),
  suggestedViewBox: z.enum(["0 0 24 24", "0 0 100 100", "0 0 200 60"]),
});

export type GlyphIntent = z.infer<typeof IntentSchema>;

const FALLBACK_INTENT: GlyphIntent = {
  type: "icon",
  style: "outline",
  complexity: "simple",
  hasAnimation: false,
  colorScheme: "monochrome",
  subject: "icon",
  suggestedViewBox: "0 0 24 24",
};

function heuristicIntent(prompt: string, styleHint?: string): GlyphIntent {
  const lower = prompt.toLowerCase();
  const hasAnimation =
    styleHint === "animated" ||
    /\b(animated|animation|loading|loader|loop|motion|morph|spinner)\b/i.test(
      prompt,
    );

  let style: GlyphIntent["style"] = "outline";
  if (styleHint === "solid") style = "solid";
  else if (styleHint === "duotone") style = "duotone";
  else if (styleHint === "animated" || hasAnimation) style = "animated";

  return {
    type: hasAnimation ? "animation" : "icon",
    style,
    complexity: lower.split(/\s+/).length > 8 ? "medium" : "simple",
    hasAnimation,
    colorScheme: "monochrome",
    subject: prompt.trim().slice(0, 120) || "icon",
    suggestedViewBox: "0 0 24 24",
  };
}

export async function classifyIntent(
  prompt: string,
  styleHint?: string,
): Promise<GlyphIntent> {
  try {
    const { object } = await generateObject({
      model: openrouter(GLYPH_CLASSIFY_MODEL),
      schema: IntentSchema,
      system:
        "Classify the SVG generation request. Prefer icon + monochrome unless clearly otherwise. Be precise.",
      prompt: `Classify this SVG request: "${prompt}"${
        styleHint ? `\nUser selected style preset: ${styleHint}` : ""
      }`,
      temperature: 0.1,
    });

    // UI style preset wins when provided
    if (styleHint === "animated") {
      return { ...object, style: "animated", hasAnimation: true };
    }
    if (styleHint === "outline" || styleHint === "solid" || styleHint === "duotone") {
      return { ...object, style: styleHint };
    }
    if (styleHint === "rounded" || styleHint === "sharp") {
      return { ...object, style: "outline" };
    }

    return object;
  } catch (error) {
    console.warn("[classifyIntent] falling back to heuristic:", error);
    return heuristicIntent(prompt, styleHint) ?? FALLBACK_INTENT;
  }
}

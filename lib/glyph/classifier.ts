import { z } from "zod";

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

/**
 * Zero-cost intent classification.
 * Free models often fail generateObject JSON — heuristics are more reliable
 * and save an entire LLM round-trip on every generation.
 */
export function classifyIntent(
  prompt: string,
  styleHint?: string,
): GlyphIntent {
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
  else if (/\bsolid|filled|fill\b/i.test(prompt)) style = "solid";
  else if (/\bduotone\b/i.test(prompt)) style = "duotone";

  const wordCount = lower.split(/\s+/).filter(Boolean).length;

  return {
    type: hasAnimation ? "animation" : "icon",
    style,
    complexity: wordCount > 10 ? "medium" : "simple",
    hasAnimation,
    colorScheme: "monochrome",
    subject: prompt.trim().slice(0, 120) || "icon",
    suggestedViewBox: "0 0 24 24",
  };
}

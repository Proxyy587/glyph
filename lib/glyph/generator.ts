import { generateText } from "ai";
import { classifyIntent, type GlyphIntent } from "./classifier";
import { buildLocalBrief } from "./examples";
import { optimizeSvg } from "./optimizer";
import {
  buildDetailedPrompt,
  GLYPH_SYSTEM_PROMPT,
  type GlyphControls,
} from "./prompts";
import {
  GLYPH_FALLBACK_MODEL,
  openrouter,
  resolveGenerateModel,
} from "./provider";
import {
  hasAnimationMarkup,
  injectFallbackAnimation,
  validateAndFixSvg,
} from "./validator";

export type GlyphStage =
  | "classify"
  | "brief"
  | "generate"
  | "validate"
  | "animate"
  | "optimize";

export type GenerateGlyphResult = {
  svg: string | null;
  raw: string;
  intent: GlyphIntent;
  stages: GlyphStage[];
  usedModel: string;
  provider: "openrouter";
};

async function generateWithFallback(
  modelId: string,
  system: string,
  prompt: string,
  temperature = 0.2,
): Promise<{ text: string; model: string }> {
  const primary = modelId.trim();
  try {
    const { text } = await generateText({
      // Explicit chat() so the UI-selected OpenRouter model is used correctly
      model: openrouter.chat(primary),
      system,
      prompt,
      temperature,
    });
    return { text: text ?? "", model: primary };
  } catch (primaryError) {
    console.warn(
      `[glyph] model ${primary} failed, using fallback ${GLYPH_FALLBACK_MODEL}:`,
      primaryError,
    );
    const { text } = await generateText({
      model: openrouter.chat(GLYPH_FALLBACK_MODEL),
      system,
      prompt,
      temperature,
    });
    return { text: text ?? "", model: GLYPH_FALLBACK_MODEL };
  }
}

/**
 * Cost-lean Glyph pipeline:
 *   heuristic classify → local brief → ONE generate call → validate → optimize
 * Optional LLM critique/animate disabled by default (showcase budget).
 */
export async function generateGlyph(
  controls: GlyphControls,
  options?: { model?: string },
): Promise<GenerateGlyphResult> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const stages: GlyphStage[] = [];
  const generateModel = resolveGenerateModel(options?.model);

  stages.push("classify");
  const intent = classifyIntent(controls.prompt, controls.style);

  stages.push("brief");
  const designBrief = buildLocalBrief(
    controls.prompt,
    intent,
    controls.style,
  );
  const detailedPrompt = buildDetailedPrompt(controls, intent, designBrief);

  stages.push("generate");
  const draft = await generateWithFallback(
    generateModel,
    GLYPH_SYSTEM_PROMPT,
    detailedPrompt,
    0.2,
  );
  const usedModel = draft.model;
  const raw = draft.text;

  stages.push("validate");
  let svg = validateAndFixSvg(raw, {
    viewBoxSize: controls.viewBoxSize,
    strokeWidth: controls.strokeWidth,
    cornerRadius: controls.cornerRadius,
    outline: controls.style !== "solid",
  });

  const needsAnimation =
    intent.hasAnimation ||
    controls.style === "animated" ||
    intent.style === "animated";

  if (svg && needsAnimation && !hasAnimationMarkup(svg)) {
    stages.push("animate");
    // Zero-cost deterministic fallback — no second LLM call
    svg = injectFallbackAnimation(svg);
  }

  if (svg) {
    stages.push("optimize");
    svg = optimizeSvg(svg);
    // Re-validate after SVGO in case it choked earlier on broken attrs
    svg =
      validateAndFixSvg(svg, {
        viewBoxSize: controls.viewBoxSize,
        strokeWidth: controls.strokeWidth,
        cornerRadius: controls.cornerRadius,
        outline: controls.style !== "solid",
      }) ?? svg;
  }

  return {
    svg,
    raw,
    intent,
    stages,
    usedModel,
    provider: "openrouter",
  };
}

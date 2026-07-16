import { generateText } from "ai";
import { classifyIntent, type GlyphIntent } from "./classifier";
import { optimizeSvg } from "./optimizer";
import { resolveVisualPlan } from "./planner";
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
  | "plan"
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
  planSource?: "curated" | "llm" | "fallback";
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
 * Plan-then-draw pipeline:
 * 1. Heuristic classify (free)
 * 2. Visual plan — curated subject DB OR cheap LLM planner
 * 3. Draw with selected quality model + VISUAL PLAN injected
 * 4. Validate → optional anim fallback → SVGO
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
  const wantsAnimation =
    intent.hasAnimation ||
    controls.style === "animated" ||
    intent.style === "animated";

  stages.push("plan");
  const { plan: visualPlan, source: planSource } = await resolveVisualPlan(
    controls.prompt,
    { style: controls.style, wantsAnimation },
  );

  const detailedPrompt = buildDetailedPrompt(controls, intent, visualPlan);

  stages.push("generate");
  const draft = await generateWithFallback(
    generateModel,
    GLYPH_SYSTEM_PROMPT,
    detailedPrompt,
    0.15,
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

  if (svg && wantsAnimation && !hasAnimationMarkup(svg)) {
    stages.push("animate");
    svg = injectFallbackAnimation(svg);
  }

  if (svg) {
    stages.push("optimize");
    svg = optimizeSvg(svg);
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
    planSource,
  };
}

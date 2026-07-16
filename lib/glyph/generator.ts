import { generateText } from "ai";
import { injectAnimation } from "./animator";
import { classifyIntent, type GlyphIntent } from "./classifier";
import { optimizeSvg } from "./optimizer";
import {
  AMPLIFIER_PROMPT,
  buildDetailedPrompt,
  CRITIQUE_PROMPT,
  GLYPH_SYSTEM_PROMPT,
  type GlyphControls,
} from "./prompts";
import {
  GLYPH_CLASSIFY_MODEL,
  GLYPH_FALLBACK_MODEL,
  openrouter,
  resolveGenerateModel,
} from "./provider";
import { hasAnimationMarkup, validateAndFixSvg } from "./validator";

export type GlyphStage =
  | "classify"
  | "brief"
  | "generate"
  | "critique"
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
  try {
    const { text } = await generateText({
      model: openrouter(modelId),
      system,
      prompt,
      temperature,
    });
    return { text: text ?? "", model: modelId };
  } catch (primaryError) {
    console.warn(
      `[glyph] model ${modelId} failed, using fallback ${GLYPH_FALLBACK_MODEL}:`,
      primaryError,
    );
    const { text } = await generateText({
      model: openrouter(GLYPH_FALLBACK_MODEL),
      system,
      prompt,
      temperature,
    });
    return { text: text ?? "", model: GLYPH_FALLBACK_MODEL };
  }
}

async function amplifyBrief(prompt: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openrouter(GLYPH_CLASSIFY_MODEL),
      system: AMPLIFIER_PROMPT,
      prompt,
      temperature: 0.3,
    });
    return text?.trim() || "";
  } catch (error) {
    console.warn("[amplifyBrief] failed:", error);
    return "";
  }
}

export async function generateGlyph(
  controls: GlyphControls,
  options?: { model?: string; skipCritique?: boolean },
): Promise<GenerateGlyphResult> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const stages: GlyphStage[] = [];
  const generateModel = resolveGenerateModel(options?.model);
  let usedModel = generateModel;

  stages.push("classify");
  const intent = await classifyIntent(controls.prompt, controls.style);

  stages.push("brief");
  const designBrief = await amplifyBrief(controls.prompt);
  const detailedPrompt = buildDetailedPrompt(
    controls,
    intent,
    designBrief || controls.prompt,
  );

  stages.push("generate");
  const draft = await generateWithFallback(
    generateModel,
    GLYPH_SYSTEM_PROMPT,
    detailedPrompt,
    0.2,
  );
  usedModel = draft.model;
  let raw = draft.text;

  if (!options?.skipCritique) {
    stages.push("critique");
    const refined = await generateWithFallback(
      usedModel === GLYPH_FALLBACK_MODEL ? GLYPH_FALLBACK_MODEL : generateModel,
      GLYPH_SYSTEM_PROMPT,
      `${CRITIQUE_PROMPT}\n\nUser request: "${controls.prompt}"\nStyle: ${controls.style}\n\nSVG to improve:\n${raw}`,
      0.15,
    );
    usedModel = refined.model;
    if (refined.text.includes("<svg")) {
      raw = refined.text;
    }
  }

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
    const animated = await injectAnimation(
      svg,
      controls.prompt,
      options?.model,
    );
    svg =
      validateAndFixSvg(animated, {
        viewBoxSize: controls.viewBoxSize,
        strokeWidth: controls.strokeWidth,
        cornerRadius: controls.cornerRadius,
        outline: controls.style !== "solid",
      }) ?? animated;
  }

  if (svg) {
    stages.push("optimize");
    svg = optimizeSvg(svg);
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

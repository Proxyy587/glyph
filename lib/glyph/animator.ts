import { generateText } from "ai";
import {
  GLYPH_FALLBACK_MODEL,
  GLYPH_GENERATE_MODEL,
  openrouter,
  resolveGenerateModel,
} from "./provider";
import { extractSvg } from "./validator";

async function runText(
  modelId: string,
  system: string,
  prompt: string,
): Promise<string> {
  try {
    const { text } = await generateText({
      model: openrouter.chat(modelId),
      system,
      prompt,
      temperature: 0.3,
    });
    return text ?? "";
  } catch (primaryError) {
    console.warn(
      `[animator] model ${modelId} failed, trying fallback:`,
      primaryError,
    );
    const { text } = await generateText({
      model: openrouter.chat(GLYPH_FALLBACK_MODEL),
      system,
      prompt,
      temperature: 0.3,
    });
    return text ?? "";
  }
}

/**
 * Inject premium CSS (preferred) or SMIL animation into a static SVG.
 */
export async function injectAnimation(
  svg: string,
  prompt: string,
  modelOverride?: string,
): Promise<string> {
  const model = resolveGenerateModel(modelOverride) || GLYPH_GENERATE_MODEL;

  const text = await runText(
    model,
    `You are an SVG animation expert.
Add CSS animations inside a <style> tag within the SVG (preferred).
Use ONLY CSS or SMIL — no JavaScript.
Animations must be smooth, purposeful, subtle, and loop seamlessly (0.6s–2.4s).
Preserve currentColor and geometry quality.
Return the complete SVG with animations added. Raw SVG only.`,
    `Add beautiful CSS animations to this SVG based on the concept "${prompt}":

${svg}

Prefer patterns: pulse, draw-on (stroke-dashoffset), spin, bounce, or staggered block opacity.
Return the COMPLETE animated SVG.`,
  );

  return extractSvg(text) ?? svg;
}

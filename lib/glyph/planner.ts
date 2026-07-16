import { generateText } from "ai";
import { GLYPH_FALLBACK_MODEL, openrouter, resolvePlanModel } from "./provider";
import { getSubjectHint } from "./subjects";

export const VISUAL_PLANNER_SYSTEM = `You are an SVG layout planner for 24×24 icons.

Describe how to draw the subject as SIMPLE geometric shapes.
Be extremely concrete:
- Exact elements (circle, ellipse, rect, path)
- Approximate coordinates inside viewBox 0 0 24 24 (center is 12,12; keep 2px padding)
- Size of each part
- Fill vs stroke for each part
- Front-to-back order
- If animation is requested: what moves, how much, duration

Rules:
- Describe a RECOGNIZABLE icon of the subject — not abstract decoration
- Prefer 3–8 elements
- No SVG code yet — geometry plan only
- Use currentColor thinking (no hardcoded brand colors unless essential; use opacity for contrast)
- If the subject is a known logo/mascot (Tux, Octocat, React atom, etc.), describe THAT iconic form`;

export type VisualPlanResult = {
  plan: string;
  source: "curated" | "llm" | "fallback";
};

/**
 * Resolve a visual plan:
 * 1. Curated subject DB (free, instant) when aliases match
 * 2. Else cheap LLM planner (scales to any subject)
 * 3. Else tiny heuristic fallback
 */
export async function resolveVisualPlan(
  prompt: string,
  opts?: { style?: string; wantsAnimation?: boolean },
): Promise<VisualPlanResult> {
  const curated = getSubjectHint(prompt);
  if (curated) {
    let plan = curated;
    if (opts?.wantsAnimation) {
      plan += `\nAnimation: add subtle CSS motion that fits the subject (e.g. waddle ±3deg, bob, pulse). 0.8–1.6s ease-in-out infinite.`;
    }
    return { plan, source: "curated" };
  }

  const planModel = resolvePlanModel();

  try {
    const { text } = await generateText({
      model: openrouter.chat(planModel),
      system: VISUAL_PLANNER_SYSTEM,
      prompt: `How would you draw "${prompt.trim()}" as a simple SVG icon in a 24×24 viewBox?

Style hint: ${opts?.style ?? "outline"}
Animation needed: ${opts?.wantsAnimation ? "yes" : "no"}

List each visual element with approximate position/size.
The result must be RECOGNIZABLE as the subject — not abstract circles.`,
      temperature: 0.3,
    });

    const plan = text?.trim();
    if (plan && plan.length > 40) {
      return { plan, source: "llm" };
    }
  } catch (error) {
    console.warn("[resolveVisualPlan] LLM planner failed:", error);
    try {
      const { text } = await generateText({
        model: openrouter.chat(GLYPH_FALLBACK_MODEL),
        system: VISUAL_PLANNER_SYSTEM,
        prompt: `Describe geometric SVG layout for: "${prompt.trim()}" in 24×24. List shapes + coords. Must be recognizable.`,
        temperature: 0.3,
      });
      if (text?.trim()) {
        return { plan: text.trim(), source: "llm" };
      }
    } catch (fallbackError) {
      console.warn(
        "[resolveVisualPlan] fallback planner failed:",
        fallbackError,
      );
    }
  }

  return {
    source: "fallback",
    plan: `SUBJECT: ${prompt.trim()}
Draw the most iconic, instantly recognizable silhouette of this subject.
Use 3–6 simple shapes on a 24×24 grid, optically centered at (12,12), 2px padding.
Prefer distinctive silhouette features over generic circles.
${opts?.wantsAnimation ? "Add subtle looping CSS animation." : ""}`,
  };
}

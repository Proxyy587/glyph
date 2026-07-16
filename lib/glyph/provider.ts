import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

/** Unused for LLM now — kept for env compatibility. Classification is heuristic. */
export const GLYPH_CLASSIFY_MODEL =
  process.env.GLYPH_CLASSIFY_MODEL ?? "openai/gpt-oss-20b:free";

/** Cheap planner model for plan-then-draw (visual description step). */
export const GLYPH_PLAN_MODEL =
  process.env.GLYPH_PLAN_MODEL ?? "openai/gpt-4o-mini";

/** Default generate model — used when UI does not pass a model. */
export const GLYPH_GENERATE_MODEL =
  process.env.GLYPH_GENERATE_MODEL ?? "openai/gpt-4o-mini";

export const GLYPH_FALLBACK_MODEL =
  process.env.GLYPH_FALLBACK_MODEL ?? "openrouter/free";

export function resolveGenerateModel(requested?: string): string {
  const id = requested?.trim();
  if (id) return id;
  return GLYPH_GENERATE_MODEL;
}

export function resolvePlanModel(): string {
  return GLYPH_PLAN_MODEL;
}

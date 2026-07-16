import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const GLYPH_CLASSIFY_MODEL =
  process.env.GLYPH_CLASSIFY_MODEL ?? "openai/gpt-oss-20b:free";

export const GLYPH_GENERATE_MODEL =
  process.env.GLYPH_GENERATE_MODEL ?? "anthropic/claude-sonnet-4";

export const GLYPH_FALLBACK_MODEL =
  process.env.GLYPH_FALLBACK_MODEL ?? "openrouter/free";

export function resolveGenerateModel(requested?: string): string {
  if (requested?.trim()) return requested.trim();
  return GLYPH_GENERATE_MODEL;
}

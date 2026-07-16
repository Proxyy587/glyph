/**
 * Models shown in the Engine dropdown.
 * Quality models first (Glyph Engine default), then free fallbacks.
 */
export const OPENROUTER_FREE_MODELS = [
  {
    id: "openai/gpt-4o-mini",
    label: "GPT-4o Mini",
    provider: "OpenAI",
  },
  // {
  //   id: "anthropic/claude-sonnet-4",
  //   label: "Claude Sonnet 4",
  //   provider: "Anthropic",
  // },
  {
    id: "openai/gpt-4o",
    label: "GPT-4o",
    provider: "OpenAI",
  },
  {
    id: "google/gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    provider: "Google",
  },
  {
    id: "openai/gpt-oss-120b:free",
    label: "GPT OSS 120B",
    provider: "OpenAI",
  },
  {
    id: "openai/gpt-oss-20b:free",
    label: "GPT OSS 20B",
    provider: "OpenAI",
  },
  {
    id: "google/gemma-4-31b-it:free",
    label: "Gemma 4 31B",
    provider: "Google",
  },
  // {
  //   id: "z-ai/glm-4.5-air:free",
  //   label: "GLM 4.5 Air",
  //   provider: "Z.ai",
  // },
  {
    id: "minimax/minimax-m2.5:free",
    label: "MiniMax M2.5",
    provider: "MiniMax",
  },
  {
    id: "qwen/qwen3-coder-480b-a35b-instruct:free",
    label: "Qwen3 Coder 480B",
    provider: "Qwen",
  },
] as const;

export type OpenRouterModelId = (typeof OPENROUTER_FREE_MODELS)[number]["id"];

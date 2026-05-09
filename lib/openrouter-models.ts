export const OPENROUTER_FREE_MODELS = [
  {
    id: "google/gemma-4-31b-it:free",
    label: "Gemma 4 31B (Free)",
    provider: "Google",
  },
  {
    id: "deepseek/deepseek-v3.2",
    label: "DeepSeek V3.2 (Free)",
    provider: "DeepSeek",
  },
  {
    id: "openai/gpt-oss-20b:free",
    label: "GPT OSS 20B (Free)",
    provider: "OpenAI",
  },
  {
    id: "openai/gpt-oss-120b:free",
    label: "GPT OSS 120B (Free)",
    provider: "OpenAI",
  },
  {
    id: "z-ai/glm-4.5-air:free",
    label: "GLM 4.5 Air (Free)",
    provider: "Z.ai",
  },
  {
    id: "minimax/minimax-m2.5:free",
    label: "MiniMax M2.5 (Free)",
    provider: "MiniMax",
  },
  {
    id: "qwen/qwen3-coder-480b-a35b-instruct:free",
    label: "Qwen3 Coder 480B (Free)",
    provider: "Qwen",
  },
] as const;

export type OpenRouterModelId = (typeof OPENROUTER_FREE_MODELS)[number]["id"];

export const STYLES = [
  { id: "outline", label: "Outline" },
  { id: "solid", label: "Solid" },
  { id: "rounded", label: "Rounded" },
  { id: "sharp", label: "Sharp" },
  { id: "duotone", label: "Duotone" },
] as const;

export type StyleId = (typeof STYLES)[number]["id"];

export const VIEWBOX_SIZES = [16, 24, 32] as const;
export type ViewBoxSize = (typeof VIEWBOX_SIZES)[number];

export type GeneratorMode = "single" | "pack";

export type PackItem = {
  prompt: string;
  svg: string | null;
  error?: string;
};

export type SvgOptions = {
  style: StyleId;
  strokeWidth: number;
  cornerRadius: number;
  padding: number;
  viewBoxSize: ViewBoxSize;
};

export const SVG_MODELS = [
  {
    id: "gemini-flash",
    label: "Gemini Flash",
    provider: "gemini" as const,
    model: "gemini-2.5-flash-lite",
    hint: "Fast, cheap, good defaults",
  },
  {
    id: "gemini-pro",
    label: "Gemini Pro",
    provider: "gemini" as const,
    model: "gemini-2.5-pro",
    hint: "Higher fidelity, slower",
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o mini",
    provider: "openai" as const,
    model: "gpt-4o-mini",
    hint: "Balanced quality/speed",
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    provider: "openai" as const,
    model: "gpt-4o",
    hint: "Maximum quality",
  },
] as const;

export type SvgModelId = (typeof SVG_MODELS)[number]["id"];

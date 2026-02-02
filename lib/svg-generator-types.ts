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

import { createHash } from "node:crypto";

/**
 * Deterministic animation presets for traced icons. The model never writes
 * CSS: we pick a preset from the prompt and wrap the whole glyph in a group.
 * Amplitudes are in viewBox units relative to a 24 grid.
 */
export type MotionPreset =
  | "float"
  | "pulse"
  | "waddle"
  | "bounce"
  | "spin"
  | "ring"
  | "shake"
  | "wiggle";

const RULES: [RegExp, MotionPreset][] = [
  [
    /\b(spin|spinning|rotat\w*|loading|loader|gear|cog|settings|refresh|sync|fan)\b/i,
    "spin",
  ],
  [/\b(bell|ring|ringing|alarm|notification)\b/i, "ring"],
  [/\b(heart|love|beat|beating|pulse|pulsing|live|record)\b/i, "pulse"],
  [/\b(penguin|duck|walk|walking|waddl\w*|robot)\b/i, "waddle"],
  [/\b(jump\w*|bounc\w*|ball|rabbit|bunny|frog)\b/i, "bounce"],
  [/\b(shak\w*|error|warning|alert|delete|trash|bin)\b/i, "shake"],
  [/\b(wav\w*|hand|flag|hello|hi)\b/i, "wiggle"],
];

const MOTION_WORDS =
  /\b(animated|animation|animate|moving|motion|loop(?:ing)?|spinning|waddl\w*|bounc\w*|wav(?:e|ing)|shak\w*|pulsing|ringing)\b/i;

export function wantsMotion(prompt: string, style?: string): boolean {
  return style === "animated" || MOTION_WORDS.test(prompt);
}

export function pickMotion(prompt: string): MotionPreset {
  for (const [re, preset] of RULES) if (re.test(prompt)) return preset;
  return "float";
}

function presetCss(preset: MotionPreset, unit: number) {
  const u = (n: number) => `${Math.round(n * unit * 100) / 100}px`;
  switch (preset) {
    case "pulse":
      return {
        origin: "50% 50%",
        timing: "1.2s ease-in-out infinite",
        frames: "0%,100%{transform:scale(1)}50%{transform:scale(1.08)}",
      };
    case "waddle":
      return {
        origin: "50% 100%",
        timing: "0.9s ease-in-out infinite alternate",
        frames: "from{transform:rotate(-6deg)}to{transform:rotate(6deg)}",
      };
    case "bounce":
      return {
        origin: "50% 100%",
        timing: "1s cubic-bezier(.3,0,.3,1) infinite",
        frames: `0%,100%{transform:translateY(0) scale(1,1)}10%{transform:translateY(0) scale(1.04,.96)}45%{transform:translateY(-${u(2)}) scale(.98,1.02)}80%{transform:translateY(0) scale(1,1)}`,
      };
    case "spin":
      return {
        origin: "50% 50%",
        timing: "2.4s linear infinite",
        frames: "from{transform:rotate(0)}to{transform:rotate(360deg)}",
      };
    case "ring":
      return {
        origin: "50% 0%",
        timing: "1.6s ease-in-out infinite",
        frames:
          "0%,50%,100%{transform:rotate(0)}10%{transform:rotate(14deg)}20%{transform:rotate(-12deg)}30%{transform:rotate(8deg)}40%{transform:rotate(-4deg)}",
      };
    case "shake":
      return {
        origin: "50% 50%",
        timing: "1.4s ease-in-out infinite",
        frames: `0%,40%,100%{transform:translateX(0)}8%,24%{transform:translateX(-${u(0.6)})}16%,32%{transform:translateX(${u(0.6)})}`,
      };
    case "wiggle":
      return {
        origin: "50% 90%",
        timing: "1.2s ease-in-out infinite alternate",
        frames: "from{transform:rotate(-10deg)}to{transform:rotate(10deg)}",
      };
    default:
      return {
        origin: "50% 50%",
        timing: "2s ease-in-out infinite",
        frames: `0%,100%{transform:translateY(0)}50%{transform:translateY(-${u(1)})}`,
      };
  }
}

/** Wrap the glyph in a scoped, reduced-motion-safe animated group. */
export function applyMotion(
  svg: string,
  preset: MotionPreset,
  viewBox: number,
): string {
  const open = /^<svg\b[^>]*>/.exec(svg)?.[0];
  if (!open) return svg;

  const id = `gl-${createHash("sha1")
    .update(svg + preset)
    .digest("hex")
    .slice(0, 6)}`;
  const inner = svg.slice(open.length).replace(/<\/svg>\s*$/, "");
  const { origin, timing, frames } = presetCss(preset, viewBox / 24);

  const css =
    `.${id}{transform-box:fill-box;transform-origin:${origin};animation:${id} ${timing}}` +
    `@keyframes ${id}{${frames}}` +
    `@media (prefers-reduced-motion:reduce){.${id}{animation:none}}`;

  return `${open}<style>${css}</style><g class="${id}">${inner}</g></svg>`;
}

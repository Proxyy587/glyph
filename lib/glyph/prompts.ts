import type { GlyphIntent } from "./classifier";
import { GOLDEN_ANCHORS, findRelevantExample } from "./examples";

export const STYLE_GUIDE: Record<string, string> = {
  outline:
    "Outline/stroke-only icon. fill=none everywhere. stroke=currentColor. Lucide weight.",
  solid: "Solid filled icon. fill=currentColor. No strokes.",
  rounded:
    "Outline with stroke-linecap=round and stroke-linejoin=round. Soft, friendly.",
  sharp:
    "Outline with stroke-linecap=square and stroke-linejoin=miter. Crisp, technical.",
  duotone:
    "Two layers: primary fill=currentColor opacity=1, secondary fill=currentColor opacity=0.3.",
  animated:
    "Clean Lucide-grade icon PLUS CSS @keyframes in an internal <style> tag. Motion is subtle and looping.",
};

export const GLYPH_SYSTEM_PROMPT = `You are an elite SVG designer and engineer.
You create pixel-perfect, scalable vector graphics that rival professional icon libraries (Lucide, Heroicons, Tabler).

CRITICAL: When a VISUAL PLAN is provided, you MUST follow it. Draw that subject — every listed part.
Do NOT replace the subject with abstract circles, grids, or decorative geometry.

CANVAS RULES — NON NEGOTIABLE
- viewBox is ALWAYS "0 0 24 24" for icons unless told otherwise
- NEVER place coordinates outside the viewBox bounds
- Allowed: path, circle, rect, line, polyline, polygon, ellipse, g, defs, clipPath, mask,
  linearGradient, radialGradient, animate, animateTransform, animateMotion, style
- Forbidden: script, foreignObject, image, event handlers

STROKE SYSTEM
- stroke="currentColor" / fill="currentColor" only — never hardcode colors
- Use the user stroke-width consistently
- Outline: fill="none". Solid: fill only. Duotone: two opacities of currentColor.
- Caps/joins match style (round unless sharp)

PATH QUALITY
- Minimize nodes; prefer intentional geometry
- Close filled shapes with Z
- Complete valid XML attributes only — never truncated attrs like stroke-

DESIGN QUALITY
- Optically centered; 2px padding; recognizable at 16×16
- Prefer 3–8 elements that READ AS THE SUBJECT

ANIMATION (when requested)
CSS <style> + @keyframes preferred. 0.6–2.4s seamless loops. Subtle.

OUTPUT
ONLY raw SVG. No markdown. No backticks. No explanation.
Start with <svg xmlns="http://www.w3.org/2000/svg" …> and end with </svg>.`;

export const AMPLIFIER_PROMPT = `Write a short geometric design brief. No SVG. 3–5 bullets.`;

export const CRITIQUE_PROMPT = `Improve the SVG for Lucide quality and subject fidelity. Return ONLY raw SVG.`;

export type GlyphControls = {
  prompt: string;
  style: string;
  strokeWidth: number;
  cornerRadius: number;
  padding: number;
  viewBoxSize: number;
  styleLock?: string;
};

export function buildDetailedPrompt(
  controls: GlyphControls,
  intent: GlyphIntent,
  visualPlan: string,
): string {
  const styleKey =
    controls.style && STYLE_GUIDE[controls.style]
      ? controls.style
      : intent.style === "animated"
        ? "animated"
        : intent.style === "solid"
          ? "solid"
          : intent.style === "duotone"
            ? "duotone"
            : "outline";

  const styleDesc = STYLE_GUIDE[styleKey] ?? STYLE_GUIDE.outline;
  const size = controls.viewBoxSize || 24;
  const viewBox =
    intent.type === "illustration"
      ? "0 0 100 100"
      : intent.type === "logo"
        ? "0 0 200 60"
        : `0 0 ${size} ${size}`;

  const complexityInstructions = {
    simple: "Minimal paths. Max 3–4 SVG elements. Clean and iconic.",
    medium: "Moderate detail. 5–8 elements.",
    complex: "Rich but still icon-grade.",
  } as const;

  const pad = controls.padding > 0 ? controls.padding : 2;
  const example = findRelevantExample(controls.prompt);
  const wantsAnim = intent.hasAnimation || styleKey === "animated";

  let spec = `Draw a clean SVG icon.\n\n`;
  spec += `SUBJECT: "${controls.prompt.trim()}"\n`;
  spec += `The icon MUST be recognizable as this subject. Do not invent unrelated abstract shapes.\n\n`;

  if (visualPlan.trim()) {
    spec += `═══════════════════════════════════════\n`;
    spec += `VISUAL PLAN — FOLLOW THIS EXACTLY\n`;
    spec += `═══════════════════════════════════════\n`;
    spec += `${visualPlan.trim()}\n\n`;
  }

  spec += `ViewBox: ${viewBox}\n`;
  spec += `Style: ${styleDesc}\n`;
  spec += `Complexity: ${complexityInstructions[intent.complexity]}\n`;
  spec += `Stroke-width: ${controls.strokeWidth}\n`;
  spec += `Padding: ${pad}px from edges\n`;
  spec += `Color: currentColor only (use opacity for belly/secondary parts)\n`;
  if (controls.cornerRadius > 0) {
    spec += `Corner radius on rects: ${controls.cornerRadius}\n`;
  }
  if (wantsAnim) {
    spec += `Animation: CSS @keyframes in <style>, subtle loop 0.8–1.6s\n`;
  }

  spec += `\n${GOLDEN_ANCHORS}\n`;
  if (example) spec += `\n${example}\n`;
  if (controls.styleLock) spec += `\n${controls.styleLock}\n`;

  spec += `\nOutput ONLY the raw <svg>…</svg>.`;

  return spec;
}

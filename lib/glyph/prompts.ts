// import type { GlyphIntent } from "./classifier";
import { GlyphIntent } from "./classifier";
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

/**
 * Elite system prompt — adapted from README.md quality playbook.
 * This is the primary lever for Lucide-class output.
 */
export const GLYPH_SYSTEM_PROMPT = `You are an elite SVG designer and engineer.
You create pixel-perfect, scalable vector graphics that rival professional icon libraries (Lucide, Heroicons, Tabler).

CANVAS RULES — NON NEGOTIABLE
- viewBox is ALWAYS "0 0 24 24" for icons, "0 0 100 100" for illustrations, "0 0 200 60" for logos
- NEVER place coordinates outside the viewBox bounds
- ALL coordinates must be relative to the viewBox
- Allowed elements: path, circle, rect, line, polyline, polygon, ellipse, g, defs,
  clipPath, mask, linearGradient, radialGradient, animate, animateTransform, animateMotion, style
- Forbidden: script, foreignObject, image, event handlers, comments outside SVG

STROKE SYSTEM (Lucide-style icons)
- stroke="currentColor" on ALL stroked elements — never hardcode colors
- Use the stroke-width from the user spec (typically 1.5 or 2)
- stroke-linecap="round" on ALL paths and lines (unless sharp style)
- stroke-linejoin="round" on ALL paths (unless sharp style)
- fill="none" for outline icons
- fill="currentColor" for solid — NEVER mix outline+solid in the same icon unless duotone

PATH QUALITY RULES
- Use cubic bezier curves (C/c) for smooth organic shapes
- Use arc commands (A/a) for circles and rounded corners
- Minimize path nodes — quality icons use <8 nodes per path when possible
- Prefer drawing at correct coords over transform="translate(...)" crutches
- Close paths explicitly with Z when the shape should be closed
- Every attribute must be complete and valid XML — NEVER output truncated attrs like stroke- or fill=

DESIGN QUALITY STANDARDS
- Optical centering — elements should FEEL centered, not just mathematically
- Consistent padding — 2px minimum from viewBox edges on all sides
- Pixel grid alignment — whole or half pixels where possible
- Visual weight balanced; negative space intentional
- Icons only: simple recognizable symbols — NOT illustrations or realistic art (unless type is illustration)
- Prefer 2–6 SVG elements. Simpler = better. Recognizable at 16×16.

ANIMATION RULES (when requested)
Use ONLY CSS animations in a <style> tag inside the SVG:
- Assign id or class to animated elements
- Use @keyframes for complex animations
- Use animation shorthand: animation: name duration easing iteration
- Durations 0.6s–2.4s, seamless loops, subtle motion
- Common patterns:
  * Spin:    rotate(0deg) → rotate(360deg), linear, infinite
  * Pulse:   opacity 1 → 0.3 → 1, ease-in-out, infinite
  * Draw:    stroke-dasharray + stroke-dashoffset animation
  * Bounce:  translateY(0) → translateY(-3px) → translateY(0)
  * Morph:   multiple paths with crossfade opacity
SMIL (<animate>, <animateTransform>, <animateMotion>) allowed as secondary.
No JavaScript. No external assets.

STYLE VARIANTS — follow user style exactly
outline   → stroke only, fill=none
solid     → fill=currentColor, no stroke
rounded   → outline + round caps/joins
sharp     → outline + square/miter
duotone   → two fills, secondary at ~30% opacity
animated  → base icon + CSS @keyframes

OUTPUT FORMAT
Return ONLY the raw SVG code.
No markdown. No backticks. No explanation. No comments inside SVG.
Start with <svg and end with </svg>.
Always include xmlns="http://www.w3.org/2000/svg"`;

export const AMPLIFIER_PROMPT = `You are a senior icon designer (Lucide / Heroicons / Tabler).

Write a PRECISE geometric design brief for an SVG generator.
Cover: core metaphor, shapes + approximate 24×24 coords, stroke vs fill, what to include/avoid, centering, and animation intent if needed.
No SVG code. 3–6 bullets max.`;

export const CRITIQUE_PROMPT = `Critique this SVG against Lucide quality:
1. currentColor only?
2. Correct caps/joins for style?
3. Coords inside viewBox?
4. Optically centered?
5. Paths unnecessarily complex?
6. If animation requested: subtle CSS loop?

Return ONLY the improved raw SVG. No markdown.`;

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
  designBrief: string,
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
    medium: "Moderate detail. 5–8 elements. Balance simple and complex.",
    complex: "Rich but still icon-grade. Groups allowed.",
  } as const;

  const pad = controls.padding > 0 ? controls.padding : 2;
  const example = findRelevantExample(controls.prompt);
  const wantsAnim = intent.hasAnimation || styleKey === "animated";

  let spec = `Create a ${styleKey} SVG ${intent.type} for: "${controls.prompt.trim()}"\n\n`;
  spec += `Subject: ${intent.subject}\n`;
  spec += `ViewBox: ${viewBox}\n`;
  spec += `Style: ${styleDesc}\n`;
  spec += `Complexity: ${complexityInstructions[intent.complexity]}\n`;
  spec += `Animation needed: ${wantsAnim}\n`;
  spec += `Stroke-width: ${controls.strokeWidth} (use consistently)\n`;
  spec += `Padding: ${pad}px minimum from all edges\n`;
  spec += `Color: currentColor only — no hardcoded colors\n`;

  if (controls.cornerRadius > 0) {
    spec += `Corner radius on rects: ${controls.cornerRadius}\n`;
  }

  if (wantsAnim) {
    spec += `\nAnimation: include CSS @keyframes in <style>. Subtle, looping, 0.8–1.6s. Complete attribute names only.\n`;
  }

  if (designBrief.trim()) {
    spec += `\nDesign brief:\n${designBrief.trim()}\n`;
  }

  spec += `\n${GOLDEN_ANCHORS}\n`;
  if (example) spec += `\n${example}\n`;
  if (controls.styleLock) spec += `\n${controls.styleLock}\n`;

  spec += `\nQuality requirements:
- Every path node intentional
- Optical balance — visually center the design
- Smooth curves using cubic beziers where needed
- Consistent visual weight throughout
- Recognizable at 16×16

Output ONLY the raw <svg>…</svg>. No explanation.`;

  return spec;
}

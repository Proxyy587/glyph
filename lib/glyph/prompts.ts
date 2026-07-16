import type { GlyphIntent } from "./classifier";
import { findRelevantExample } from "./examples";

export const STYLE_GUIDE: Record<string, string> = {
  outline:
    "Outline style: stroke only, fill='none'. Clean single-weight lines like Lucide or Heroicons. Use stroke='currentColor'.",
  solid:
    "Solid style: filled shapes, no stroke. Use fill='currentColor'. Like Phosphor fill or Lucide solid.",
  rounded:
    "Rounded style: stroke outline with stroke-linecap='round' stroke-linejoin='round'. Soft, friendly look.",
  sharp:
    "Sharp style: stroke outline with stroke-linecap='square' stroke-linejoin='miter'. Crisp, technical look.",
  duotone:
    "Duotone style: two-tone. Main shape uses fill with opacity 0.3–0.4, accent detail uses full fill. Both use currentColor.",
  animated:
    "Animated style: start from a clean outline icon, then add premium CSS @keyframes motion inside a <style> block. Keep geometry Lucide-grade.",
};

export const GLYPH_SYSTEM_PROMPT = `You are an elite SVG designer and engineer.
You create pixel-perfect, scalable vector graphics that rival professional icon libraries (Lucide, Heroicons, Tabler).

═══════════════════════════════════════
CANVAS RULES — NON NEGOTIABLE
═══════════════════════════════════════
- viewBox is ALWAYS "0 0 24 24" for icons unless told otherwise ("0 0 100 100" illustrations, "0 0 200 60" logos)
- NEVER place geometry outside the viewBox bounds
- ALL coordinates relative to the viewBox
- Allowed elements: path, circle, rect, line, polyline, polygon, ellipse, g, defs, clipPath, mask,
  linearGradient, radialGradient, animate, animateTransform, animateMotion, style
- Forbidden: script, foreignObject, image, event handlers

═══════════════════════════════════════
STROKE SYSTEM (Lucide-style icons)
═══════════════════════════════════════
- stroke="currentColor" on ALL stroked elements — never hardcode colors
- Prefer stroke-width from the user spec (default 1.5 or 2)
- stroke-linecap and stroke-linejoin must match the style preset
- fill="none" for outline icons
- fill="currentColor" for solid — NEVER mix outline+solid in the same icon unless duotone

═══════════════════════════════════════
PATH QUALITY RULES
═══════════════════════════════════════
- Use cubic bezier curves (C/c) for smooth organic shapes
- Use arc commands (A/a) for circles and rounded corners
- Minimize path nodes — quality icons use <8 nodes per path when possible
- Prefer drawing at correct coords over transform="translate(...)" crutches
- Close paths explicitly with Z when the shape should be closed

═══════════════════════════════════════
DESIGN QUALITY STANDARDS
═══════════════════════════════════════
- Optical centering — elements should FEEL centered
- Consistent padding — 2px minimum from viewBox edges unless told otherwise
- Pixel grid alignment — whole or half pixels where possible
- Visual weight balanced; negative space intentional
- Icons only: simple recognizable symbols — NOT illustrations or realistic art (unless type is illustration)

═══════════════════════════════════════
ANIMATION RULES (when requested)
═══════════════════════════════════════
Prefer CSS animations in a <style> tag inside the SVG:
- Assign class or id to animated elements
- Use @keyframes for complex motion
- Durations 0.6s–2.4s, smooth easing, seamless loops
- Patterns: spin, pulse, draw-on (stroke-dashoffset), bounce, staggered blocks
SMIL (<animate>, <animateTransform>, <animateMotion>) is allowed as secondary.
No JavaScript. No external assets.

═══════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════
Return ONLY the raw SVG code.
No markdown. No backticks. No explanation. No comments outside the SVG.
Start with <svg and end with </svg>.
Always include xmlns="http://www.w3.org/2000/svg"`;

export const AMPLIFIER_PROMPT = `You are a senior icon designer who works with Lucide, Heroicons, and Tabler.

Take a vague user request and write a PRECISE DESIGN BRIEF for an SVG code generator.

Describe:
1. Core concept and simplest visual metaphor
2. Exact shapes / approximate coordinates on the target grid
3. Stroke vs fill, caps and joins
4. Details to INCLUDE and AVOID (max ~5 paths for simple icons)
5. Composition and optical centering
6. If animation is requested: what moves, duration, easing, stagger

RULES:
- Do NOT write any SVG or code
- 3–6 bullet points maximum
- Think geometry, not art
- Assume Lucide visual language: minimal, clean, consistent stroke`;

export const CRITIQUE_PROMPT = `Critique the SVG against these checks and output an IMPROVED version:
1. Are all strokes/fills using currentColor (monochrome)?
2. Are stroke-linecap / stroke-linejoin correct for the style?
3. Any coordinates outside the viewBox?
4. Is it visually balanced and optically centered?
5. Are paths unnecessarily complex?
6. If animation was requested: is motion subtle, looping, and CSS/SMIL-only?

Return ONLY the improved raw SVG. No markdown. No explanation.`;

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
    simple: "Use minimal paths. Maximum 3–4 SVG elements. Clean and iconic.",
    medium: "Moderate detail. 5–8 elements. Balance simple and complex.",
    complex: "Rich but still icon-grade. Multiple layers allowed via <g>.",
  } as const;

  const pad = controls.padding > 0 ? controls.padding : 2;
  const example = findRelevantExample(controls.prompt);

  let spec = `Create a ${styleKey} SVG ${intent.type} for: "${controls.prompt.trim()}"\n\n`;
  spec += `Subject (cleaned): ${intent.subject}\n`;
  spec += `ViewBox: ${viewBox}\n`;
  spec += `Style: ${styleDesc}\n`;
  spec += `Complexity: ${complexityInstructions[intent.complexity]}\n`;
  spec += `Animation needed: ${intent.hasAnimation || styleKey === "animated"}\n\n`;

  if (designBrief.trim()) {
    spec += `Design brief:\n${designBrief.trim()}\n\n`;
  }

  if (example) spec += `${example}\n`;

  spec += `Icon constraints:\n`;
  spec += `- Optical center; ${pad}px minimum padding from edges.\n`;
  spec += `- Stroke width: ${controls.strokeWidth}. Use consistently for ALL strokes.\n`;
  if (controls.cornerRadius > 0) {
    spec += `- Corner radius: ${controls.cornerRadius} on rects.\n`;
  }
  spec += `- Use currentColor only. No hardcoded colors.\n`;

  if (intent.hasAnimation || styleKey === "animated") {
    spec += `- Add premium CSS @keyframes in an internal <style> block (preferred) or SMIL.\n`;
    spec += `- Seamless loop, 0.6–2.4s, subtle stagger if multiple blocks.\n`;
  }

  if (controls.styleLock) {
    spec += `\n${controls.styleLock}\n`;
  }

  spec += `\nQuality requirements:\n`;
  spec += `- Every path node intentional\n`;
  spec += `- Smooth curves; consistent visual weight\n`;
  spec += `- Output ONLY the raw SVG. No explanation.\n`;

  return spec;
}

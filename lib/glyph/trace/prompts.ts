/**
 * Prompt templates for the image → trace engine.
 *
 * Every request is a grid "sheet" so one paid image yields several icons:
 *   - single mode: 2×2 sheet of four different takes on the same subject
 *   - pack mode:   2×2 (≤4 items) or 3×3 (≤9 items) sheet, one cell per item
 * The sheet also forces a shared visual style across a pack for free.
 */

/** Bump when templates change so stale cache entries are not reused. */
export const TRACE_TEMPLATE_VERSION = "t2";

export type TraceStyle = "solid" | "outline" | "rounded" | "sharp";

const FILLER_WORDS =
  /\b(icons?|glyphs?|svgs?|vectors?|please|make|create|generate|draw|design|simple|clean|minimal(?:ist)?|modern|flat|style|styled|animated|animation|animate|moving|actually|motion|loop(?:ing)?|outlined?|solid|filled|rounded|sharp|duotone|stroke[sd]?|caps?)\b/gi;

/** Strip style/animation chatter so only the subject is described and drawn. */
export function normalizeSubject(prompt: string): string {
  const cleaned = prompt
    .replace(FILLER_WORDS, " ")
    .replace(/[,;:.!?]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (cleaned || prompt.trim()).slice(0, 160);
}

export function toTraceStyle(style: string | undefined): TraceStyle {
  if (style === "outline" || style === "rounded" || style === "sharp") {
    return style;
  }
  return "solid";
}

function styleClause(style: TraceStyle): string {
  switch (style) {
    case "outline":
      return "Every icon is an outline line icon drawn with thick, uniform black strokes (stroke weight about one twelfth of the icon width), open hollow interiors, no large solid fills.";
    case "rounded":
      return "Every icon is an outline line icon drawn with thick, uniform black strokes with fully rounded line ends and soft rounded corners, open hollow interiors, no large solid fills.";
    case "sharp":
      return "Every icon is an outline line icon drawn with thick, uniform black strokes with square line ends and crisp sharp corners, open hollow interiors, no large solid fills.";
    default:
      return "Every icon is a solid filled glyph: bold black silhouette shapes, using white negative-space cutouts only for the subject's real defining features.";
  }
}

const SHARED_RULES =
  "Pure black (#000000) on pure white (#FFFFFF), strictly two colors. Instantly recognizable at small sizes, bold geometric shapes, smooth curves, identical visual weight. No text, no letters, no gray, no gradients, no shading, no shadows, no texture, no borders, no boxes, no frames, no grid lines, no dividers.";

const POSITIONS: Record<2 | 3, string[]> = {
  2: ["top-left", "top-right", "bottom-left", "bottom-right"],
  3: [
    "top-left",
    "top-center",
    "top-right",
    "middle-left",
    "center",
    "middle-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
  ],
};

export function gridSizeFor(count: number): 2 | 3 {
  return count <= 4 ? 2 : 3;
}

function buildSheetPrompt(lead: string, cells: string[], style: TraceStyle) {
  const grid = gridSizeFor(cells.length);
  const list = POSITIONS[grid]
    .map((pos, i) => `${pos}: ${cells[i] ?? "leave this cell empty white"}`)
    .join("; ");

  return [
    `An icon sheet laid out as an invisible ${grid}x${grid} grid. ${lead} ${list}.`,
    "Each icon is centered inside its own grid cell with wide white margins and never touches or crosses the cell boundaries.",
    styleClause(style),
    SHARED_RULES,
  ].join(" ");
}

/** 2×2 sheet with four distinct takes on one subject (variants for the user). */
export function buildVariantSheetPrompt(
  subject: string,
  takes: string[],
  style: TraceStyle,
): string {
  return buildSheetPrompt(
    `It shows four different design variations of the same icon (${subject}), in one consistent icon style:`,
    takes.slice(0, 4),
    style,
  );
}

/** One sheet cell per pack item, all in one consistent icon family. */
export function buildPackSheetPrompt(
  descriptions: string[],
  style: TraceStyle,
): string {
  return buildSheetPrompt(
    "It contains separate icons that belong to one consistent icon set:",
    descriptions,
    style,
  );
}

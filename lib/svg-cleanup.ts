/**
 * SVG validation & cleanup for developer-grade icon output.
 * - Extracts SVG from markdown/code blocks
 * - Normalizes viewBox and dimensions
 * - Strips scripts, style overrides; enforces stroke/radius
 */

const SVG_TAG = /<svg[\s\S]*?<\/svg>/i;
const CODE_BLOCK = /```(?:svg|xml)?\s*([\s\S]*?)```/i;

export interface CleanupOptions {
  viewBoxSize?: number; // 16 | 24 | 32
  strokeWidth?: number;
  cornerRadius?: number;
  padding?: number;
}

/**
 * Extract first valid SVG from text (handles markdown code blocks).
 */
export function extractSvg(raw: string): string | null {
  let content = raw.trim();
  const codeMatch = content.match(CODE_BLOCK);
  if (codeMatch) content = codeMatch[1].trim();
  const svgMatch = content.match(SVG_TAG);
  return svgMatch ? svgMatch[0] : null;
}

/**
 * Parse viewBox from SVG string.
 */
function getViewBox(
  svg: string
): { x: number; y: number; w: number; h: number } | null {
  const m = svg.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  if (!m) return null;
  const parts = m[1].trim().split(/\s+/).map(Number);
  if (parts.length !== 4) return null;
  return { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
}

/**
 * Set or normalize viewBox and width/height on root <svg>.
 */
function setViewBox(svg: string, size: number): string {
  const vb = getViewBox(svg);
  const w = vb ? vb.w : size;
  const h = vb ? vb.h : size;
  const x = vb ? vb.x : 0;
  const y = vb ? vb.y : 0;
  const viewBox = `${x} ${y} ${w} ${h}`;
  return svg
    .replace(/\s*viewBox\s*=\s*["'][^"']*["']/i, "")
    .replace(/\s*width\s*=\s*["'][^"']*["']/i, "")
    .replace(/\s*height\s*=\s*["'][^"']*["']/i, "")
    .replace(
      /<svg/i,
      `<svg viewBox="${viewBox}" width="${size}" height="${size}" `
    );
}

/**
 * Remove script and event attributes for safety; strip unwanted styling.
 */
function stripUnsafe(svg: string): string {
  let out = svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\s+on\w+\s*=\s*[^\s>]+/gi, "");
  return out;
}

/**
 * Apply stroke-width to elements that have stroke (path, line, circle, etc.).
 */
function applyStroke(svg: string, strokeWidth: number): string {
  const dec = strokeWidth.toString();
  if (!svg.includes("stroke=")) {
    return svg
      .replace(/<svg/i, `<svg style="--icon-stroke:${dec}"`)
      .replace(
        /(<(?:path|line|polyline|polygon|rect|circle|ellipse)[^>]*)(\/?>)/gi,
        (_, open, close) => {
          if (open.includes("stroke-width") || open.includes("strokeWidth"))
            return open + close;
          return open + ` stroke-width="${dec}"` + close;
        }
      );
  }
  return svg
    .replace(/stroke-width\s*=\s*["'][^"']*["']/gi, `stroke-width="${dec}"`)
    .replace(/strokeWidth\s*=\s*["'][^"']*["']/gi, `stroke-width="${dec}"`);
}

/**
 * Apply corner radius to rect elements (rounded style).
 */
function applyCornerRadius(svg: string, radius: number): string {
  if (radius <= 0) return svg;
  const r = radius.toString();
  return svg.replace(/<rect([^>]*)>/gi, (_, attrs) => {
    if (attrs.includes("rx=") || attrs.includes("ry=")) return `<rect${attrs}>`;
    return `<rect${attrs} rx="${r}" ry="${r}">`;
  });
}

/**
 * Clean and normalize SVG with optional viewBox size, stroke, and radius.
 */
export function cleanupSvg(
  raw: string,
  options: CleanupOptions = {}
): string | null {
  const svg = extractSvg(raw);
  if (!svg) return null;

  const { viewBoxSize = 24, strokeWidth, cornerRadius } = options;

  let result = stripUnsafe(svg);
  result = setViewBox(result, viewBoxSize);

  if (strokeWidth != null && strokeWidth > 0) {
    result = applyStroke(result, strokeWidth);
  }
  if (cornerRadius != null && cornerRadius > 0) {
    result = applyCornerRadius(result, cornerRadius);
  }

  return result;
}

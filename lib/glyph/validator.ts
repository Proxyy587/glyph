export type ValidateOptions = {
  viewBoxSize?: number;
  strokeWidth?: number;
  cornerRadius?: number;
  outline?: boolean;
};

const SVG_TAG = /<svg[\s\S]*?<\/svg>/i;
const CODE_BLOCK = /```(?:svg|xml)?\s*([\s\S]*?)```/i;

export function extractSvg(raw: string): string | null {
  let content = raw.trim();
  const codeMatch = content.match(CODE_BLOCK);
  if (codeMatch) content = codeMatch[1].trim();
  // strip leftover fences
  content = content
    .replace(/^```(?:svg|xml)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const svgMatch = content.match(SVG_TAG);
  if (svgMatch) return svgMatch[0];
  const start = content.indexOf("<svg");
  if (start === -1) return null;
  const end = content.lastIndexOf("</svg>");
  if (end === -1) return content.slice(start) + "</svg>";
  return content.slice(start, end + 6);
}

function stripUnsafe(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\s+on\w+\s*=\s*[^\s>]+/gi, "");
}

function ensureXmlns(svg: string): string {
  if (/xmlns\s*=/.test(svg)) return svg;
  return svg.replace(
    /<svg\b/i,
    `<svg xmlns="http://www.w3.org/2000/svg"`,
  );
}

function ensureViewBox(svg: string, size: number): string {
  if (/viewBox\s*=/.test(svg)) {
    return svg
      .replace(/\s*width\s*=\s*["'][^"']*["']/gi, "")
      .replace(/\s*height\s*=\s*["'][^"']*["']/gi, "");
  }
  return svg
    .replace(/\s*width\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\s*height\s*=\s*["'][^"']*["']/gi, "")
    .replace(/<svg\b/i, `<svg viewBox="0 0 ${size} ${size}"`);
}

function applyStroke(svg: string, strokeWidth: number): string {
  const dec = strokeWidth.toString();
  let out = svg
    .replace(/stroke-width\s*=\s*["'][^"']*["']/gi, `stroke-width="${dec}"`)
    .replace(/strokeWidth\s*=\s*["'][^"']*["']/gi, `stroke-width="${dec}"`);

  out = out.replace(
    /(<(?:path|line|polyline|polygon|circle|ellipse|rect)[^>]*?)(\/?>)/gi,
    (match, open: string, close: string) => {
      if (!open.includes("stroke=") && !open.includes("fill=")) {
        return `${open} stroke="currentColor" stroke-width="${dec}" stroke-linecap="round" stroke-linejoin="round" fill="none"${close}`;
      }
      if (
        open.includes("stroke=") &&
        !open.includes("stroke-width") &&
        !open.includes("strokeWidth")
      ) {
        return `${open} stroke-width="${dec}"${close}`;
      }
      return match;
    },
  );

  return out;
}

function applyCornerRadius(svg: string, radius: number): string {
  if (radius <= 0) return svg;
  const r = radius.toString();
  return svg.replace(/<rect([^>]*)\/?>/gi, (full, attrs: string) => {
    if (attrs.includes("rx=") || attrs.includes("ry=")) return full;
    if (full.endsWith("/>")) return `<rect${attrs} rx="${r}" ry="${r}"/>`;
    return `<rect${attrs} rx="${r}" ry="${r}">`;
  });
}

/**
 * Extract, sanitize, and normalize SVG. Preserves <style> and SMIL animation.
 */
export function validateAndFixSvg(
  raw: string,
  options: ValidateOptions = {},
): string | null {
  const extracted = extractSvg(raw);
  if (!extracted) return null;

  const size = options.viewBoxSize ?? 24;
  let result = stripUnsafe(extracted);
  result = ensureXmlns(result);
  result = ensureViewBox(result, size);

  if (options.strokeWidth != null && options.strokeWidth > 0) {
    result = applyStroke(result, options.strokeWidth);
  } else if (options.outline !== false) {
    // light default for outline icons missing stroke attrs
    result = applyStroke(result, 1.5);
  }

  if (options.cornerRadius != null && options.cornerRadius > 0) {
    result = applyCornerRadius(result, options.cornerRadius);
  }

  if (!/<\/svg>\s*$/i.test(result)) {
    result = `${result}</svg>`;
  }

  return result;
}

export function hasAnimationMarkup(svg: string): boolean {
  return (
    /@keyframes/i.test(svg) ||
    /<animate\b/i.test(svg) ||
    /<animateTransform\b/i.test(svg) ||
    /<animateMotion\b/i.test(svg) ||
    /animation\s*:/i.test(svg)
  );
}

export function extractStyleTokens(svg: string): string {
  const strokeWidthMatch = svg.match(/stroke-width="([^"]+)"/);
  const strokeLinecapMatch = svg.match(/stroke-linecap="([^"]+)"/);
  const strokeLinejoinMatch = svg.match(/stroke-linejoin="([^"]+)"/);
  const rxMatch = svg.match(/rx="([^"]+)"/);

  const tokens: string[] = [];
  if (strokeWidthMatch) tokens.push(`stroke-width: ${strokeWidthMatch[1]}`);
  if (strokeLinecapMatch)
    tokens.push(`stroke-linecap: ${strokeLinecapMatch[1]}`);
  if (strokeLinejoinMatch)
    tokens.push(`stroke-linejoin: ${strokeLinejoinMatch[1]}`);
  if (rxMatch) tokens.push(`corner radius (rx): ${rxMatch[1]}`);

  if (tokens.length === 0) return "";

  return (
    `[PACK CONSISTENCY: This icon is part of a set. You MUST use these exact style values: ${tokens.join(", ")}. Do not deviate.]`
  );
}

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

/**
 * Strip XSS / exfiltration vectors before dangerouslySetInnerHTML.
 * Models are instructed not to emit these; this is defense in depth.
 */
function stripUnsafe(svg: string): string {
  return (
    svg
      // Executable / embedded content
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "")
      .replace(/<foreignObject\b[^>]*\/?>/gi, "")
      .replace(/<image\b[^>]*\/?>/gi, "")
      .replace(/<image[\s\S]*?<\/image>/gi, "")
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
      .replace(/<object[\s\S]*?<\/object>/gi, "")
      .replace(/<embed\b[^>]*\/?>/gi, "")
      // Event handlers
      .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "")
      .replace(/\s+on\w+\s*=\s*[^\s>]+/gi, "")
      // javascript: / data: URLs in href / xlink:href / src
      .replace(
        /\s(?:xlink:)?href\s*=\s*["']\s*javascript:[^"']*["']/gi,
        ' href="#"',
      )
      .replace(/\s(?:xlink:)?href\s*=\s*["']\s*data:[^"']*["']/gi, ' href="#"')
      .replace(/\ssrc\s*=\s*["'][^"']*["']/gi, "")
      // External stylesheet / URL imports in style blocks
      .replace(/@import\b[^;]+;/gi, "")
      .replace(/expression\s*\(/gi, "(")
      .replace(/url\s*\(\s*["']?\s*javascript:[^)]*\)/gi, "url(#)")
      .replace(/url\s*\(\s*["']?\s*https?:[^)]*\)/gi, "url(#)")
  );
}

/** Fix truncated/broken attributes like `stroke-` or `fill=` without value. */
function repairBrokenAttrs(svg: string): string {
  return (
    svg
      // incomplete attribute names ending with hyphen: stroke- fill-
      .replace(
        /\s(?:stroke|fill|stroke-linecap|stroke-linejoin|stroke-width|opacity)-(?=\s|\/|>)/gi,
        " ",
      )
      // attribute with equals but no value: stroke= fill=
      .replace(
        /\s(stroke|fill|stroke-linecap|stroke-linejoin|stroke-width|opacity|class|id)=(?=[\s/>])/gi,
        " ",
      )
      // empty quoted attrs: stroke=""
      .replace(/\s(stroke|fill)="\s*"/gi, " ")
      // duplicate spaces
      .replace(/\s{2,}/g, " ")
  );
}

function ensureXmlns(svg: string): string {
  if (/xmlns\s*=/.test(svg)) return svg;
  return svg.replace(/<svg\b/i, `<svg xmlns="http://www.w3.org/2000/svg"`);
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
      const hasStroke = /\bstroke\s*=/.test(open);
      const hasFill = /\bfill\s*=/.test(open);
      if (!hasStroke && !hasFill) {
        return `${open} stroke="currentColor" stroke-width="${dec}" stroke-linecap="round" stroke-linejoin="round" fill="none"${close}`;
      }
      if (hasStroke && !/stroke-width/i.test(open)) {
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
 * Zero-cost animation fallback when model forgets motion markup.
 */
export function injectFallbackAnimation(svg: string): string {
  if (hasAnimationMarkup(svg)) return svg;
  if (/<style[\s>]/i.test(svg)) {
    return svg.replace(
      /<\/style>/i,
      `@keyframes glyphPulse{0%,100%{opacity:1}50%{opacity:.45}}.glyph-anim{animation:glyphPulse 1.2s ease-in-out infinite}</style>`,
    );
  }
  return svg.replace(
    /<\/svg>/i,
    `<style>@keyframes glyphPulse{0%,100%{opacity:1}50%{opacity:.45}}svg>*{animation:glyphPulse 1.2s ease-in-out infinite}</style></svg>`,
  );
}

export function validateAndFixSvg(
  raw: string,
  options: ValidateOptions = {},
): string | null {
  const extracted = extractSvg(raw);
  if (!extracted) return null;

  const size = options.viewBoxSize ?? 24;
  let result = stripUnsafe(extracted);
  result = repairBrokenAttrs(result);
  result = ensureXmlns(result);
  result = ensureViewBox(result, size);

  if (options.strokeWidth != null && options.strokeWidth > 0) {
    result = applyStroke(result, options.strokeWidth);
  } else if (options.outline !== false) {
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

  return `[PACK CONSISTENCY: use exact values: ${tokens.join(", ")}]`;
}

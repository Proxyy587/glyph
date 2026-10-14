import {
  ColorMode,
  Hierarchical,
  PathSimplifyMode,
  vectorize,
  type Config,
} from "@neplex/vectorizer";
import { optimizeSvg } from "../optimizer";

/** Raster size each icon is traced at. Plenty for a 16–32px icon, keeps nodes low. */
export const TRACE_SIZE = 384;

const TRACE_CONFIG: Config = {
  colorMode: ColorMode.Binary,
  hierarchical: Hierarchical.Cutout,
  filterSpeckle: 4,
  colorPrecision: 6,
  layerDifference: 16,
  mode: PathSimplifyMode.Spline,
  cornerThreshold: 60,
  lengthThreshold: 4,
  maxIterations: 10,
  spliceThreshold: 45,
  pathPrecision: 2,
};

const PATH_TAG = /<path\b[^>]*\/>/g;
const TOKEN = /[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g;

function round(n: number): string {
  return String(Math.round(n * 100) / 100);
}

/**
 * Rebuild path data from numbers only, applying VTracer's translate() and the
 * scale into the target viewBox. VTracer emits absolute M/L/C/Q/Z only; any
 * other command means an unexpected format and the path is rejected.
 */
function transformPath(d: string, tx: number, ty: number, scale: number) {
  const tokens = d.match(TOKEN) ?? [];
  const out: string[] = [];
  let isX = true;

  for (const token of tokens) {
    if (/^[A-Za-z]$/.test(token)) {
      if (!"MLCQZ".includes(token)) return null;
      out.push(token);
      isX = true;
      continue;
    }
    const value = Number(token);
    if (!Number.isFinite(value)) return null;
    out.push(round((value + (isX ? tx : ty)) * scale));
    isX = !isX;
  }

  return out.join(" ");
}

function isBlackFill(fill: string | undefined) {
  if (!fill) return true;
  const f = fill.toLowerCase();
  return f === "#000" || f === "#000000" || f === "black";
}

/** Trace a fitted binary PNG into a clean `currentColor` SVG on the given grid. */
export async function traceToSvg(
  png: Buffer,
  viewBox: number,
): Promise<string> {
  const raw = await vectorize(png, TRACE_CONFIG);
  const scale = viewBox / TRACE_SIZE;
  const paths: string[] = [];

  for (const tag of raw.match(PATH_TAG) ?? []) {
    const d = /\bd="([^"]+)"/.exec(tag)?.[1];
    if (!d) continue;
    if (!isBlackFill(/\bfill="([^"]+)"/.exec(tag)?.[1])) continue;

    const t = /translate\(\s*([-\d.e+]+)[\s,]+([-\d.e+]+)\s*\)/.exec(tag);
    const tx = t ? Number(t[1]) : 0;
    const ty = t ? Number(t[2]) : 0;

    const next = transformPath(d, tx, ty, scale);
    if (next) paths.push(next);
  }

  if (paths.length === 0) throw new Error("Trace produced no paths");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBox} ${viewBox}" fill="currentColor">${paths
    .map((d) => `<path fill-rule="evenodd" d="${d}"/>`)
    .join("")}</svg>`;

  return optimizeSvg(svg);
}

import sharp from "sharp";

/** 1-bit image: data[i] === 1 means black ink. */
export type Mask = { data: Uint8Array; width: number; height: number };

type Box = { minX: number; minY: number; maxX: number; maxY: number };

type Component = Box & { id: number; area: number };

export type CellAnalysis =
  | { ok: true; mask: Mask; box: Box; coverage: number; clipped: boolean }
  | { ok: false; reason: "empty" };

const INK_THRESHOLD = 140;

export async function toMask(bytes: Buffer): Promise<Mask> {
  const { data, info } = await sharp(bytes)
    .flatten({ background: "#ffffff" })
    .grayscale()
    .normalise()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < mask.length; i++) {
    mask[i] = data[i * channels] < INK_THRESHOLD ? 1 : 0;
  }
  return { data: mask, width, height };
}

function maskToGray(mask: Mask): Buffer {
  const gray = Buffer.alloc(mask.data.length);
  for (let i = 0; i < gray.length; i++) gray[i] = mask.data[i] ? 0 : 255;
  return gray;
}

/** Lossless 2-colour PNG (~10–30 KB per sheet) for the trace cache. */
export async function maskToPng(mask: Mask): Promise<Buffer> {
  return sharp(maskToGray(mask), {
    raw: { width: mask.width, height: mask.height, channels: 1 },
  })
    .png({ palette: true, colours: 2, compressionLevel: 9 })
    .toBuffer();
}

function cropMask(mask: Mask, x: number, y: number, w: number, h: number) {
  const data = new Uint8Array(w * h);
  for (let row = 0; row < h; row++) {
    const src = (y + row) * mask.width + x;
    data.set(mask.data.subarray(src, src + w), row * w);
  }
  return { data, width: w, height: h };
}

/** Split a sheet into grid cells, row-major. */
export function sliceGrid(mask: Mask, grid: number): Mask[] {
  const cw = Math.floor(mask.width / grid);
  const ch = Math.floor(mask.height / grid);
  const cells: Mask[] = [];
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      cells.push(cropMask(mask, c * cw, r * ch, cw, ch));
    }
  }
  return cells;
}

function labelComponents(mask: Mask) {
  const { data, width, height } = mask;
  const labels = new Int32Array(data.length);
  const stack = new Int32Array(data.length);
  const comps: Component[] = [];

  for (let start = 0; start < data.length; start++) {
    if (!data[start] || labels[start]) continue;
    const id = comps.length + 1;
    const comp: Component = {
      id,
      area: 0,
      minX: width,
      minY: height,
      maxX: -1,
      maxY: -1,
    };
    let sp = 0;
    stack[sp++] = start;
    labels[start] = id;

    while (sp > 0) {
      const p = stack[--sp];
      const x = p % width;
      const y = (p - x) / width;
      comp.area++;
      if (x < comp.minX) comp.minX = x;
      if (x > comp.maxX) comp.maxX = x;
      if (y < comp.minY) comp.minY = y;
      if (y > comp.maxY) comp.maxY = y;

      if (x > 0 && data[p - 1] && !labels[p - 1]) {
        labels[p - 1] = id;
        stack[sp++] = p - 1;
      }
      if (x < width - 1 && data[p + 1] && !labels[p + 1]) {
        labels[p + 1] = id;
        stack[sp++] = p + 1;
      }
      if (y > 0 && data[p - width] && !labels[p - width]) {
        labels[p - width] = id;
        stack[sp++] = p - width;
      }
      if (y < height - 1 && data[p + width] && !labels[p + width]) {
        labels[p + width] = id;
        stack[sp++] = p + width;
      }
    }
    comps.push(comp);
  }

  return { labels, comps };
}

/**
 * Clean one cell: drop specks, model-drawn frames and grid lines, and flag
 * icons that cross the cell boundary (likely cut off).
 */
export function analyzeCell(cell: Mask): CellAnalysis {
  const { width: w, height: h } = cell;
  const cellArea = w * h;
  const edge = Math.max(2, Math.round(Math.min(w, h) * 0.01));
  const { labels, comps } = labelComponents(cell);

  const keep = new Set<number>();
  let clipped = false;

  for (const c of comps) {
    const bw = c.maxX - c.minX + 1;
    const bh = c.maxY - c.minY + 1;
    const fill = c.area / (bw * bh);

    if (c.area < cellArea * 0.0004) continue;

    const isFrame = bw >= w * 0.7 && bh >= h * 0.7 && fill < 0.15;
    if (isFrame) continue;

    const isDivider =
      (bw >= w * 0.6 && bh <= h * 0.03) || (bh >= h * 0.6 && bw <= w * 0.03);
    if (isDivider) continue;

    const touchesEdge =
      c.minX < edge ||
      c.minY < edge ||
      c.maxX >= w - edge ||
      c.maxY >= h - edge;
    if (touchesEdge) {
      if (c.area < cellArea * 0.004) continue;
      clipped = true;
    }

    keep.add(c.id);
  }

  if (keep.size === 0) return { ok: false, reason: "empty" };

  const data = new Uint8Array(cell.data.length);
  const box: Box = { minX: w, minY: h, maxX: -1, maxY: -1 };
  let inked = 0;
  for (let i = 0; i < labels.length; i++) {
    if (!keep.has(labels[i])) continue;
    data[i] = 1;
    inked++;
    const x = i % w;
    const y = (i - x) / w;
    if (x < box.minX) box.minX = x;
    if (x > box.maxX) box.maxX = x;
    if (y < box.minY) box.minY = y;
    if (y > box.maxY) box.maxY = y;
  }

  const coverage = inked / cellArea;
  if (coverage < 0.005) return { ok: false, reason: "empty" };

  return {
    ok: true,
    mask: { data, width: w, height: h },
    box,
    coverage,
    clipped,
  };
}

/**
 * Crop to the ink bounding box and fit it into a square canvas whose live area
 * matches the UI padding (padding is in 24-grid units).
 */
export async function fitToSquare(
  mask: Mask,
  box: Box,
  size: number,
  padding: number,
): Promise<Buffer> {
  const pad = Math.min(Math.max(padding, 0), 8);
  const inner = Math.max(8, Math.round((size * (24 - 2 * pad)) / 24));
  const cw = box.maxX - box.minX + 1;
  const ch = box.maxY - box.minY + 1;
  const crop = cropMask(mask, box.minX, box.minY, cw, ch);

  const before = Math.floor((size - inner) / 2);
  const after = size - inner - before;

  return sharp(maskToGray(crop), {
    raw: { width: cw, height: ch, channels: 1 },
  })
    .resize(inner, inner, { fit: "contain", background: "#ffffff" })
    .extend({
      top: before,
      bottom: after,
      left: before,
      right: after,
      background: "#ffffff",
    })
    .flatten({ background: "#ffffff" })
    .threshold(128)
    .png()
    .toBuffer();
}

import { getSheet } from "./cache";
import { describeSubjects, describeVariants } from "./describe";
import { applyMotion, pickMotion, wantsMotion } from "./motion";
import {
  buildPackSheetPrompt,
  buildVariantSheetPrompt,
  gridSizeFor,
  normalizeSubject,
  toTraceStyle,
} from "./prompts";
import { analyzeCell, fitToSquare, sliceGrid, type Mask } from "./raster";
import { TRACE_SIZE, traceToSvg } from "./vectorize";

export { countPriorRolls } from "./cache";
export { GLYPH_IMAGE_MODEL } from "./image-client";

export type TraceControls = {
  style?: string;
  padding?: number;
  viewBoxSize?: number;
};

type TraceOptions = { userId: string; roll: number };

export type TraceSingleResult = {
  variants: string[];
  costUsd: number;
  cached: boolean;
  model: string;
};

export type TracePackResult = {
  /** One entry per prompt; null when that cell was empty or cut off. */
  items: (string | null)[];
  costUsd: number;
  cached: boolean;
  model: string;
};

async function cellToSvg(
  cell: Mask,
  controls: TraceControls,
  motionPrompt: string | null,
): Promise<{ svg: string; clipped: boolean } | null> {
  const analysis = analyzeCell(cell);
  if (!analysis.ok) return null;

  const viewBox = controls.viewBoxSize ?? 24;
  const png = await fitToSquare(
    analysis.mask,
    analysis.box,
    TRACE_SIZE,
    controls.padding ?? 2,
  );
  let svg = await traceToSvg(png, viewBox);
  if (motionPrompt) svg = applyMotion(svg, pickMotion(motionPrompt), viewBox);

  return { svg, clipped: analysis.clipped };
}

/** One paid image → up to four traced variants of the same subject. */
export async function traceSingle(
  prompt: string,
  controls: TraceControls,
  options: TraceOptions,
): Promise<TraceSingleResult> {
  const subject = normalizeSubject(prompt);
  const style = toTraceStyle(controls.style);
  const sheet = await getSheet(
    `variants|${style}|${subject.toLowerCase()}`,
    async () =>
      buildVariantSheetPrompt(subject, await describeVariants(subject), style),
    options,
  );
  const motionPrompt = wantsMotion(prompt, controls.style) ? prompt : null;

  const cells = await Promise.all(
    sliceGrid(sheet.mask, 2).map((cell) =>
      cellToSvg(cell, controls, motionPrompt).catch(() => null),
    ),
  );

  // Clean cells first; cut-off ones only as a last resort.
  const usable = cells.filter(
    (c): c is { svg: string; clipped: boolean } => !!c,
  );
  const variants = [
    ...usable.filter((c) => !c.clipped),
    ...usable.filter((c) => c.clipped),
  ].map((c) => c.svg);

  if (variants.length === 0) {
    throw new Error("Trace produced no usable icon");
  }

  return {
    variants,
    costUsd: sheet.costUsd,
    cached: sheet.cached,
    model: sheet.model,
  };
}

/** One paid image → a whole pack (up to 9 icons) in a shared style. */
export async function tracePack(
  prompts: string[],
  controls: TraceControls,
  options: TraceOptions,
): Promise<TracePackResult> {
  if (prompts.length > 9) {
    throw new Error("Trace packs support up to 9 icons per sheet");
  }

  const subjects = prompts.map(normalizeSubject);
  const style = toTraceStyle(controls.style);
  const sheet = await getSheet(
    `pack|${style}|${subjects.join("\n").toLowerCase()}`,
    async () => buildPackSheetPrompt(await describeSubjects(subjects), style),
    options,
  );
  const cells = sliceGrid(sheet.mask, gridSizeFor(prompts.length));

  const items = await Promise.all(
    prompts.map(async (prompt, i) => {
      const motionPrompt = wantsMotion(prompt, controls.style) ? prompt : null;
      const result = await cellToSvg(cells[i], controls, motionPrompt).catch(
        () => null,
      );
      return result && !result.clipped ? result.svg : null;
    }),
  );

  return {
    items,
    costUsd: sheet.costUsd,
    cached: sheet.cached,
    model: sheet.model,
  };
}

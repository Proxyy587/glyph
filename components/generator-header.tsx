"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";

export function GeneratorHeaderMeta() {
  const { viewBoxSize, mode } = useSvgGenerator();

  return (
    <>
      <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        {mode === "single" ? "Single icon" : "Icon pack"}
      </span>
      <span className="text-[11px] text-zinc-500 tabular-nums">
        {viewBoxSize} x {viewBoxSize}
      </span>
    </>
  );
}

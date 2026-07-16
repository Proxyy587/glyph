"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";

export function PackLoading() {
  const { loadingPack, loadingStage } = useSvgGenerator();

  if (!loadingPack) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
      <p className="text-xs text-zinc-300">
        {loadingStage ?? "Generating pack…"}
      </p>
      <p className="text-[11px] text-zinc-500">
        First icon locks style · rest generate in parallel
      </p>
    </div>
  );
}

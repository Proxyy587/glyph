"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";

export function PackLoading() {
  const { loadingPack } = useSvgGenerator();

  if (!loadingPack) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
      <p className="text-xs text-zinc-500">Generating pack…</p>
    </div>
  );
}

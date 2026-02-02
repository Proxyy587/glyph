"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";
import { cn } from "@/lib/utils";

export function GeneratorBottomBar() {
  const {
    mode,
    prompt,
    packPrompts,
    loading,
    loadingPack,
    generate,
    generatePack,
  } = useSvgGenerator();

  const isDisabled =
    mode === "single"
      ? loading || !prompt.trim()
      : loadingPack ||
        !packPrompts
          .trim()
          .split("\n")
          .some((s) => s.trim());

  const isLoading = mode === "single" ? loading : loadingPack;
  const label = isLoading
    ? mode === "single"
      ? "Generating…"
      : "Generating pack…"
    : "Generate";

  return (
    <div className="flex h-14 shrink-0 items-center justify-center gap-3 border-t border-zinc-800/80 bg-[#0c0c0e] w-full">
      <button
        type="button"
        onClick={mode === "single" ? generate : generatePack}
        disabled={isDisabled}
        className={cn(
          "rounded-sm w-full py-2 text-sm font-medium transition-all",
          "bg-zinc-100 text-zinc-900 hover:bg-white disabled:pointer-events-none disabled:opacity-40"
        )}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-800" />
            {label}
          </span>
        ) : (
          label
        )}
      </button>
    </div>
  );
}

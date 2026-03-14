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
    <footer className="relative grid h-16 grid-cols-[auto_1fr] items-center gap-3 px-4 sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:px-6">
      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-[11px] uppercase tracking-[0.2em] text-zinc-600">
          Prompt to developer-grade SVG
        </p>
      </div>

      <button
        type="button"
        onClick={mode === "single" ? generate : generatePack}
        disabled={isDisabled}
        className={cn(
          "min-w-[150px] rounded-none border border-zinc-100 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-all sm:min-w-[180px] sm:px-6",
          "hover:bg-white disabled:pointer-events-none disabled:opacity-40",
        )}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-800" />
            {label}
          </span>
        ) : (
          label
        )}
      </button>

      <div className="absolute top-0 left-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-700 bg-[#0a0a0c]" />
      <div className="absolute top-0 right-0 h-2.5 w-2.5 translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-700 bg-[#0a0a0c]" />
      <div className="absolute top-0 left-1/2 h-px w-screen -translate-x-1/2 bg-zinc-800/80" />
    </footer>
  );
}

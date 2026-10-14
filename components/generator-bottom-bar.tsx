"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { useSvgGenerator } from "@/contexts/svg-generator-context";
import { HistoryPanel } from "@/components/history/history-panel";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
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
  const [historyOpen, setHistoryOpen] = useState(false);

  const isDisabled =
    mode === "single"
      ? loading || !prompt.trim()
      : loadingPack || !packPrompts.split("\n").some((s) => s.trim());

  const isLoading = mode === "single" ? loading : loadingPack;
  const label = isLoading
    ? mode === "single"
      ? "Generating…"
      : "Generating pack…"
    : mode === "single"
      ? "Generate"
      : "Generate pack";

  return (
    <footer className="relative grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:gap-4 sm:px-6">
      <div className="min-w-0">
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="inline-flex h-9 items-center gap-2 border border-zinc-800 px-3 text-xs text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100 lg:hidden"
        >
          <History className="size-3.5" />
          History
        </button>
        <p className="hidden truncate text-[11px] uppercase tracking-[0.2em] text-zinc-600 lg:block">
          Prompt to developer-grade SVG
        </p>
      </div>

      <button
        type="button"
        onClick={mode === "single" ? generate : generatePack}
        disabled={isDisabled}
        className={cn(
          "min-w-[150px] border border-zinc-100 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-all sm:min-w-[200px] sm:px-6",
          "hover:bg-white active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
        )}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-800" />
            {label}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2.5">
            {label}
            <kbd className="hidden font-mono text-[10px] text-zinc-500 sm:inline">
              ⌘↵
            </kbd>
          </span>
        )}
      </button>

      <div />

      <div className="absolute top-0 left-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-700 bg-[#0a0a0c]" />
      <div className="absolute top-0 right-0 h-2.5 w-2.5 translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-700 bg-[#0a0a0c]" />
      <div className="absolute top-0 left-1/2 h-px w-screen -translate-x-1/2 bg-zinc-800/80" />

      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent
          side="right"
          className="w-[88vw] gap-0 border-l border-zinc-800 bg-[#0a0a0c] p-0 text-zinc-100 sm:max-w-[360px] [&>button:last-child]:top-4 [&>button:last-child]:right-4"
        >
          <SheetTitle className="sr-only">History</SheetTitle>
          <HistoryPanel inSheet onNavigate={() => setHistoryOpen(false)} />
        </SheetContent>
      </Sheet>
    </footer>
  );
}

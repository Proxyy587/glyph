"use client";

import { cn } from "@/lib/utils";
import { useSvgGenerator } from "@/contexts/svg-generator-context";

export function ModeToggle() {
  const { mode, setMode } = useSvgGenerator();

  return (
    <div className="flex gap-0.5 rounded-lg bg-zinc-800/80 p-0.5">
      <button
        type="button"
        onClick={() => setMode("single")}
        className={cn(
          "flex-1 rounded-md py-2 text-xs font-medium transition-colors",
          mode === "single"
            ? "bg-zinc-700 text-zinc-100 shadow-sm"
            : "text-zinc-500 hover:text-zinc-300"
        )}
      >
        Single
      </button>
      <button
        type="button"
        onClick={() => setMode("pack")}
        className={cn(
          "flex-1 rounded-md py-2 text-xs font-medium transition-colors",
          mode === "pack"
            ? "bg-zinc-700 text-zinc-100 shadow-sm"
            : "text-zinc-500 hover:text-zinc-300"
        )}
      >
        Pack
      </button>
    </div>
  );
}

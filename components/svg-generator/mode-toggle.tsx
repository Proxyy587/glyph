"use client";

import { cn } from "@/lib/utils";
import { useSvgGenerator } from "@/contexts/svg-generator-context";

const MODES = [
  { id: "single", label: "Single icon" },
  { id: "pack", label: "Icon pack" },
] as const;

export function ModeToggle() {
  const { mode, setMode } = useSvgGenerator();

  return (
    <div
      role="tablist"
      aria-label="Generation mode"
      className="mx-4 mt-4 grid grid-cols-2 border border-zinc-800 bg-zinc-900/40 p-0.5"
    >
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          role="tab"
          aria-selected={mode === m.id}
          onClick={() => setMode(m.id)}
          className={cn(
            "py-1.5 text-xs font-medium transition-colors",
            mode === m.id
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-500 hover:text-zinc-200",
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

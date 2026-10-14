"use client";

import { cn } from "@/lib/utils";
import { STYLES } from "@/lib/svg-generator-types";
import { useSvgGenerator } from "@/contexts/svg-generator-context";

export function StylePresets() {
  const { style, setStyle } = useSvgGenerator();

  return (
    <div className="mt-4">
      <span className="text-xs font-medium text-zinc-500">Style</span>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStyle(s.id)}
            aria-pressed={style === s.id}
            className={cn(
              "border px-2.5 py-1.5 text-xs font-medium transition-colors",
              style === s.id
                ? "border-zinc-100 bg-zinc-100 text-zinc-900"
                : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

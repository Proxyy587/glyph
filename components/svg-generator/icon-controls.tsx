"use client";

import { cn } from "@/lib/utils";
import { VIEWBOX_SIZES } from "@/lib/svg-generator-types";
import { useSvgGenerator } from "@/contexts/svg-generator-context";

const sliderClass =
  "mt-1 h-1.5 w-full appearance-none rounded-full bg-zinc-800 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-100";

export function IconControls() {
  const { padding, setPadding, viewBoxSize, setViewBoxSize } =
    useSvgGenerator();

  return (
    <div className="mt-4 space-y-3">
      <div>
        <div className="flex justify-between text-[11px]">
          <span className="font-medium text-zinc-500">Padding</span>
          <span className="text-zinc-400 tabular-nums">{padding}</span>
        </div>
        <input
          type="range"
          min="0"
          max="8"
          step="1"
          value={padding}
          onChange={(e) => setPadding(Number(e.target.value))}
          className={sliderClass}
        />
      </div>
      <div>
        <span className="text-[11px] font-medium text-zinc-500">Size</span>
        <div className="mt-2 flex gap-1.5">
          {VIEWBOX_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setViewBoxSize(size)}
              className={cn(
                "border px-2.5 py-1.5 text-xs font-medium tabular-nums transition-colors",
                viewBoxSize === size
                  ? "border-zinc-100 bg-zinc-100 text-zinc-900"
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

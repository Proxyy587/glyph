"use client";

import { cn } from "@/lib/utils";
import { VIEWBOX_SIZES } from "@/lib/svg-generator-types";
import { useSvgGenerator } from "@/contexts/svg-generator-context";

const sliderClass =
  "mt-1 h-1.5 w-full appearance-none rounded-full bg-zinc-800 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-100";

export function IconControls() {
  const {
    strokeWidth,
    setStrokeWidth,
    cornerRadius,
    setCornerRadius,
    padding,
    setPadding,
    viewBoxSize,
    setViewBoxSize,
  } = useSvgGenerator();

  return (
    <div className="mt-4 space-y-3">
      <div>
        <div className="flex justify-between text-[11px]">
          <span className="font-medium text-zinc-500">Stroke</span>
          <span className="text-zinc-400 tabular-nums">{strokeWidth}</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.25"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className={sliderClass}
        />
      </div>
      <div>
        <div className="flex justify-between text-[11px]">
          <span className="font-medium text-zinc-500">Radius</span>
          <span className="text-zinc-400 tabular-nums">{cornerRadius}</span>
        </div>
        <input
          type="range"
          min="0"
          max="8"
          step="1"
          value={cornerRadius}
          onChange={(e) => setCornerRadius(Number(e.target.value))}
          className={sliderClass}
        />
      </div>
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
                "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                viewBoxSize === size
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
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

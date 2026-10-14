"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";
import { cn } from "@/lib/utils";

const MAX_ICONS = 8;

export function PackPromptInput() {
  const { packPrompts, setPackPrompts, generatePack, loadingPack } =
    useSvgGenerator();
  const count = packPrompts.split("\n").filter((l) => l.trim()).length;

  return (
    <>
      <div className="mt-4 flex items-baseline justify-between">
        <label
          htmlFor="glyph-pack-prompts"
          className="text-xs font-medium text-zinc-500"
        >
          Icons, one per line
        </label>
        <span
          className={cn(
            "text-[10px] tabular-nums",
            count > MAX_ICONS ? "text-red-400" : "text-zinc-600",
          )}
        >
          {count}/{MAX_ICONS} icons
        </span>
      </div>
      <textarea
        id="glyph-pack-prompts"
        value={packPrompts}
        onChange={(e) => setPackPrompts(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !loadingPack) {
            e.preventDefault();
            void generatePack();
          }
        }}
        placeholder={"settings gear\nheart\nstar"}
        rows={6}
        className="mt-1.5 w-full resize-none border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 font-mono text-[13px] leading-6 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
      />
      <p className="mt-1.5 text-[10px] text-zinc-600">
        {count > MAX_ICONS
          ? `Remove ${count - MAX_ICONS} line${count - MAX_ICONS === 1 ? "" : "s"}. Packs are limited to ${MAX_ICONS}.`
          : "All icons share one style. ⌘/Ctrl ↵ to generate"}
      </p>
    </>
  );
}

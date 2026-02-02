"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";
import { ModeToggle } from "@/components/svg-generator/mode-toggle";
import { PromptInput } from "@/components/svg-generator/prompt-input";
import { PackPromptInput } from "@/components/svg-generator/pack-prompt-input";
import { StylePresets } from "@/components/svg-generator/style-presets";
import { IconControls } from "@/components/svg-generator/icon-controls";
import { GeneratorBottomBar } from "./generator-bottom-bar";

export function GeneratorLeftSidebar() {
  const { mode, svg, copied, copySvg, downloadSingle } = useSvgGenerator();

  return (
    <aside className="flex flex-col w-[280px] shrink-0 border-r border-zinc-800/80 bg-[#0c0c0e] px-4 py-4">
      <div className="flex flex-col">
        <ModeToggle />
        {mode === "single" ? <PromptInput /> : <PackPromptInput />}
        <StylePresets />
        <IconControls />
      </div>
      <div className="flex-1" />
      <div>
        <GeneratorBottomBar />
        {mode === "single" && svg && (
          <div className="mt-4 flex gap-2 border-t border-zinc-800/80 pt-4">
            <button
              type="button"
              onClick={copySvg}
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/60 py-2 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={downloadSingle}
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/60 py-2 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              Download
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

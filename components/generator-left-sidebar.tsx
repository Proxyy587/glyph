 "use client";

import { useEffect, useState } from "react";
import { useSvgGenerator } from "@/contexts/svg-generator-context";
import { SVG_MODELS } from "@/lib/svg-generator-types";
import { PromptInput } from "@/components/svg-generator/prompt-input";
import { PackPromptInput } from "@/components/svg-generator/pack-prompt-input";
import { StylePresets } from "@/components/svg-generator/style-presets";
import { IconControls } from "@/components/svg-generator/icon-controls";
import { ModeToggle } from "@/components/svg-generator/mode-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function GeneratorLeftSidebar() {
  const { mode, svg, copied, copySvg, downloadSingle, modelId, setModelId } =
    useSvgGenerator();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="flex w-[290px] shrink-0 flex-col border-r border-zinc-800/80 bg-[#0a0a0c]">
      <div className="border-b border-zinc-800/80 px-4 py-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Design
        </p>
        <p className="mt-2 max-w-[220px] text-xs leading-5 text-zinc-400">
          Tune the prompt, style, and geometry before generating a clean SVG.
        </p>
      </div>
      <div className="flex">
        <div className="w-full">
          <ModeToggle />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-4 py-4">
        {mode === "single" ? <PromptInput /> : <PackPromptInput />}
        <StylePresets />
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Engine
          </p>
          <div className="mt-2">
            {mounted && (
              <Select
                value={modelId}
                onValueChange={(value) => setModelId(value as any)}
              >
                <SelectTrigger
                  size="sm"
                  className="w-full justify-between border-zinc-800 bg-zinc-900/60 text-[11px] text-zinc-200"
                >
                  <span>
                    {
                      SVG_MODELS.find((entry) => entry.id === modelId)
                        ?.label ?? "Choose model"
                    }
                  </span>
                </SelectTrigger>
                <SelectContent
                  align="start"
                  className="bg-[#050509] border-zinc-800"
                >
                  {SVG_MODELS.map((entry) => (
                    <SelectItem
                      key={entry.id}
                      value={entry.id}
                      className="flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 text-xs text-zinc-200 hover:bg-zinc-900"
                    >
                      <span className="flex flex-col">
                        <span className="font-medium text-zinc-100">
                          {entry.label}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {entry.hint}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <IconControls />

        <div className="mt-6 border-t border-zinc-800/80 pt-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Export
          </p>
          <p className="mt-2 text-[11px] leading-5 text-zinc-500">
            Copy raw SVG or download the current result.
          </p>
        </div>

        {mode === "single" && svg && (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={copySvg}
              className="flex-1 rounded-none border border-zinc-700 bg-zinc-900/80 py-2 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={downloadSingle}
              className="flex-1 rounded-none border border-zinc-700 bg-zinc-900/80 py-2 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              Download
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

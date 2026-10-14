"use client";

import { Check, Copy, FileCode, FileImage } from "lucide-react";
import { useSvgGenerator } from "@/contexts/svg-generator-context";
import { PromptInput } from "@/components/svg-generator/prompt-input";
import { PackPromptInput } from "@/components/svg-generator/pack-prompt-input";
import { StylePresets } from "@/components/svg-generator/style-presets";
import { IconControls } from "@/components/svg-generator/icon-controls";
import { ModeToggle } from "@/components/svg-generator/mode-toggle";
import { siteConfig } from "@/lib/site";

const GLYPH_MODEL_NAME = `${siteConfig.name} 1`;

const exportBtn =
  "inline-flex flex-1 items-center justify-center gap-1.5 border border-zinc-700 bg-zinc-900/80 py-2 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-40";

export function GeneratorLeftSidebar() {
  const { mode, svg, copied, copySvg, downloadSingle, downloadSinglePng } =
    useSvgGenerator();
  const canExport = mode === "single" && !!svg;

  return (
    <aside className="flex max-h-[46dvh] min-h-0 w-full shrink-0 flex-col overflow-hidden border-b border-zinc-800/80 bg-[#0a0a0c] md:h-full md:max-h-none md:w-[290px] md:border-r md:border-b-0">
      <div className="hidden shrink-0 border-b border-zinc-800/80 px-4 py-4 md:block">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Design
        </p>
        <p className="mt-2 max-w-[220px] text-xs leading-5 text-zinc-400">
          Describe it, pick a style, generate.
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <ModeToggle />
        <div className="flex flex-1 flex-col px-4 pt-1 pb-4">
          {mode === "single" ? <PromptInput /> : <PackPromptInput />}
          <StylePresets />
          <div className="mt-4">
            <p className="text-xs font-medium text-zinc-500">Model</p>
            <div className="mt-2 flex h-8 w-full items-center justify-between border border-zinc-800 bg-zinc-900/60 px-3 text-[11px] font-medium text-zinc-200">
              {GLYPH_MODEL_NAME}
              <span className="text-[10px] font-normal text-zinc-600">
                Default
              </span>
            </div>
          </div>
          <IconControls />

          <div className="mt-6 border-t border-zinc-800/80 pt-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Export
            </p>
            <p className="mt-2 text-[11px] leading-5 text-zinc-500">
              {canExport
                ? "Copy the SVG code or download the current icon."
                : mode === "pack"
                  ? "Use the buttons above the pack to download icons."
                  : "Generate an icon to export it."}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={copySvg}
                disabled={!canExport}
                className={exportBtn}
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-400" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={downloadSingle}
                disabled={!canExport}
                className={exportBtn}
              >
                <FileCode className="size-3.5" />
                SVG
              </button>
              <button
                type="button"
                onClick={downloadSinglePng}
                disabled={!canExport}
                className={exportBtn}
              >
                <FileImage className="size-3.5" />
                PNG
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSvgGenerator } from "@/contexts/svg-generator-context";

/** ASCII frames — procedural glyph assembly (infinite loop). */
const ASCII_FRAMES = [
  `
    ·  ·  ·  ·  ·
    ·  ·  ·  ·  ·
    ·  ·  ◆  ·  ·
    ·  ·  ·  ·  ·
    ·  ·  ·  ·  ·
`.trim(),
  `
    ·  ·  ·  ·  ·
    ·  ·  ░  ·  ·
    ·  ░  ◆  ░  ·
    ·  ·  ░  ·  ·
    ·  ·  ·  ·  ·
`.trim(),
  `
    ·  ·  ·  ·  ·
    ·  ░  ▒  ░  ·
    ·  ▒  ◆  ▒  ·
    ·  ░  ▒  ░  ·
    ·  ·  ·  ·  ·
`.trim(),
  `
    ·  ░  ·  ░  ·
    ░  ▒  ▓  ▒  ░
    ·  ▓  ◆  ▓  ·
    ░  ▒  ▓  ▒  ░
    ·  ░  ·  ░  ·
`.trim(),
  `
    ░  ▒  ░  ▒  ░
    ▒  ▓  █  ▓  ▒
    ░  █  ◆  █  ░
    ▒  ▓  █  ▓  ▒
    ░  ▒  ░  ▒  ░
`.trim(),
  `
    ┌─────────────┐
    │ ░ ▒ ▓ ▒ ░ │
    │ ▒ ▓ ◆ ▓ ▒ │
    │ ░ ▒ ▓ ▒ ░ │
    └─────────────┘
`.trim(),
  `
    ┌─────────────┐
    │ · ░ ▒ ░ · │
    │ ░ ▒ ◆ ▒ ░ │
    │ · ░ ▒ ░ · │
    └─────────────┘
`.trim(),
  `
    ┌─────────────┐
    │ · · ░ · · │
    │ · ░ ◆ ░ · │
    │ · · ░ · · │
    └─────────────┘
`.trim(),
];

const STATUS_LINES = [
  "> parsing intent",
  "> locking stroke tokens",
  "> drafting vector paths",
  "> optical centering",
  "> validating markup",
  "> polishing output",
];

export function LoadingSpinner() {
  const { loading, loadingStage } = useSvgGenerator();
  const [frame, setFrame] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % ASCII_FRAMES.length);
      setTick((t) => t + 1);
    }, 140);
    return () => window.clearInterval(id);
  }, [loading]);

  if (!loading) return null;

  const status =
    loadingStage ?? STATUS_LINES[tick % STATUS_LINES.length] ?? STATUS_LINES[0];

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-[min(100%,280px)] border border-zinc-800 bg-[#050509] px-4 py-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
        <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-zinc-600">
          <span>glyph // synth</span>
          <span className="tabular-nums text-zinc-500">
            {String((tick % 99) + 1).padStart(2, "0")}
          </span>
        </div>

        <pre
          aria-hidden="true"
          className="overflow-hidden font-mono text-[11px] leading-[1.35] text-zinc-200 sm:text-[12px]"
        >
          {ASCII_FRAMES[frame]}
        </pre>

        <div className="mt-4 flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse bg-zinc-100" />
          <p className="font-mono text-[11px] tracking-wide text-zinc-400">
            {status}
          </p>
        </div>

        <div className="mt-3 h-px w-full overflow-hidden bg-zinc-900">
          <div
            className="h-full bg-zinc-400/80 transition-[width] duration-150 ease-out"
            style={{ width: `${12 + ((tick * 7) % 88)}%` }}
          />
        </div>

        <span className="absolute top-0 left-0 h-2 w-2 border-t border-l border-zinc-600/50" />
        <span className="absolute top-0 right-0 h-2 w-2 border-t border-r border-zinc-600/50" />
        <span className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-zinc-600/50" />
        <span className="absolute right-0 bottom-0 h-2 w-2 border-b border-r border-zinc-600/50" />
      </div>

      <p className="max-w-[240px] text-center text-[11px] leading-5 text-zinc-600">
        Assembling Lucide-grade geometry · one pass
      </p>
    </div>
  );
}

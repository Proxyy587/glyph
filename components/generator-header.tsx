"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";
import { Button } from "@/components/ui/button";

export function GeneratorHeader() {
  const { viewBoxSize } = useSvgGenerator();

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-[#0c0c0e] px-4">
      <a
        href="/"
        className="text-2xl font-semibold tracking-tight text-zinc-100 no-underline"
      >
        glyph
      </a>
      <div className="flex items-center gap-4">
        <span className="text-[11px] text-zinc-500 tabular-nums">
          {viewBoxSize}×{viewBoxSize}
        </span>
        <Button
          // variant="ghost"
          size="sm"
          className="h-8"
        >
          Log in
        </Button>
      </div>
    </header>
  );
}

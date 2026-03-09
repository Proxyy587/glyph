"use client";

import Link from "next/link";
import { useSvgGenerator } from "@/contexts/svg-generator-context";
import { Button } from "@/components/ui/button";

export function GeneratorHeader() {
  const { viewBoxSize, mode } = useSvgGenerator();

  return (
    <header className="relative flex h-14 items-center justify-between px-4 sm:px-6">
      <a
        href="/"
        className=" tracking-[0.18em] text-zinc-100 uppercase no-underline"
      >
        Glyph
      </a>

      <div className="hidden items-center gap-3 md:flex">
        <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          {mode === "single" ? "Single icon" : "Icon pack"}
        </span>
        <span className="text-[11px] text-zinc-500 tabular-nums">
          {viewBoxSize} x {viewBoxSize}
        </span>
      </div>

      <Button
        asChild
        variant="ghost"
        size="sm"
        className="h-8 rounded-none border border-dashed border-zinc-700 bg-transparent px-3 text-[11px] text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
      >
        <Link href="/sign-in">Log in</Link>
      </Button>

      <div className="absolute bottom-0 left-0 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border border-zinc-700 bg-[#0a0a0c]" />
      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 translate-x-1/2 translate-y-1/2 rounded-full border border-zinc-700 bg-[#0a0a0c]" />
      <div className="absolute bottom-0 left-1/2 h-px w-screen -translate-x-1/2 bg-zinc-800/80" />
    </header>
  );
}

"use client";

import { EnhancedBtn } from "@/components/ui/enhancedbtn";
import { useSvgGenerator } from "@/contexts/svg-generator-context";
import { Wand } from "lucide-react";

export function GenerateButton() {
  const {
    mode,
    prompt,
    packPrompts,
    loading,
    loadingPack,
    generate,
    generatePack,
  } = useSvgGenerator();

  const isDisabled =
    mode === "single"
      ? loading || !prompt.trim()
      : loadingPack ||
        !packPrompts
          .trim()
          .split("\n")
          .some((s) => s.trim());

  const label =
    mode === "single"
      ? loading
        ? "Generating…"
        : "Generate"
      : loadingPack
        ? "Generating pack…"
        : "Generate";

  return (
    <div className="mt-auto pt-4">
      <EnhancedBtn
        onClick={mode === "single" ? generate : generatePack}
        disabled={isDisabled}
        loading={mode === "single" ? loading : loadingPack}
        className="rounded-none cursor-pointer relative overflow-hidden focus-visible:ring-0 h-8 px-3 py-1"
      >
        <span className="shine absolute -top-1/2 -left-full h-[200%] w-3/4 skew-x-[-20deg] bg-linear-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
        {label}
        <Wand className="size-4 w-0 opacity-0 group-hover:w-4 group-hover:opacity-100 transition-all duration-200" />
      </EnhancedBtn>
      <span className="absolute h-2 w-2 border-foreground border-dashed border-b border-r bottom-0 right-0" />
      <span className="absolute h-2 w-2 border-foreground border-dashed border-b border-l bottom-0 left-0" />
      <span className="absolute h-2 w-2 border-foreground border-dashed border-t border-r top-0 right-0" />
      <span className="absolute h-2 w-2 border-foreground border-dashed border-t border-l top-0 left-0" />
    </div>
  );
}

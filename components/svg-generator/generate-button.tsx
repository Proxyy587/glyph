"use client";

import { EnhancedBtn } from "@/components/ui/enhancedbtn";
import { useSvgGenerator } from "@/contexts/svg-generator-context";

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
      >
        {label}
      </EnhancedBtn>
    </div>
  );
}

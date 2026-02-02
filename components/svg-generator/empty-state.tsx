"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";

export function EmptyState() {
  const { mode } = useSvgGenerator();

  return (
    <p className="text-sm text-zinc-500">
      {mode === "single"
        ? "Enter a prompt and click Generate to see your icon."
        : "Enter one prompt per line and click Generate pack."}
    </p>
  );
}

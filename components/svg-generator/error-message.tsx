"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";

export function ErrorMessage() {
  const { error } = useSvgGenerator();

  if (!error) return null;

  return (
    <p className="rounded-lg bg-red-950/50 border border-red-900/50 px-3 py-2 text-xs text-red-300">
      {error}
    </p>
  );
}

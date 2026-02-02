"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";

export function PackPromptInput() {
  const { packPrompts, setPackPrompts } = useSvgGenerator();

  return (
    <>
      <label className="mt-4 block text-xs font-medium text-zinc-500">
        One prompt per line
      </label>
      <textarea
        value={packPrompts}
        onChange={(e) => setPackPrompts(e.target.value)}
        placeholder="settings gear, heart, star"
        rows={4}
        className="mt-1.5 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
      />
    </>
  );
}

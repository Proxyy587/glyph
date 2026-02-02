"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";

export function PromptInput() {
  const { prompt, setPrompt } = useSvgGenerator();

  return (
    <>
      <label className="mt-4 block text-xs font-medium text-zinc-500">
        Prompt
      </label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g. settings gear, outline"
        rows={2}
        className="mt-1.5 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
      />
    </>
  );
}

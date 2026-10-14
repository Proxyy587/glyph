"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";
import { cn } from "@/lib/utils";

const MAX = 500;

export function PromptInput() {
  const { prompt, setPrompt, generate, loading } = useSvgGenerator();
  const length = prompt.length;

  return (
    <>
      <div className="mt-4 flex items-baseline justify-between">
        <label
          htmlFor="glyph-prompt"
          className="text-xs font-medium text-zinc-500"
        >
          Prompt
        </label>
        <span
          className={cn(
            "text-[10px] tabular-nums",
            length > MAX ? "text-red-400" : "text-zinc-600",
          )}
        >
          {length}/{MAX}
        </span>
      </div>
      <textarea
        id="glyph-prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !loading) {
            e.preventDefault();
            void generate();
          }
        }}
        placeholder="e.g. a fox sleeping curled up"
        rows={3}
        className="mt-1.5 w-full resize-none border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
      />
      <p className="mt-1.5 text-[10px] text-zinc-600">
        Describe the subject, not the style.{" "}
        <kbd className="font-mono text-zinc-500">⌘/Ctrl ↵</kbd> to generate
      </p>
    </>
  );
}

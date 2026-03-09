"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";
import { ErrorMessage } from "@/components/svg-generator/error-message";
import { PackGrid } from "@/components/svg-generator/pack-grid";
import { LoadingSpinner } from "@/components/svg-generator/loading-spinner";
import { PackLoading } from "@/components/svg-generator/pack-loading";
import { EmptyState } from "@/components/svg-generator/empty-state";

export function GeneratorCanvas() {
  const { mode, svg, loading, packResults, loadingPack, prompt, packPrompts } =
    useSvgGenerator();

  // const activeTitle =
  //   mode === "single"
  //     ? prompt.trim() || "Prompt to icon"
  //     : `${packPrompts
  //         .split("\n")
  //         .map((value) => value.trim())
  //         .filter(Boolean).length || 0} prompts in pack`;

  return (
    <main className="flex min-w-0 flex-1 items-stretch justify-center bg-[#0b0b0d] px-4 py-5 sm:px-6">
      <div className="relative flex w-full max-w-5xl flex-1 flex-col overflow-hidden border border-zinc-800/80 bg-[#0d0d10]">
        <div className="border-b border-zinc-800/80 px-5 py-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Canvas
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
            Prompt to SVG
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
            Developer-grade SVG output inspired by icon systems, not image
            generators.
          </p>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-auto px-6 py-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.10),_transparent_30%)]" />
          <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center gap-6">
            <ErrorMessage />

            {mode === "pack" && (
              <>
                {loadingPack && <PackLoading />}
                {!loadingPack && packResults.length === 0 && <EmptyState />}
                {!loadingPack && packResults.length > 0 && <PackGrid />}
              </>
            )}

            {mode === "single" && (
              <>
                {loading && <LoadingSpinner />}
                {!loading && !svg && <EmptyState />}
                {!loading && svg && (
                  <div className="relative flex min-h-[340px] w-full max-w-[520px] items-center justify-center overflow-hidden border border-zinc-800 bg-[#101014] p-12">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_22%),radial-gradient(circle_at_70%_65%,rgba(99,102,241,0.12),transparent_28%)]" />
                    <div
                      className="relative z-10 text-zinc-100 [&_svg]:max-h-[220px] [&_svg]:max-w-[220px] [&_svg]:shrink-0"
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-zinc-500/40" />
                    <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-zinc-500/40" />
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 border-t border-r border-zinc-500/40" />
                    <span className="absolute top-0 left-0 h-2.5 w-2.5 border-t border-l border-zinc-500/40" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-zinc-500/40" />
        <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-zinc-500/40" />
        <span className="absolute top-0 right-0 h-2.5 w-2.5 border-t border-r border-zinc-500/40" />
        <span className="absolute top-0 left-0 h-2.5 w-2.5 border-t border-l border-zinc-500/40" />
      </div>
    </main>
  );
}

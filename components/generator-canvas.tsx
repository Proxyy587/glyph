"use client";

import { useState } from "react";
import { useSvgGenerator } from "@/contexts/svg-generator-context";
import { ErrorMessage } from "@/components/svg-generator/error-message";
import { PackGrid } from "@/components/svg-generator/pack-grid";
import { LoadingSpinner } from "@/components/svg-generator/loading-spinner";
import { PackLoading } from "@/components/svg-generator/pack-loading";
import { EmptyState } from "@/components/svg-generator/empty-state";

export function GeneratorCanvas() {
  const { mode, svg, displaySvg, loading, packResults, loadingPack } =
    useSvgGenerator();
  const [tab, setTab] = useState<"canvas" | "code">("canvas");
  // Remove automatic clearing of editedSvg in useEffect
  const [editedSvg, setEditedSvg] = useState<string | null>(null);

  // Compute activeSvg: if svg changes, this resets unless user is typing
  const activeSvg = editedSvg !== null ? editedSvg : displaySvg ?? svg ?? "";

  const hasSingleResult = Boolean(svg);

  return (
    <main className="flex min-w-0 flex-1 items-stretch justify-center bg-[#0b0b0d] px-4 py-5 sm:px-6">
      <div className="relative flex w-full max-w-5xl flex-1 flex-col overflow-hidden border border-zinc-800/80 bg-[#0d0d10]">
        <div className="border-b border-zinc-800/80 px-5 py-4">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                Workspace
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
                Prompt to SVG
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                Design on the left, see the icon here, or switch to code to
                tweak the SVG by hand.
              </p>
            </div>

            {mode === "single" && hasSingleResult && (
              <div className="inline-flex w-fit rounded-md border border-zinc-800 bg-zinc-900/70 text-[11px] text-zinc-400">
                <button
                  type="button"
                  onClick={() => setTab("canvas")}
                  className={`px-3 py-1.5 ${
                    tab === "canvas"
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-400 hover:text-zinc-100"
                  }`}
                >
                  Canvas
                </button>
                <button
                  type="button"
                  onClick={() => setTab("code")}
                  className={`px-3 py-1.5 ${
                    tab === "code"
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-400 hover:text-zinc-100"
                  }`}
                >
                  Code
                </button>
              </div>
            )}
          </div>
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

                {!loading && svg && tab === "canvas" && (
                  <div className="relative flex min-h-[340px] w-full max-w-[520px] items-center justify-center overflow-hidden border border-zinc-800 bg-[#101014] p-12">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_22%),radial-gradient(circle_at_70%_65%,rgba(99,102,241,0.12),transparent_28%)]" />
                    <div
                      className="relative z-10 text-zinc-100 [&_svg]:max-h-[220px] [&_svg]:max-w-[220px] [&_svg]:shrink-0"
                      dangerouslySetInnerHTML={{ __html: activeSvg }}
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-zinc-500/40" />
                    <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-zinc-500/40" />
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 border-t border-r border-zinc-500/40" />
                    <span className="absolute top-0 left-0 h-2.5 w-2.5 border-t border-l border-zinc-500/40" />
                  </div>
                )}

                {!loading && svg && tab === "code" && (
                  <div className="flex w-full max-w-[680px] flex-col gap-3">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Raw SVG (editable)</span>
                      <button
                        type="button"
                        className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800"
                        onClick={() => navigator.clipboard.writeText(activeSvg)}
                      >
                        Copy
                      </button>
                    </div>
                    <textarea
                      value={activeSvg}
                      onChange={(event) => setEditedSvg(event.target.value)}
                      className="min-h-[260px] w-full rounded border border-zinc-800 bg-[#050509] px-3 py-3 font-mono text-xs text-zinc-100 shadow-inner outline-none focus:border-zinc-500"
                      spellCheck={false}
                    />
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

"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";
import { ErrorMessage } from "@/components/svg-generator/error-message";
import { PackGrid } from "@/components/svg-generator/pack-grid";
import { LoadingSpinner } from "@/components/svg-generator/loading-spinner";
import { PackLoading } from "@/components/svg-generator/pack-loading";
import { EmptyState } from "@/components/svg-generator/empty-state";

export function GeneratorCanvas() {
  const { mode, svg, loading, packResults, loadingPack } = useSvgGenerator();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 overflow-auto p-8">
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
            <div className="flex min-h-[280px] min-w-[280px] items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 p-10">
              <div
                className="text-zinc-100 [&_svg]:max-h-[200px] [&_svg]:max-w-[200px] [&_svg]:shrink-0 [&_svg]:drop-shadow-sm"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>
          )}
        </>
      )}
    </main>
  );
}

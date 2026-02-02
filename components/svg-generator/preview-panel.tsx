"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";
import { ErrorMessage } from "./error-message";
import { SinglePreview } from "./single-preview";
import { PackGrid } from "./pack-grid";
import { LoadingSpinner } from "./loading-spinner";
import { PackLoading } from "./pack-loading";
import { EmptyState } from "./empty-state";

export function PreviewPanel() {
  const { mode, svg, loading, packResults, loadingPack } = useSvgGenerator();

  return (
    <main className="flex flex-1 flex-col items-center gap-5 overflow-auto p-6">
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
          {!loading && svg && <SinglePreview />}
        </>
      )}
    </main>
  );
}

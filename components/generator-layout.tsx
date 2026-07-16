"use client";

import { SvgGeneratorProvider } from "@/contexts/svg-generator-context";
import { GeneratorLeftSidebar } from "./generator-left-sidebar";
import { GeneratorCanvas } from "./generator-canvas";
import { GeneratorLibrarySidebar } from "./generator-library-sidebar";
import { GeneratorBottomBar } from "./generator-bottom-bar";
import { LadderRail } from "./generator-ornaments";
import { AppHeader } from "@/components/widgets/app-header";
import { GeneratorHeaderMeta } from "./generator-header";

export function GeneratorLayout() {
  return (
    <SvgGeneratorProvider>
      <div className="dark flex h-dvh max-h-dvh flex-col overflow-hidden bg-[#0a0a0c] text-zinc-100">
        <div className="mx-auto w-full max-w-7xl shrink-0 border-x border-zinc-800/80">
          <AppHeader meta={<GeneratorHeaderMeta />} />
        </div>

        <div className="min-h-0 flex-1 overflow-hidden xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,80rem)_minmax(0,1fr)]">
          <aside className="pointer-events-none hidden xl:flex pr-[18%]">
            <LadderRail side="left" />
          </aside>

          <section className="mx-auto flex h-full min-h-0 w-full max-w-7xl overflow-hidden border-x border-zinc-800/80">
            <GeneratorLeftSidebar />
            <GeneratorCanvas />
            <GeneratorLibrarySidebar />
          </section>

          <aside className="pointer-events-none hidden xl:flex pl-[18%]">
            <LadderRail side="right" />
          </aside>
        </div>

        <div className="mx-auto w-full max-w-7xl shrink-0 border-x border-zinc-800/80">
          <GeneratorBottomBar />
        </div>
      </div>
    </SvgGeneratorProvider>
  );
}

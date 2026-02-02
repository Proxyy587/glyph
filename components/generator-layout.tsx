"use client";

import { SvgGeneratorProvider } from "@/contexts/svg-generator-context";
import { GeneratorHeader } from "./generator-header";
import { GeneratorLeftSidebar } from "./generator-left-sidebar";
import { GeneratorCanvas } from "./generator-canvas";
import { GeneratorLibrarySidebar } from "./generator-library-sidebar";

export function GeneratorLayout() {
  return (
    <SvgGeneratorProvider>
      <div className="dark flex h-screen flex-col bg-[#0c0c0e] text-zinc-100">
        <GeneratorHeader />
        <div className="flex min-h-0 flex-1">
          <GeneratorLeftSidebar />
          <GeneratorCanvas />
          <GeneratorLibrarySidebar />
        </div>
      </div>
    </SvgGeneratorProvider>
  );
}

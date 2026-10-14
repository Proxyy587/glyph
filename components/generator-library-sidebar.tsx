"use client";

import { HistoryPanel } from "@/components/history/history-panel";

export function GeneratorLibrarySidebar() {
  return (
    <aside className="hidden h-full min-h-0 w-[300px] shrink-0 flex-col overflow-hidden border-l border-zinc-800/80 bg-[#0a0a0c] lg:flex">
      <HistoryPanel />
    </aside>
  );
}

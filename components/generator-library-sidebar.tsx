"use client";

export function GeneratorLibrarySidebar() {
  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-l border-zinc-800/80 bg-[#0c0c0e]">
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
        <span className="text-xs font-medium text-zinc-400">Library</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800/80 hover:text-zinc-300"
            title="Add"
            aria-label="Add"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800/80 hover:text-zinc-300"
            title="Shuffle"
            aria-label="Shuffle"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 18h1.4a1.4 1.4 0 0 0 1.1-.5l1.1-1.2a1.4 1.4 0 0 1 1.1-.5h1.4" />
              <path d="M9 18h2.8a1.4 1.4 0 0 0 1.1-.5l1.1-1.2a1.4 1.4 0 0 1 1.1-.5h1.4" />
              <path d="M16 18h1.4a1.4 1.4 0 0 0 1.1-.5l1.1-1.2a1.4 1.4 0 0 1 1.1-.5H22" />
              <path d="m2 6 3 3 3-3" />
              <path d="M8 6v12" />
              <path d="m16 6 3 3 3-3" />
              <path d="M22 6v12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 px-4 py-8 text-center">
          <p className="text-[11px] text-zinc-500">
            Generated icons will appear here
          </p>
          <p className="mt-1 text-[10px] text-zinc-600">Log in to sync</p>
        </div>
        <div className="mt-3 space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-2"
            >
              <div className="h-8 w-8 shrink-0 rounded bg-zinc-800" />
              <span className="min-w-0 flex-1 truncate text-[11px] text-zinc-500">
                icon-{i}
              </span>
              <button
                type="button"
                className="shrink-0 rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                aria-label="Delete"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function GeneratorLibrarySidebar() {
  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-l border-zinc-800/80 bg-[#0a0a0c] lg:flex">
      <div className="border-b border-zinc-800/80 px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-500">
            Library
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-none border border-zinc-800 p-1.5 text-zinc-500 hover:bg-zinc-900/80 hover:text-zinc-300"
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
              className="rounded-none border border-zinc-800 p-1.5 text-zinc-500 hover:bg-zinc-900/80 hover:text-zinc-300"
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
        <p className="mt-2 text-xs leading-5 text-zinc-500">
          A shared shelf for saved icons, team packs, and public assets.
        </p>
        <Link
          href="/library"
          className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400 transition-colors hover:text-zinc-100"
        >
          Open library
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="relative rounded-none border border-dashed border-zinc-800 bg-zinc-900/30 px-4 py-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            Coming soon
          </p>
          <p className="mt-3 text-xs leading-5 text-zinc-600">
            Generated icons will live here once accounts and persistence are wired up.
          </p>
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-zinc-600/40" />
          <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-zinc-600/40" />
          <span className="absolute top-0 right-0 h-2.5 w-2.5 border-t border-r border-zinc-600/40" />
          <span className="absolute top-0 left-0 h-2.5 w-2.5 border-t border-l border-zinc-600/40" />
        </div>

        <div className="mt-4 space-y-3">
          {[
            "Outline essentials",
            "Rounded social set",
            "Navigation pack",
          ].map((label) => (
            <div
              key={label}
              className="relative overflow-hidden border border-zinc-800 bg-zinc-900/40 px-3 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 border border-zinc-800 bg-zinc-950" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-zinc-300">{label}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                    placeholder
                  </p>
                </div>
              </div>
              <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-zinc-600/40" />
              <span className="absolute top-0 left-0 h-2 w-2 border-t border-l border-zinc-600/40" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

 "use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Trash2 } from "lucide-react";

type HistoryItem = {
  id: string;
  prompt: string;
  svg: string;
  mode: "single" | "pack";
  createdAt: string;
};

function isHistoryItem(value: unknown): value is HistoryItem {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.prompt === "string" &&
    typeof v.svg === "string" &&
    (v.mode === "single" || v.mode === "pack") &&
    typeof v.createdAt === "string"
  );
}

export function GeneratorLibrarySidebar() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/svg/history", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && Array.isArray(data.items)) {
          setItems(data.items.filter(isHistoryItem));
        }
      } catch {
        if (!cancelled) {
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = (id: string) => {
    // Soft-delete in UI for now. In a next pass we can wire a DELETE route.
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-l border-zinc-800/80 bg-[#0a0a0c] lg:flex">
      <div className="border-b border-zinc-800/80 px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-500">
            Library
          </span>
          <Link
            href="/library"
            className="inline-flex items-center gap-1 rounded-none border border-zinc-800 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-100"
          >
            View all
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
        <p className="mt-2 text-xs leading-5 text-zinc-500">
          Your recently generated icons, ready to reuse or tweak.
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {loading && (
          <div className="relative rounded-none border border-dashed border-zinc-800 bg-zinc-900/30 px-4 py-8 text-center text-xs text-zinc-500">
            Loading your icons…
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="relative rounded-none border border-dashed border-zinc-800 bg-zinc-900/30 px-4 py-10 text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
              No icons yet
            </p>
            <p className="mt-3 text-xs leading-5 text-zinc-600">
              Generate an icon on the left and it will show up here with a
              tiny preview.
            </p>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-zinc-600/40" />
            <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-zinc-600/40" />
            <span className="absolute top-0 right-0 h-2.5 w-2.5 border-t border-r border-zinc-600/40" />
            <span className="absolute top-0 left-0 h-2.5 w-2.5 border-t border-l border-zinc-600/40" />
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => {
              const date = item.createdAt
                ? new Date(item.createdAt)
                : null;
              const label =
                item.prompt.trim().slice(0, 60) ||
                (item.mode === "pack" ? "Pack item" : "Icon");

              return (
                <div
                  key={item.id}
                  className="relative overflow-hidden border border-zinc-800 bg-zinc-900/40 px-3 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-zinc-800 bg-[#050509] text-zinc-100 [&_svg]:h-8 [&_svg]:w-8">
                      <div
                        className="text-[0px]"
                        dangerouslySetInnerHTML={{ __html: item.svg }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-zinc-200">
                        {label}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                        {date
                          ? date.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })
                          : "Just now"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-none border border-zinc-800 text-zinc-500 hover:bg-zinc-900 hover:text-red-400"
                      aria-label="Remove from sidebar"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-zinc-600/40" />
                  <span className="absolute top-0 left-0 h-2 w-2 border-t border-l border-zinc-600/40" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Eye,
  FileImage,
  FileCode,
  MoreVertical,
  Trash2,
  Paintbrush,
  Search,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useSvgGenerator } from "@/contexts/svg-generator-context";
import { downloadSvgAsPng } from "@/lib/svg-to-png";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { toast } from "sonner";

export type HistorySingle = {
  id: string;
  prompt: string;
  svg: string;
  mode: "single";
  createdAt: string;
};

export type HistoryPackItem = { prompt: string; svg: string };

export type HistoryPack = {
  id: string;
  prompt: string;
  mode: "pack";
  createdAt: string;
  items: HistoryPackItem[];
  previewSvgs: string[];
};

export type HistoryEntry = HistorySingle | HistoryPack;

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (
    typeof v.id !== "string" ||
    typeof v.prompt !== "string" ||
    typeof v.createdAt !== "string" ||
    (v.mode !== "single" && v.mode !== "pack")
  ) {
    return false;
  }

  if (v.mode === "single") {
    return typeof v.svg === "string";
  }

  if (!Array.isArray(v.items) || !Array.isArray(v.previewSvgs)) return false;
  const itemsOk = v.items.every((it) => {
    if (!it || typeof it !== "object") return false;
    const r = it as Record<string, unknown>;
    return typeof r.prompt === "string" && typeof r.svg === "string";
  });
  const previewsOk = v.previewSvgs.every((s) => typeof s === "string");
  return itemsOk && previewsOk;
}

function safeName(prompt: string, fallback: string): string {
  return (
    prompt
      .trim()
      .replace(/[^a-z0-9-_]/gi, "-")
      .slice(0, 32) || fallback
  );
}

export function GeneratorLibrarySidebar() {
  const [previewEntry, setPreviewEntry] = useState<HistoryEntry | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "single" | "pack">("all");

  const {
    downloadSvg,
    loadSvgIntoWorkspace,
    loading: genLoading,
    loadingPack,
  } = useSvgGenerator();

  const queryClient = getQueryClient();

  const historyQuery = useQuery({
    queryKey: ["svg-history"],
    queryFn: async (): Promise<HistoryEntry[]> => {
      const res = await fetch("/api/svg/history", { cache: "no-store" });
      const data = await res.json();
      if (!Array.isArray(data.items)) return [];
      return data.items.filter(isHistoryEntry);
    },
    enabled: !(genLoading || loadingPack),
  });

  const items = historyQuery.data ?? [];
  const loading = historyQuery.isLoading;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((entry) => {
      if (filter !== "all" && entry.mode !== filter) return false;
      if (!q) return true;
      return entry.prompt.toLowerCase().includes(q);
    });
  }, [items, query, filter]);

  const grouped = useMemo(() => {
    const groups: { label: string; entries: HistoryEntry[] }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const buckets = new Map<string, HistoryEntry[]>();

    for (const entry of filtered) {
      const d = entry.createdAt ? new Date(entry.createdAt) : new Date();
      const day = new Date(d);
      day.setHours(0, 0, 0, 0);
      let label = day.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      if (day.getTime() === today.getTime()) label = "Today";
      else if (day.getTime() === yesterday.getTime()) label = "Yesterday";

      const list = buckets.get(label) ?? [];
      list.push(entry);
      buckets.set(label, list);
    }

    for (const [label, entries] of buckets) {
      groups.push({ label, entries });
    }
    return groups;
  }, [filtered]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/svg/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Delete failed");
      }
      return true;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["svg-history"] });
      const prev = queryClient.getQueryData<HistoryEntry[]>(["svg-history"]);
      queryClient.setQueryData<HistoryEntry[]>(["svg-history"], (old) =>
        (old ?? []).filter((e) => e.id !== id),
      );
      if (previewEntry?.id === id) setPreviewEntry(null);
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["svg-history"], ctx.prev);
      toast.error("Delete failed. Restored the item.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["svg-history"] });
    },
  });

  const handleDelete = useCallback(
    async (entry: HistoryEntry) => {
      deleteMutation.mutate(entry.id);
    },
    [deleteMutation],
  );

  const handleDownloadSvg = useCallback(
    (item: HistorySingle) => {
      downloadSvg(item.svg, safeName(item.prompt, "icon"));
    },
    [downloadSvg],
  );

  const handleDownloadPng = useCallback((item: HistorySingle) => {
    downloadSvgAsPng(item.svg, safeName(item.prompt, "icon"), 512);
  }, []);

  const handleUseInWorkspace = useCallback(
    (item: HistorySingle) => {
      loadSvgIntoWorkspace(item.svg, item.prompt);
      setPreviewEntry(null);
    },
    [loadSvgIntoWorkspace],
  );

  return (
    <aside className="hidden h-full min-h-0 w-[300px] shrink-0 flex-col overflow-hidden border-l border-zinc-800/80 bg-[#0a0a0c] lg:flex">
      <div className="shrink-0 border-b border-zinc-800/80 px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-500">
            History
          </span>
          <Link
            href="/library"
            className="inline-flex items-center gap-1 rounded-none border border-zinc-800 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-100"
          >
            View all
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts…"
            className="w-full border border-zinc-800 bg-zinc-900/50 py-2 pr-3 pl-8 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-zinc-600"
          />
        </div>

        <div className="mt-3 flex gap-1">
          {(
            [
              ["all", "All"],
              ["single", "Icons"],
              ["pack", "Packs"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] transition-colors ${
                filter === id
                  ? "bg-zinc-100 text-zinc-900"
                  : "border border-zinc-800 text-zinc-500 hover:text-zinc-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-0 min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:theme(colors.zinc.700)_transparent]">
        <div className="space-y-5 p-4 pb-6">
          {loading && (
            <div className="border border-dashed border-zinc-800 bg-zinc-900/30 px-4 py-8 text-center text-xs text-zinc-500">
              Loading history…
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="border border-dashed border-zinc-800 bg-zinc-900/30 px-4 py-10 text-center">
              <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                {items.length === 0 ? "No icons yet" : "No matches"}
              </p>
              <p className="mt-3 text-xs leading-5 text-zinc-600">
                {items.length === 0
                  ? "Generate an icon and it will appear here."
                  : "Try a different search or filter."}
              </p>
            </div>
          )}

          {!loading &&
            grouped.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                  {group.label}
                  <span className="ml-2 text-zinc-700">
                    {group.entries.length}
                  </span>
                </p>
                <div className="space-y-2">
                  {group.entries.map((entry) => {
                    const date = entry.createdAt
                      ? new Date(entry.createdAt)
                      : null;
                    const label = entry.prompt.trim() || "Icon";
                    const isPack = entry.mode === "pack";

                    return (
                      <div
                        key={entry.id}
                        className="group relative overflow-hidden border border-zinc-800 bg-zinc-900/40 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60"
                      >
                        <button
                          type="button"
                          onClick={() => setPreviewEntry(entry)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 pr-12 text-left outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-inset"
                        >
                          {entry.mode === "single" ? (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-zinc-800 bg-[#050509] text-zinc-100 [&_svg]:h-6 [&_svg]:w-6">
                              <div
                                className="text-[0px]"
                                dangerouslySetInnerHTML={{ __html: entry.svg }}
                              />
                            </div>
                          ) : (
                            <div className="grid h-10 w-10 shrink-0 grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden border border-zinc-800 bg-[#050509] p-0.5">
                              {entry.previewSvgs.slice(0, 3).map((svg, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-center bg-[#0a0a0c] text-zinc-100 [&_svg]:h-3.5 [&_svg]:w-3.5"
                                  dangerouslySetInnerHTML={{ __html: svg }}
                                />
                              ))}
                              <div className="flex items-center justify-center bg-[#0a0a0c] text-[9px] font-medium text-zinc-500">
                                +{Math.max(0, entry.items.length - 3)}
                              </div>
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-zinc-200">
                              {label}
                            </p>
                            <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                              {isPack ? "Pack" : "Icon"}
                              {date
                                ? ` · ${date.toLocaleTimeString(undefined, {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}`
                                : ""}
                            </p>
                          </div>
                        </button>

                        <div className="absolute top-2 right-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex h-7 w-7 items-center justify-center border border-zinc-800 bg-[#0a0a0c] text-zinc-500 opacity-0 transition-opacity hover:bg-zinc-800 hover:text-zinc-300 group-hover:opacity-100 focus-visible:opacity-100"
                                aria-label="Options"
                              >
                                <MoreVertical className="size-3.5" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="end"
                              side="left"
                              className="w-52 rounded-none border-zinc-800 bg-[#0d0d10] p-1"
                            >
                              <button
                                type="button"
                                onClick={() => setPreviewEntry(entry)}
                                className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-800"
                              >
                                <Eye className="size-3.5" />
                                Preview
                              </button>
                              {entry.mode === "single" ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadSvg(entry)}
                                    className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-800"
                                  >
                                    <FileCode className="size-3.5" />
                                    Download SVG
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadPng(entry)}
                                    className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-800"
                                  >
                                    <FileImage className="size-3.5" />
                                    Download PNG
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUseInWorkspace(entry)}
                                    className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-800"
                                  >
                                    <Paintbrush className="size-3.5" />
                                    Use in workspace
                                  </button>
                                </>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => handleDelete(entry)}
                                className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs text-red-400 hover:bg-zinc-800"
                              >
                                <Trash2 className="size-3.5" />
                                Delete
                              </button>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Preview sheet */}
      <Sheet
        open={!!previewEntry}
        onOpenChange={(open) => !open && setPreviewEntry(null)}
      >
        <SheetContent
          side="right"
          className="w-full border-l border-zinc-800 bg-[#0a0a0c] sm:max-w-md"
          showCloseButton={true}
        >
          {previewEntry && (
            <>
              <SheetHeader className="border-b border-zinc-800/80 pb-4">
                <SheetTitle className="min-w-0 text-left text-sm font-medium text-zinc-100">
                  <span className="block truncate">
                    {previewEntry.prompt.trim().slice(0, 80) ||
                      (previewEntry.mode === "pack" ? "Pack" : "Icon")}
                  </span>
                </SheetTitle>
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  {previewEntry.createdAt
                    ? new Date(previewEntry.createdAt).toLocaleDateString(
                        undefined,
                        { dateStyle: "medium" },
                      )
                    : "Just now"}
                </p>
              </SheetHeader>

              {previewEntry.mode === "single" ? (
                <div className="flex flex-1 flex-col items-center justify-center overflow-auto py-8">
                  <div className="flex min-h-[200px] w-full items-center justify-center rounded-none border border-zinc-800 bg-[#050509] p-8 text-zinc-100 [&_svg]:max-h-[180px] [&_svg]:max-w-[180px] [&_svg]:shrink-0">
                    <div
                      className="text-[0px]"
                      dangerouslySetInnerHTML={{ __html: previewEntry.svg }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col gap-3 overflow-auto p-4">
                  <div className="rounded-none border border-zinc-800 bg-[#050509] p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      Pack • {previewEntry.items.length} icons
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Tap an icon to send it to the workspace, or download as
                      SVG/PNG.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {previewEntry.items.map((it) => (
                      <div
                        key={it.prompt}
                        role="button"
                        tabIndex={0}
                        onClick={() => loadSvgIntoWorkspace(it.svg, it.prompt)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            loadSvgIntoWorkspace(it.svg, it.prompt);
                          }
                        }}
                        className="group relative overflow-hidden rounded-none border border-zinc-800 bg-zinc-900/40 p-3 text-left outline-none hover:bg-zinc-900/70 focus-visible:ring-2 focus-visible:ring-zinc-500"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center border border-zinc-800 bg-[#0a0a0c] text-zinc-100 [&_svg]:h-7 [&_svg]:w-7">
                            <div
                              className="text-[0px]"
                              dangerouslySetInnerHTML={{ __html: it.svg }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-zinc-200">
                              {it.prompt}
                            </p>
                            <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                              Click to use
                            </p>
                          </div>
                        </div>
                        <div className="absolute right-2 top-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-none border border-zinc-800 bg-[#0a0a0c] text-zinc-500 opacity-0 transition-opacity hover:bg-zinc-800 hover:text-zinc-300 group-hover:opacity-100 focus-visible:opacity-100"
                                aria-label="Options"
                              >
                                <MoreVertical className="size-3.5" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="end"
                              side="left"
                              className="w-48 rounded-none border-zinc-800 bg-[#0d0d10] p-1"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  downloadSvg(
                                    it.svg,
                                    safeName(it.prompt, "icon"),
                                  )
                                }
                                className="flex w-full items-center gap-2 rounded-none px-2 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-800"
                              >
                                <FileCode className="size-3.5" />
                                Download SVG
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  downloadSvgAsPng(
                                    it.svg,
                                    safeName(it.prompt, "icon"),
                                    512,
                                  )
                                }
                                className="flex w-full items-center gap-2 rounded-none px-2 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-800"
                              >
                                <FileImage className="size-3.5" />
                                Download PNG
                              </button>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <SheetFooter className="flex flex-row flex-wrap gap-2 border-t border-zinc-800/80 pt-4">
                {previewEntry.mode === "single" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUseInWorkspace(previewEntry)}
                      className="inline-flex items-center gap-2 rounded-none border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                    >
                      <Paintbrush className="size-3.5" />
                      Use in workspace
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadSvg(previewEntry)}
                      className="inline-flex items-center gap-2 rounded-none border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                    >
                      <FileCode className="size-3.5" />
                      SVG
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadPng(previewEntry)}
                      className="inline-flex items-center gap-2 rounded-none border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                    >
                      <FileImage className="size-3.5" />
                      PNG
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(previewEntry)}
                      className="inline-flex items-center gap-2 rounded-none border border-zinc-800 bg-transparent px-3 py-2 text-xs font-medium text-red-400/90 hover:bg-zinc-900 hover:text-red-300"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (previewEntry.items.length > 0) {
                          const first = previewEntry.items[0];
                          loadSvgIntoWorkspace(first.svg, first.prompt);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-none border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                    >
                      <Paintbrush className="size-3.5" />
                      Use in workspace
                    </button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-none border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                        >
                          <MoreVertical className="size-3.5" />
                          More
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        className="w-56 rounded-none border-zinc-800 bg-[#0d0d10] p-1"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            previewEntry.items.forEach((it) =>
                              downloadSvg(it.svg, safeName(it.prompt, "icon")),
                            );
                          }}
                          className="flex w-full items-center gap-2 rounded-none px-2 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-800"
                        >
                          <FileCode className="size-3.5" />
                          Download all SVGs
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            previewEntry.items.forEach((it) =>
                              downloadSvgAsPng(
                                it.svg,
                                safeName(it.prompt, "icon"),
                                512,
                              ),
                            );
                          }}
                          className="flex w-full items-center gap-2 rounded-none px-2 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-800"
                        >
                          <FileImage className="size-3.5" />
                          Download all PNGs
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(previewEntry)}
                          className="mt-1 flex w-full items-center gap-2 rounded-none px-2 py-2 text-left text-xs text-red-400/90 hover:bg-zinc-800 hover:text-red-300"
                        >
                          <Trash2 className="size-3.5" />
                          Delete pack
                        </button>
                      </PopoverContent>
                    </Popover>
                  </>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </aside>
  );
}

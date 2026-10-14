"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Copy,
  Eye,
  FileCode,
  FileImage,
  History,
  MoreHorizontal,
  PenLine,
  RotateCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSvgGenerator } from "@/contexts/svg-generator-context";
import { useSession } from "@/lib/authClient";
import { SvgPreview } from "@/components/svg-generator/svg-preview";
import {
  ConfirmDeleteDialog,
  type DeleteTarget,
} from "@/components/svg-generator/confirm-delete-dialog";
import { ActionButton } from "@/components/history/action-button";
import { HistoryPreviewSheet } from "@/components/history/history-preview-sheet";
import {
  formatTime,
  groupByDay,
  useDeleteHistory,
  useHistory,
  type HistoryEntry,
} from "@/components/history/use-history";
import {
  copyToClipboard,
  downloadMany,
  downloadSvgFile,
  fileNameFor,
} from "@/lib/icon-export";
import { downloadSvgAsPng } from "@/lib/svg-to-png";
import { cn } from "@/lib/utils";

type Filter = "all" | "single" | "pack";

const FILTERS: [Filter, string][] = [
  ["all", "All"],
  ["single", "Icons"],
  ["pack", "Packs"],
];

const menuItem =
  "cursor-pointer rounded-none px-2.5 py-2 text-xs text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100";

export function HistoryPanel({
  onNavigate,
  inSheet = false,
}: {
  onNavigate?: () => void;
  inSheet?: boolean;
}) {
  const { data: session, isPending: sessionPending } = useSession();
  const signedIn = Boolean(session?.user);
  const {
    svg: workspaceSvg,
    generationId,
    loadSvgIntoWorkspace,
    reusePrompt,
  } = useSvgGenerator();

  const historyQuery = useHistory(signedIn);
  const deleteMutation = useDeleteHistory();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [previewEntry, setPreviewEntry] = useState<HistoryEntry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<HistoryEntry | null>(
    null,
  );

  const items = useMemo(() => historyQuery.data ?? [], [historyQuery.data]);
  const counts = useMemo(
    () => ({
      all: items.length,
      single: items.filter((e) => e.mode === "single").length,
      pack: items.filter((e) => e.mode === "pack").length,
    }),
    [items],
  );

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((entry) => {
      if (filter !== "all" && entry.mode !== filter) return false;
      if (!q) return true;
      if (entry.prompt.toLowerCase().includes(q)) return true;
      return (
        entry.mode === "pack" &&
        entry.items.some((it) => it.prompt.toLowerCase().includes(q))
      );
    });
    return groupByDay(filtered);
  }, [items, query, filter]);

  const isActive = (entry: HistoryEntry) =>
    entry.mode === "single" &&
    (entry.id === generationId || entry.svg === workspaceSvg);

  const openInWorkspace = (entry: HistoryEntry) => {
    if (entry.mode === "single") {
      loadSvgIntoWorkspace(entry.svg, {
        prompt: entry.prompt,
        generationId: entry.id,
      });
      toast.success("Opened in workspace");
    } else {
      reusePrompt(entry.items.map((i) => i.prompt).join("\n"), "pack");
      toast.success("Pack prompts loaded into the editor");
    }
    onNavigate?.();
  };

  const deleteTarget: DeleteTarget | null = pendingDelete
    ? pendingDelete.mode === "single"
      ? {
          kind: "icon",
          prompt: pendingDelete.prompt,
          previews: [pendingDelete.svg],
        }
      : {
          kind: "pack",
          prompt: pendingDelete.items.map((i) => i.prompt).join(", "),
          previews: pendingDelete.previewSvgs,
          count: pendingDelete.items.length,
        }
    : null;

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete.id);
    if (previewEntry?.id === pendingDelete.id) setPreviewEntry(null);
    setPendingDelete(null);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-zinc-800/80 px-4 py-4">
        <div
          className={cn(
            "flex items-center justify-between",
            inSheet && "pr-9",
          )}
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-500">
            History
            {signedIn && counts.all > 0 && (
              <span className="ml-2 text-zinc-700 tabular-nums">
                {counts.all}
              </span>
            )}
          </span>
          <Link
            href="/library"
            className="inline-flex items-center gap-1 border border-zinc-800 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-400 transition-colors hover:bg-zinc-900/80 hover:text-zinc-100"
          >
            Library
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        {signedIn && (
          <>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-600" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setQuery("")}
                placeholder="Search prompts…"
                aria-label="Search history"
                className="w-full border border-zinc-800 bg-zinc-900/50 py-2 pr-8 pl-8 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-0.5 text-zinc-500 hover:text-zinc-200"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="mt-3 flex gap-1" role="tablist">
              {FILTERS.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={filter === id}
                  onClick={() => setFilter(id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] transition-colors",
                    filter === id
                      ? "bg-zinc-100 text-zinc-900"
                      : "border border-zinc-800 text-zinc-500 hover:text-zinc-200",
                  )}
                >
                  {label}
                  <span
                    className={cn(
                      "tabular-nums",
                      filter === id ? "text-zinc-500" : "text-zinc-700",
                    )}
                  >
                    {counts[id]}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="h-0 min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-color:theme(colors.zinc.700)_transparent] [scrollbar-width:thin]">
        <div className="space-y-5 p-4 pb-6">
          {!sessionPending && !signedIn && (
            <EmptyCard
              title="Your history lives here"
              body="Sign in and every icon you generate is saved automatically, ready to reopen, export or remix."
              action={
                <Link
                  href="/sign-in"
                  className="mt-4 inline-flex items-center gap-1.5 bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-white"
                >
                  Sign in
                  <ArrowUpRight className="size-3.5" />
                </Link>
              }
            />
          )}

          {signedIn && historyQuery.isLoading && <HistorySkeleton />}

          {signedIn && historyQuery.isError && (
            <EmptyCard
              title="Couldn't load history"
              body="Check your connection and try again."
              action={
                <button
                  type="button"
                  onClick={() => historyQuery.refetch()}
                  className="mt-4 inline-flex items-center gap-1.5 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-900"
                >
                  <RotateCw className="size-3.5" />
                  Retry
                </button>
              }
            />
          )}

          {signedIn && historyQuery.isSuccess && groups.length === 0 && (
            <EmptyCard
              title={items.length === 0 ? "No icons yet" : "No matches"}
              body={
                items.length === 0
                  ? "Generate your first icon and it will show up here."
                  : "Try a different search or filter."
              }
              action={
                items.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setFilter("all");
                    }}
                    className="mt-4 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900"
                  >
                    Clear filters
                  </button>
                ) : null
              }
            />
          )}

          {signedIn &&
            groups.map((group) => (
              <section key={group.label}>
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                  {group.label}
                </p>
                <ul className="space-y-1.5">
                  {group.entries.map((entry) => (
                    <HistoryRow
                      key={entry.id}
                      entry={entry}
                      active={isActive(entry)}
                      onPreview={() => setPreviewEntry(entry)}
                      onOpen={() => openInWorkspace(entry)}
                      onDelete={() => setPendingDelete(entry)}
                    />
                  ))}
                </ul>
              </section>
            ))}
        </div>
      </div>

      <HistoryPreviewSheet
        entry={previewEntry}
        onClose={() => setPreviewEntry(null)}
        onDelete={setPendingDelete}
        onOpened={onNavigate}
      />

      <ConfirmDeleteDialog
        target={deleteTarget}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function HistoryRow({
  entry,
  active,
  onPreview,
  onOpen,
  onDelete,
}: {
  entry: HistoryEntry;
  active: boolean;
  onPreview: () => void;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const isPack = entry.mode === "pack";
  const title = isPack
    ? entry.items.map((i) => i.prompt).join(", ")
    : entry.prompt.trim() || "Untitled icon";
  const name = fileNameFor(entry.prompt);

  return (
    <li
      className={cn(
        "group relative border bg-zinc-900/30 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60",
        active ? "border-zinc-500 bg-zinc-900/70" : "border-zinc-800",
      )}
    >
      <button
        type="button"
        onClick={onPreview}
        className="flex w-full items-center gap-3 px-2.5 py-2.5 pr-[72px] text-left outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-inset"
      >
        {isPack ? (
          <div className="grid size-11 shrink-0 grid-cols-2 grid-rows-2 gap-px overflow-hidden border border-zinc-800 bg-zinc-800">
            {entry.items.slice(0, 4).map((it, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center bg-[#08080b] text-zinc-100"
              >
                <SvgPreview svg={it.svg} className="size-3.5" />
              </div>
            ))}
            {Array.from({ length: Math.max(0, 4 - entry.items.length) }).map(
              (_, idx) => (
                <div key={`pad-${idx}`} className="bg-[#08080b]" />
              ),
            )}
          </div>
        ) : (
          <div className="flex size-11 shrink-0 items-center justify-center border border-zinc-800 bg-[#08080b] text-zinc-100">
            <SvgPreview svg={entry.svg} className="size-6" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xs leading-[1.35rem] font-medium text-zinc-200">
            {title}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-zinc-600">
            {isPack ? `Pack · ${entry.items.length}` : "Icon"}
            <span aria-hidden>·</span>
            <span className="normal-case tracking-normal">
              {formatTime(entry.createdAt)}
            </span>
            {active && (
              <span className="ml-auto inline-flex items-center gap-1 normal-case tracking-normal text-emerald-400/90">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                In workspace
              </span>
            )}
          </p>
        </div>
      </button>

      <div className="absolute top-2 right-2 flex gap-1 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 lg:has-[[data-state=open]]:opacity-100">
        <ActionButton
          label={isPack ? "Load prompts into editor" : "Open in workspace"}
          className="h-7 w-7"
          onClick={onOpen}
        >
          {isPack ? (
            <PenLine className="size-3.5" />
          ) : (
            <ArrowUpRight className="size-3.5" />
          )}
        </ActionButton>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="More actions"
              className="inline-flex h-7 w-7 items-center justify-center border border-zinc-800 bg-[#0a0a0c] text-zinc-400 transition-colors outline-none hover:bg-zinc-800 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-500 data-[state=open]:bg-zinc-800 data-[state=open]:text-zinc-100"
            >
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 rounded-none border-zinc-800 bg-[#0d0d10] p-1 text-zinc-200"
          >
            <DropdownMenuItem className={menuItem} onSelect={onPreview}>
              <Eye />
              Preview
            </DropdownMenuItem>
            {entry.mode === "single" ? (
              <>
                <DropdownMenuItem className={menuItem} onSelect={onOpen}>
                  <ArrowUpRight />
                  Open in workspace
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={menuItem}
                  onSelect={() => copyToClipboard(entry.svg)}
                >
                  <Copy />
                  Copy SVG
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={menuItem}
                  onSelect={() => downloadSvgFile(entry.svg, name)}
                >
                  <FileCode />
                  Download SVG
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={menuItem}
                  onSelect={() => downloadSvgAsPng(entry.svg, name, 512)}
                >
                  <FileImage />
                  Download PNG
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem className={menuItem} onSelect={onOpen}>
                  <PenLine />
                  Reuse prompts
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={menuItem}
                  onSelect={() => downloadMany(entry.items, "svg")}
                >
                  <FileCode />
                  Download all SVG
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={menuItem}
                  onSelect={() => downloadMany(entry.items, "png")}
                >
                  <FileImage />
                  Download all PNG
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              variant="destructive"
              className={cn(
                menuItem,
                "text-red-400 focus:bg-red-950/50 focus:text-red-300",
              )}
              onSelect={onDelete}
            >
              <Trash2 />
              Delete…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}

function EmptyCard({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center border border-dashed border-zinc-800 bg-zinc-900/20 px-5 py-10 text-center">
      <History className="size-5 text-zinc-600" />
      <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-zinc-400">
        {title}
      </p>
      <p className="mt-2 text-xs leading-5 text-zinc-600">{body}</p>
      {action}
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-1.5" aria-label="Loading history">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border border-zinc-800/70 px-2.5 py-2.5"
        >
          <div className="size-11 shrink-0 animate-pulse bg-zinc-800/60" />
          <div className="flex-1 space-y-2">
            <div
              className="h-2.5 animate-pulse bg-zinc-800/60"
              style={{ width: `${55 + ((i * 17) % 35)}%` }}
            />
            <div className="h-2 w-1/3 animate-pulse bg-zinc-800/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

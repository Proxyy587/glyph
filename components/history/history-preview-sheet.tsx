"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Copy,
  FileCode,
  FileImage,
  PenLine,
  Trash2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { useSvgGenerator } from "@/contexts/svg-generator-context";
import {
  SurfaceToggle,
  SvgPreview,
  surfaceProps,
  type PreviewSurface,
} from "@/components/svg-generator/svg-preview";
import { ActionButton } from "@/components/history/action-button";
import {
  formatTime,
  useEntryVariants,
  type HistoryEntry,
  type HistoryPack,
  type HistorySingle,
} from "@/components/history/use-history";
import {
  copyToClipboard,
  downloadMany,
  downloadSvgFile,
  fileNameFor,
} from "@/lib/icon-export";
import { downloadSvgAsPng } from "@/lib/svg-to-png";
import { cn } from "@/lib/utils";

const secondaryBtn =
  "inline-flex h-9 items-center justify-center gap-2 border border-zinc-800 bg-zinc-900/60 px-3 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function HistoryPreviewSheet({
  entry,
  onClose,
  onDelete,
  onOpened,
}: {
  entry: HistoryEntry | null;
  onClose: () => void;
  onDelete: (entry: HistoryEntry) => void;
  onOpened?: () => void;
}) {
  return (
    <Sheet open={!!entry} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full gap-0 border-l border-zinc-800 bg-[#0a0a0c] p-0 text-zinc-100 sm:max-w-[440px] [&>button:last-child]:top-5 [&>button:last-child]:right-5 [&>button:last-child]:text-zinc-400"
      >
        {entry?.mode === "single" && (
          <SinglePreview
            key={entry.id}
            entry={entry}
            onClose={onClose}
            onDelete={onDelete}
            onOpened={onOpened}
          />
        )}
        {entry?.mode === "pack" && (
          <PackPreview
            key={entry.id}
            entry={entry}
            onClose={onClose}
            onDelete={onDelete}
            onOpened={onOpened}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function SheetHead({
  eyebrow,
  title,
  createdAt,
}: {
  eyebrow: string;
  title: string;
  createdAt: string;
}) {
  return (
    <SheetHeader className="gap-0 border-b border-zinc-800/80 px-5 pt-5 pb-4 pr-12">
      <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
        {eyebrow}
      </p>
      <SheetTitle className="mt-2 line-clamp-3 text-left text-base leading-6 font-medium text-zinc-100">
        {title}
      </SheetTitle>
      <SheetDescription className="mt-1 text-[11px] text-zinc-500">
        {formatDate(createdAt)} · {formatTime(createdAt)}
      </SheetDescription>
    </SheetHeader>
  );
}

function SinglePreview({
  entry,
  onClose,
  onDelete,
  onOpened,
}: {
  entry: HistorySingle;
  onClose: () => void;
  onDelete: (entry: HistoryEntry) => void;
  onOpened?: () => void;
}) {
  const { loadSvgIntoWorkspace, saveVariantChoice, reusePrompt } =
    useSvgGenerator();
  const [surface, setSurface] = useState<PreviewSurface>("dark");
  const [picked, setPicked] = useState<string | null>(null);
  const variantsQuery = useEntryVariants(entry);
  const variants = variantsQuery.data ?? [];
  const current = picked ?? entry.svg;
  const name = fileNameFor(entry.prompt);
  const stage = surfaceProps(surface);

  const openInWorkspace = () => {
    loadSvgIntoWorkspace(current, {
      prompt: entry.prompt,
      variants,
      generationId: entry.id,
    });
    const index = variants.indexOf(current);
    if (picked && picked !== entry.svg && index >= 0) {
      saveVariantChoice(entry.id, index);
    }
    toast.success("Opened in workspace");
    onClose();
    onOpened?.();
  };

  return (
    <>
      <SheetHead
        eyebrow="Icon"
        title={entry.prompt.trim() || "Untitled icon"}
        createdAt={entry.createdAt}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div
          className={cn(
            "relative flex aspect-square w-full items-center justify-center border border-zinc-800 transition-colors",
            stage.className,
          )}
          style={stage.style}
        >
          <SvgPreview
            svg={current}
            label={entry.prompt}
            className="h-[58%] w-[58%]"
          />
          <SurfaceToggle
            value={surface}
            onChange={setSurface}
            className="absolute top-3 right-3"
          />
        </div>

        {variants.length > 1 && (
          <div className="mt-5">
            <div className="flex items-baseline justify-between">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Options
              </p>
              <p className="text-[11px] text-zinc-600">
                Pick one, then open it
              </p>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {variants.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPicked(v)}
                  aria-label={`Option ${i + 1}`}
                  aria-pressed={current === v}
                  className={cn(
                    "relative flex aspect-square items-center justify-center border bg-[#101014] p-3 text-zinc-100 transition-colors",
                    current === v
                      ? "border-zinc-300"
                      : "border-zinc-800 hover:border-zinc-600",
                  )}
                >
                  <SvgPreview svg={v} className="h-full w-full" />
                  {v === entry.svg && (
                    <span className="absolute top-1 left-1 text-[8px] uppercase tracking-[0.14em] text-zinc-500">
                      Saved
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-end justify-between gap-2 border border-zinc-800/80 bg-[#0d0d10] px-4 py-3">
          {[16, 24, 32, 48].map((size) => (
            <div key={size} className="flex flex-col items-center gap-1.5">
              <div className="flex h-14 items-end">
                <SvgPreview
                  svg={current}
                  className="text-zinc-100"
                  style={{ width: size, height: size }}
                />
              </div>
              <span className="text-[9px] tabular-nums text-zinc-600">
                {size}px
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            reusePrompt(entry.prompt, "single");
            toast.success("Prompt loaded into the editor");
            onClose();
            onOpened?.();
          }}
          className="mt-5 flex w-full items-center gap-2 text-left text-[11px] text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <PenLine className="size-3.5" />
          Reuse this prompt to generate new options
        </button>
      </div>

      <div className="flex flex-col gap-2 border-t border-zinc-800/80 bg-[#0a0a0c] px-5 py-4">
        <button
          type="button"
          onClick={openInWorkspace}
          className="inline-flex h-10 w-full items-center justify-center gap-2 bg-zinc-100 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
        >
          Open in workspace
          <ArrowUpRight className="size-4" />
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => copyToClipboard(current)}
            className={cn(secondaryBtn, "flex-1")}
          >
            <Copy className="size-3.5" />
            Copy
          </button>
          <button
            type="button"
            onClick={() => downloadSvgFile(current, name)}
            className={cn(secondaryBtn, "flex-1")}
          >
            <FileCode className="size-3.5" />
            SVG
          </button>
          <button
            type="button"
            onClick={() => downloadSvgAsPng(current, name, 512)}
            className={cn(secondaryBtn, "flex-1")}
          >
            <FileImage className="size-3.5" />
            PNG
          </button>
          <ActionButton
            label="Delete icon"
            tone="danger"
            className="h-9 w-9"
            onClick={() => onDelete(entry)}
          >
            <Trash2 className="size-3.5" />
          </ActionButton>
        </div>
      </div>
    </>
  );
}

function PackPreview({
  entry,
  onClose,
  onDelete,
  onOpened,
}: {
  entry: HistoryPack;
  onClose: () => void;
  onDelete: (entry: HistoryEntry) => void;
  onOpened?: () => void;
}) {
  const { loadSvgIntoWorkspace, reusePrompt } = useSvgGenerator();
  const [surface, setSurface] = useState<PreviewSurface>("dark");
  const tile = surfaceProps(surface);

  const openItem = (item: { prompt: string; svg: string }) => {
    loadSvgIntoWorkspace(item.svg, { prompt: item.prompt });
    toast.success(`Opened “${item.prompt}” in workspace`);
    onClose();
    onOpened?.();
  };

  return (
    <>
      <SheetHead
        eyebrow={`Pack · ${entry.items.length} icons`}
        title={entry.items.map((i) => i.prompt).join(", ") || "Untitled pack"}
        createdAt={entry.createdAt}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] text-zinc-500">
            Click an icon to open it in the workspace
          </p>
          <SurfaceToggle value={surface} onChange={setSurface} />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {entry.items.map((item, i) => (
            <div
              key={`${item.prompt}-${i}`}
              className="group relative border border-zinc-800 transition-colors hover:border-zinc-600"
            >
              <button
                type="button"
                onClick={() => openItem(item)}
                className={cn(
                  "flex aspect-square w-full flex-col items-center justify-center gap-2 p-4 outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-inset",
                  tile.className,
                )}
                style={tile.style}
                aria-label={`Open ${item.prompt} in workspace`}
              >
                <SvgPreview svg={item.svg} className="size-10" />
              </button>
              <div className="flex items-center justify-between gap-1 border-t border-zinc-800 bg-[#0d0d10] px-2 py-1.5">
                <p
                  className="min-w-0 truncate text-[11px] text-zinc-400"
                  title={item.prompt}
                >
                  {item.prompt}
                </p>
                <div className="flex shrink-0 opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <ActionButton
                    label="Copy SVG"
                    className="h-6 w-6 border-0 bg-transparent"
                    onClick={() => copyToClipboard(item.svg)}
                  >
                    <Copy className="size-3" />
                  </ActionButton>
                  <ActionButton
                    label="Download SVG"
                    className="h-6 w-6 border-0 bg-transparent"
                    onClick={() => downloadSvgFile(item.svg, item.prompt)}
                  >
                    <FileCode className="size-3" />
                  </ActionButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            reusePrompt(
              entry.items.map((i) => i.prompt).join("\n"),
              "pack",
            );
            toast.success("Pack prompts loaded into the editor");
            onClose();
            onOpened?.();
          }}
          className="mt-5 flex w-full items-center gap-2 text-left text-[11px] text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <PenLine className="size-3.5" />
          Reuse these prompts to generate the pack again
        </button>
      </div>

      <div className="flex gap-2 border-t border-zinc-800/80 bg-[#0a0a0c] px-5 py-4">
        <button
          type="button"
          onClick={() => downloadMany(entry.items, "svg")}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 bg-zinc-100 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
        >
          <FileCode className="size-4" />
          Download all SVG
        </button>
        <button
          type="button"
          onClick={() => downloadMany(entry.items, "png")}
          className={cn(secondaryBtn, "h-10")}
        >
          <FileImage className="size-3.5" />
          PNG
        </button>
        <ActionButton
          label="Delete pack"
          tone="danger"
          className="h-10 w-10"
          onClick={() => onDelete(entry)}
        >
          <Trash2 className="size-3.5" />
        </ActionButton>
      </div>
    </>
  );
}

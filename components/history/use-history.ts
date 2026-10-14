"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getQueryClient } from "@/lib/query-client";

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

export const HISTORY_KEY = ["svg-history"] as const;

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
  if (v.mode === "single") return typeof v.svg === "string";
  if (!Array.isArray(v.items) || !Array.isArray(v.previewSvgs)) return false;
  return v.items.every((it) => {
    if (!it || typeof it !== "object") return false;
    const r = it as Record<string, unknown>;
    return typeof r.prompt === "string" && typeof r.svg === "string";
  });
}

export function useHistory(enabled: boolean) {
  return useQuery({
    queryKey: HISTORY_KEY,
    queryFn: async (): Promise<HistoryEntry[]> => {
      const res = await fetch("/api/svg/history", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load history");
      const data = await res.json();
      if (!Array.isArray(data.items)) return [];
      return data.items.filter(isHistoryEntry);
    },
    enabled,
    staleTime: 30_000,
  });
}

/** Variants are fetched on demand to keep the history list light. */
export function useEntryVariants(entry: HistoryEntry | null) {
  const id = entry?.mode === "single" ? entry.id : null;
  return useQuery({
    queryKey: ["svg-history-variants", id],
    queryFn: async (): Promise<string[]> => {
      const res = await fetch(`/api/svg/history?variants=${id}`, {
        cache: "no-store",
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.variants)
        ? data.variants.filter((v: unknown) => typeof v === "string")
        : [];
    },
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
  });
}

export function useDeleteHistory() {
  const queryClient = getQueryClient();

  return useMutation({
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
      await queryClient.cancelQueries({ queryKey: HISTORY_KEY });
      const prev = queryClient.getQueryData<HistoryEntry[]>(HISTORY_KEY);
      queryClient.setQueryData<HistoryEntry[]>(HISTORY_KEY, (old) =>
        (old ?? []).filter((e) => e.id !== id),
      );
      return { prev };
    },
    onSuccess: () => {
      toast.success("Deleted from history");
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(HISTORY_KEY, ctx.prev);
      toast.error("Couldn't delete. The item has been restored.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: HISTORY_KEY });
    },
  });
}

export function groupByDay(entries: HistoryEntry[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const buckets = new Map<string, HistoryEntry[]>();
  for (const entry of entries) {
    const day = new Date(entry.createdAt);
    day.setHours(0, 0, 0, 0);
    let label = day.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: day.getFullYear() === today.getFullYear() ? undefined : "numeric",
    });
    if (day.getTime() === today.getTime()) label = "Today";
    else if (day.getTime() === yesterday.getTime()) label = "Yesterday";
    const list = buckets.get(label) ?? [];
    list.push(entry);
    buckets.set(label, list);
  }
  return Array.from(buckets, ([label, items]) => ({ label, entries: items }));
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

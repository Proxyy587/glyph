"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { SvgPreview } from "@/components/svg-generator/svg-preview";

export type DeleteTarget = {
  kind: "icon" | "pack";
  prompt: string;
  previews: string[];
  count?: number;
};

export function ConfirmDeleteDialog({
  target,
  onCancel,
  onConfirm,
}: {
  target: DeleteTarget | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [shown, setShown] = useState(target);
  if (target && target !== shown) setShown(target);
  const isPack = shown?.kind === "pack";
  const label = shown?.prompt.split("\n")[0]?.trim() || "Untitled";

  return (
    <AlertDialog open={!!target} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-[400px] gap-5 rounded-none border-zinc-800 bg-[#0d0d10] p-0 text-zinc-100 shadow-2xl sm:max-w-[400px]">
        <AlertDialogHeader className="gap-0 px-5 pt-5 text-left sm:place-items-start">
          <div className="mb-4 flex items-center gap-2">
            {shown?.previews.slice(0, 4).map((svg, i) => (
              <SvgPreview
                key={i}
                svg={svg}
                className="size-12 border border-zinc-800 bg-[#101014] p-2.5 text-zinc-100"
              />
            ))}
          </div>
          <AlertDialogTitle className="text-base font-semibold text-zinc-100">
            {isPack ? "Delete this pack?" : "Delete this icon?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-sm leading-6 text-zinc-400">
            <span className="text-zinc-200">&ldquo;{label}&rdquo;</span>
            {isPack && shown?.count
              ? ` and all ${shown.count} icons in it`
              : ""}{" "}
            will be permanently removed from your history. This can&apos;t be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-end gap-2 border-t border-zinc-800/80 bg-[#0a0a0c] px-5 py-3">
          <AlertDialogCancel className="h-9 rounded-none border-zinc-700 bg-transparent px-4 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100">
            Cancel
          </AlertDialogCancel>
          <AlertDialogPrimitive.Action
            onClick={onConfirm}
            className="inline-flex h-9 items-center gap-2 border border-red-900/70 bg-red-950/60 px-4 text-xs font-medium text-red-200 transition-colors outline-none hover:bg-red-900/60 focus-visible:ring-2 focus-visible:ring-red-700"
          >
            <Trash2 className="size-3.5" />
            {isPack ? "Delete pack" : "Delete icon"}
          </AlertDialogPrimitive.Action>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

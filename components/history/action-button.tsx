"use client";

import type { ComponentProps, ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ActionButton({
  label,
  children,
  className,
  tone = "default",
  ...props
}: Omit<ComponentProps<"button">, "children"> & {
  label: string;
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center border border-zinc-800 bg-[#0a0a0c] text-zinc-400 transition-colors outline-none hover:bg-zinc-800 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:pointer-events-none disabled:opacity-40",
            tone === "danger" &&
              "hover:border-red-900/70 hover:bg-red-950/50 hover:text-red-300",
            className,
          )}
          {...props}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6} className="rounded-none">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  activeView?: "generate" | "library";
  onViewChange?: (view: "generate" | "library") => void;
};

export function AppHeader({
  activeView = "generate",
  onViewChange,
}: AppHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 md:px-6">
      <a
        href="/"
        className="text-xl font-semibold tracking-tight text-foreground no-underline"
      >
        glyph
      </a>

      <nav className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onViewChange?.("generate")}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors",
            activeView === "generate"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          Generate
        </button>
        <button
          type="button"
          onClick={() => onViewChange?.("library")}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors",
            activeView === "library"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          Library
        </button>
        <div className="ml-2 h-4 w-px bg-border" />
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          Log in
        </Button>
      </nav>
    </header>
  );
}

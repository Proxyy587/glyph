"use client";

export function LibrarySection() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-12 py-16 md:px-20 md:py-24">
        <h2 className="text-lg font-medium text-foreground">Library</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Icons you generate will be saved here. Log in to sync across devices
          and browse the community library.
        </p>
        <p className="mt-4 text-xs text-muted-foreground/80">Coming soon.</p>
      </div>
    </div>
  );
}

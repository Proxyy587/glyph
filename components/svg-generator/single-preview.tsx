"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";

export function SinglePreview() {
  const { svg, copied, copySvg, downloadSingle } = useSvgGenerator();

  if (!svg) return null;

  return (
    <>
      <div className="flex min-h-[180px] min-w-[180px] items-center justify-center rounded-lg border border-border bg-muted/20 p-6">
        <div
          className="text-foreground [&_svg]:max-h-[140px] [&_svg]:max-w-[140px] [&_svg]:shrink-0"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={copySvg}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/50"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          onClick={downloadSingle}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/50"
        >
          Download
        </button>
      </div>
      <pre className="max-h-[200px] w-full max-w-xl overflow-auto rounded-md border border-border bg-muted/20 p-3 text-[11px] text-muted-foreground">
        <code>{svg}</code>
      </pre>
    </>
  );
}

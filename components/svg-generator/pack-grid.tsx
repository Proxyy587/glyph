"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";

export function PackGrid() {
  const { packResults, downloadSvg } = useSvgGenerator();

  if (packResults.length === 0) return null;

  return (
    <div className="grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {packResults.map((item, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
        >
          <div className="flex h-14 w-14 items-center justify-center text-zinc-100 [&_svg]:max-h-full [&_svg]:max-w-full [&_svg]:shrink-0">
            {item.svg ? (
              <div dangerouslySetInnerHTML={{ __html: item.svg }} />
            ) : (
              <span className="text-[11px] text-zinc-500">
                {item.error ?? "…"}
              </span>
            )}
          </div>
          <p
            className="w-full truncate text-center text-[11px] text-zinc-500"
            title={item.prompt}
          >
            {item.prompt}
          </p>
          {item.svg && (
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(item.svg!)}
                className="rounded-md border border-zinc-700 bg-zinc-800/80 px-2 py-1 text-[11px] text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadSvg(
                    item.svg!,
                    item.prompt.replace(/[^a-z0-9-_]/gi, "-").slice(0, 24)
                  )
                }
                className="rounded-md border border-zinc-700 bg-zinc-800/80 px-2 py-1 text-[11px] text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              >
                Download
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

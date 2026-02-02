"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { EnhancedBtn } from "@/components/ui/enhancedbtn";

const STYLES = [
  { id: "outline", label: "Outline" },
  { id: "solid", label: "Solid" },
  { id: "rounded", label: "Rounded" },
  { id: "sharp", label: "Sharp" },
  { id: "duotone", label: "Duotone" },
] as const;

type StyleId = (typeof STYLES)[number]["id"];

const VIEWBOX_SIZES = [16, 24, 32] as const;

type PackItem = { prompt: string; svg: string | null; error?: string };

export default function Home() {
  const [mode, setMode] = useState<"single" | "pack">("single");
  const [prompt, setPrompt] = useState("cloud upload icon");
  const [packPrompts, setPackPrompts] = useState(
    "settings gear\nheart\nstar\ncloud upload"
  );
  const [style, setStyle] = useState<StyleId>("outline");
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [padding, setPadding] = useState(0);
  const [viewBoxSize, setViewBoxSize] = useState<16 | 24 | 32>(24);
  const [svg, setSvg] = useState<string | null>(null);
  const [packResults, setPackResults] = useState<PackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPack, setLoadingPack] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const opts = { style, strokeWidth, cornerRadius, padding, viewBoxSize };

  const generate = useCallback(async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setSvg(null);
    try {
      const res = await fetch("/api/svg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), ...opts }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Generation failed");
        return;
      }
      setSvg(data.svg);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [prompt, style, strokeWidth, cornerRadius, padding, viewBoxSize]);

  const generatePack = useCallback(async () => {
    const lines = packPrompts
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    setLoadingPack(true);
    setError(null);
    setPackResults(lines.map((prompt) => ({ prompt, svg: null })));
    const results: PackItem[] = [];
    for (const p of lines) {
      try {
        const res = await fetch("/api/svg", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: p, ...opts }),
        });
        const data = await res.json();
        if (res.ok && data.svg) {
          results.push({ prompt: p, svg: data.svg });
        } else {
          results.push({ prompt: p, svg: null, error: data.error ?? "Failed" });
        }
      } catch (e) {
        results.push({
          prompt: p,
          svg: null,
          error: e instanceof Error ? e.message : "Request failed",
        });
      }
      setPackResults([...results]);
    }
    setLoadingPack(false);
  }, [packPrompts, style, strokeWidth, cornerRadius, padding, viewBoxSize]);

  const copySvg = useCallback(async () => {
    if (!svg) return;
    await navigator.clipboard.writeText(svg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [svg]);

  const downloadSvg = useCallback((content: string, name = "icon") => {
    if (!content) return;
    const safe = name.replace(/[^a-z0-9-_]/gi, "-").slice(0, 32) || "icon";
    const blob = new Blob([content], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safe}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const downloadSingle = useCallback(() => {
    if (!svg) return;
    const name =
      prompt
        .trim()
        .replace(/[^a-z0-9-_]/gi, "-")
        .slice(0, 32) || "icon";
    downloadSvg(svg, name);
  }, [svg, prompt, downloadSvg]);

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900">
      <aside className="flex w-[360px] shrink-0 flex-col border-r border-zinc-200 bg-white p-6">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
          glyph
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Lucide icons could never.</p>

        <div className="mt-4 flex gap-1 rounded-lg bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={cn(
              "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
              mode === "single"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            Single
          </button>
          <button
            type="button"
            onClick={() => setMode("pack")}
            className={cn(
              "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
              mode === "pack"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            Pack
          </button>
        </div>

        {mode === "single" ? (
          <>
            <label className="mt-4 block text-xs font-medium text-zinc-500">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. settings gear icon, outline, rounded"
              rows={3}
              className="mt-1.5 w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </>
        ) : (
          <>
            <label className="mt-4 block text-xs font-medium text-zinc-500">
              One prompt per line
            </label>
            <textarea
              value={packPrompts}
              onChange={(e) => setPackPrompts(e.target.value)}
              placeholder="settings gear\nheart\nstar"
              rows={5}
              className="mt-1.5 w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </>
        )}

        <div className="mt-5">
          <span className="text-xs font-medium text-zinc-500">Style</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  style === s.id
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <div className="flex justify-between text-xs">
              <span className="font-medium text-zinc-500">Stroke width</span>
              <span className="text-zinc-400">{strokeWidth}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.25"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="mt-1 h-2 w-full appearance-none rounded-full bg-zinc-200 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-900"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs">
              <span className="font-medium text-zinc-500">Corner radius</span>
              <span className="text-zinc-400">{cornerRadius}</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="1"
              value={cornerRadius}
              onChange={(e) => setCornerRadius(Number(e.target.value))}
              className="mt-1 h-2 w-full appearance-none rounded-full bg-zinc-200 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-900"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs">
              <span className="font-medium text-zinc-500">Padding</span>
              <span className="text-zinc-400">{padding}</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="1"
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
              className="mt-1 h-2 w-full appearance-none rounded-full bg-zinc-200 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-900"
            />
          </div>
          <div>
            <span className="text-xs font-medium text-zinc-500">
              ViewBox size
            </span>
            <div className="mt-2 flex gap-1.5">
              {VIEWBOX_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setViewBoxSize(size)}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    viewBoxSize === size
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* <button
          type="button"
          onClick={mode === "single" ? generate : generatePack}
          disabled={
            mode === "single"
              ? loading || !prompt.trim()
              : loadingPack ||
                !packPrompts
                  .trim()
                  .split("\n")
                  .some((s) => s.trim())
          }
        >
          {mode === "single"
            ? loading
              ? "Generating…"
              : "Generate SVG"
            : loadingPack
            ? "Generating pack…"
            : "Generate pack"}
        </button> */}
        <EnhancedBtn
          onClick={mode === "single" ? generate : generatePack}
          disabled={
            mode === "single"
              ? loading || !prompt.trim()
              : loadingPack ||
                !packPrompts
                  .trim()
                  .split("\n")
                  .some((s) => s.trim())
          }
          loading={loading}
        >
          {mode === "single"
            ? loading
              ? "Generating…"
              : "Generate"
            : loadingPack
            ? "Generating pack…"
            : "Generate"}
        </EnhancedBtn>
      </aside>

      {/* Right: preview + copy + download */}
      <main className="flex flex-1 flex-col items-center gap-6 overflow-auto p-8">
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {mode === "pack" ? (
          <>
            {packResults.length > 0 && (
              <div className="grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {packResults.map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-20 w-20 items-center justify-center text-zinc-900 [&_svg]:max-h-full [&_svg]:max-w-full [&_svg]:shrink-0">
                      {item.svg ? (
                        <div dangerouslySetInnerHTML={{ __html: item.svg }} />
                      ) : (
                        <span className="text-xs text-zinc-400">
                          {item.error ?? "…"}
                        </span>
                      )}
                    </div>
                    <p
                      className="w-full truncate text-center text-xs text-zinc-500"
                      title={item.prompt}
                    >
                      {item.prompt}
                    </p>
                    {item.svg && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(item.svg!)
                          }
                          className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50"
                        >
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            downloadSvg(
                              item.svg!,
                              item.prompt
                                .replace(/[^a-z0-9-_]/gi, "-")
                                .slice(0, 24)
                            )
                          }
                          className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50"
                        >
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!loadingPack && packResults.length === 0 && (
              <p className="text-sm text-zinc-400">
                Enter one prompt per line and click Generate pack.
              </p>
            )}
            {loadingPack && (
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
                <p className="text-sm text-zinc-500">Generating pack…</p>
              </div>
            )}
          </>
        ) : (
          <>
            {svg ? (
              <>
                <div className="flex min-h-[200px] min-w-[200px] items-center justify-center rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
                  <div
                    className="text-zinc-900 [&_svg]:max-h-[160px] [&_svg]:max-w-[160px] [&_svg]:shrink-0"
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={copySvg}
                    className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
                  >
                    {copied ? "Copied" : "Copy SVG"}
                  </button>
                  <button
                    type="button"
                    onClick={downloadSingle}
                    className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
                  >
                    Download
                  </button>
                </div>
                <pre className="max-h-[240px] w-full max-w-2xl overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-700">
                  <code>{svg}</code>
                </pre>
              </>
            ) : (
              !loading &&
              !error && (
                <p className="text-sm text-zinc-400">
                  Enter a prompt and click Generate to see your icon.
                </p>
              )
            )}
            {loading && (
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
                <p className="text-sm text-zinc-500">Generating icon…</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

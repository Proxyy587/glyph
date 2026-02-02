"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { PackItem, StyleId, ViewBoxSize } from "@/lib/svg-generator-types";

type SvgGeneratorState = {
  mode: "single" | "pack";
  prompt: string;
  packPrompts: string;
  style: StyleId;
  strokeWidth: number;
  cornerRadius: number;
  padding: number;
  viewBoxSize: ViewBoxSize;
  svg: string | null;
  packResults: PackItem[];
  loading: boolean;
  loadingPack: boolean;
  error: string | null;
  copied: boolean;
};

type SvgGeneratorContextValue = SvgGeneratorState & {
  setMode: (mode: "single" | "pack") => void;
  setPrompt: (prompt: string) => void;
  setPackPrompts: (prompt: string) => void;
  setStyle: (style: StyleId) => void;
  setStrokeWidth: (v: number) => void;
  setCornerRadius: (v: number) => void;
  setPadding: (v: number) => void;
  setViewBoxSize: (v: ViewBoxSize) => void;
  generate: () => Promise<void>;
  generatePack: () => Promise<void>;
  copySvg: () => Promise<void>;
  downloadSvg: (content: string, name?: string) => void;
  downloadSingle: () => void;
  clearError: () => void;
};

const initialState: SvgGeneratorState = {
  mode: "single",
  prompt: "cloud upload icon",
  packPrompts: "settings gear\nheart\nstar\ncloud upload",
  style: "outline",
  strokeWidth: 1.5,
  cornerRadius: 0,
  padding: 0,
  viewBoxSize: 24,
  svg: null,
  packResults: [],
  loading: false,
  loadingPack: false,
  error: null,
  copied: false,
};

const SvgGeneratorContext = createContext<SvgGeneratorContextValue | null>(
  null
);

export function SvgGeneratorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SvgGeneratorState>(initialState);

  const opts = {
    style: state.style,
    strokeWidth: state.strokeWidth,
    cornerRadius: state.cornerRadius,
    padding: state.padding,
    viewBoxSize: state.viewBoxSize,
  };

  const generate = useCallback(async () => {
    if (!state.prompt.trim()) return;
    setState((s) => ({
      ...s,
      loading: true,
      error: null,
      svg: null,
    }));
    try {
      const res = await fetch("/api/svg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: state.prompt.trim(),
          ...opts,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState((s) => ({
          ...s,
          loading: false,
          error: data.error ?? "Generation failed",
        }));
        return;
      }
      setState((s) => ({ ...s, loading: false, svg: data.svg }));
    } catch (e) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e instanceof Error ? e.message : "Request failed",
      }));
    }
  }, [
    state.prompt,
    state.style,
    state.strokeWidth,
    state.cornerRadius,
    state.padding,
    state.viewBoxSize,
  ]);

  const generatePack = useCallback(async () => {
    const lines = state.packPrompts
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    setState((s) => ({
      ...s,
      loadingPack: true,
      error: null,
      packResults: lines.map((prompt) => ({ prompt, svg: null })),
    }));
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
          results.push({
            prompt: p,
            svg: null,
            error: data.error ?? "Failed",
          });
        }
      } catch (e) {
        results.push({
          prompt: p,
          svg: null,
          error: e instanceof Error ? e.message : "Request failed",
        });
      }
      setState((s) => ({ ...s, packResults: [...results] }));
    }
    setState((s) => ({ ...s, loadingPack: false }));
  }, [
    state.packPrompts,
    state.style,
    state.strokeWidth,
    state.cornerRadius,
    state.padding,
    state.viewBoxSize,
  ]);

  const copySvg = useCallback(async () => {
    if (!state.svg) return;
    await navigator.clipboard.writeText(state.svg);
    setState((s) => ({ ...s, copied: true }));
    setTimeout(() => setState((s) => ({ ...s, copied: false })), 2000);
  }, [state.svg]);

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
    if (!state.svg) return;
    const name =
      state.prompt
        .trim()
        .replace(/[^a-z0-9-_]/gi, "-")
        .slice(0, 32) || "icon";
    downloadSvg(state.svg, name);
  }, [state.svg, state.prompt, downloadSvg]);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  const value: SvgGeneratorContextValue = {
    ...state,
    setMode: (mode) => setState((s) => ({ ...s, mode })),
    setPrompt: (prompt) => setState((s) => ({ ...s, prompt })),
    setPackPrompts: (packPrompts) => setState((s) => ({ ...s, packPrompts })),
    setStyle: (style) => setState((s) => ({ ...s, style })),
    setStrokeWidth: (strokeWidth) => setState((s) => ({ ...s, strokeWidth })),
    setCornerRadius: (cornerRadius) =>
      setState((s) => ({ ...s, cornerRadius })),
    setPadding: (padding) => setState((s) => ({ ...s, padding })),
    setViewBoxSize: (viewBoxSize) => setState((s) => ({ ...s, viewBoxSize })),
    generate,
    generatePack,
    copySvg,
    downloadSvg,
    downloadSingle,
    clearError,
  };

  return (
    <SvgGeneratorContext.Provider value={value}>
      {children}
    </SvgGeneratorContext.Provider>
  );
}

export function useSvgGenerator() {
  const ctx = useContext(SvgGeneratorContext);
  if (!ctx) {
    throw new Error("useSvgGenerator must be used within SvgGeneratorProvider");
  }
  return ctx;
}

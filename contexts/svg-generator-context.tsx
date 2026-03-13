"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  SVG_MODELS,
  type PackItem,
  type StyleId,
  type SvgModelId,
  type ViewBoxSize,
} from "@/lib/svg-generator-types";
import { useSession } from "@/lib/authClient";
import { toast } from "sonner";


type SvgGeneratorState = {
  mode: "single" | "pack";
  prompt: string;
  packPrompts: string;
  modelId: SvgModelId;
  style: StyleId;
  strokeWidth: number;
  cornerRadius: number;
  padding: number;
  viewBoxSize: ViewBoxSize;
  svg: string | null;
  displaySvg: string | null;
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
  setModelId: (id: SvgModelId) => void;
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
  modelId: "gemini-flash",
  style: "outline",
  strokeWidth: 1.5,
  cornerRadius: 0,
  padding: 0,
  viewBoxSize: 24,
  svg: null,
  displaySvg: null,
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
  const router = useRouter();
  const { data: session } = useSession();

  const currentModel =
    SVG_MODELS.find((entry) => entry.id === state.modelId) ?? SVG_MODELS[0];

  const opts = {
    style: state.style,
    strokeWidth: state.strokeWidth,
    cornerRadius: state.cornerRadius,
    padding: state.padding,
    viewBoxSize: state.viewBoxSize,
    provider: currentModel.provider,
    model: currentModel.model,
  };

  const generate = useCallback(async () => {
    if (!state.prompt.trim()) return;

    if (!session?.user) {
      // Lightweight feedback + redirect for unauthenticated users
      router.push("/sign-in");
      toast.error("You need to be signed in to generate SVGs.");
      
      return;
    }

    setState((s) => ({
      ...s,
      loading: true,
      error: null,
      svg: null,
      displaySvg: null,
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
      const full = (data.svg as string) ?? "";

      // Store full SVG for copy/download
      setState((s) => ({
        ...s,
        loading: false,
        svg: full,
        displaySvg: "",
      }));

      // Lightweight "drawing" animation: progressively reveal SVG markup
      if (typeof window !== "undefined" && full) {
        const total = full.length;
        const steps = 40;
        const increment = Math.max(1, Math.floor(total / steps));

        let index = 0;

        const tick = () => {
          index += increment;
          const slice = full.slice(0, index);
          setState((s) => ({
            ...s,
            displaySvg: slice,
          }));

          if (index < total) {
            window.requestAnimationFrame(tick);
          }
        };

        window.requestAnimationFrame(tick);
      }
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
    session?.user,
    router,
  ]);

  const generatePack = useCallback(async () => {
    const lines = state.packPrompts
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    if (!session?.user) {
      if (typeof window !== "undefined") {
        window.alert("You need to be signed in to generate an icon pack.");
      }
      router.push("/sign-in");
      return;
    }

    setState((s) => ({
      ...s,
      loadingPack: true,
      error: null,
      packResults: lines.map((prompt) => ({ prompt, svg: null })),
    }));
    try {
      const res = await fetch("/api/svg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: lines.join("\n"),
          packPrompts: lines,
          ...opts,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setState((s) => ({
          ...s,
          loadingPack: false,
          error: data.error ?? "Failed to generate icon pack",
        }));
        return;
      }

      setState((s) => ({
        ...s,
        loadingPack: false,
        packResults: (data.packResults as PackItem[]) ?? [],
      }));
    } catch (e) {
      setState((s) => ({
        ...s,
        loadingPack: false,
        error: e instanceof Error ? e.message : "Request failed",
      }));
    }
  }, [
    state.packPrompts,
    state.style,
    state.strokeWidth,
    state.cornerRadius,
    state.padding,
    state.viewBoxSize,
    session?.user,
    router,
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
    setModelId: (modelId) => setState((s) => ({ ...s, modelId })),
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

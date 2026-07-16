"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
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
import { getQueryClient } from "@/lib/query-client";

export const GLYPH_STAGE_LABELS = [
  "Reading intent…",
  "Drafting geometry…",
  "Validating SVG…",
  "Polishing output…",
] as const;

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
  loadingStage: string | null;
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
  loadSvgIntoWorkspace: (svg: string, prompt?: string) => void;
  clearError: () => void;
};

const initialState: SvgGeneratorState = {
  mode: "single",
  prompt: "cloud upload icon, outline, rounded caps",
  packPrompts: "settings gear\nheart\nstar\ncloud upload",
  modelId: "openai/gpt-4o-mini",
  style: "outline",
  strokeWidth: 1.5,
  cornerRadius: 0,
  padding: 2,
  viewBoxSize: 24,
  svg: null,
  displaySvg: null,
  packResults: [],
  loading: false,
  loadingPack: false,
  loadingStage: null,
  error: null,
  copied: false,
};

function startStageCycle(
  setState: Dispatch<SetStateAction<SvgGeneratorState>>,
): () => void {
  let index = 0;
  setState((s) => ({
    ...s,
    loadingStage: GLYPH_STAGE_LABELS[0],
  }));
  const id = window.setInterval(() => {
    index = Math.min(index + 1, GLYPH_STAGE_LABELS.length - 1);
    setState((s) => ({
      ...s,
      loadingStage: GLYPH_STAGE_LABELS[index],
    }));
  }, 2200);
  return () => window.clearInterval(id);
}

const SvgGeneratorContext = createContext<SvgGeneratorContextValue | null>(
  null,
);

export function SvgGeneratorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SvgGeneratorState>(initialState);
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = getQueryClient();

  const currentModel =
    SVG_MODELS.find((entry) => entry.id === state.modelId) ?? SVG_MODELS[0];

  const opts = useMemo(
    () => ({
      style: state.style,
      strokeWidth: state.strokeWidth,
      cornerRadius: state.cornerRadius,
      padding: state.padding,
      viewBoxSize: state.viewBoxSize,
      model: currentModel.id,
    }),
    [
      state.style,
      state.strokeWidth,
      state.cornerRadius,
      state.padding,
      state.viewBoxSize,
      currentModel.id,
    ],
  );

  const generate = useCallback(async () => {
    if (!state.prompt.trim()) return;

    if (!session?.user) {
      router.push("/sign-in");
      toast.error("You need to be signed in to generate SVGs.");
      return;
    }

    const stopStages = startStageCycle(setState);
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
      stopStages();
      if (!res.ok) {
        setState((s) => ({
          ...s,
          loading: false,
          loadingStage: null,
          error: data.error ?? "Generation failed",
        }));
        return;
      }
      const full = (data.svg as string) ?? "";

      setState((s) => ({
        ...s,
        loading: false,
        loadingStage: null,
        svg: full,
        displaySvg: full,
      }));

      queryClient.invalidateQueries({ queryKey: ["svg-history"] });
    } catch (e) {
      stopStages();
      setState((s) => ({
        ...s,
        loading: false,
        loadingStage: null,
        error: e instanceof Error ? e.message : "Request failed",
      }));
    }
  }, [state.prompt, opts, session?.user, router, queryClient]);

  const generatePack = useCallback(async () => {
    const lines = state.packPrompts
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    if (!session?.user) {
      toast.error("You need to be signed in to generate an icon pack.");
      router.push("/sign-in");
      return;
    }

    const stopStages = startStageCycle(setState);
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
      stopStages();

      if (!res.ok) {
        setState((s) => ({
          ...s,
          loadingPack: false,
          loadingStage: null,
          error: data.error ?? "Failed to generate icon pack",
        }));
        return;
      }

      setState((s) => ({
        ...s,
        loadingPack: false,
        loadingStage: null,
        packResults: (data.packResults as PackItem[]) ?? [],
      }));

      queryClient.invalidateQueries({ queryKey: ["svg-history"] });
    } catch (e) {
      stopStages();
      setState((s) => ({
        ...s,
        loadingPack: false,
        loadingStage: null,
        error: e instanceof Error ? e.message : "Request failed",
      }));
    }
  }, [state.packPrompts, opts, session?.user, router, queryClient]);

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

  const loadSvgIntoWorkspace = useCallback((svg: string, prompt?: string) => {
    setState((s) => ({
      ...s,
      svg,
      displaySvg: svg,
      ...(prompt !== undefined ? { prompt: prompt.trim() || s.prompt } : {}),
    }));
  }, []);

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
    loadSvgIntoWorkspace,
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

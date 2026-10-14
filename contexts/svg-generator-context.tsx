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
  type PackItem,
  type StyleId,
  type ViewBoxSize,
} from "@/lib/svg-generator-types";
import { useSession } from "@/lib/authClient";
import { toast } from "sonner";
import { getQueryClient } from "@/lib/query-client";
import {
  copyToClipboard,
  downloadSvgFile,
  fileNameFor,
} from "@/lib/icon-export";
import { downloadSvgAsPng } from "@/lib/svg-to-png";

export const GLYPH_STAGE_LABELS = [
  "Reading your prompt…",
  "Exploring ideas…",
  "Shaping the icon…",
  "Refining details…",
  "Polishing output…",
] as const;

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
  displaySvg: string | null;
  variants: string[];
  activeVariant: number;
  generationId: string | null;
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
  selectVariant: (index: number) => void;
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
  downloadSinglePng: () => void;
  loadSvgIntoWorkspace: (svg: string, options?: LoadOptions) => void;
  reusePrompt: (prompt: string, mode: "single" | "pack") => void;
  saveVariantChoice: (id: string, index: number) => void;
  clearError: () => void;
};

type LoadOptions = {
  prompt?: string;
  variants?: string[];
  generationId?: string | null;
};

const initialState: SvgGeneratorState = {
  mode: "single",
  prompt: "rocket taking off",
  packPrompts: "settings gear\nheart\nstar\ncloud upload",
  style: "outline",
  strokeWidth: 1.5,
  cornerRadius: 0,
  padding: 2,
  viewBoxSize: 24,
  svg: null,
  displaySvg: null,
  variants: [],
  activeVariant: 0,
  generationId: null,
  packResults: [],
  loading: false,
  loadingPack: false,
  loadingStage: null,
  error: null,
  copied: false,
};

function startStageCycle(
  setState: Dispatch<SetStateAction<SvgGeneratorState>>,
  labels: readonly string[],
): () => void {
  let index = 0;
  setState((s) => ({
    ...s,
    loadingStage: labels[0],
  }));
  const id = window.setInterval(() => {
    index = Math.min(index + 1, labels.length - 1);
    setState((s) => ({
      ...s,
      loadingStage: labels[index],
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

  const opts = useMemo(
    () => ({
      style: state.style,
      strokeWidth: state.strokeWidth,
      cornerRadius: state.cornerRadius,
      padding: state.padding,
      viewBoxSize: state.viewBoxSize,
    }),
    [
      state.style,
      state.strokeWidth,
      state.cornerRadius,
      state.padding,
      state.viewBoxSize,
    ],
  );

  const stageLabels = GLYPH_STAGE_LABELS;

  const generate = useCallback(async () => {
    if (!state.prompt.trim()) return;

    if (state.prompt.trim().length > 500) {
      toast.error("Prompt is too long (max 500 characters).");
      return;
    }

    if (!session?.user) {
      router.push("/sign-in");
      toast.error("You need to be signed in to generate SVGs.");
      return;
    }

    const stopStages = startStageCycle(setState, stageLabels);
    setState((s) => ({
      ...s,
      loading: true,
      error: null,
      svg: null,
      displaySvg: null,
      variants: [],
      activeVariant: 0,
      generationId: null,
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
        const message = data.error ?? "Generation failed";
        if (res.status === 429) toast.error(message);
        setState((s) => ({
          ...s,
          loading: false,
          loadingStage: null,
          error: message,
        }));
        return;
      }
      const full = (data.svg as string) ?? "";
      const variants = Array.isArray(data.variants)
        ? (data.variants as string[])
        : [full];

      setState((s) => ({
        ...s,
        loading: false,
        loadingStage: null,
        svg: full,
        displaySvg: full,
        variants,
        activeVariant: 0,
        generationId: typeof data.id === "string" ? data.id : null,
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
  }, [state.prompt, opts, stageLabels, session?.user, router, queryClient]);

  const saveVariantChoice = useCallback(
    (id: string, index: number) => {
      void fetch("/api/svg/history", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, variantIndex: index }),
      })
        .then(() =>
          queryClient.invalidateQueries({ queryKey: ["svg-history"] }),
        )
        .catch(() => {});
    },
    [queryClient],
  );

  const selectVariant = useCallback(
    (index: number) => {
      const next = state.variants[index];
      if (!next || index === state.activeVariant) return;

      setState((s) => ({
        ...s,
        svg: next,
        displaySvg: next,
        activeVariant: index,
      }));

      if (state.generationId) saveVariantChoice(state.generationId, index);
    },
    [
      state.variants,
      state.activeVariant,
      state.generationId,
      saveVariantChoice,
    ],
  );

  const generatePack = useCallback(async () => {
    const lines = state.packPrompts
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    if (lines.length > 8) {
      toast.error("Packs are limited to 8 prompts at a time.");
      return;
    }

    if (!session?.user) {
      toast.error("You need to be signed in to generate an icon pack.");
      router.push("/sign-in");
      return;
    }

    const stopStages = startStageCycle(setState, stageLabels);
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
        const message = data.error ?? "Failed to generate icon pack";
        if (res.status === 429) toast.error(message);
        setState((s) => ({
          ...s,
          loadingPack: false,
          loadingStage: null,
          error: message,
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
  }, [
    state.packPrompts,
    opts,
    stageLabels,
    session?.user,
    router,
    queryClient,
  ]);

  const copySvg = useCallback(async () => {
    if (!state.svg) return;
    const ok = await copyToClipboard(state.svg);
    if (!ok) return;
    setState((s) => ({ ...s, copied: true }));
    setTimeout(() => setState((s) => ({ ...s, copied: false })), 2000);
  }, [state.svg]);

  const downloadSvg = useCallback((content: string, name = "icon") => {
    downloadSvgFile(content, name);
  }, []);

  const downloadSingle = useCallback(() => {
    if (!state.svg) return;
    downloadSvg(state.svg, fileNameFor(state.prompt));
  }, [state.svg, state.prompt, downloadSvg]);

  const downloadSinglePng = useCallback(() => {
    if (!state.svg) return;
    downloadSvgAsPng(state.svg, fileNameFor(state.prompt), 512);
  }, [state.svg, state.prompt]);

  const loadSvgIntoWorkspace = useCallback(
    (svg: string, options: LoadOptions = {}) => {
      const variants =
        options.variants && options.variants.length > 1 ? options.variants : [];
      const index = Math.max(0, variants.indexOf(svg));
      setState((s) => ({
        ...s,
        mode: "single",
        error: null,
        svg,
        displaySvg: svg,
        variants,
        activeVariant: index,
        generationId: options.generationId ?? null,
        ...(options.prompt !== undefined
          ? { prompt: options.prompt.trim() || s.prompt }
          : {}),
      }));
    },
    [],
  );

  const reusePrompt = useCallback(
    (prompt: string, mode: "single" | "pack") => {
      setState((s) =>
        mode === "single"
          ? { ...s, mode, prompt: prompt.trim(), error: null }
          : { ...s, mode, packPrompts: prompt.trim(), error: null },
      );
    },
    [],
  );

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  const value: SvgGeneratorContextValue = {
    ...state,
    setMode: (mode) => setState((s) => ({ ...s, mode })),
    setPrompt: (prompt) => setState((s) => ({ ...s, prompt })),
    setPackPrompts: (packPrompts) => setState((s) => ({ ...s, packPrompts })),
    selectVariant,
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
    downloadSinglePng,
    loadSvgIntoWorkspace,
    reusePrompt,
    saveVariantChoice,
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

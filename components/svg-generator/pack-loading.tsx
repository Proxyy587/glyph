"use client";

import { useEffect, useState } from "react";
import { useSvgGenerator } from "@/contexts/svg-generator-context";

const FRAMES = ["░", "▒", "▓", "█", "▓", "▒"];

export function PackLoading() {
  const { loadingPack, loadingStage } = useSvgGenerator();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!loadingPack) return;
    const id = window.setInterval(() => setI((x) => x + 1), 120);
    return () => window.clearInterval(id);
  }, [loadingPack]);

  if (!loadingPack) return null;

  const bar = Array.from({ length: 12 }, (_, idx) => {
    const active = (i + idx) % 12 < 4;
    return active ? FRAMES[(i + idx) % FRAMES.length] : "·";
  }).join(" ");

  return (
    <div className="flex flex-col items-center gap-3 border border-zinc-800 bg-[#050509] px-6 py-5">
      <pre className="font-mono text-xs text-zinc-200">{`[ ${bar} ]`}</pre>
      <p className="font-mono text-[11px] text-zinc-400">
        {loadingStage ?? "Generating pack…"}
      </p>
      <p className="text-[11px] text-zinc-600">
        First icon locks style · rest run in parallel
      </p>
    </div>
  );
}

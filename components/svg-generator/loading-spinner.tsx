"use client";

import { useSvgGenerator } from "@/contexts/svg-generator-context";

export function LoadingSpinner() {
  const { loading } = useSvgGenerator();

  if (!loading) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex h-28 w-28 items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]">
        <svg
          viewBox="0 0 120 120"
          aria-hidden="true"
          className="h-full w-full text-zinc-100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="18" y="18" width="84" height="84" rx="14" stroke="currentColor" strokeOpacity="0.14" />

          <g opacity="0.95">
            <rect x="28" y="28" width="12" height="12" rx="2" fill="currentColor">
              <animate attributeName="x" values="28;46;64;46;28" dur="2.4s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" />
              <animate attributeName="y" values="28;28;46;64;64" dur="2.4s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" />
              <animate attributeName="opacity" values="0.35;0.7;1;0.7;0.35" dur="2.4s" repeatCount="indefinite" />
            </rect>
            <rect x="46" y="28" width="12" height="12" rx="2" fill="currentColor">
              <animate attributeName="x" values="46;64;64;46;46" dur="2.4s" begin="0.08s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" />
              <animate attributeName="y" values="28;28;46;64;46" dur="2.4s" begin="0.08s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" />
              <animate attributeName="opacity" values="0.3;0.55;0.95;0.55;0.3" dur="2.4s" begin="0.08s" repeatCount="indefinite" />
            </rect>
            <rect x="64" y="28" width="12" height="12" rx="2" fill="currentColor">
              <animate attributeName="x" values="64;64;46;28;46" dur="2.4s" begin="0.16s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" />
              <animate attributeName="y" values="28;46;64;64;46" dur="2.4s" begin="0.16s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" />
              <animate attributeName="opacity" values="0.25;0.5;0.9;0.5;0.25" dur="2.4s" begin="0.16s" repeatCount="indefinite" />
            </rect>
            <rect x="28" y="46" width="12" height="12" rx="2" fill="currentColor">
              <animate attributeName="x" values="28;28;46;64;64" dur="2.4s" begin="0.24s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" />
              <animate attributeName="y" values="46;64;64;46;28" dur="2.4s" begin="0.24s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" />
              <animate attributeName="opacity" values="0.25;0.45;0.85;0.45;0.25" dur="2.4s" begin="0.24s" repeatCount="indefinite" />
            </rect>
            <rect x="46" y="46" width="12" height="12" rx="2" fill="currentColor">
              <animate attributeName="x" values="46;64;46;28;46" dur="2.4s" begin="0.32s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" />
              <animate attributeName="y" values="46;46;64;46;28" dur="2.4s" begin="0.32s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" />
              <animate attributeName="opacity" values="0.4;0.75;1;0.75;0.4" dur="2.4s" begin="0.32s" repeatCount="indefinite" />
            </rect>
            <rect x="64" y="46" width="12" height="12" rx="2" fill="currentColor">
              <animate attributeName="x" values="64;46;28;46;64" dur="2.4s" begin="0.4s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" />
              <animate attributeName="y" values="46;64;64;46;28" dur="2.4s" begin="0.4s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" />
              <animate attributeName="opacity" values="0.28;0.55;0.9;0.55;0.28" dur="2.4s" begin="0.4s" repeatCount="indefinite" />
            </rect>
            <rect x="28" y="64" width="12" height="12" rx="2" fill="currentColor">
              <animate attributeName="x" values="28;46;64;64;46" dur="2.4s" begin="0.48s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" />
              <animate attributeName="y" values="64;64;46;28;28" dur="2.4s" begin="0.48s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" />
              <animate attributeName="opacity" values="0.25;0.45;0.82;0.45;0.25" dur="2.4s" begin="0.48s" repeatCount="indefinite" />
            </rect>
            <rect x="46" y="64" width="12" height="12" rx="2" fill="currentColor">
              <animate attributeName="x" values="46;28;28;46;64" dur="2.4s" begin="0.56s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" />
              <animate attributeName="y" values="64;46;28;28;46" dur="2.4s" begin="0.56s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" />
              <animate attributeName="opacity" values="0.3;0.6;0.92;0.6;0.3" dur="2.4s" begin="0.56s" repeatCount="indefinite" />
            </rect>
            <rect x="64" y="64" width="12" height="12" rx="2" fill="currentColor">
              <animate attributeName="x" values="64;64;46;28;28" dur="2.4s" begin="0.64s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" />
              <animate attributeName="y" values="64;46;28;28;46" dur="2.4s" begin="0.64s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" />
              <animate attributeName="opacity" values="0.22;0.5;0.85;0.5;0.22" dur="2.4s" begin="0.64s" repeatCount="indefinite" />
            </rect>
          </g>

          <path d="M34 60H86" stroke="currentColor" strokeOpacity="0.16" strokeWidth="2" strokeLinecap="round">
            <animate attributeName="stroke-opacity" values="0.05;0.28;0.05" dur="2.4s" repeatCount="indefinite" />
          </path>
          <path d="M60 34V86" stroke="currentColor" strokeOpacity="0.16" strokeWidth="2" strokeLinecap="round">
            <animate attributeName="stroke-opacity" values="0.28;0.05;0.28" dur="2.4s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>
      <div className="space-y-1 text-center">
        <p className="text-xs font-medium tracking-wide text-zinc-300">
          Assembling vector intelligence...
        </p>
        <p className="text-[11px] text-zinc-500">
          Building geometry, rhythm and motion
        </p>
      </div>
    </div>
  );
}

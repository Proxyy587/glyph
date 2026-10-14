"use client";

import { memo, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Generated SVGs carry only a viewBox, so they collapse to 0×0 unless the
 * wrapper sizes them. Always render icons through this component.
 */
export const SvgPreview = memo(function SvgPreview({
  svg,
  className,
  style,
  label = "Icon preview",
}: {
  svg: string;
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      style={style}
      className={cn(
        "flex shrink-0 items-center justify-center [&>svg]:block [&>svg]:h-full [&>svg]:w-full",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
});

export type PreviewSurface = "dark" | "light" | "grid";

export const SURFACES: { id: PreviewSurface; label: string }[] = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "grid", label: "Transparent" },
];

const CHECKER: CSSProperties = {
  backgroundColor: "#16161b",
  backgroundImage:
    "linear-gradient(45deg,#1f1f26 25%,transparent 25%),linear-gradient(-45deg,#1f1f26 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1f1f26 75%),linear-gradient(-45deg,transparent 75%,#1f1f26 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
};

export function surfaceProps(surface: PreviewSurface): {
  className: string;
  style?: CSSProperties;
} {
  if (surface === "light") return { className: "bg-zinc-100 text-zinc-900" };
  if (surface === "grid") return { className: "text-zinc-100", style: CHECKER };
  return { className: "bg-[#101014] text-zinc-100" };
}

export function SurfaceToggle({
  value,
  onChange,
  className,
}: {
  value: PreviewSurface;
  onChange: (surface: PreviewSurface) => void;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Preview background"
      className={cn(
        "inline-flex items-center border border-zinc-800 bg-[#0a0a0c]/90 backdrop-blur",
        className,
      )}
    >
      {SURFACES.map((s) => {
        const swatch = surfaceProps(s.id);
        return (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={value === s.id}
            aria-label={`${s.label} background`}
            title={`${s.label} background`}
            onClick={() => onChange(s.id)}
            className={cn(
              "flex h-8 w-8 items-center justify-center transition-colors hover:bg-zinc-900",
              value === s.id && "bg-zinc-800",
            )}
          >
            <span
              className={cn(
                "size-3.5 border",
                value === s.id ? "border-zinc-300" : "border-zinc-600",
                swatch.className,
              )}
              style={{ ...swatch.style, backgroundSize: "6px 6px" }}
            />
          </button>
        );
      })}
    </div>
  );
}

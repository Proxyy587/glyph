"use client";

const RUNG_COUNT = 3;

export function LadderRail({ side }: { side: "left" | "right" }) {
  return (
    <div className="flex h-full w-full flex-col">
      {Array.from({ length: RUNG_COUNT }).map((_, i) => (
        <div
          key={i}
          className={[
            "relative w-full flex-1 text-zinc-700/20",
            side === "left"
              ? "border-r border-zinc-800/80"
              : "border-l border-zinc-800/80",
            i !== RUNG_COUNT - 1 ? "border-b border-zinc-800/80" : "",
          ].join(" ")}
          style={{
            backgroundImage:
              "repeating-linear-gradient(315deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)",
            backgroundSize: "8px 8px",
            backgroundAttachment: "fixed",
          }}
        />
      ))}
    </div>
  );
}

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Glyph — AI SVG icon generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0A0A0C",
        padding: 72,
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: "#18181B",
            border: "1px solid #27272A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FAFAFA",
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          G
        </div>
        <div
          style={{
            color: "#FAFAFA",
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Glyph
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            color: "#FAFAFA",
            fontSize: 64,
            fontWeight: 650,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          Prompt to Lucide-grade SVG icons
        </div>
        <div
          style={{
            color: "#A1A1AA",
            fontSize: 28,
            lineHeight: 1.4,
            maxWidth: 820,
          }}
        >
          AI icon generator for developers — outline, solid, duotone &amp;
          animated vectors.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#71717A",
          fontSize: 22,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <span>AI · SVG · Icons</span>
        <span>Developer-ready</span>
      </div>
    </div>,
    { ...size },
  );
}

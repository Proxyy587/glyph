import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0C",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#F4F4F5",
            letterSpacing: "-0.06em",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          G
        </div>
      </div>
    ),
    { ...size },
  );
}

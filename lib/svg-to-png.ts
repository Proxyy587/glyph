/**
 * Export an SVG string as a PNG file (client-side, using canvas).
 */
export function downloadSvgAsPng(
  svgString: string,
  filename = "icon",
  size = 512,
): void {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);

      canvas.toBlob(
        (pngBlob) => {
          URL.revokeObjectURL(url);
          if (!pngBlob) return;
          const safe =
            filename.replace(/[^a-z0-9-_]/gi, "-").slice(0, 32) || "icon";
          const pngUrl = URL.createObjectURL(pngBlob);
          const a = document.createElement("a");
          a.href = pngUrl;
          a.download = `${safe}.png`;
          a.click();
          URL.revokeObjectURL(pngUrl);
        },
        "image/png",
        1,
      );
    } catch {
      URL.revokeObjectURL(url);
    }
  };

  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}

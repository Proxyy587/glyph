/**
 * Export an SVG string as a PNG file (client-side, using canvas).
 * Icons use `currentColor`, so `color` decides the PNG ink colour.
 */
export function downloadSvgAsPng(
  svgString: string,
  filename = "icon",
  size = 512,
  color = "#0a0a0c",
): void {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  // Firefox refuses to rasterise SVGs without explicit dimensions.
  const sized = svgString.replace(/<svg\b([^>]*)>/i, (_tag, attrs: string) => {
    const clean = attrs.replace(
      /\s(?:width|height)\s*=\s*(["'])[^"']*\1/gi,
      "",
    );
    return `<svg${clean} width="${size}" height="${size}" color="${color}">`;
  });

  const blob = new Blob([sized], { type: "image/svg+xml" });
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
          setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
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

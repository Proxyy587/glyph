import { toast } from "sonner";
import { downloadSvgAsPng } from "@/lib/svg-to-png";

export function fileNameFor(prompt: string, fallback = "icon"): string {
  return (
    prompt
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || fallback
  );
}

export async function copyToClipboard(
  text: string,
  successMessage = "SVG copied to clipboard",
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
    return true;
  } catch {
    toast.error("Couldn't access the clipboard.");
    return false;
  }
}

export function downloadSvgFile(content: string, name = "icon"): void {
  if (!content) return;
  const blob = new Blob([content], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileNameFor(name)}.svg`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Browsers block bursts of downloads, so files are staggered. */
export function downloadMany(
  items: { prompt: string; svg: string }[],
  format: "svg" | "png",
): void {
  if (items.length === 0) return;
  items.forEach((item, i) => {
    setTimeout(() => {
      if (format === "svg") downloadSvgFile(item.svg, item.prompt);
      else downloadSvgAsPng(item.svg, fileNameFor(item.prompt), 512);
    }, i * 180);
  });
  toast.success(
    `Downloading ${items.length} ${format.toUpperCase()} file${items.length === 1 ? "" : "s"}`,
  );
}

import { optimize } from "svgo";

/**
 * SVGO pass that preserves viewBox and animation (<style> / SMIL).
 */
export function optimizeSvg(svg: string): string {
  try {
    const result = optimize(svg, {
      multipass: true,
      plugins: [
        {
          name: "preset-default",
          params: {
            overrides: {
              removeHiddenElems: false,
              mergePaths: false,
            },
          },
        },
        "removeDoctype",
        "removeXMLProcInst",
        "removeComments",
        "removeMetadata",
        "removeEditorsNSData",
        "cleanupAttrs",
        "minifyStyles",
        "cleanupIds",
        "removeUselessDefs",
        "cleanupNumericValues",
        "convertColors",
        "removeEmptyText",
        "removeEmptyAttrs",
        "removeEmptyContainers",
        "sortAttrs",
      ],
      js2svg: { pretty: false },
    });

    // Belt-and-suspenders: if a plugin still stripped viewBox, restore from input
    let data = result.data || svg;
    if (!/viewBox\s*=/.test(data) && /viewBox\s*=/.test(svg)) {
      const m = svg.match(/viewBox\s*=\s*["']([^"']+)["']/i);
      if (m) {
        data = data.replace(/<svg\b/i, `<svg viewBox="${m[1]}"`);
      }
    }

    return data;
  } catch (error) {
    console.warn("[optimizeSvg] SVGO failed, returning original:", error);
    return svg;
  }
}

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
              removeViewBox: false,
              // Keep style blocks for CSS animation
              removeHiddenElems: false,
              // Avoid aggressive path merges that can break animation targets
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

    return result.data || svg;
  } catch (error) {
    console.warn("[optimizeSvg] SVGO failed, returning original:", error);
    return svg;
  }
}

/**
 * Canonical site config for SEO, Open Graph, sitemap, and robots.
 */
export const siteConfig = {
  name: "Glyph",
  shortName: "Glyph",
  tagline: "AI SVG icon generator",
  description:
    "Generate Lucide-grade SVG icons from text prompts. Outline, solid, duotone, and animated icons — clean, scalable, developer-ready.",
  url:
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.BETTER_AUTH_URL?.replace(/\/$/, "") ||
    "http://localhost:3000",
  locale: "en_US",
  creator: "@glyph",
  keywords: [
    "AI SVG generator",
    "SVG icon generator",
    "AI icon maker",
    "Lucide icons",
    "prompt to SVG",
    "vector icon generator",
    "animated SVG",
    "icon pack generator",
    "developer icons",
    "Glyph",
  ],
} as const;

export function absoluteUrl(path = "/") {
  const base = siteConfig.url;
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

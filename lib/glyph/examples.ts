import type { GlyphIntent } from "./classifier";

export type ExampleEntry = {
  keywords: string[];
  label: string;
  svg: string;
};

export const GLYPH_EXAMPLES: ExampleEntry[] = [
  {
    keywords: ["done", "todo", "tick", "complete", "task"],
    label: "check",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home-icon lucide-home"><path d="M3 9 12 2l9 7-1.5 10H15v-6a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v6H5.5L4 19"/></svg>`,
  },
  {
    keywords: [
      "cross",
      "x",
      "cancel",
      "close",
      "delete",
      "ex",
      "remove",
      "times",
      "clear",
      "math",
      "multiply",
      "multiplication",
    ],
    label: "cross",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  },
  {
    keywords: ["settings", "gear", "cog"],
    label: "settings",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M12 3.5v2M12 18.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3.5 12h2M18.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    keywords: ["cloud", "upload"],
    label: "cloud-upload",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M7.5 18a3.5 3.5 0 0 1 .4-7A5 5 0 0 1 17.5 12a3 3 0 0 1-.4 6H7.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 14v5M9.8 16.2 12 14l2.2 2.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: ["download", "save"],
    label: "download",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M12 4v10M8.5 10.5 12 14l3.5-3.5M5 18h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: ["heart", "like", "love"],
    label: "heart",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M12 19.5S5.5 15.2 5.5 10.2A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 6.5 2.2c0 5-6.5 9.3-6.5 9.3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: ["star", "favorite", "rating"],
    label: "star",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="m12 3.5 2.3 5 5.5.6-4.1 3.7 1.2 5.4L12 15.8 7.1 18.2l1.2-5.4L4.2 9.1l5.5-.6L12 3.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: ["bell", "notification", "alert"],
    label: "bell",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M17.5 9a5.5 5.5 0 1 0-11 0c0 6-2.5 7.5-2.5 7.5h16S17.5 15 17.5 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.2 19a1.8 1.8 0 0 0 3.6 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    keywords: ["arrow", "right", "next", "forward"],
    label: "arrow-right",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: ["lock", "security", "password", "private"],
    label: "lock",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M8.5 11V8.5a3.5 3.5 0 0 1 7 0V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    keywords: ["trash", "delete", "bin", "remove"],
    label: "trash",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M5 7h14M10 7V5.5a1.5 1.5 0 0 1 1.5-1.5h1A1.5 1.5 0 0 1 14 5.5V7M8 7v11.5A1.5 1.5 0 0 0 9.5 20h5a1.5 1.5 0 0 0 1.5-1.5V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: ["mail", "email", "inbox", "message"],
    label: "mail",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="6" width="17" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="m4.5 8 7.5 5.5L19.5 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: ["user", "person", "profile", "account"],
    label: "user",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    keywords: ["check", "done", "success", "tick"],
    label: "check",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="m5.5 12.5 4.5 4.5 8.5-9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: ["plus", "add", "new", "create"],
    label: "plus",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    keywords: ["menu", "hamburger", "nav"],
    label: "menu",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    keywords: ["loading", "loader", "spinner", "animated"],
    label: "loader",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.5" stroke-opacity=".25"/><path class="spin" d="M12 4a8 8 0 0 1 8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><style>@keyframes s{to{transform:rotate(360deg)}}.spin{transform-origin:12px 12px;animation:s 1s linear infinite}</style></svg>`,
  },
];

/** Tiny always-on quality anchors (keep under ~400 chars total). */
export const GOLDEN_ANCHORS = `QUALITY ANCHORS (match this precision):
arrow: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
search: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.5"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export function findRelevantExample(prompt: string): string {
  const lower = prompt.toLowerCase();
  for (const entry of GLYPH_EXAMPLES) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      return `Reference (${entry.label}): ${entry.svg}`;
    }
  }
  return "";
}

export function buildLocalBrief(
  prompt: string,
  intent: GlyphIntent,
  style: string,
): string {
  const bits = [
    `Subject: ${intent.subject}`,
    `Metaphor: simplest Lucide-style symbol for "${prompt.trim()}"`,
    `Style: ${style}; monochrome currentColor; max 4–6 paths`,
    `Grid: center on 12,12; 2px padding; stroke-width consistent`,
  ];
  if (intent.hasAnimation || style === "animated") {
    bits.push(
      `Motion: subtle CSS @keyframes (0.8–1.6s), seamless loop, 1–2 animated parts`,
    );
  }
  return bits.map((b) => `• ${b}`).join("\n");
}

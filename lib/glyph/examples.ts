export type ExampleEntry = {
  keywords: string[];
  label: string;
  svg: string;
};

/** Curated Lucide-grade references — keep this file small on purpose. */
export const GLYPH_EXAMPLES: ExampleEntry[] = [
  {
    keywords: ["home", "house"],
    label: "home",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: ["search", "magnifier", "find"],
    label: "search",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M16.5 16.5 21 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    keywords: ["settings", "gear", "cog"],
    label: "settings",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    keywords: ["cloud", "upload", "download"],
    label: "cloud-upload",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M7 18a4 4 0 0 1 .5-7.96A5.5 5.5 0 0 1 18 11a3.5 3.5 0 0 1-.5 7H7Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 13v6M9.5 15.5 12 13l2.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: ["heart", "like", "favorite"],
    label: "heart",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M12 20s-7-4.35-7-9.2A3.8 3.8 0 0 1 12 8.2 3.8 3.8 0 0 1 19 10.8C19 15.65 12 20 12 20Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: ["star", "favorite", "rating"],
    label: "star",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="m12 3 2.6 5.6 6.2.7-4.6 4.2 1.3 6.1L12 16.8 6.5 19.6l1.3-6.1L3.2 9.3l6.2-.7L12 3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: ["bell", "notification", "alert"],
    label: "bell",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.3 21a1.7 1.7 0 0 0 3.4 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    keywords: ["arrow", "right", "next"],
    label: "arrow-right",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: ["lock", "security", "password"],
    label: "lock",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><rect x="4" y="11" width="16" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    keywords: ["loading", "loader", "spinner", "animated"],
    label: "loader-blocks",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><rect class="b" x="4" y="4" width="6" height="6" rx="1" fill="currentColor"/><rect class="b" x="14" y="4" width="6" height="6" rx="1" fill="currentColor"/><rect class="b" x="4" y="14" width="6" height="6" rx="1" fill="currentColor"/><rect class="b" x="14" y="14" width="6" height="6" rx="1" fill="currentColor"/><style>@keyframes p{0%,100%{opacity:.35}50%{opacity:1}}.b{animation:p 1.2s ease-in-out infinite}.b:nth-child(2){animation-delay:.15s}.b:nth-child(3){animation-delay:.3s}.b:nth-child(4){animation-delay:.45s}</style></svg>`,
  },
];

export function findRelevantExample(prompt: string): string {
  const lower = prompt.toLowerCase();
  for (const entry of GLYPH_EXAMPLES) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      return `\nClosest reference icon (${entry.label}) — match this style and precision:\n${entry.svg}\n`;
    }
  }
  return "";
}

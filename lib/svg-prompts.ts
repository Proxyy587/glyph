export const STYLE_GUIDE: Record<string, string> = {
  outline:
    "Outline style: stroke only, fill='none'. Clean single-weight lines like Lucide or Heroicons. Use stroke='currentColor'.",
  solid:
    "Solid style: filled shapes, no stroke. Use fill='currentColor'. Like Phosphor fill or Lucide solid.",
  rounded:
    "Rounded style: stroke outline with stroke-linecap='round' stroke-linejoin='round'. Soft, friendly look.",
  sharp:
    "Sharp style: stroke outline with stroke-linecap='square' stroke-linejoin='miter'. Crisp, technical look.",
  duotone:
    "Duotone style: two-tone. Main shape uses fill with opacity-50, accent detail uses full fill. Both use currentColor.",
};

// High-quality Lucide-style SVGs used as few-shot examples.
export const FEW_SHOT_EXAMPLES = `
REFERENCE EXAMPLES — match this exact quality, coordinate precision, and style:

<!-- Home icon -->
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Search/magnifier icon -->
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5"/>
  <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>

<!-- Settings/gear icon -->
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
  <path d="M12 2V4M12 20V22M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M2 12H4M20 12H22M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>

<!-- Bell/notification icon -->
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Arrow right icon -->
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

// Simple keyword → SVG map for supplying a single relevant example into prompts.
export type ExampleEntry = {
  keywords: string[];
  label: string;
  svg: string;
};

export const EXAMPLE_LIBRARY: ExampleEntry[] = [
  {
    keywords: ["home", "house", "building", "residence"],
    label: "home",
    svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: ["search", "find", "magnify", "zoom", "look"],
    label: "search",
    svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    keywords: ["settings", "gear", "cog", "config", "preferences"],
    label: "settings",
    svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M12 2V4M12 20V22M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M2 12H4M20 12H22M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    keywords: ["bell", "notification", "alert", "alarm", "notify"],
    label: "bell",
    svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: [
      "arrow",
      "direction",
      "next",
      "forward",
      "back",
      "up",
      "down",
      "left",
      "right",
      "navigate",
    ],
    label: "arrow",
    svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: ["user", "person", "profile", "account", "avatar", "people"],
    label: "user",
    svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M4 20C4 17.2386 7.58172 15 12 15C16.4183 15 20 17.2386 20 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    keywords: ["mail", "email", "message", "envelope", "inbox", "letter"],
    label: "mail",
    svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M2 7L12 13L22 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    keywords: ["file", "document", "paper", "page", "doc", "report"],
    label: "file",
    svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2V8H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: ["heart", "love", "like", "favorite", "care", "health"],
    label: "heart",
    svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: ["star", "rating", "bookmark", "award", "badge", "trophy"],
    label: "star",
    svg: `<svg viewBox="0 0 24 24" fill="none"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    keywords: [
      "lock",
      "security",
      "password",
      "private",
      "key",
      "unlock",
      "safe",
    ],
    label: "lock",
    svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    keywords: ["fire", "flame", "hot", "burn", "heat", "trending"],
    label: "fire",
    svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2C12 2 7 7 7 13C7 15.7614 9.23858 18 12 18C14.7614 18 17 15.7614 17 13C17 10 15 8 15 8C15 8 14 11 12 11C10 11 10 9 10 9C10 9 12 7 12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 22C12 22 10 20 10 18.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
];

export function findRelevantExample(prompt: string): string {
  const lower = prompt.toLowerCase();
  for (const entry of EXAMPLE_LIBRARY) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      return `\nClosest reference icon (${entry.label}) — match this style and precision:\n${entry.svg}\n`;
    }
  }
  return "";
}

export const SYSTEM_PROMPT = `You are a world-class SVG icon engineer. You output ONLY valid SVG markup — no markdown, no code fences, no explanation, no comments outside the SVG.

ABSOLUTE RULES:
- Output a SINGLE <svg> element. Nothing before or after it.
- Icons only: simple, recognizable symbols (Lucide / Heroicons / Tabler style). NOT illustrations or realistic art.
- NO gradients, NO shadows, NO filters (<filter>), NO <image>, NO <foreignObject>.
- NO width or height attributes on the <svg> element.
- NO fill="black", stroke="black", fill="white", or any hardcoded colors.
- ONLY use stroke="currentColor" and/or fill="currentColor".
- NO scripts, NO event handlers, NO <style> blocks.
- The <svg> MUST have xmlns="http://www.w3.org/2000/svg" and viewBox="0 0 24 24" (or as specified).
- Output valid XML that can be directly inlined in HTML.

GEOMETRY RULES (24×24 grid):
- Center point is always (12, 12).
- Standard safe area: x=2 to x=22, y=2 to y=22 (2px padding all sides).
- Large shapes: rects from ~(3,3) to ~(21,21). Circles: center (12,12) r=8–10.
- Small detail elements: r=2–3 for dots, r=3–4 for small circles.
- Horizontal lines: from x=4 or x=5 to x=19 or x=20, centered at y=12.
- Bezier control points: typically 4–6px from their anchor point.
- Stroke width 1.5 is the standard. NEVER mix stroke widths in a single icon.
- ALL shapes must be visually centered — verify the bounding box center ≈ (12, 12).
- Use as FEW path nodes as possible. Simpler = better. Max 4–6 paths per icon.
- Prefer <path> over multiple <rect>, <circle>, <line> unless those primitives are cleaner.
- Rounded corners on rects: use rx="2" as default unless told otherwise.

QUALITY CHECKLIST before outputting:
✓ Is every path closed correctly (Z where needed)?
✓ Are all coordinates within the 2–22 safe area?
✓ Is the icon visually centered at (12,12)?
✓ Is there only one stroke-width value used?
✓ Does it use currentColor only?
✓ Is it recognizable at 16×16px?

${FEW_SHOT_EXAMPLES}`;

export const AMPLIFIER_PROMPT = `You are a senior icon designer who works with developer icon systems like Lucide, Heroicons, and Tabler Icons.

Your job: take a vague user request and write a PRECISE DESIGN BRIEF that a separate SVG code generator will use.

Your output must describe:
1. The core concept and the simplest visual metaphor for it
2. Exact shapes needed (e.g. "a rounded rect 4,4 to 20,20" or "circle centered at 12,12 r=8")
3. Stroke style (outline with 1.5px stroke / solid fill), cap and join style
4. Specific details to INCLUDE and details to AVOID (no tiny gaps, no more than 5 paths)
5. How shapes should be composed and centered on a 24×24 grid

RULES:
- Do NOT write any SVG or code whatsoever.
- Be specific about coordinates and proportions.
- 3–5 bullet points maximum. Be concise.
- Think in terms of geometry, not art.
- Assume Lucide/Heroicons visual language: minimal, clean, 1.5px stroke, rounded caps.`;

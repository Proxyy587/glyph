import { generateText } from "ai";
import { GLYPH_PLAN_MODEL, openrouter } from "../provider";

/**
 * Image models read prompts literally ("git branch" → a tree branch). One cheap
 * text call (~$0.0002, vs ~$0.014 for the image) rewrites subjects into the
 * concrete metaphor icon sets use. Any failure falls back to the raw subject.
 */

const SYSTEM = `You turn icon requests into concrete drawing instructions for an image model that draws flat, single-color icons.
Describe exactly what to draw the way established UI icon sets (Lucide, Material Symbols, Font Awesome) depict the subject: the objects, their arrangement, and any arrows or symbols.
Rules:
- 6 to 18 words each. Concrete nouns and shapes only. No style, color, or rendering words.
- Technical terms use their standard icon metaphor, for example:
  "git branch" -> "three small circles connected by lines forming a fork, like a git branch diagram"
  "docker container" -> "a whale carrying a stack of square shipping-container boxes on its back"
  "terminal" -> "a rectangular window containing a > prompt chevron and an underscore cursor"
  "cloud upload" -> "a cloud with a bold upward-pointing arrow in its center"
- Brand names: describe the brand's widely recognized logo mark as simple shapes.
- Ignore words about animation or motion; describe a single still pose.
Return JSON only.`;

const TIMEOUT_MS = 10_000;

async function askForList(
  prompt: string,
  count: number,
): Promise<string[] | null> {
  try {
    const { text } = await generateText({
      model: openrouter.chat(GLYPH_PLAN_MODEL),
      system: SYSTEM,
      prompt,
      temperature: 0.4,
      maxOutputTokens: 600,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const items = (JSON.parse(json) as { items?: unknown }).items;
    if (!Array.isArray(items) || items.length !== count) return null;

    const cleaned = items.map((item) =>
      typeof item === "string"
        ? item.replace(/\s+/g, " ").trim().slice(0, 200)
        : "",
    );
    return cleaned.every(Boolean) ? cleaned : null;
  } catch (error) {
    console.warn("[glyph-trace] describe failed, using raw subjects:", error);
    return null;
  }
}

/** Four distinct takes on one subject, used as the 2×2 variant sheet. */
export async function describeVariants(subject: string): Promise<string[]> {
  const result = await askForList(
    `Subject: ${JSON.stringify(subject)}
Write 4 clearly different ways to draw this one icon, each still instantly recognizable at 16px.
Keep every take simple: one main subject plus at most one small supporting element. Vary pose, viewpoint, framing, or level of simplification instead of adding props, patterns, or scenes. The first take is the canonical depiction.
Return {"items": ["...", "...", "...", "..."]}.`,
    4,
  );

  return (
    result ?? [
      `${subject}, the classic most recognizable front view`,
      `${subject}, a three-quarter or side view`,
      `${subject}, simplified into basic geometric shapes`,
      `${subject}, a bold close-up of its most defining feature`,
    ]
  );
}

/** One description per pack item, same order. */
export async function describeSubjects(subjects: string[]): Promise<string[]> {
  const result = await askForList(
    `Subjects: ${JSON.stringify(subjects)}
Write one drawing instruction per subject, in the same order.
Return {"items": [${subjects.map(() => '"..."').join(", ")}]}.`,
    subjects.length,
  );
  return result ?? subjects;
}

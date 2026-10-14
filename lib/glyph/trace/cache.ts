import { createHash } from "node:crypto";
import { and, count, eq, sql } from "drizzle-orm";
import db from "@/lib/db";
import { glyphTraceCache, svgGeneration } from "@/lib/db/svg-schema";
import { generateImage, GLYPH_IMAGE_MODEL } from "./image-client";
import { TRACE_TEMPLATE_VERSION } from "./prompts";
import { maskToPng, toMask, type Mask } from "./raster";

export type SheetResult = {
  mask: Mask;
  costUsd: number;
  cached: boolean;
  model: string;
};

/**
 * How many times this user already generated this exact prompt with the
 * trace engine. Roll 0 is shared across users (free cache hits for popular
 * prompts); each re-generate moves to the next roll, so users always get
 * fresh variants instead of the same cached sheet.
 */
export async function countPriorRolls(
  userId: string,
  prompt: string,
): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(svgGeneration)
    .where(
      and(
        eq(svgGeneration.userId, userId),
        eq(svgGeneration.engine, "trace"),
        eq(svgGeneration.prompt, prompt),
      ),
    );
  return row?.n ?? 0;
}

function cacheKey(model: string, request: string, roll: number) {
  return createHash("sha256")
    .update(`${TRACE_TEMPLATE_VERSION}|${model}|${roll}|${request}`)
    .digest("hex");
}

/**
 * Return the binarized sheet for a request, generating it only on a miss.
 * `request` is the stable cache identity (kind + style + subjects); the image
 * prompt is built lazily so a hit skips the describe call as well.
 */
export async function getSheet(
  request: string,
  buildPrompt: () => Promise<string>,
  options: { roll: number; userId: string },
): Promise<SheetResult> {
  const model = GLYPH_IMAGE_MODEL;
  const key = cacheKey(model, request, options.roll);

  const [hit] = await db
    .select({ image: glyphTraceCache.image })
    .from(glyphTraceCache)
    .where(eq(glyphTraceCache.key, key))
    .limit(1);

  if (hit) {
    void db
      .update(glyphTraceCache)
      .set({ hits: sql`${glyphTraceCache.hits} + 1` })
      .where(eq(glyphTraceCache.key, key))
      .catch(() => {});
    return {
      mask: await toMask(Buffer.from(hit.image, "base64")),
      costUsd: 0,
      cached: true,
      model,
    };
  }

  const imagePrompt = await buildPrompt();
  const image = await generateImage(imagePrompt, {
    model,
    userId: options.userId,
  });
  const mask = await toMask(image.bytes);

  try {
    const png = await maskToPng(mask);
    await db
      .insert(glyphTraceCache)
      .values({
        key,
        model,
        prompt: imagePrompt,
        image: png.toString("base64"),
      })
      .onConflictDoNothing();
  } catch (error) {
    console.warn("[glyph-trace] cache write failed:", error);
  }

  return { mask, costUsd: image.costUsd, cached: false, model };
}

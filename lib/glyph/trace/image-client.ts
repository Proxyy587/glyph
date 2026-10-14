/**
 * Thin client for OpenRouter's Images API (POST /api/v1/images).
 * One call = one paid image; everything after this is local and free.
 */

export const GLYPH_IMAGE_MODEL =
  process.env.GLYPH_IMAGE_MODEL ?? "black-forest-labs/flux.2-klein-4b";

const IMAGES_ENDPOINT = "https://openrouter.ai/api/v1/images";
const TIMEOUT_MS = 45_000;

export type GeneratedImage = {
  bytes: Buffer;
  mediaType: string;
  costUsd: number;
  model: string;
};

export async function generateImage(
  prompt: string,
  options: { model?: string; seed?: number; userId?: string } = {},
): Promise<GeneratedImage> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");

  const model = options.model ?? GLYPH_IMAGE_MODEL;

  // `resolution` is intentionally omitted: several providers reject tiers
  // below 1K, and FLUX bills a 1MP minimum regardless of requested size.
  const res = await fetch(IMAGES_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      size: "1024x1024",
      output_format: "png",
      n: 1,
      ...(options.seed != null ? { seed: options.seed } : {}),
      ...(options.userId ? { user: options.userId } : {}),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const json = (await res.json().catch(() => null)) as {
    data?: { b64_json?: string; media_type?: string }[];
    usage?: { cost?: number };
    error?: { message?: string };
  } | null;

  if (!res.ok || !json) {
    throw new Error(
      `Image generation failed (${res.status}): ${json?.error?.message ?? "no body"}`,
    );
  }

  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error("Image generation returned no image data");

  return {
    bytes: Buffer.from(b64, "base64"),
    mediaType: json.data?.[0]?.media_type ?? "image/png",
    costUsd: json.usage?.cost ?? 0,
    model,
  };
}

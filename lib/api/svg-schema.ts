import { z } from "zod";
import { OPENROUTER_FREE_MODELS } from "@/lib/openrouter-models";
import { STYLE_GUIDE } from "@/lib/glyph/prompts";

export const MAX_PROMPT_LENGTH = Number(
  process.env.GLYPH_MAX_PROMPT_LENGTH ?? 500,
);
export const MAX_PACK_SIZE = Number(process.env.GLYPH_MAX_PACK_SIZE ?? 8);
export const PACK_CONCURRENCY = Number(process.env.GLYPH_PACK_CONCURRENCY ?? 3);

const ALLOWED_MODELS = new Set<string>(
  OPENROUTER_FREE_MODELS.map((m) => m.id),
);

export const svgGenerateBodySchema = z
  .object({
    prompt: z.string().max(MAX_PROMPT_LENGTH).optional().default(""),
    style: z
      .string()
      .refine((s) => s in STYLE_GUIDE, { message: "Invalid style." })
      .optional(),
    strokeWidth: z.number().min(0.5).max(4).optional(),
    cornerRadius: z.number().min(0).max(8).optional(),
    padding: z.number().min(0).max(8).optional(),
    viewBoxSize: z
      .union([z.literal(16), z.literal(24), z.literal(32)])
      .optional(),
    packPrompts: z
      .array(z.string().max(MAX_PROMPT_LENGTH))
      .max(MAX_PACK_SIZE)
      .optional(),
    model: z.string().max(120).optional(),
  })
  .superRefine((data, ctx) => {
    const pack = (data.packPrompts ?? []).map((p) => p.trim()).filter(Boolean);
    const prompt = data.prompt?.trim() ?? "";

    if (!prompt && pack.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a prompt and click Generate to see your icon.",
        path: ["prompt"],
      });
    }

    if (data.model && !ALLOWED_MODELS.has(data.model)) {
      ctx.addIssue({
        code: "custom",
        message: "Unsupported model.",
        path: ["model"],
      });
    }
  });

export type SvgGenerateBody = z.infer<typeof svgGenerateBodySchema>;

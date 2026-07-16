/**
 * Compatibility re-exports — prefer importing from `@/lib/glyph`.
 * Kept so any leftover imports do not break.
 */
export {
  STYLE_GUIDE,
  GLYPH_SYSTEM_PROMPT as SYSTEM_PROMPT,
  AMPLIFIER_PROMPT,
} from "@/lib/glyph/prompts";
export { findRelevantExample } from "@/lib/glyph/examples";

import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "@/lib/db/auth-schema";

export const svgGenerationModeEnum = pgEnum("svg_generation_mode", [
  "single",
  "pack",
]);

export type SvgPackItem = {
  prompt: string;
  svg: string | null;
  error?: string;
};

export const svgGeneration = pgTable(
  "svg_generation",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    mode: svgGenerationModeEnum("mode").notNull(),
    generatedSvg: text("generated_svg"),
    generatedPack: jsonb("generated_pack").$type<SvgPackItem[] | null>(),
    variants: jsonb("variants").$type<string[] | null>(),
    engine: text("engine").$type<"code" | "trace">().default("code").notNull(),
    costUsd: real("cost_usd").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("svg_generation_user_id_idx").on(table.userId),
    index("svg_generation_mode_idx").on(table.mode),
    index("svg_generation_user_created_idx").on(table.userId, table.createdAt),
  ],
);

/**
 * Shared cache of binarized image sheets for the trace engine.
 * A hit re-slices and re-traces locally, so it costs nothing.
 */
export const glyphTraceCache = pgTable("glyph_trace_cache", {
  key: text("key").primaryKey(),
  model: text("model").notNull(),
  prompt: text("prompt").notNull(),
  /** Base64 2-colour PNG of the full sheet. */
  image: text("image").notNull(),
  hits: integer("hits").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const svgGenerationRelations = relations(svgGeneration, ({ one }) => ({
  user: one(user, {
    fields: [svgGeneration.userId],
    references: [user.id],
  }),
}));

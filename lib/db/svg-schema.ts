import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("svg_generation_user_id_idx").on(table.userId),
    index("svg_generation_mode_idx").on(table.mode),
  ],
);

export const svgGenerationRelations = relations(svgGeneration, ({ one }) => ({
  user: one(user, {
    fields: [svgGeneration.userId],
    references: [user.id],
  }),
}));

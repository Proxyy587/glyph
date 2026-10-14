import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { svgGeneration } from "@/lib/db/svg-schema";
import { eq, desc, and } from "drizzle-orm";

const deleteBodySchema = z.object({
  id: z.string().uuid(),
});

const patchBodySchema = z.object({
  id: z.string().uuid(),
  variantIndex: z.number().int().min(0).max(8),
});

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    const variantsFor = new URL(request.url).searchParams.get("variants");
    if (variantsFor !== null) {
      const id = z.string().uuid().safeParse(variantsFor);
      if (!id.success) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
      }
      const [row] = await db
        .select({ variants: svgGeneration.variants })
        .from(svgGeneration)
        .where(
          and(
            eq(svgGeneration.id, id.data),
            eq(svgGeneration.userId, session.user.id),
          ),
        )
        .limit(1);
      return NextResponse.json(
        { variants: row?.variants ?? [] },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const rows = await db
      .select({
        id: svgGeneration.id,
        prompt: svgGeneration.prompt,
        mode: svgGeneration.mode,
        generatedSvg: svgGeneration.generatedSvg,
        generatedPack: svgGeneration.generatedPack,
        createdAt: svgGeneration.createdAt,
      })
      .from(svgGeneration)
      .where(eq(svgGeneration.userId, session.user.id))
      .orderBy(desc(svgGeneration.createdAt))
      .limit(24);

    const items = rows
      .map((row) => {
        if (row.mode === "single" && row.generatedSvg) {
          return {
            id: row.id,
            prompt: row.prompt,
            mode: "single" as const,
            svg: row.generatedSvg,
            createdAt: row.createdAt,
          };
        }

        if (row.mode === "pack" && row.generatedPack) {
          const packItems = row.generatedPack
            .filter((entry) => entry.svg)
            .map((entry) => ({
              prompt: entry.prompt,
              svg: entry.svg as string,
            }));

          if (packItems.length === 0) return null;

          return {
            id: row.id,
            prompt: row.prompt,
            mode: "pack" as const,
            createdAt: row.createdAt,
            items: packItems,
            previewSvgs: packItems.slice(0, 3).map((p) => p.svg),
          };
        }

        return null;
      })
      .filter(Boolean);

    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("Failed to load SVG history:", error);
    return NextResponse.json(
      { error: "Failed to load history", items: [] },
      { status: 500 },
    );
  }
}

/** Pick which traced variant is saved as the generation's icon. */
export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    const parsed = patchBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const where = and(
      eq(svgGeneration.id, parsed.data.id),
      eq(svgGeneration.userId, session.user.id),
    );

    const [row] = await db
      .select({ variants: svgGeneration.variants })
      .from(svgGeneration)
      .where(where)
      .limit(1);

    const svg = row?.variants?.[parsed.data.variantIndex];
    if (!svg) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.update(svgGeneration).set({ generatedSvg: svg }).where(where);

    return NextResponse.json({ updated: true });
  } catch (error) {
    console.error("Failed to update SVG history item:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    const parsed = deleteBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid id; only single generations can be deleted" },
        { status: 400 },
      );
    }

    const deleted = await db
      .delete(svgGeneration)
      .where(
        and(
          eq(svgGeneration.id, parsed.data.id),
          eq(svgGeneration.userId, session.user.id),
        ),
      )
      .returning({ id: svgGeneration.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Failed to delete SVG history item:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { svgGeneration } from "@/lib/db/svg-schema";
import { eq, desc, and } from "drizzle-orm";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    const rows = await db
      .select()
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

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Failed to load SVG history:", error);
    return NextResponse.json(
      { error: "Failed to load history", items: [] },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const id = typeof body.id === "string" ? body.id.trim() : null;
    if (!id) {
      return NextResponse.json(
        { error: "Missing id in body" },
        { status: 400 },
      );
    }

    // Only allow deleting single-generation rows (uuid). Pack sub-items use "uuid:prompt".
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid id; only single generations can be deleted" },
        { status: 400 },
      );
    }

    const deleted = await db
      .delete(svgGeneration)
      .where(
        and(
          eq(svgGeneration.id, id),
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

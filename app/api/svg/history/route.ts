import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { svgGeneration } from "@/lib/db/svg-schema";
import { eq, desc } from "drizzle-orm";

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
            svg: row.generatedSvg,
            mode: row.mode,
            createdAt: row.createdAt,
          };
        }

        if (row.mode === "pack" && row.generatedPack) {
          return row.generatedPack
            .filter((entry) => entry.svg)
            .slice(0, 3)
            .map((entry) => ({
              id: `${row.id}:${entry.prompt}`,
              prompt: entry.prompt,
              svg: entry.svg as string,
              mode: row.mode,
              createdAt: row.createdAt,
            }));
        }

        return null;
      })
      .flat()
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

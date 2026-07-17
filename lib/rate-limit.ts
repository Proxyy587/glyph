import { and, eq, gte } from "drizzle-orm";
import db from "@/lib/db";
import { svgGeneration } from "@/lib/db/svg-schema";

/** Env-tunable quotas (generation units: 1 single = 1, pack = N prompts). */
export const RATE_LIMITS = {
  perMinute: Number(process.env.GLYPH_RATE_LIMIT_BURST ?? 4),
  perHour: Number(process.env.GLYPH_RATE_LIMIT_HOURLY ?? 20),
  perDay: Number(process.env.GLYPH_RATE_LIMIT_DAILY ?? 50),
} as const;

export type RateLimitResult =
  | { ok: true; remaining: { minute: number; hour: number; day: number } }
  | {
      ok: false;
      retryAfterSec: number;
      limit: "minute" | "hour" | "day";
      message: string;
    };

function unitsFromRow(row: {
  mode: "single" | "pack";
  generatedPack: { prompt: string }[] | null;
  prompt: string;
}): number {
  if (row.mode === "pack") {
    if (row.generatedPack?.length) return row.generatedPack.length;
    return Math.max(1, row.prompt.split("\n").filter(Boolean).length);
  }
  return 1;
}

async function usageSince(userId: string, since: Date): Promise<number> {
  const rows = await db
    .select({
      mode: svgGeneration.mode,
      generatedPack: svgGeneration.generatedPack,
      prompt: svgGeneration.prompt,
    })
    .from(svgGeneration)
    .where(
      and(
        eq(svgGeneration.userId, userId),
        gte(svgGeneration.createdAt, since),
      ),
    );

  return rows.reduce((sum, row) => sum + unitsFromRow(row), 0);
}

/**
 * Check whether `requestedUnits` fit under per-minute / hour / day quotas.
 * Uses existing generation history so limits survive across serverless instances.
 */
export async function checkGenerationRateLimit(
  userId: string,
  requestedUnits: number,
): Promise<RateLimitResult> {
  const now = Date.now();
  const minuteAgo = new Date(now - 60_000);
  const hourAgo = new Date(now - 3_600_000);
  const dayAgo = new Date(now - 86_400_000);

  const [minuteUsed, hourUsed, dayUsed] = await Promise.all([
    usageSince(userId, minuteAgo),
    usageSince(userId, hourAgo),
    usageSince(userId, dayAgo),
  ]);

  if (minuteUsed + requestedUnits > RATE_LIMITS.perMinute) {
    return {
      ok: false,
      limit: "minute",
      retryAfterSec: 60,
      message: `Too many requests. Try again in a minute (max ${RATE_LIMITS.perMinute} icons/min).`,
    };
  }

  if (hourUsed + requestedUnits > RATE_LIMITS.perHour) {
    return {
      ok: false,
      limit: "hour",
      retryAfterSec: 3600,
      message: `Hourly limit reached (${RATE_LIMITS.perHour} icons). Please wait and try again.`,
    };
  }

  if (dayUsed + requestedUnits > RATE_LIMITS.perDay) {
    return {
      ok: false,
      limit: "day",
      retryAfterSec: 86_400,
      message: `Daily limit reached (${RATE_LIMITS.perDay} icons). Come back tomorrow.`,
    };
  }

  return {
    ok: true,
    remaining: {
      minute: Math.max(0, RATE_LIMITS.perMinute - minuteUsed - requestedUnits),
      hour: Math.max(0, RATE_LIMITS.perHour - hourUsed - requestedUnits),
      day: Math.max(0, RATE_LIMITS.perDay - dayUsed - requestedUnits),
    },
  };
}

/** Run async work over items with a fixed concurrency pool. */
export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];
  const limit = Math.max(1, Math.min(concurrency, items.length));
  const results = new Array<R>(items.length);
  let next = 0;

  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (true) {
        const i = next++;
        if (i >= items.length) return;
        results[i] = await fn(items[i], i);
      }
    }),
  );

  return results;
}

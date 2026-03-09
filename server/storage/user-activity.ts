/**
 * Sprint 204: Persistent user activity tracking.
 * Replaces in-memory Map with DB-backed active user counts.
 */

import { gte, sql, count } from "drizzle-orm";
import { userActivity } from "@shared/schema";
import { db } from "../db";

/** Upsert user activity — sets lastSeenAt to now */
export async function recordUserActivityDb(userId: string): Promise<void> {
  await db
    .insert(userActivity)
    .values({ userId, lastSeenAt: new Date() })
    .onConflictDoUpdate({
      target: userActivity.userId,
      set: { lastSeenAt: new Date() },
    });
}

/** Get active user counts by time window from DB */
export async function getActiveUserStatsDb(): Promise<{
  last1h: number;
  last24h: number;
  last7d: number;
  last30d: number;
}> {
  const now = Date.now();
  const windows = {
    last1h: new Date(now - 60 * 60 * 1000),
    last24h: new Date(now - 24 * 60 * 60 * 1000),
    last7d: new Date(now - 7 * 24 * 60 * 60 * 1000),
    last30d: new Date(now - 30 * 24 * 60 * 60 * 1000),
  };

  const [r1h, r24h, r7d, r30d] = await Promise.all([
    db.select({ count: count() }).from(userActivity).where(gte(userActivity.lastSeenAt, windows.last1h)),
    db.select({ count: count() }).from(userActivity).where(gte(userActivity.lastSeenAt, windows.last24h)),
    db.select({ count: count() }).from(userActivity).where(gte(userActivity.lastSeenAt, windows.last7d)),
    db.select({ count: count() }).from(userActivity).where(gte(userActivity.lastSeenAt, windows.last30d)),
  ]);

  return {
    last1h: r1h[0].count,
    last24h: r24h[0].count,
    last7d: r7d[0].count,
    last30d: r30d[0].count,
  };
}

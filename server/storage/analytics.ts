/**
 * Sprint 201: Analytics event persistence.
 * Flush handler for in-memory analytics buffer → PostgreSQL.
 * Uses the existing analyticsEvents table from schema.
 */

import { desc, eq, gte, lt, sql, count } from "drizzle-orm";
import { analyticsEvents } from "@shared/schema";
import { db } from "../db";

interface FunnelEntry {
  event: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

/** Bulk insert analytics events from the in-memory buffer */
export async function persistAnalyticsEvents(entries: FunnelEntry[]): Promise<void> {
  if (entries.length === 0) return;

  const values = entries.map((e) => ({
    event: e.event,
    userId: e.userId || null,
    metadata: e.metadata || null,
    createdAt: new Date(e.timestamp),
  }));

  // Batch insert in chunks of 100 to avoid query size limits
  const CHUNK_SIZE = 100;
  for (let i = 0; i < values.length; i += CHUNK_SIZE) {
    const chunk = values.slice(i, i + CHUNK_SIZE);
    await db.insert(analyticsEvents).values(chunk);
  }
}

/** Get persisted event counts by type for a time range */
export async function getPersistedEventCounts(
  since: Date,
): Promise<Record<string, number>> {
  const rows = await db
    .select({
      event: analyticsEvents.event,
      count: count(),
    })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, since))
    .groupBy(analyticsEvents.event);

  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.event] = row.count;
  }
  return result;
}

/** Get persisted daily stats for the last N days */
export async function getPersistedDailyStats(
  days: number,
): Promise<Array<{ date: string; events: number }>> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await db
    .select({
      date: sql<string>`DATE(${analyticsEvents.createdAt})`,
      count: count(),
    })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, since))
    .groupBy(sql`DATE(${analyticsEvents.createdAt})`)
    .orderBy(sql`DATE(${analyticsEvents.createdAt})`);

  return rows.map((r) => ({ date: r.date, events: r.count }));
}

/** Get total persisted event count */
export async function getPersistedEventTotal(): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(analyticsEvents);
  return result.count;
}

/**
 * Sprint 203: Data retention — purge analytics events older than N days.
 * Default retention: 90 days. Called by scheduled cleanup.
 */
export async function purgeOldAnalyticsEvents(retentionDays = 90): Promise<number> {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const result = await db
    .delete(analyticsEvents)
    .where(lt(analyticsEvents.createdAt, cutoff));
  return result.rowCount ?? 0;
}

/** Sprint 203: Data retention policy metadata */
export const DATA_RETENTION_POLICY = {
  analyticsEvents: { retentionDays: 90, description: "Analytics events older than 90 days are purged" },
  betaInvites: { retentionDays: 365, description: "Beta invite records retained for 1 year" },
} as const;

/**
 * DB-Backed Outreach History
 * Replaces in-memory outreach-history.ts with persistent PostgreSQL storage.
 * Owner: Cole (City Growth Lead)
 *
 * Uses raw SQL via db.execute() to avoid requiring a Drizzle migration
 * for the outreach_history table.
 */

import { db } from "./db";
import { log } from "./logger";
import { sql } from "drizzle-orm";

const histLog = log.tag("OutreachHistoryDB");

/**
 * Creates the outreach_history table if it does not already exist.
 * Call once at server startup.
 */
export async function ensureOutreachHistoryTable(): Promise<void> {
  histLog.info("Ensuring outreach_history table exists");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS outreach_history (
      id SERIAL PRIMARY KEY,
      business_id VARCHAR NOT NULL,
      template_name VARCHAR NOT NULL,
      sent_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_outreach_biz_template
    ON outreach_history (business_id, template_name)
  `);

  histLog.info("outreach_history table ready");
}

/**
 * Record that outreach was sent to a business with a given template.
 */
export async function recordOutreachSentDb(
  businessId: string,
  templateName: string,
): Promise<void> {
  await db.execute(sql`
    INSERT INTO outreach_history (business_id, template_name)
    VALUES (${businessId}, ${templateName})
  `);
  histLog.info(`Recorded outreach: ${templateName} -> business ${businessId}`);
}

/**
 * Check if outreach was sent within the last N days.
 */
export async function hasOutreachBeenSentDb(
  businessId: string,
  templateName: string,
  withinDays: number,
): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT COUNT(*)::int AS cnt
    FROM outreach_history
    WHERE business_id = ${businessId}
      AND template_name = ${templateName}
      AND sent_at >= NOW() - (${withinDays} || ' days')::interval
  `);
  const cnt = (result.rows[0] as any)?.cnt ?? 0;
  return cnt > 0;
}

/**
 * Return all outreach history for a given business.
 */
export async function getOutreachHistoryDb(
  businessId: string,
): Promise<{ templateName: string; sentAt: Date }[]> {
  const result = await db.execute(sql`
    SELECT template_name, sent_at
    FROM outreach_history
    WHERE business_id = ${businessId}
    ORDER BY sent_at DESC
  `);

  return (result.rows as any[]).map((row) => ({
    templateName: row.template_name,
    sentAt: new Date(row.sent_at),
  }));
}

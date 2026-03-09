/**
 * GDPR Deletion Grace Period Service — Sprint 117 (DB-backed)
 * Persistent storage for account deletion grace periods.
 * Owner: Jordan Blake (Compliance), Sarah Nakamura (Lead Engineer)
 *
 * Per GDPR Art. 17 and CCPA §1798.105, users have the right to deletion.
 * This module implements a grace period (default 30 days) during which
 * the user can cancel their deletion request by logging back in.
 *
 * Previously used in-memory Map — now backed by deletionRequests table
 * so requests survive server restarts.
 */

import { db } from "./db";
import { deletionRequests } from "@shared/schema";
import { eq, and, lte } from "drizzle-orm";

export interface DeletionRequest {
  userId: string;
  scheduledAt: Date;
  deleteAt: Date;
  status: "pending" | "cancelled" | "completed";
}

/**
 * Schedule an account for deletion with a grace period.
 * If a pending request already exists, it is overwritten (cancelled + new one created).
 */
export async function scheduleDeletion(userId: string, gracePeriodDays: number): Promise<DeletionRequest> {
  const now = new Date();
  const deleteAt = new Date(now.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000);

  // Cancel any existing pending request for this user
  await db
    .update(deletionRequests)
    .set({ status: "cancelled", cancelledAt: now })
    .where(and(eq(deletionRequests.memberId, userId), eq(deletionRequests.status, "pending")));

  // Insert a new pending request
  const [row] = await db
    .insert(deletionRequests)
    .values({
      memberId: userId,
      requestedAt: now,
      scheduledDeletionAt: deleteAt,
      status: "pending",
    })
    .returning();

  return {
    userId,
    scheduledAt: row.requestedAt,
    deleteAt: row.scheduledDeletionAt,
    status: row.status as "pending",
  };
}

/**
 * Cancel a pending deletion request.
 * Returns true if a pending request was found and cancelled, false otherwise.
 */
export async function cancelDeletion(userId: string): Promise<boolean> {
  const now = new Date();
  const result = await db
    .update(deletionRequests)
    .set({ status: "cancelled", cancelledAt: now })
    .where(and(eq(deletionRequests.memberId, userId), eq(deletionRequests.status, "pending")))
    .returning();

  return result.length > 0;
}

/**
 * Get the current deletion status for a user.
 * Returns the most recent DeletionRequest if one exists, or null.
 */
export async function getDeletionStatus(userId: string): Promise<DeletionRequest | null> {
  const rows = await db
    .select()
    .from(deletionRequests)
    .where(eq(deletionRequests.memberId, userId))
    .orderBy(deletionRequests.requestedAt)
    .limit(1);

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    userId: row.memberId,
    scheduledAt: row.requestedAt,
    deleteAt: row.scheduledDeletionAt,
    status: row.status as DeletionRequest["status"],
  };
}

/**
 * Process all expired deletion requests.
 * Marks expired pending requests as "completed" and returns the list of user IDs
 * whose accounts should be purged.
 *
 * Should be called by a cron job or background worker (e.g., node-cron)
 * to periodically sweep expired requests.
 */
export async function processExpiredDeletions(): Promise<string[]> {
  const now = new Date();

  const completed = await db
    .update(deletionRequests)
    .set({ status: "completed", completedAt: now })
    .where(and(eq(deletionRequests.status, "pending"), lte(deletionRequests.scheduledDeletionAt, now)))
    .returning();

  return completed.map((row) => row.memberId);
}

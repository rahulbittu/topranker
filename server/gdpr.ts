/**
 * GDPR Deletion Grace Period Service — Sprint 117
 * Background job for managing account deletion with a configurable grace period.
 * Owner: Jordan Blake (Compliance), Sarah Nakamura (Lead Engineer)
 *
 * Per GDPR Art. 17 and CCPA §1798.105, users have the right to deletion.
 * This module implements a grace period (default 30 days) during which
 * the user can cancel their deletion request by logging back in.
 */

export interface DeletionRequest {
  userId: string;
  scheduledAt: Date;
  deleteAt: Date;
  status: "pending" | "cancelled" | "completed";
}

// In-memory storage — production would use the database
const deletionRequests = new Map<string, DeletionRequest>();

/**
 * Schedule an account for deletion with a grace period.
 * If a pending request already exists, it is overwritten with a new schedule.
 */
export function scheduleDeletion(userId: string, gracePeriodDays: number): DeletionRequest {
  const now = new Date();
  const deleteAt = new Date(now.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000);

  const request: DeletionRequest = {
    userId,
    scheduledAt: now,
    deleteAt,
    status: "pending",
  };

  deletionRequests.set(userId, request);
  return request;
}

/**
 * Cancel a pending deletion request.
 * Returns true if a pending request was found and cancelled, false otherwise.
 */
export function cancelDeletion(userId: string): boolean {
  const request = deletionRequests.get(userId);
  if (!request || request.status !== "pending") {
    return false;
  }
  request.status = "cancelled";
  deletionRequests.set(userId, request);
  return true;
}

/**
 * Get the current deletion status for a user.
 * Returns the DeletionRequest if one exists, or null.
 */
export function getDeletionStatus(userId: string): DeletionRequest | null {
  return deletionRequests.get(userId) || null;
}

/**
 * Process all expired deletion requests.
 * Marks expired pending requests as "completed" and returns the list of user IDs
 * whose accounts should be purged.
 *
 * In production, this would be called by a cron job or background worker
 * (e.g., Bull queue, node-cron) to periodically sweep expired requests.
 */
export function processExpiredDeletions(): string[] {
  const now = new Date();
  const expiredUserIds: string[] = [];

  for (const [userId, request] of deletionRequests.entries()) {
    if (request.status === "pending" && request.deleteAt <= now) {
      request.status = "completed";
      deletionRequests.set(userId, request);
      expiredUserIds.push(userId);
    }
  }

  return expiredUserIds;
}

/**
 * Clear all deletion requests (for testing).
 */
export function clearDeletionRequests(): void {
  deletionRequests.clear();
}

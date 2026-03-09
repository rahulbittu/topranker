/**
 * Sprint 211: Beta feedback storage.
 * Collect and query user feedback during beta period.
 */

import { desc, eq, gte, count } from "drizzle-orm";
import { betaFeedback } from "@shared/schema";
import { db } from "../db";

interface CreateFeedbackParams {
  memberId: string;
  rating: number;
  category: string;
  message: string;
  screenContext?: string;
  appVersion?: string;
}

/** Submit beta feedback */
export async function createFeedback(params: CreateFeedbackParams) {
  const [result] = await db
    .insert(betaFeedback)
    .values(params)
    .returning();
  return result;
}

/** Get recent feedback for admin dashboard */
export async function getRecentFeedback(limit = 50) {
  return db
    .select()
    .from(betaFeedback)
    .orderBy(desc(betaFeedback.createdAt))
    .limit(limit);
}

/** Get feedback stats (count by category, avg rating) */
export async function getFeedbackStats() {
  const rows = await db
    .select({
      category: betaFeedback.category,
      count: count(),
    })
    .from(betaFeedback)
    .groupBy(betaFeedback.category);

  const total = rows.reduce((sum, r) => sum + r.count, 0);
  const byCategory: Record<string, number> = {};
  for (const row of rows) {
    byCategory[row.category] = row.count;
  }

  return { total, byCategory };
}

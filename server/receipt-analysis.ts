/**
 * Sprint 542: Receipt Analysis Service — OCR Prep
 *
 * Prepares infrastructure for automated receipt verification.
 * V1: Manual review pipeline with admin endpoints.
 * V2: OCR integration point (interface defined, not implemented).
 *
 * Rating Integrity Part 4: Receipt = +25% verification boost.
 * Currently presence-based; this service adds structured analysis.
 *
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { db } from "./db";
import { receiptAnalysis, ratingPhotos, ratings, businesses } from "@shared/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { log } from "./logger";

const receiptLog = log.tag("ReceiptAnalysis");

export type ReceiptStatus = "pending" | "analyzing" | "verified" | "rejected" | "inconclusive";

export interface ReceiptAnalysisResult {
  businessName?: string;
  amount?: number;
  date?: Date;
  items?: string;
  confidence: number;
  matchScore: number;
}

/**
 * Queue a receipt photo for analysis.
 * Called when a photo is uploaded with isReceipt=true.
 */
export async function queueReceiptForAnalysis(
  ratingPhotoId: string,
  ratingId: string,
  businessId: string,
): Promise<string> {
  const [row] = await db
    .insert(receiptAnalysis)
    .values({
      ratingPhotoId,
      ratingId,
      businessId,
      status: "pending",
    })
    .returning({ id: receiptAnalysis.id });

  receiptLog.info(`Receipt queued for analysis: ${row.id} (rating: ${ratingId})`);
  return row.id;
}

/**
 * Get pending receipts for admin review.
 */
export async function getPendingReceipts(limit: number = 50): Promise<{
  id: string;
  ratingPhotoId: string;
  ratingId: string;
  businessId: string;
  businessName: string;
  photoUrl: string;
  status: string;
  createdAt: Date;
}[]> {
  const rows = await db
    .select({
      id: receiptAnalysis.id,
      ratingPhotoId: receiptAnalysis.ratingPhotoId,
      ratingId: receiptAnalysis.ratingId,
      businessId: receiptAnalysis.businessId,
      businessName: businesses.name,
      photoUrl: ratingPhotos.photoUrl,
      status: receiptAnalysis.status,
      createdAt: receiptAnalysis.createdAt,
    })
    .from(receiptAnalysis)
    .innerJoin(ratingPhotos, eq(receiptAnalysis.ratingPhotoId, ratingPhotos.id))
    .innerJoin(businesses, eq(receiptAnalysis.businessId, businesses.id))
    .where(eq(receiptAnalysis.status, "pending"))
    .orderBy(desc(receiptAnalysis.createdAt))
    .limit(limit);

  return rows;
}

/**
 * Admin: Mark receipt as verified after manual review.
 */
export async function verifyReceipt(
  analysisId: string,
  reviewerId: string,
  result: ReceiptAnalysisResult,
  note?: string,
): Promise<boolean> {
  const [updated] = await db
    .update(receiptAnalysis)
    .set({
      status: "verified",
      extractedBusinessName: result.businessName || null,
      extractedAmount: result.amount?.toFixed(2) || null,
      extractedDate: result.date || null,
      extractedItems: result.items || null,
      confidence: result.confidence.toFixed(3),
      matchScore: result.matchScore.toFixed(3),
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNote: note || null,
    })
    .where(eq(receiptAnalysis.id, analysisId))
    .returning({ id: receiptAnalysis.id });

  if (!updated) return false;
  receiptLog.info(`Receipt verified: ${analysisId} by ${reviewerId}`);
  return true;
}

/**
 * Admin: Reject receipt as invalid/unreadable.
 */
export async function rejectReceipt(
  analysisId: string,
  reviewerId: string,
  note: string,
): Promise<boolean> {
  const [updated] = await db
    .update(receiptAnalysis)
    .set({
      status: "rejected",
      confidence: "0.000",
      matchScore: "0.000",
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNote: note,
    })
    .where(eq(receiptAnalysis.id, analysisId))
    .returning({ id: receiptAnalysis.id });

  if (!updated) return false;
  receiptLog.info(`Receipt rejected: ${analysisId} by ${reviewerId}`);
  return true;
}

/**
 * Get receipt analysis stats for admin dashboard.
 */
export async function getReceiptAnalysisStats(): Promise<{
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  avgConfidence: number;
}> {
  const [stats] = await db
    .select({
      total: count(),
      pending: sql<number>`COUNT(*) FILTER (WHERE ${receiptAnalysis.status} = 'pending')`,
      verified: sql<number>`COUNT(*) FILTER (WHERE ${receiptAnalysis.status} = 'verified')`,
      rejected: sql<number>`COUNT(*) FILTER (WHERE ${receiptAnalysis.status} = 'rejected')`,
      avgConfidence: sql<number>`COALESCE(AVG(${receiptAnalysis.confidence}::numeric) FILTER (WHERE ${receiptAnalysis.status} = 'verified'), 0)`,
    })
    .from(receiptAnalysis);

  return {
    total: stats.total,
    pending: stats.pending,
    verified: stats.verified,
    rejected: stats.rejected,
    avgConfidence: Number(stats.avgConfidence),
  };
}

/**
 * V2 OCR Interface — stub for future integration.
 * When OCR provider is selected, implement this interface.
 */
export interface OCRProvider {
  /** Analyze receipt image and return extracted data */
  analyzeReceipt(imageUrl: string): Promise<ReceiptAnalysisResult>;
  /** Provider name for logging */
  name: string;
}

/**
 * V2: Process receipt through OCR provider.
 * Currently a no-op stub — logs intent and returns null.
 */
export async function processReceiptOCR(
  _analysisId: string,
  _imageUrl: string,
  _provider?: OCRProvider,
): Promise<ReceiptAnalysisResult | null> {
  receiptLog.info("OCR processing not yet implemented — receipt requires manual review");
  return null;
}

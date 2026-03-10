/**
 * Sprint 441: Photo Moderation Pipeline — DB Persistence
 * Migrated from in-memory Map to Drizzle/PostgreSQL.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { log } from "./logger";
import { db } from "./db";
import { photoSubmissions } from "@shared/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import crypto from "crypto";

const photoModLog = log.tag("PhotoModeration");

type PhotoStatus = "pending" | "approved" | "rejected";
type RejectionReason = "inappropriate" | "low_quality" | "irrelevant" | "copyright" | "spam" | "other";

export interface PhotoSubmissionRow {
  id: string;
  businessId: string;
  memberId: string;
  url: string;
  caption: string;
  status: PhotoStatus;
  rejectionReason: RejectionReason | null;
  moderatorId: string | null;
  moderatorNote: string | null;
  fileSize: number;
  mimeType: string;
  submittedAt: Date;
  reviewedAt: Date | null;
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_CAPTION_LENGTH = 500;

export async function submitPhoto(
  businessId: string,
  memberId: string,
  url: string,
  caption: string,
  fileSize: number,
  mimeType: string,
): Promise<PhotoSubmissionRow | { error: string }> {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) return { error: `Invalid mime type: ${mimeType}` };
  if (fileSize > MAX_FILE_SIZE) return { error: "File too large (max 10MB)" };
  if (caption.length > MAX_CAPTION_LENGTH) return { error: "Caption too long (max 500 chars)" };

  const id = crypto.randomUUID();
  const [row] = await db
    .insert(photoSubmissions)
    .values({
      id,
      businessId,
      memberId,
      url,
      caption,
      fileSize,
      mimeType,
    })
    .returning();

  photoModLog.info(`Photo submitted: ${row.id} for business ${businessId}`);
  return row as PhotoSubmissionRow;
}

export async function approvePhoto(photoId: string, moderatorId: string, note?: string): Promise<boolean> {
  const result = await db
    .update(photoSubmissions)
    .set({
      status: "approved",
      moderatorId,
      moderatorNote: note || null,
      reviewedAt: new Date(),
    })
    .where(and(eq(photoSubmissions.id, photoId), eq(photoSubmissions.status, "pending")))
    .returning({ id: photoSubmissions.id });

  if (result.length === 0) return false;
  photoModLog.info(`Photo approved: ${photoId} by ${moderatorId}`);
  return true;
}

export async function rejectPhoto(photoId: string, moderatorId: string, reason: RejectionReason, note?: string): Promise<boolean> {
  const result = await db
    .update(photoSubmissions)
    .set({
      status: "rejected",
      rejectionReason: reason,
      moderatorId,
      moderatorNote: note || null,
      reviewedAt: new Date(),
    })
    .where(and(eq(photoSubmissions.id, photoId), eq(photoSubmissions.status, "pending")))
    .returning({ id: photoSubmissions.id });

  if (result.length === 0) return false;
  photoModLog.info(`Photo rejected: ${photoId} by ${moderatorId} (reason: ${reason})`);
  return true;
}

export async function getPendingPhotos(limit?: number): Promise<PhotoSubmissionRow[]> {
  const rows = await db
    .select()
    .from(photoSubmissions)
    .where(eq(photoSubmissions.status, "pending"))
    .orderBy(desc(photoSubmissions.submittedAt))
    .limit(limit || 50);
  return rows as PhotoSubmissionRow[];
}

export async function getPhotosByBusiness(businessId: string): Promise<PhotoSubmissionRow[]> {
  const rows = await db
    .select()
    .from(photoSubmissions)
    .where(and(eq(photoSubmissions.businessId, businessId), eq(photoSubmissions.status, "approved")))
    .orderBy(desc(photoSubmissions.submittedAt));
  return rows as PhotoSubmissionRow[];
}

export async function getPhotoStats(): Promise<{ total: number; pending: number; approved: number; rejected: number; byReason: Record<string, number> }> {
  const allRows = await db.select().from(photoSubmissions);
  const byReason: Record<string, number> = {};
  for (const s of allRows) {
    if (s.rejectionReason) byReason[s.rejectionReason] = (byReason[s.rejectionReason] || 0) + 1;
  }
  return {
    total: allRows.length,
    pending: allRows.filter(s => s.status === "pending").length,
    approved: allRows.filter(s => s.status === "approved").length,
    rejected: allRows.filter(s => s.status === "rejected").length,
    byReason,
  };
}

export function getAllowedMimeTypes(): string[] { return [...ALLOWED_MIME_TYPES]; }
export function getMaxFileSize(): number { return MAX_FILE_SIZE; }

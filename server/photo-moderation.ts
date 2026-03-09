/**
 * Sprint 254: Photo Moderation Pipeline
 * Manages user-uploaded photo submissions with admin moderation workflow.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { log } from "./logger";
import crypto from "crypto";

const photoModLog = log.tag("PhotoModeration");

type PhotoStatus = "pending" | "approved" | "rejected";
type RejectionReason = "inappropriate" | "low_quality" | "irrelevant" | "copyright" | "spam" | "other";

interface PhotoSubmission {
  id: string;
  businessId: string;
  memberId: string;
  url: string;
  caption: string;
  status: PhotoStatus;
  rejectionReason: RejectionReason | null;
  moderatorId: string | null;
  moderatorNote: string | null;
  fileSize: number;       // bytes
  mimeType: string;
  submittedAt: string;
  reviewedAt: string | null;
}

const submissions = new Map<string, PhotoSubmission>();
const MAX_SUBMISSIONS = 3000;

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_CAPTION_LENGTH = 500;

export function submitPhoto(businessId: string, memberId: string, url: string, caption: string, fileSize: number, mimeType: string): PhotoSubmission | { error: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) return { error: `Invalid mime type: ${mimeType}` };
  if (fileSize > MAX_FILE_SIZE) return { error: "File too large (max 10MB)" };
  if (caption.length > MAX_CAPTION_LENGTH) return { error: "Caption too long (max 500 chars)" };

  const sub: PhotoSubmission = {
    id: crypto.randomUUID(),
    businessId, memberId, url, caption,
    status: "pending",
    rejectionReason: null, moderatorId: null, moderatorNote: null,
    fileSize, mimeType,
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
  };
  submissions.set(sub.id, sub);
  if (submissions.size > MAX_SUBMISSIONS) {
    const oldest = Array.from(submissions.values()).sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))[0];
    if (oldest) submissions.delete(oldest.id);
  }
  photoModLog.info(`Photo submitted: ${sub.id} for business ${businessId}`);
  return sub;
}

export function approvePhoto(photoId: string, moderatorId: string, note?: string): boolean {
  const sub = submissions.get(photoId);
  if (!sub || sub.status !== "pending") return false;
  sub.status = "approved";
  sub.moderatorId = moderatorId;
  sub.moderatorNote = note || null;
  sub.reviewedAt = new Date().toISOString();
  photoModLog.info(`Photo approved: ${photoId} by ${moderatorId}`);
  return true;
}

export function rejectPhoto(photoId: string, moderatorId: string, reason: RejectionReason, note?: string): boolean {
  const sub = submissions.get(photoId);
  if (!sub || sub.status !== "pending") return false;
  sub.status = "rejected";
  sub.rejectionReason = reason;
  sub.moderatorId = moderatorId;
  sub.moderatorNote = note || null;
  sub.reviewedAt = new Date().toISOString();
  photoModLog.info(`Photo rejected: ${photoId} by ${moderatorId} (reason: ${reason})`);
  return true;
}

export function getPendingPhotos(limit?: number): PhotoSubmission[] {
  return Array.from(submissions.values()).filter(s => s.status === "pending").slice(0, limit || 50);
}

export function getPhotosByBusiness(businessId: string): PhotoSubmission[] {
  return Array.from(submissions.values()).filter(s => s.businessId === businessId && s.status === "approved");
}

export function getPhotoStats(): { total: number; pending: number; approved: number; rejected: number; byReason: Record<string, number> } {
  const all = Array.from(submissions.values());
  const byReason: Record<string, number> = {};
  for (const s of all) {
    if (s.rejectionReason) byReason[s.rejectionReason] = (byReason[s.rejectionReason] || 0) + 1;
  }
  return {
    total: all.length,
    pending: all.filter(s => s.status === "pending").length,
    approved: all.filter(s => s.status === "approved").length,
    rejected: all.filter(s => s.status === "rejected").length,
    byReason,
  };
}

export function getAllowedMimeTypes(): string[] { return [...ALLOWED_MIME_TYPES]; }
export function getMaxFileSize(): number { return MAX_FILE_SIZE; }

export function clearSubmissions(): void {
  submissions.clear();
}

/**
 * Sprint 583: Rating Photo Verification — Content Hash + Duplicate Detection
 *
 * Anti-gaming layer: detect exact duplicate photos across ratings.
 * A SHA-256 content hash is computed on upload and checked against known hashes.
 * Duplicates are flagged for admin review (not blocked — weighting handles trust).
 *
 * Owner: Nadia Kaur (Cybersecurity) + Sarah Nakamura (Lead Eng)
 */

import crypto from "crypto";
import { log } from "./logger";

const hashLog = log.tag("PhotoHash");

// In-memory hash index: contentHash → { ratingId, memberId, businessId, uploadedAt }
// Persists for server lifetime. At scale, move to Redis or DB column.
interface HashEntry {
  ratingId: string;
  memberId: string;
  businessId: string;
  photoId: string;
  uploadedAt: number;
}

const hashIndex = new Map<string, HashEntry>();

/** Compute SHA-256 content hash from raw photo buffer */
export function computePhotoHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/** Check if a photo hash already exists. Returns the original entry if duplicate. */
export function checkDuplicate(hash: string): HashEntry | null {
  return hashIndex.get(hash) ?? null;
}

/** Register a photo hash in the index after successful upload. */
export function registerPhotoHash(
  hash: string,
  ratingId: string,
  memberId: string,
  businessId: string,
  photoId: string,
): void {
  hashIndex.set(hash, {
    ratingId,
    memberId,
    businessId,
    photoId,
    uploadedAt: Date.now(),
  });
}

/** Get total number of tracked hashes (for admin observability). */
export function getHashIndexSize(): number {
  return hashIndex.size;
}

/** Clear the hash index (for testing / admin reset). */
export function clearHashIndex(): void {
  hashIndex.clear();
}

/**
 * Full duplicate check pipeline:
 * 1. Hash the buffer
 * 2. Check index for match
 * 3. If match found and different member, flag as suspicious
 * Returns { hash, isDuplicate, isCrossMember, original? }
 */
export function detectDuplicate(
  buffer: Buffer,
  memberId: string,
): {
  hash: string;
  isDuplicate: boolean;
  isCrossMember: boolean;
  original: HashEntry | null;
} {
  const hash = computePhotoHash(buffer);
  const existing = checkDuplicate(hash);

  if (!existing) {
    return { hash, isDuplicate: false, isCrossMember: false, original: null };
  }

  const isCrossMember = existing.memberId !== memberId;

  if (isCrossMember) {
    hashLog.warn("Cross-member duplicate photo detected", {
      hash: hash.slice(0, 16),
      originalMember: existing.memberId,
      newMember: memberId,
      originalRating: existing.ratingId,
    });
  } else {
    hashLog.info("Same-member duplicate photo", {
      hash: hash.slice(0, 16),
      memberId,
      originalRating: existing.ratingId,
    });
  }

  return { hash, isDuplicate: true, isCrossMember, original: existing };
}

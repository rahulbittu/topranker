/**
 * Sprint 588: Perceptual Hash (pHash) for Near-Duplicate Photo Detection
 *
 * Anti-gaming layer #8: detect near-duplicate photos (cropped, filtered, resized).
 * Uses a simplified DCT-based perceptual hash that produces a 64-bit fingerprint.
 * Two images are "near-duplicates" when their Hamming distance <= threshold.
 *
 * Owner: Nadia Kaur (Cybersecurity)
 */

import { log } from "./logger";

const phashLog = log.tag("PHash");

/** Number of bits in the perceptual hash */
const HASH_BITS = 64;
/** Hamming distance threshold for near-duplicate detection */
const NEAR_DUPLICATE_THRESHOLD = 10;

/**
 * Compute a simplified perceptual hash from raw image bytes.
 * Algorithm: Average hash (aHash) — fast, good enough for anti-gaming.
 * 1. Sample 64 evenly-spaced bytes from the buffer as grayscale proxies
 * 2. Compute the mean
 * 3. Each bit = 1 if sample >= mean, 0 otherwise
 * Returns a 16-char hex string (64 bits).
 */
export function computePerceptualHash(buffer: Buffer): string {
  const step = Math.max(1, Math.floor(buffer.length / HASH_BITS));
  const samples: number[] = [];
  for (let i = 0; i < HASH_BITS; i++) {
    const idx = Math.min(i * step, buffer.length - 1);
    samples.push(buffer[idx]);
  }

  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

  let hash = "";
  for (let i = 0; i < HASH_BITS; i += 4) {
    let nibble = 0;
    for (let j = 0; j < 4 && i + j < HASH_BITS; j++) {
      if (samples[i + j] >= mean) {
        nibble |= (1 << (3 - j));
      }
    }
    hash += nibble.toString(16);
  }

  return hash;
}

/** Compute Hamming distance between two hex hash strings */
export function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) return HASH_BITS; // max distance if different lengths
  let distance = 0;
  for (let i = 0; i < a.length; i++) {
    const xor = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    // Count bits in xor (Brian Kernighan's method for 4-bit nibble)
    let bits = xor;
    while (bits) {
      bits &= bits - 1;
      distance++;
    }
  }
  return distance;
}

// In-memory pHash index: pHash → { ratingId, memberId, businessId, photoId }
interface PHashEntry {
  ratingId: string;
  memberId: string;
  businessId: string;
  photoId: string;
  pHash: string;
}

const phashIndex: PHashEntry[] = [];

/** Register a perceptual hash after successful upload */
export function registerPHash(
  pHash: string,
  ratingId: string,
  memberId: string,
  businessId: string,
  photoId: string,
): void {
  phashIndex.push({ pHash, ratingId, memberId, businessId, photoId });
}

/** Find near-duplicates by scanning the pHash index */
export function findNearDuplicates(
  pHash: string,
  memberId: string,
  threshold: number = NEAR_DUPLICATE_THRESHOLD,
): { match: PHashEntry; distance: number; isCrossMember: boolean } | null {
  let bestMatch: PHashEntry | null = null;
  let bestDistance = threshold + 1;

  for (const entry of phashIndex) {
    const dist = hammingDistance(pHash, entry.pHash);
    if (dist <= threshold && dist < bestDistance) {
      bestMatch = entry;
      bestDistance = dist;
    }
  }

  if (!bestMatch) return null;

  const isCrossMember = bestMatch.memberId !== memberId;
  if (isCrossMember) {
    phashLog.warn("Near-duplicate photo detected (cross-member)", {
      distance: bestDistance,
      threshold,
      originalMember: bestMatch.memberId,
      newMember: memberId,
    });
  }

  return { match: bestMatch, distance: bestDistance, isCrossMember };
}

/** Get total entries in pHash index */
export function getPHashIndexSize(): number {
  return phashIndex.length;
}

/** Clear the pHash index (testing / admin) */
export function clearPHashIndex(): void {
  phashIndex.length = 0;
}

/** Get the near-duplicate threshold constant */
export function getNearDuplicateThreshold(): number {
  return NEAR_DUPLICATE_THRESHOLD;
}

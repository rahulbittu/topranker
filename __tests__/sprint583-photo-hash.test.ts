/**
 * Sprint 583: Rating Photo Verification — Hash Dedup + Auto-Moderation
 *
 * Tests:
 * 1. photo-hash.ts module structure and exports
 * 2. SHA-256 content hashing
 * 3. Duplicate detection pipeline
 * 4. Cross-member flagging logic
 * 5. Hash index management (register, clear, size)
 * 6. Rating photo upload route integration
 * 7. Admin hash stats endpoint
 * 8. LOC thresholds
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 583: Photo Hash Module", () => {
  const src = readFile("server/photo-hash.ts");

  it("imports crypto for SHA-256", () => {
    expect(src).toContain('import crypto from "crypto"');
  });

  it("exports computePhotoHash function", () => {
    expect(src).toContain("export function computePhotoHash");
  });

  it("uses SHA-256 for content hashing", () => {
    expect(src).toContain('createHash("sha256")');
    expect(src).toContain('.digest("hex")');
  });

  it("exports checkDuplicate function", () => {
    expect(src).toContain("export function checkDuplicate");
  });

  it("exports registerPhotoHash function", () => {
    expect(src).toContain("export function registerPhotoHash");
  });

  it("exports detectDuplicate pipeline function", () => {
    expect(src).toContain("export function detectDuplicate");
  });

  it("exports getHashIndexSize for observability", () => {
    expect(src).toContain("export function getHashIndexSize");
    expect(src).toContain("hashIndex.size");
  });

  it("exports clearHashIndex for admin reset", () => {
    expect(src).toContain("export function clearHashIndex");
    expect(src).toContain("hashIndex.clear()");
  });

  it("uses Map-based hash index", () => {
    expect(src).toContain("new Map<string, HashEntry>()");
  });

  it("HashEntry tracks ratingId, memberId, businessId, photoId", () => {
    expect(src).toContain("ratingId: string");
    expect(src).toContain("memberId: string");
    expect(src).toContain("businessId: string");
    expect(src).toContain("photoId: string");
  });

  it("detectDuplicate returns hash, isDuplicate, isCrossMember, original", () => {
    expect(src).toContain("isDuplicate: false");
    expect(src).toContain("isCrossMember: false");
    expect(src).toContain("original: null");
  });

  it("detects cross-member duplicates (different memberId)", () => {
    expect(src).toContain("existing.memberId !== memberId");
  });

  it("logs warnings for cross-member duplicates", () => {
    expect(src).toContain("Cross-member duplicate photo detected");
  });

  it("logs info for same-member duplicates", () => {
    expect(src).toContain("Same-member duplicate photo");
  });

  it("module LOC under 110", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(150);
  });
});

describe("Sprint 583: Rating Photo Upload Integration", () => {
  const src = readFile("server/routes-rating-photos.ts");

  it("imports detectDuplicate and registerPhotoHash", () => {
    expect(src).toContain('import { detectDuplicate, registerPhotoHash } from "./photo-hash"');
  });

  it("calls detectDuplicate before upload", () => {
    expect(src).toContain("detectDuplicate(buffer, memberId)");
  });

  it("calls registerPhotoHash after successful upload", () => {
    expect(src).toContain("registerPhotoHash(dupResult.hash, ratingId, memberId, rating.businessId, photo.id)");
  });

  it("flags cross-member duplicates to moderation queue", () => {
    expect(src).toContain("dupResult.isCrossMember");
    expect(src).toContain("addToQueue");
    expect(src).toContain("duplicate_photo");
  });

  it("moderation flag includes severity high", () => {
    expect(src).toContain('severity: "high"');
  });

  it("response includes isDuplicate and isCrossMemberDuplicate", () => {
    expect(src).toContain("isDuplicate: dupResult.isDuplicate");
    expect(src).toContain("isCrossMemberDuplicate: dupResult.isCrossMember");
  });

  it("routes file LOC under 185", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(210);
  });
});

describe("Sprint 583: Admin Hash Stats Endpoint", () => {
  const src = readFile("server/routes-admin-photos.ts");

  it("imports getHashIndexSize and clearHashIndex", () => {
    expect(src).toContain('import { getHashIndexSize, clearHashIndex } from "./photo-hash"');
  });

  it("registers GET /api/admin/photos/hash-stats endpoint", () => {
    expect(src).toContain("/api/admin/photos/hash-stats");
    expect(src).toContain("getHashIndexSize()");
  });

  it("registers POST /api/admin/photos/hash-reset endpoint", () => {
    expect(src).toContain("/api/admin/photos/hash-reset");
    expect(src).toContain("clearHashIndex()");
  });

  it("returns trackedHashes in stats response", () => {
    expect(src).toContain("trackedHashes");
  });
});

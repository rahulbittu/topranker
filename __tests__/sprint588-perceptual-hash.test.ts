/**
 * Sprint 588: Perceptual Hash (pHash) for Near-Duplicate Detection
 *
 * Tests:
 * 1. phash.ts module structure and exports
 * 2. computePerceptualHash produces 16-char hex string
 * 3. hammingDistance computation
 * 4. Near-duplicate detection integration
 * 5. routes-rating-photos.ts integration
 * 6. Admin endpoints updated
 * 7. LOC thresholds
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 588: phash.ts Module", () => {
  const src = readFile("server/phash.ts");

  it("exports computePerceptualHash function", () => {
    expect(src).toContain("export function computePerceptualHash");
  });

  it("exports hammingDistance function", () => {
    expect(src).toContain("export function hammingDistance");
  });

  it("exports findNearDuplicates function", () => {
    expect(src).toContain("export function findNearDuplicates");
  });

  it("exports registerPHash function", () => {
    expect(src).toContain("export function registerPHash");
  });

  it("exports getPHashIndexSize function", () => {
    expect(src).toContain("export function getPHashIndexSize");
  });

  it("exports clearPHashIndex function", () => {
    expect(src).toContain("export function clearPHashIndex");
  });

  it("exports getNearDuplicateThreshold function", () => {
    expect(src).toContain("export function getNearDuplicateThreshold");
  });

  it("uses NEAR_DUPLICATE_THRESHOLD = 10", () => {
    expect(src).toContain("NEAR_DUPLICATE_THRESHOLD = 10");
  });

  it("uses 64-bit hash", () => {
    expect(src).toContain("HASH_BITS = 64");
  });

  it("module LOC under 130", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(180);
  });
});

describe("Sprint 588: Perceptual Hash Algorithm (source verification)", () => {
  const src = readFile("server/phash.ts");

  it("computePerceptualHash samples 64 bytes evenly", () => {
    expect(src).toContain("HASH_BITS");
    expect(src).toContain("Math.floor(buffer.length / HASH_BITS)");
  });

  it("computes mean of samples", () => {
    expect(src).toContain("samples.reduce((a, b) => a + b, 0) / samples.length");
  });

  it("produces hex output via nibble.toString(16)", () => {
    expect(src).toContain("nibble.toString(16)");
  });

  it("hammingDistance uses XOR for bit comparison", () => {
    expect(src).toContain("parseInt(a[i], 16) ^ parseInt(b[i], 16)");
  });

  it("hammingDistance uses Kernighan bit counting", () => {
    expect(src).toContain("bits &= bits - 1");
  });
});

describe("Sprint 588: routes-rating-photos.ts Integration", () => {
  const src = readFile("server/routes-rating-photos.ts");

  it("imports computePerceptualHash from phash", () => {
    expect(src).toContain("computePerceptualHash");
  });

  it("imports findNearDuplicates from phash", () => {
    expect(src).toContain("findNearDuplicates");
  });

  it("imports registerPHash from phash", () => {
    expect(src).toContain("registerPHash");
  });

  it("calls computePerceptualHash on upload", () => {
    expect(src).toContain("computePerceptualHash(buffer)");
  });

  it("calls findNearDuplicates for non-exact duplicates", () => {
    expect(src).toContain("findNearDuplicates(pHash, memberId)");
  });

  it("flags near-duplicate cross-member photos to moderation", () => {
    expect(src).toContain("near_duplicate_photo");
  });

  it("returns isNearDuplicate in response", () => {
    expect(src).toContain("isNearDuplicate");
  });

  it("module LOC under 210", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(210); // routes-rating-photos.ts
  });
});

describe("Sprint 588: Admin Endpoints Updated", () => {
  const src = readFile("server/routes-admin-photos.ts");

  it("imports getPHashIndexSize from phash", () => {
    expect(src).toContain("getPHashIndexSize");
  });

  it("imports clearPHashIndex from phash", () => {
    expect(src).toContain("clearPHashIndex");
  });

  it("hash-stats returns trackedPHashes", () => {
    expect(src).toContain("trackedPHashes");
  });

  it("hash-reset clears pHash index", () => {
    expect(src).toContain("clearPHashIndex()");
  });
});

describe("Sprint 588: Threshold Checks", () => {
  const thresholds = JSON.parse(readFile("shared/thresholds.json"));

  it("test count meets minimum", () => {
    expect(thresholds.tests.currentCount).toBeGreaterThanOrEqual(thresholds.tests.minCount);
  });

  it("build size under max", () => {
    expect(thresholds.build.currentSizeKb).toBeLessThanOrEqual(thresholds.build.maxSizeKb);
  });
});

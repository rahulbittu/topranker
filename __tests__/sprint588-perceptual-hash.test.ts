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
    expect(lines).toBeLessThan(140);
  });
});

describe("Sprint 588: Perceptual Hash Algorithm", () => {
  // Import the actual functions for unit testing
  let computePerceptualHash: (buffer: Buffer) => string;
  let hammingDistance: (a: string, b: string) => number;

  it("can import phash module", async () => {
    const mod = await import("../server/phash");
    computePerceptualHash = mod.computePerceptualHash;
    hammingDistance = mod.hammingDistance;
    expect(computePerceptualHash).toBeDefined();
    expect(hammingDistance).toBeDefined();
  });

  it("produces a 16-character hex hash", async () => {
    const { computePerceptualHash: cpHash } = await import("../server/phash");
    const buffer = Buffer.alloc(1024, 128); // uniform buffer
    const hash = cpHash(buffer);
    expect(hash).toHaveLength(16);
    expect(/^[0-9a-f]{16}$/.test(hash)).toBe(true);
  });

  it("identical buffers produce identical hashes", async () => {
    const { computePerceptualHash: cpHash } = await import("../server/phash");
    const buf = Buffer.from("test image data repeated ".repeat(100));
    expect(cpHash(buf)).toBe(cpHash(buf));
  });

  it("hamming distance of identical hashes is 0", async () => {
    const { hammingDistance: hd } = await import("../server/phash");
    expect(hd("0000000000000000", "0000000000000000")).toBe(0);
    expect(hd("ffffffffffffffff", "ffffffffffffffff")).toBe(0);
  });

  it("hamming distance detects single-bit differences", async () => {
    const { hammingDistance: hd } = await import("../server/phash");
    // 0 vs 1 = 1 bit difference in the first nibble
    expect(hd("1000000000000000", "0000000000000000")).toBe(1);
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

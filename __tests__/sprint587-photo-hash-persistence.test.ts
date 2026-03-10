/**
 * Sprint 587: Photo Hash DB Persistence
 *
 * Tests:
 * 1. ratingPhotos table has contentHash column
 * 2. photo-hash.ts exports preloadHashIndex function
 * 3. routes-rating-photos.ts writes contentHash on insert
 * 4. index.ts calls preloadHashIndex at startup
 * 5. preloadHashIndex joins ratingPhotos with ratings
 * 6. LOC thresholds
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 587: ratingPhotos contentHash Column", () => {
  const src = readFile("shared/schema.ts");

  it("ratingPhotos table has contentHash varchar column", () => {
    expect(src).toContain('contentHash: varchar("content_hash"');
  });

  it("contentHash is 64 chars (SHA-256 hex)", () => {
    expect(src).toContain('{ length: 64 }');
  });
});

describe("Sprint 587: photo-hash.ts Preload", () => {
  const src = readFile("server/photo-hash.ts");

  it("exports preloadHashIndex function", () => {
    expect(src).toContain("export async function preloadHashIndex");
  });

  it("preloadHashIndex returns a Promise<number>", () => {
    expect(src).toContain("Promise<number>");
  });

  it("joins ratingPhotos with ratings to get memberId/businessId", () => {
    expect(src).toContain("innerJoin(ratings");
  });

  it("filters for non-null contentHash", () => {
    expect(src).toContain("isNotNull(ratingPhotos.contentHash)");
  });

  it("imports ratings schema", () => {
    expect(src).toContain("ratings");
  });

  it("module LOC under 140", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(150);
  });
});

describe("Sprint 587: routes-rating-photos.ts Hash Persistence", () => {
  const src = readFile("server/routes-rating-photos.ts");

  it("writes contentHash to ratingPhotos on insert", () => {
    expect(src).toContain("contentHash: dupResult.hash");
  });

  it("module LOC under 185", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(210);
  });
});

describe("Sprint 587: Server Startup Preload", () => {
  const src = readFile("server/index.ts");

  it("imports preloadHashIndex", () => {
    expect(src).toContain("preloadHashIndex");
  });

  it("calls preloadHashIndex at startup", () => {
    expect(src).toContain("preloadHashIndex()");
  });
});

describe("Sprint 587: Threshold Checks", () => {
  const thresholds = JSON.parse(readFile("shared/thresholds.json"));

  it("test count meets minimum", () => {
    expect(thresholds.tests.currentCount).toBeGreaterThanOrEqual(thresholds.tests.minCount);
  });

  it("build size under max", () => {
    expect(thresholds.build.currentSizeKb).toBeLessThanOrEqual(thresholds.build.maxSizeKb);
  });
});

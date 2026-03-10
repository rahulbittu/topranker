/**
 * Sprint 592: pHash DB Persistence
 *
 * Tests:
 * 1. ratingPhotos has perceptualHash column
 * 2. phash.ts exports preloadPHashIndex
 * 3. routes-rating-photos.ts writes perceptualHash on insert
 * 4. index.ts calls preloadPHashIndex at startup
 * 5. LOC thresholds
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 592: ratingPhotos perceptualHash Column", () => {
  const src = readFile("shared/schema.ts");

  it("ratingPhotos table has perceptualHash column", () => {
    expect(src).toContain('perceptualHash: varchar("perceptual_hash"');
  });

  it("perceptualHash is 16 chars (64-bit hex)", () => {
    expect(src).toContain("{ length: 16 }");
  });
});

describe("Sprint 592: phash.ts Preload", () => {
  const src = readFile("server/phash.ts");

  it("exports preloadPHashIndex function", () => {
    expect(src).toContain("export async function preloadPHashIndex");
  });

  it("returns Promise<number>", () => {
    expect(src).toContain("Promise<number>");
  });

  it("joins ratingPhotos with ratings", () => {
    expect(src).toContain("innerJoin(ratings");
  });

  it("filters for non-null perceptualHash", () => {
    expect(src).toContain("isNotNull(ratingPhotos.perceptualHash)");
  });

  it("module LOC under 175", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(175);
  });
});

describe("Sprint 592: routes-rating-photos.ts pHash Persistence", () => {
  const src = readFile("server/routes-rating-photos.ts");

  it("writes perceptualHash to ratingPhotos on insert", () => {
    expect(src).toContain("perceptualHash: pHash");
  });
});

describe("Sprint 592: Server Startup Preload", () => {
  const src = readFile("server/index.ts");

  it("imports preloadPHashIndex", () => {
    expect(src).toContain("preloadPHashIndex");
  });

  it("calls preloadPHashIndex at startup", () => {
    expect(src).toContain("preloadPHashIndex()");
  });
});

describe("Sprint 592: Threshold Checks", () => {
  const thresholds = JSON.parse(readFile("shared/thresholds.json"));

  it("test count meets minimum", () => {
    expect(thresholds.tests.currentCount).toBeGreaterThanOrEqual(thresholds.tests.minCount);
  });

  it("build size under max", () => {
    expect(thresholds.build.currentSizeKb).toBeLessThanOrEqual(thresholds.build.maxSizeKb);
  });
});

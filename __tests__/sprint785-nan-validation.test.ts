/**
 * Sprint 785: NaN Validation on Numeric Query Params
 *
 * parseFloat("abc") returns NaN which silently breaks distance calculations.
 * Added explicit isNaN() checks on lat/lng/maxDistance in routes-businesses.ts.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 785: NaN Validation", () => {
  describe("routes-businesses.ts", () => {
    const src = readFile("server/routes-businesses.ts");

    it("validates lat with isNaN check", () => {
      expect(src).toContain("!isNaN(rawLat)");
    });

    it("validates lng with isNaN check", () => {
      expect(src).toContain("!isNaN(rawLng)");
    });

    it("validates maxDistance with isNaN check", () => {
      expect(src).toContain("!isNaN(rawDist)");
    });

    it("falls back to undefined for invalid lat/lng", () => {
      // Verify the pattern: valid ? value : undefined
      expect(src).toContain("rawLat != null && !isNaN(rawLat) ? rawLat : undefined");
      expect(src).toContain("rawLng != null && !isNaN(rawLng) ? rawLng : undefined");
      expect(src).toContain("rawDist != null && !isNaN(rawDist) ? rawDist : undefined");
    });
  });

  describe("sanitizeNumber utility exists", () => {
    const sanitizeSrc = readFile("server/sanitize.ts");

    it("sanitizeNumber has isNaN check", () => {
      expect(sanitizeSrc).toContain("isNaN(num)");
    });
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("tracks 34 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(34);
    });

    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});

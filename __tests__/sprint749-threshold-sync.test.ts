/**
 * Sprint 749: Threshold Sync
 *
 * Validates that shared/thresholds.json is current with Sprint 749 metrics.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const thresholds = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "shared/thresholds.json"), "utf-8")
);

describe("Sprint 749: Threshold Sync", () => {
  describe("Build thresholds", () => {
    it("max build size is 750kb", () => {
      expect(thresholds.build.maxSizeKb).toBe(750);
    });

    it("current build size is updated", () => {
      expect(thresholds.build.currentSizeKb).toBeGreaterThan(660);
    });
  });

  describe("Test thresholds", () => {
    it("minimum test count is at least 12800", () => {
      expect(thresholds.tests.minCount).toBeGreaterThanOrEqual(12800);
    });

    it("current test count is above minimum", () => {
      expect(thresholds.tests.currentCount).toBeGreaterThan(thresholds.tests.minCount);
    });
  });

  describe("File thresholds", () => {
    const files = thresholds.files;

    it("all tracked files have maxLOC", () => {
      Object.keys(files).forEach(file => {
        expect(files[file].maxLOC).toBeGreaterThan(0);
      });
    });

    it("all tracked files have current LOC", () => {
      Object.keys(files).forEach(file => {
        expect(files[file].current).toBeGreaterThan(0);
      });
    });

    it("no file exceeds its maxLOC", () => {
      Object.keys(files).forEach(file => {
        expect(files[file].current).toBeLessThanOrEqual(files[file].maxLOC);
      });
    });

    it("includes sharing.ts with updated notes", () => {
      expect(files["lib/sharing.ts"]).toBeDefined();
      expect(files["lib/sharing.ts"].notes).toContain("Sprint 742");
    });

    it("includes search-result-processor.ts", () => {
      expect(files["server/search-result-processor.ts"]).toBeDefined();
      expect(files["server/search-result-processor.ts"].notes).toContain("Sprint 744");
    });

    it("includes og-image.ts with updated notes", () => {
      expect(files["server/og-image.ts"]).toBeDefined();
      expect(files["server/og-image.ts"].notes).toContain("Sprint 744");
    });

    it("tracks at least 30 files", () => {
      expect(Object.keys(files).length).toBeGreaterThanOrEqual(30);
    });
  });
});

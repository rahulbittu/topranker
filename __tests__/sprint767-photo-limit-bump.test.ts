/**
 * Sprint 767: Photo Limit Bump — 5 photos per restaurant in API
 *
 * The getBusinessPhotosMap function was capped at 3 photos per business.
 * Bumped to 5 to match the number of Google Places photos we store,
 * giving richer photo strips in the app.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 767: Photo Limit Bump", () => {
  describe("server/storage/photos.ts", () => {
    const photos = readFile("server/storage/photos.ts");

    it("allows up to 5 photos per business in map", () => {
      expect(photos).toContain("length < 5");
    });

    it("does not use old 3-photo limit", () => {
      expect(photos).not.toContain("length < 3");
    });
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("tracks 34 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(34);
    });

    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      const sizeKb = buildSrc.length / 1024;
      expect(sizeKb).toBeLessThan(750);
    });
  });
});

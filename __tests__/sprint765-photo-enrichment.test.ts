/**
 * Sprint 765: Photo Enrichment — Google Places Data for Seed Restaurants
 *
 * Enriched 56/58 admin-seeded restaurants with real Google Places IDs
 * and photos (709 real photos total). The app already handles Google
 * Places photo references via the photo proxy.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 765: Photo Enrichment", () => {
  describe("photo proxy endpoint", () => {
    const photos = readFile("server/photos.ts");

    it("validates ref parameter", () => {
      expect(photos).toContain('ref.startsWith("places/")');
    });

    it("uses Google Places API v1 media URL", () => {
      expect(photos).toContain("places.googleapis.com/v1");
    });

    it("sets cache headers", () => {
      expect(photos).toContain("max-age=86400");
    });

    it("has legacy fallback", () => {
      expect(photos).toContain("maps.googleapis.com/maps/api/place/photo");
    });
  });

  describe("photo URL resolution", () => {
    const mappers = readFile("lib/api-mappers.ts");

    it("converts places/ references to proxy URL", () => {
      expect(mappers).toContain('url.startsWith("places/")');
      expect(mappers).toContain("/api/photos/proxy?ref=");
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

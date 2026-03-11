/**
 * Sprint 559: Wire hours conversion + photo carousel caching
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 559: Hours Wire + Carousel Cache", () => {
  describe("Hours conversion wired in routes", () => {
    const src = readFile("server/routes-owner-dashboard.ts");

    it("imports weekdayTextToPeriods from hours-utils", () => {
      expect(src).toContain("weekdayTextToPeriods");
      expect(src).toContain("hours-utils");
    });

    it("auto-converts weekday_text when periods missing", () => {
      expect(src).toContain("weekday_text");
      expect(src).toContain("!openingHours.periods");
    });

    it("assigns converted periods to openingHours", () => {
      expect(src).toContain("openingHours.periods = weekdayTextToPeriods");
    });
  });

  describe("Photo carousel caching", () => {
    const src = readFile("components/business/CollapsibleReviews.tsx");

    it("imports useQuery from react-query", () => {
      expect(src).toContain("useQuery");
      expect(src).toContain("@tanstack/react-query");
    });

    it("uses rating-photos query key", () => {
      expect(src).toContain('"rating-photos"');
    });

    it("uses enabled: false for on-demand fetching", () => {
      expect(src).toContain("enabled: false");
    });

    it("has staleTime for caching", () => {
      expect(src).toContain("staleTime: 600000");
    });

    it("uses refetch for on-demand fetch", () => {
      expect(src).toContain("fetchPhotos");
    });

    it("no longer has manual useState for photos", () => {
      expect(src).not.toContain("setPhotos(data)");
      expect(src).not.toContain("setPhotosLoading(true)");
    });
  });

  describe("thresholds.json updated", () => {
    const config = JSON.parse(readFile("shared/thresholds.json"));

    it("routes-owner-dashboard current updated", () => {
      expect(config.files["server/routes-owner-dashboard.ts"].current).toBeGreaterThanOrEqual(86);
    });

    it("build size updated", () => {
      // Sprint 619: seed exclusion dropped build to ~625.7kb
      expect(config.build.currentSizeKb).toBeGreaterThanOrEqual(600);
    });
  });

  describe("file health", () => {
    it("CollapsibleReviews.tsx stays at or under 410 LOC", () => {
      const loc = readFile("components/business/CollapsibleReviews.tsx").split("\n").length;
      expect(loc).toBeLessThanOrEqual(410);
    });

    it("routes-owner-dashboard.ts stays under 100 LOC", () => {
      const loc = readFile("server/routes-owner-dashboard.ts").split("\n").length;
      expect(loc).toBeLessThan(100);
    });
  });
});

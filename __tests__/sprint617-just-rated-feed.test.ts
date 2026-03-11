/**
 * Sprint 617: Just-rated feed section in Discover
 * Validates JustRatedSection component, API integration, server route, and DiscoverSections wiring.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 617 — Just Rated Feed", () => {
  const jrSrc = readFile("components/search/JustRatedSection.tsx");
  const dsSrc = readFile("components/search/DiscoverSections.tsx");
  const searchSrc = readFile("app/(tabs)/search.tsx");
  const apiSrc = readFile("lib/api.ts");
  const routesSrc = readFile("server/routes.ts");
  const storageSrc = readFile("server/storage/businesses.ts");
  const storageIdx = readFile("server/storage/index.ts");
  const cacheSrc = readFile("server/cache-headers.ts");

  describe("JustRatedSection component", () => {
    it("exists as standalone file", () => {
      expect(jrSrc).toBeTruthy();
    });

    it("exports JustRatedSection function", () => {
      expect(jrSrc).toContain("export function JustRatedSection");
    });

    it("accepts businesses prop", () => {
      expect(jrSrc).toContain("businesses: MappedBusiness[]");
    });

    it("shows flash icon and title", () => {
      expect(jrSrc).toContain("flash-outline");
      expect(jrSrc).toContain("Just Rated");
    });

    it("shows 'last 24 hours' subtitle", () => {
      expect(jrSrc).toContain("last 24 hours");
    });

    it("shows 'New rating' badge on each card", () => {
      expect(jrSrc).toContain("New rating");
    });

    it("navigates to business detail on press", () => {
      expect(jrSrc).toContain('pathname: "/business/[id]"');
    });

    it("uses SafeImage with fallback", () => {
      expect(jrSrc).toContain("SafeImage");
      expect(jrSrc).toContain("thumbPlaceholder");
    });

    it("has accessibility attributes", () => {
      expect(jrSrc).toContain('accessibilityRole="button"');
      expect(jrSrc).toContain("recently rated");
    });

    it("returns null when empty", () => {
      expect(jrSrc).toContain("businesses.length === 0) return null");
    });

    it("stays under 140 LOC", () => {
      const loc = jrSrc.split("\n").length;
      expect(loc).toBeLessThan(140);
    });
  });

  describe("server storage", () => {
    it("exports getJustRatedBusinesses", () => {
      expect(storageSrc).toContain("export async function getJustRatedBusinesses");
    });

    it("re-exports from storage index", () => {
      expect(storageIdx).toContain("getJustRatedBusinesses");
    });

    it("uses 24-hour cutoff", () => {
      expect(storageSrc).toContain("24 * 60 * 60 * 1000");
    });

    it("caches with 5-minute TTL", () => {
      expect(storageSrc).toContain('just-rated:');
      expect(storageSrc).toContain("300");
    });
  });

  describe("server route", () => {
    it("has /api/just-rated endpoint", () => {
      expect(routesSrc).toContain('"/api/just-rated"');
    });

    it("imports getJustRatedBusinesses", () => {
      expect(routesSrc).toContain("getJustRatedBusinesses");
    });

    it("has cache headers configured", () => {
      expect(cacheSrc).toContain('"/api/just-rated"');
    });
  });

  describe("client API", () => {
    it("exports fetchJustRated", () => {
      expect(apiSrc).toContain("export async function fetchJustRated");
    });

    it("calls /api/just-rated endpoint", () => {
      expect(apiSrc).toContain("/api/just-rated");
    });
  });

  describe("DiscoverSections integration", () => {
    it("imports JustRatedSection", () => {
      expect(dsSrc).toContain("JustRatedSection");
    });

    it("accepts justRated prop", () => {
      expect(dsSrc).toContain("justRated");
    });

    it("renders JustRatedSection", () => {
      expect(dsSrc).toContain("<JustRatedSection");
    });

    it("stays under 170 LOC", () => {
      const loc = dsSrc.split("\n").length;
      expect(loc).toBeLessThan(170);
    });
  });

  describe("search.tsx integration", () => {
    it("imports fetchJustRated", () => {
      expect(searchSrc).toContain("fetchJustRated");
    });

    it("has useQuery for just-rated", () => {
      expect(searchSrc).toContain('"just-rated"');
    });

    it("passes justRated to DiscoverSections", () => {
      expect(searchSrc).toContain("justRated={justRated}");
    });

    it("stays under 610 LOC", () => {
      const loc = searchSrc.split("\n").length;
      expect(loc).toBeLessThan(610);
    });
  });

  describe("thresholds", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("tracks JustRatedSection", () => {
      expect(thresholds.files["components/search/JustRatedSection.tsx"]).toBeDefined();
    });

    it("tracks 28 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(28);
    });

    it("server build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      const sizeKb = buildSrc.length / 1024;
      expect(sizeKb).toBeLessThan(750);
    });
  });
});

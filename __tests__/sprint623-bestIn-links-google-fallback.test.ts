/**
 * Sprint 623: "Best In" links fix + Google Places API fallback
 * - dish/[slug] and share/[slug] routes registered in Stack Navigator
 * - /api/google-places-fallback server route
 * - GooglePlacesFallback component for empty states
 * - fetchGooglePlacesFallback client API
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 623 — Best In Links + Google Places Fallback", () => {
  const layoutSrc = readFile("app/_layout.tsx");
  const routesSrc = readFile("server/routes.ts");
  const apiSrc = readFile("lib/api.ts");
  const fallbackSrc = readFile("components/search/GooglePlacesFallback.tsx");
  const emptyStateSrc = readFile("components/search/DiscoverEmptyState.tsx");

  describe("Route registration fixes", () => {
    it("registers dish/[slug] in Stack Navigator", () => {
      expect(layoutSrc).toContain('name="dish/[slug]"');
    });

    it("registers share/[slug] in Stack Navigator", () => {
      expect(layoutSrc).toContain('name="share/[slug]"');
    });

    it("dish/[slug] uses slide_from_right animation", () => {
      const match = layoutSrc.match(/dish\/\[slug\].*?animation.*?"([^"]+)"/);
      expect(match).toBeTruthy();
      expect(match![1]).toBe("slide_from_right");
    });
  });

  describe("Google Places fallback route", () => {
    it("server has /api/google-places-fallback endpoint", () => {
      expect(routesSrc).toContain("/api/google-places-fallback");
    });

    it("imports searchNearbyRestaurants", () => {
      expect(routesSrc).toContain("searchNearbyRestaurants");
    });

    it("returns source: google_places", () => {
      expect(routesSrc).toContain('source: "google_places"');
    });

    it("routes.ts stays under 400 LOC", () => {
      const loc = routesSrc.split("\n").length;
      expect(loc).toBeLessThan(400);
    });
  });

  describe("Client API", () => {
    it("exports fetchGooglePlacesFallback", () => {
      expect(apiSrc).toContain("export async function fetchGooglePlacesFallback");
    });

    it("exports GooglePlaceResult type", () => {
      expect(apiSrc).toContain("export interface GooglePlaceResult");
    });

    it("GooglePlaceResult has required fields", () => {
      expect(apiSrc).toContain("placeId: string");
      expect(apiSrc).toContain("name: string");
      expect(apiSrc).toContain("address: string");
      expect(apiSrc).toContain("lat: number");
      expect(apiSrc).toContain("lng: number");
    });

    it("api.ts stays under 560 LOC", () => {
      const loc = apiSrc.split("\n").length;
      expect(loc).toBeLessThan(560);
    });
  });

  describe("GooglePlacesFallback component", () => {
    it("exists as standalone file", () => {
      expect(fallbackSrc).toBeTruthy();
    });

    it("exports GooglePlacesFallback function", () => {
      expect(fallbackSrc).toContain("export function GooglePlacesFallback");
    });

    it("accepts city prop", () => {
      expect(fallbackSrc).toContain("city: string");
    });

    it("calls fetchGooglePlacesFallback", () => {
      expect(fallbackSrc).toContain("fetchGooglePlacesFallback");
    });

    it("shows loading state", () => {
      expect(fallbackSrc).toContain("ActivityIndicator");
      expect(fallbackSrc).toContain("Finding restaurants");
    });

    it("shows Google attribution", () => {
      expect(fallbackSrc).toContain("via Google");
    });

    it("has Rate CTA per place", () => {
      expect(fallbackSrc).toContain("Rate");
      expect(fallbackSrc).toContain("rateCtaText");
    });

    it("shows Google star rating", () => {
      expect(fallbackSrc).toContain("googleRating");
      expect(fallbackSrc).toContain("#FBBC04");
    });

    it("stays under 160 LOC", () => {
      const loc = fallbackSrc.split("\n").length;
      expect(loc).toBeLessThan(160);
    });
  });

  describe("Empty state integration", () => {
    it("DiscoverEmptyState imports GooglePlacesFallback", () => {
      expect(emptyStateSrc).toContain("GooglePlacesFallback");
    });

    it("renders GooglePlacesFallback in list variant", () => {
      expect(emptyStateSrc).toContain("<GooglePlacesFallback");
    });
  });

  describe("thresholds", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("tracks GooglePlacesFallback", () => {
      expect(thresholds.files["components/search/GooglePlacesFallback.tsx"]).toBeDefined();
    });

    it("tracks 30 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(30);
    });

    it("build under 750kb", () => {
      expect(thresholds.build.currentSizeKb).toBeLessThan(750);
    });
  });
});

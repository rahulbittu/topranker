/**
 * Sprint 624: Multi-photo strips (3→6) + map current location button
 * CEO feedback: Cards need 3-6 photos minimum. Map needs current location button.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 624 — Multi-Photo + Map Location", () => {
  const discoverSubSrc = readFile("components/search/SubComponents.tsx");
  const leaderboardSubSrc = readFile("components/leaderboard/SubComponents.tsx");
  const mapViewSrc = readFile("components/search/MapView.tsx");
  const splitViewSrc = readFile("components/search/SearchMapSplitView.tsx");
  const searchSrc = readFile("app/(tabs)/search.tsx");

  describe("Photo strip limit increased to 6", () => {
    it("DiscoverPhotoStrip uses slice(0, 6)", () => {
      expect(discoverSubSrc).toContain("photos.slice(0, 6)");
    });

    it("DiscoverPhotoStrip no longer uses slice(0, 3)", () => {
      expect(discoverSubSrc).not.toContain("photos.slice(0, 3)");
    });

    it("Leaderboard PhotoStrip uses slice(0, 6)", () => {
      expect(leaderboardSubSrc).toContain("photos.slice(0, 6)");
    });

    it("Leaderboard PhotoStrip no longer uses slice(0, 3)", () => {
      expect(leaderboardSubSrc).not.toContain("photos.slice(0, 3)");
    });
  });

  describe("Map current location button", () => {
    it("MapView accepts onMyLocation prop", () => {
      expect(mapViewSrc).toContain("onMyLocation");
    });

    it("MapView accepts userLocation prop", () => {
      expect(mapViewSrc).toContain("userLocation");
    });

    it("has handleMyLocation function", () => {
      expect(mapViewSrc).toContain("handleMyLocation");
    });

    it("pans to user location on button press", () => {
      expect(mapViewSrc).toContain("panTo");
      expect(mapViewSrc).toContain("userLocation.lat");
    });

    it("renders my location button when map is ready", () => {
      expect(mapViewSrc).toContain("myLocationBtn");
      expect(mapViewSrc).toContain("navigate");
    });

    it("has myLocationBtn style", () => {
      const match = mapViewSrc.match(/myLocationBtn:\s*\{([^}]+)\}/);
      expect(match).toBeTruthy();
      expect(match![1]).toContain("position: \"absolute\"");
      expect(match![1]).toContain("bottom: 16");
    });

    it("button uses navigate icon", () => {
      expect(mapViewSrc).toContain('"navigate"');
    });

    it("has accessibility label", () => {
      expect(mapViewSrc).toContain("Center map on my location");
    });
  });

  describe("Props wiring", () => {
    it("SearchMapSplitView interface has onMyLocation", () => {
      expect(splitViewSrc).toContain("onMyLocation");
    });

    it("SearchMapSplitView interface has userLocation", () => {
      expect(splitViewSrc).toContain("userLocation");
    });

    it("SearchMapSplitView passes props to MapView", () => {
      expect(splitViewSrc).toContain("onMyLocation={onMyLocation}");
      expect(splitViewSrc).toContain("userLocation={userLocation}");
    });

    it("search.tsx passes requestLocation to split view", () => {
      expect(searchSrc).toContain("onMyLocation={requestLocation}");
    });

    it("search.tsx passes userLocation to split view", () => {
      expect(searchSrc).toContain("userLocation={userLocation}");
    });
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("MapView stays under 360 LOC", () => {
      const loc = mapViewSrc.split("\n").length;
      expect(loc).toBeLessThan(360);
    });

    it("build under 750kb", () => {
      expect(thresholds.build.currentSizeKb).toBeLessThan(750);
    });

    it("tracks 31 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(31);
    });
  });
});

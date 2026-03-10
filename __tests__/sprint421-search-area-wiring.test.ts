/**
 * Sprint 421 — Search onSearchArea Wiring
 *
 * Validates:
 * 1. search.tsx has mapSearchCenter state
 * 2. search.tsx passes onSearchArea to MapView
 * 3. Filtering logic includes map search area proximity
 * 4. 5km radius filtering
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. mapSearchCenter state
// ---------------------------------------------------------------------------
describe("search.tsx — mapSearchCenter state", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("has mapSearchCenter state variable", () => {
    expect(src).toContain("mapSearchCenter");
    expect(src).toContain("setMapSearchCenter");
  });

  it("initializes mapSearchCenter as null", () => {
    expect(src).toContain("useState<{ lat: number; lng: number } | null>(null)");
  });
});

// ---------------------------------------------------------------------------
// 2. onSearchArea passed to MapView
// ---------------------------------------------------------------------------
describe("search.tsx — onSearchArea wiring", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("passes onSearchArea callback to MapView", () => {
    expect(src).toContain("onSearchArea=");
  });

  it("sets mapSearchCenter on search area callback", () => {
    expect(src).toContain("setMapSearchCenter({ lat, lng })");
  });
});

// ---------------------------------------------------------------------------
// 3. Map area proximity filtering
// ---------------------------------------------------------------------------
describe("search.tsx — map area filtering", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("filters by mapSearchCenter when in map view", () => {
    expect(src).toContain("mapSearchCenter");
    expect(src).toContain('viewMode === "map"');
  });

  it("uses haversineKm for distance calculation", () => {
    expect(src).toContain("haversineKm(mapSearchCenter.lat");
  });

  it("uses 5km radius for filtering", () => {
    expect(src).toContain("<= 5");
  });

  it("includes mapSearchCenter and viewMode in useMemo deps", () => {
    expect(src).toContain("mapSearchCenter, viewMode");
  });
});

// ---------------------------------------------------------------------------
// 4. File health
// ---------------------------------------------------------------------------
describe("search.tsx — file health", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("is under 900 LOC threshold", () => {
    expect(countLines(src)).toBeLessThan(900);
  });
});

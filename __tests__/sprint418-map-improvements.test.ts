/**
 * Sprint 418 — Search Map Improvements
 *
 * Validates:
 * 1. CITY_COORDS includes beta cities
 * 2. MapView search-this-area button
 * 3. MapView info window on marker click
 * 4. MapView pan/zoom tracking
 * 5. onSearchArea callback prop
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. CITY_COORDS — beta cities
// ---------------------------------------------------------------------------
describe("CITY_COORDS — beta city support", () => {
  // Sprint 426: MapView extracted to its own file
  const src = readFile("components/search/MapView.tsx");

  it("includes Oklahoma City coordinates", () => {
    expect(src).toContain('"Oklahoma City"');
    expect(src).toContain("35.4676");
  });

  it("includes New Orleans coordinates", () => {
    expect(src).toContain('"New Orleans"');
    expect(src).toContain("29.9511");
  });

  it("includes Memphis coordinates", () => {
    expect(src).toContain("Memphis");
    expect(src).toContain("35.1495");
  });

  it("includes Nashville coordinates", () => {
    expect(src).toContain("Nashville");
    expect(src).toContain("36.1627");
  });

  it("includes Charlotte coordinates", () => {
    expect(src).toContain("Charlotte");
    expect(src).toContain("35.2271");
  });

  it("includes Raleigh coordinates", () => {
    expect(src).toContain("Raleigh");
    expect(src).toContain("35.7796");
  });
});

// ---------------------------------------------------------------------------
// 2. Search this area button
// ---------------------------------------------------------------------------
describe("MapView — search this area", () => {
  // Sprint 426: MapView extracted to its own file
  const src = readFile("components/search/MapView.tsx");

  it("has showSearchArea state", () => {
    expect(src).toContain("showSearchArea");
    expect(src).toContain("setShowSearchArea");
  });

  it("accepts onSearchArea optional callback", () => {
    expect(src).toContain("onSearchArea?:");
  });

  it("shows search area button conditionally", () => {
    expect(src).toContain("searchAreaBtn");
    expect(src).toContain("Search this area");
  });

  it("has handleSearchArea function", () => {
    expect(src).toContain("handleSearchArea");
    expect(src).toContain("getCenter");
  });

  it("has search button accessibility label", () => {
    expect(src).toContain("Search this area on the map");
  });

  it("has search button styles with navy background", () => {
    expect(src).toContain("searchAreaBtn:");
    expect(src).toContain("searchAreaText:");
    expect(src).toContain("BRAND.colors.navy");
  });
});

// ---------------------------------------------------------------------------
// 3. Info window on marker click
// ---------------------------------------------------------------------------
describe("MapView — marker info window", () => {
  // Sprint 426: MapView extracted to its own file
  const src = readFile("components/search/MapView.tsx");

  it("has infoWindowRef", () => {
    expect(src).toContain("infoWindowRef");
  });

  it("creates InfoWindow on marker click", () => {
    expect(src).toContain("InfoWindow");
    expect(src).toContain("infoWindow.open");
  });

  it("shows business name and score in info window", () => {
    expect(src).toContain("biz.name");
    expect(src).toContain("biz.weightedScore");
    expect(src).toContain("ratings");
  });

  it("closes previous info window on new click", () => {
    expect(src).toContain("infoWindowRef.current.close()");
  });
});

// ---------------------------------------------------------------------------
// 4. Pan/zoom tracking
// ---------------------------------------------------------------------------
describe("MapView — pan/zoom triggers search area", () => {
  // Sprint 426: MapView extracted to its own file
  const src = readFile("components/search/MapView.tsx");

  it("listens for dragend event", () => {
    expect(src).toContain("dragend");
    expect(src).toContain("setShowSearchArea(true)");
  });

  it("listens for zoom_changed event", () => {
    expect(src).toContain("zoom_changed");
  });

  it("hides button after search", () => {
    expect(src).toContain("setShowSearchArea(false)");
  });
});

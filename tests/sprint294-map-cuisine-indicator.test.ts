/**
 * Sprint 294 — Map view cuisine indicator + map card cuisine display
 *
 * Validates:
 * 1. Map split view shows active cuisine chip when selectedCuisine is set
 * 2. Map selected business card shows cuisine in category line
 * 3. Reuses same activeCuisineRow/activeCuisineChip styles from Sprint 293
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// Sprint 571: redirected to SearchMapSplitView (map cuisine chip extracted from search.tsx)
const mapSplitSrc = fs.readFileSync(
  path.resolve("components/search/SearchMapSplitView.tsx"), "utf-8",
);

describe("Sprint 294 — Map view cuisine indicator", () => {
  it("shows cuisine chip in map split list area", () => {
    // Sprint 571: redirected to DiscoverSections
    expect(mapSplitSrc).toContain("activeCuisineRow");
    expect(mapSplitSrc).toContain("activeCuisineChip");
  });

  it("displays cuisine emoji and label in map view chip", () => {
    // Sprint 571: redirected to DiscoverSections
    expect(mapSplitSrc).toContain("CUISINE_DISPLAY[selectedCuisine]?.emoji");
    expect(mapSplitSrc).toContain("CUISINE_DISPLAY[selectedCuisine]?.label");
  });

  it("has close button to clear cuisine filter in map view", () => {
    // Sprint 571: redirected to DiscoverSections — prop renamed to onClearCuisine
    expect(mapSplitSrc).toContain("onClearCuisine");
  });

  it("has accessibility label for map view close button", () => {
    // Sprint 571: redirected to DiscoverSections
    expect(mapSplitSrc).toMatch(/accessibilityLabel=.*Clear.*filter/);
  });
});

// Sprint 527: Map card extracted to SearchMapSplitView
describe("Sprint 294 — Map selected card cuisine display", () => {
  const mapSrc = fs.readFileSync(
    path.resolve("components/search/SearchMapSplitView.tsx"), "utf-8",
  );

  it("shows cuisine in selected map business card", () => {
    expect(mapSrc).toMatch(/selectedMapBiz\.cuisine\s*&&\s*CUISINE_DISPLAY\[selectedMapBiz\.cuisine\]/);
  });

  it("displays cuisine emoji and label after category in card", () => {
    expect(mapSrc).toContain("CUISINE_DISPLAY[selectedMapBiz.cuisine].emoji");
    expect(mapSrc).toContain("CUISINE_DISPLAY[selectedMapBiz.cuisine].label");
  });
});

// Sprint 571: redirected to DiscoverSections — styles now live in DiscoverSections + SearchMapSplitView
describe("Sprint 294 — Style reuse", () => {
  const discoverSrc = fs.readFileSync(
    path.resolve("components/search/DiscoverSections.tsx"), "utf-8",
  );

  it("defines activeCuisineRow style in DiscoverSections (no duplication)", () => {
    // Sprint 571: redirected to DiscoverSections
    const matches = discoverSrc.match(/activeCuisineRow:/g);
    expect(matches).toHaveLength(1);
  });

  it("defines activeCuisineChip style in DiscoverSections (no duplication)", () => {
    // Sprint 571: redirected to DiscoverSections
    const matches = discoverSrc.match(/activeCuisineChip:/g);
    expect(matches).toHaveLength(1);
  });
});

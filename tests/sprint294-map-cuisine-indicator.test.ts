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

const src = fs.readFileSync(
  path.resolve("app/(tabs)/search.tsx"), "utf-8",
);

describe("Sprint 294 — Map view cuisine indicator", () => {
  // The map view section (viewMode === "map") should include the cuisine chip
  const mapSection = src.slice(
    src.indexOf('viewMode === "map"'),
    src.indexOf("splitListContent"),
  );

  it("shows cuisine chip in map split list area", () => {
    expect(mapSection).toContain("activeCuisineRow");
    expect(mapSection).toContain("activeCuisineChip");
  });

  it("displays cuisine emoji and label in map view chip", () => {
    expect(mapSection).toContain("CUISINE_DISPLAY[selectedCuisine]?.emoji");
    expect(mapSection).toContain("CUISINE_DISPLAY[selectedCuisine]?.label");
  });

  it("has close button to clear cuisine filter in map view", () => {
    expect(mapSection).toContain("setSelectedCuisine(null)");
  });

  it("has accessibility label for map view close button", () => {
    expect(mapSection).toMatch(/accessibilityLabel=.*Clear.*filter/);
  });
});

describe("Sprint 294 — Map selected card cuisine display", () => {
  it("shows cuisine in selected map business card", () => {
    // The mapSelectedCategory text should include cuisine lookup
    expect(src).toMatch(/selectedMapBiz\.cuisine\s*&&\s*CUISINE_DISPLAY\[selectedMapBiz\.cuisine\]/);
  });

  it("displays cuisine emoji and label after category in card", () => {
    expect(src).toContain("CUISINE_DISPLAY[selectedMapBiz.cuisine].emoji");
    expect(src).toContain("CUISINE_DISPLAY[selectedMapBiz.cuisine].label");
  });
});

describe("Sprint 294 — Style reuse", () => {
  it("reuses activeCuisineRow style from Sprint 293 (no duplication)", () => {
    const matches = src.match(/activeCuisineRow:/g);
    // Should only be defined once in StyleSheet
    expect(matches).toHaveLength(1);
  });

  it("reuses activeCuisineChip style from Sprint 293 (no duplication)", () => {
    const matches = src.match(/activeCuisineChip:/g);
    expect(matches).toHaveLength(1);
  });
});

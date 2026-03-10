/**
 * Sprint 293 — Active cuisine filter indicator tests
 *
 * Validates:
 * 1. Search page imports CUISINE_DISPLAY for label/emoji lookup
 * 2. Active cuisine chip renders when selectedCuisine is set
 * 3. Chip includes emoji, label, close button, and result count
 * 4. Close button calls setSelectedCuisine(null)
 * 5. Styles for the cuisine indicator are defined
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const searchSrc = fs.readFileSync(
  path.resolve("app/(tabs)/search.tsx"), "utf-8",
);

describe("Sprint 293 — Active cuisine indicator import", () => {
  it("imports CUISINE_DISPLAY from shared/best-in-categories", () => {
    expect(searchSrc).toContain('import { CUISINE_DISPLAY } from "@/shared/best-in-categories"');
  });
});

describe("Sprint 293 — Active cuisine chip rendering", () => {
  it("conditionally renders when selectedCuisine is truthy", () => {
    expect(searchSrc).toMatch(/\{selectedCuisine\s*&&\s*\(/);
  });

  it("displays cuisine emoji from CUISINE_DISPLAY lookup", () => {
    expect(searchSrc).toContain("CUISINE_DISPLAY[selectedCuisine]?.emoji");
  });

  it("displays cuisine label from CUISINE_DISPLAY lookup", () => {
    expect(searchSrc).toContain("CUISINE_DISPLAY[selectedCuisine]?.label");
  });

  it("falls back to raw cuisine string if not in CUISINE_DISPLAY", () => {
    // After the || the raw selectedCuisine is used
    expect(searchSrc).toMatch(/CUISINE_DISPLAY\[selectedCuisine\]\?\.label\s*\|\|\s*selectedCuisine/);
  });

  it("shows result count from filtered array", () => {
    expect(searchSrc).toMatch(/filtered\.length\s*}\s*result/);
  });
});

describe("Sprint 293 — Close button clears cuisine filter", () => {
  it("calls setSelectedCuisine(null) on close tap", () => {
    expect(searchSrc).toMatch(/onPress=.*setSelectedCuisine\(null\)/);
  });

  it("has accessible label for clearing the filter", () => {
    expect(searchSrc).toMatch(/accessibilityLabel=.*Clear.*filter/);
  });

  it("uses close-circle icon", () => {
    expect(searchSrc).toContain('name="close-circle"');
  });
});

describe("Sprint 293 — Active cuisine indicator styles", () => {
  it("defines activeCuisineRow style", () => {
    expect(searchSrc).toContain("activeCuisineRow:");
  });

  it("defines activeCuisineChip style with amber tint", () => {
    expect(searchSrc).toContain("activeCuisineChip:");
    expect(searchSrc).toMatch(/196,\s*154,\s*26/); // amber rgba
  });

  it("defines activeCuisineText style", () => {
    expect(searchSrc).toContain("activeCuisineText:");
  });

  it("defines activeCuisineCount style", () => {
    expect(searchSrc).toContain("activeCuisineCount:");
  });
});

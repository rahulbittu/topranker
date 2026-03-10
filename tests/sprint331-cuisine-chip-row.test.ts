/**
 * Sprint 331: CuisineChipRow Shared Component
 *
 * Verifies that the CuisineChipRow component is extracted and used by
 * both the sticky bar and in-scroll cuisine chips in index.tsx.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const componentPath = path.resolve(__dirname, "../components/leaderboard/CuisineChipRow.tsx");
const componentCode = fs.readFileSync(componentPath, "utf-8");
const indexPath = path.resolve(__dirname, "../app/(tabs)/index.tsx");
const indexCode = fs.readFileSync(indexPath, "utf-8");

describe("Sprint 331 — CuisineChipRow Component", () => {
  // Component structure
  it("should export CuisineChipRow as named export", () => {
    expect(componentCode).toContain("export const CuisineChipRow");
  });

  it("should accept cuisines, selectedCuisine, onSelect props", () => {
    expect(componentCode).toContain("cuisines: string[]");
    expect(componentCode).toContain("selectedCuisine: string | null");
    expect(componentCode).toContain("onSelect: (cuisine: string | null) => void");
  });

  it("should accept analyticsSource prop", () => {
    expect(componentCode).toContain("analyticsSource: string");
  });

  it("should support default and sticky variants", () => {
    expect(componentCode).toContain('"default" | "sticky"');
  });

  it("should render All option", () => {
    expect(componentCode).toContain(">All<");
  });

  it("should filter out universal cuisine", () => {
    expect(componentCode).toContain('c !== "universal"');
  });

  it("should use CUISINE_DISPLAY for labels", () => {
    expect(componentCode).toContain("CUISINE_DISPLAY");
  });

  it("should fire analytics on select and clear", () => {
    expect(componentCode).toContain("Analytics.cuisineFilterSelect");
    expect(componentCode).toContain("Analytics.cuisineFilterClear");
  });

  it("should use haptics on press", () => {
    expect(componentCode).toContain("Haptics.selectionAsync");
  });

  it("should have accessibility labels", () => {
    expect(componentCode).toContain("accessibilityRole");
    expect(componentCode).toContain("accessibilityLabel");
    expect(componentCode).toContain("accessibilityState");
  });

  // Integration in index.tsx
  it("should import CuisineChipRow in index.tsx", () => {
    expect(indexCode).toContain("CuisineChipRow");
    expect(indexCode).toContain("from \"@/components/leaderboard/CuisineChipRow\"");
  });

  it("should use CuisineChipRow in sticky bar", () => {
    const stickySection = indexCode.slice(
      indexCode.indexOf("stickyCuisineBar"),
      indexCode.indexOf("{isLoading ?")
    );
    expect(stickySection).toContain("CuisineChipRow");
    expect(stickySection).toContain('variant="sticky"');
  });

  it("should use CuisineChipRow in ListHeaderComponent", () => {
    // Sprint 386: ListHeaderComponent now renders RankingsListHeader which contains CuisineChipRow
    const headerSrc = fs.readFileSync(path.resolve(__dirname, "../components/leaderboard/RankingsListHeader.tsx"), "utf-8");
    expect(indexCode).toContain("RankingsListHeader");
    expect(headerSrc).toContain("CuisineChipRow");
  });

  it("should NOT have inline cuisine chip rendering in index.tsx", () => {
    // The old inline cuisineChip styles should be gone
    expect(indexCode).not.toContain("styles.cuisineChip,");
    expect(indexCode).not.toContain("cuisineChipActive");
    expect(indexCode).not.toContain("stickyCuisineChip");
  });

  it("should reduce index.tsx below 600 LOC", () => {
    const lines = indexCode.split("\n").length;
    expect(lines).toBeLessThan(600);
  });
});

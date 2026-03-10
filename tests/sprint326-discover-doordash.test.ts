/**
 * Sprint 326: DoorDash-Style Navigation for Discover Page
 *
 * Verifies filter chips, price chips, and sort chips moved from fixed position
 * into FlatList ListHeaderComponent. View toggle stays fixed.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const searchPath = path.resolve(__dirname, "../app/(tabs)/search.tsx");
const searchCode = fs.readFileSync(searchPath, "utf-8");

describe("Sprint 326 — Discover DoorDash Pattern", () => {
  // Core pattern: filters in scroll, not fixed
  it("should have filter chips inside ListHeaderComponent", () => {
    // Find ListHeaderComponent content
    const lhcStart = searchCode.indexOf("ListHeaderComponent={");
    expect(lhcStart).toBeGreaterThan(-1);
    const afterLhc = searchCode.slice(lhcStart, lhcStart + 3000);
    // Filter chips (FILTERS.map) should be inside ListHeaderComponent
    expect(afterLhc).toContain("FILTERS.map");
  });

  it("should have price chips inside ListHeaderComponent", () => {
    const lhcStart = searchCode.indexOf("ListHeaderComponent={");
    const afterLhc = searchCode.slice(lhcStart, lhcStart + 3000);
    // Price chips should be inside ListHeaderComponent
    expect(afterLhc).toContain('"$"');
    expect(afterLhc).toContain('"$$"');
    expect(afterLhc).toContain('"$$$"');
    expect(afterLhc).toContain('"$$$$"');
  });

  it("should have sort chips inside ListHeaderComponent", () => {
    const lhcStart = searchCode.indexOf("ListHeaderComponent={");
    const afterLhc = searchCode.slice(lhcStart, lhcStart + 3000);
    expect(afterLhc).toContain("sortLabel");
    expect(afterLhc).toContain("Ranked");
    expect(afterLhc).toContain("Most Rated");
  });

  it("should keep view toggle in fixed area (above FlatList)", () => {
    // viewToggleRow should be BEFORE the conditional rendering
    const viewToggleRowIdx = searchCode.indexOf("viewToggleRow");
    const flatListIdx = searchCode.indexOf("<FlatList");
    expect(viewToggleRowIdx).toBeGreaterThan(-1);
    expect(viewToggleRowIdx).toBeLessThan(flatListIdx);
  });

  it("should NOT have controlsRow in fixed area", () => {
    // controlsRow should not appear in the JSX (only in styles)
    const jsxSection = searchCode.slice(0, searchCode.indexOf("const styles"));
    expect(jsxSection).not.toContain("styles.controlsRow");
  });

  it("should NOT have priceRow in fixed area above FlatList", () => {
    // priceRow should only appear inside ListHeaderComponent, not before the conditional
    const beforeConditional = searchCode.slice(
      searchCode.indexOf("viewToggleRow"),
      searchCode.indexOf("isLoading ?")
    );
    expect(beforeConditional).not.toContain("priceRow");
  });

  it("should NOT have sortRow in fixed area above FlatList", () => {
    const beforeConditional = searchCode.slice(
      searchCode.indexOf("viewToggleRow"),
      searchCode.indexOf("isLoading ?")
    );
    expect(beforeConditional).not.toContain("sortRow");
  });

  it("should have viewToggleRow style defined", () => {
    expect(searchCode).toContain("viewToggleRow:");
  });

  it("should have filterScrollRow style defined", () => {
    expect(searchCode).toContain("filterScrollRow:");
  });

  // Fixed area should be minimal: header + search + view toggle only
  it("should have header and search fixed above scroll", () => {
    const fixedArea = searchCode.slice(
      searchCode.indexOf("return ("),
      searchCode.indexOf("isLoading ?")
    );
    expect(fixedArea).toContain("styles.headerRow");
    expect(fixedArea).toContain("styles.searchBox");
    expect(fixedArea).toContain("viewToggleRow");
  });

  it("should have DoorDash pattern comment", () => {
    expect(searchCode).toContain("DoorDash pattern");
  });

  // search.tsx should stay under 1000 LOC threshold
  it("should keep search.tsx under 1000 LOC", () => {
    const lines = searchCode.split("\n").length;
    expect(lines).toBeLessThan(1000);
  });

  // Existing functionality preserved
  it("should preserve all 6 filter types", () => {
    expect(searchCode).toContain('"All"');
    expect(searchCode).toContain('"Top 10"');
    expect(searchCode).toContain('"Challenging"');
    expect(searchCode).toContain('"Trending"');
    expect(searchCode).toContain('"Open Now"');
    expect(searchCode).toContain('"Near Me"');
  });

  it("should preserve BestInSection in ListHeaderComponent", () => {
    const lhcStart = searchCode.indexOf("ListHeaderComponent={");
    const afterLhc = searchCode.slice(lhcStart, lhcStart + 5000);
    expect(afterLhc).toContain("BestInSection");
  });

  it("should preserve DishLeaderboardSection in ListHeaderComponent", () => {
    const lhcStart = searchCode.indexOf("ListHeaderComponent={");
    const afterLhc = searchCode.slice(lhcStart, lhcStart + 8000);
    expect(afterLhc).toContain("DishLeaderboardSection");
  });
});

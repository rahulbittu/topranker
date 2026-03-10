/**
 * Sprint 332: Extract Filter Components from search.tsx
 *
 * Verifies FilterChips, PriceChips, SortChips extracted into
 * DiscoverFilters component and used by search.tsx.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const filterPath = path.resolve(__dirname, "../components/search/DiscoverFilters.tsx");
const filterCode = fs.readFileSync(filterPath, "utf-8");
const searchPath = path.resolve(__dirname, "../app/(tabs)/search.tsx");
const searchCode = fs.readFileSync(searchPath, "utf-8");

describe("Sprint 332 — Discover Filter Extraction", () => {
  // Component structure
  it("should export FilterChips", () => {
    expect(filterCode).toContain("export const FilterChips");
  });

  it("should export PriceChips", () => {
    expect(filterCode).toContain("export const PriceChips");
  });

  it("should export SortChips", () => {
    expect(filterCode).toContain("export const SortChips");
  });

  it("FilterChips should have all 6 filter types", () => {
    expect(filterCode).toContain('"All"');
    expect(filterCode).toContain('"Top 10"');
    expect(filterCode).toContain('"Challenging"');
    expect(filterCode).toContain('"Trending"');
    expect(filterCode).toContain('"Open Now"');
    expect(filterCode).toContain('"Near Me"');
  });

  it("PriceChips should have 4 price levels", () => {
    expect(filterCode).toContain('"$"');
    expect(filterCode).toContain('"$$"');
    expect(filterCode).toContain('"$$$"');
    expect(filterCode).toContain('"$$$$"');
  });

  it("SortChips should have 3 sort options", () => {
    expect(filterCode).toContain('"Ranked"');
    expect(filterCode).toContain('"Most Rated"');
    expect(filterCode).toContain('"Trending"');
  });

  it("should use Haptics in all components", () => {
    expect(filterCode).toContain("Haptics.selectionAsync");
  });

  it("should have accessibility labels", () => {
    expect(filterCode).toContain("accessibilityRole");
    expect(filterCode).toContain("accessibilityLabel");
  });

  // Integration in search.tsx
  it("should import DiscoverFilters in search.tsx", () => {
    expect(searchCode).toContain("FilterChips");
    expect(searchCode).toContain("PriceChips");
    expect(searchCode).toContain("SortChips");
    expect(searchCode).toContain("from \"@/components/search/DiscoverFilters\"");
  });

  it("should use FilterChips in ListHeaderComponent", () => {
    const lhcStart = searchCode.indexOf("ListHeaderComponent={");
    const afterLhc = searchCode.slice(lhcStart, lhcStart + 2000);
    expect(afterLhc).toContain("FilterChips");
  });

  it("should use PriceChips in ListHeaderComponent", () => {
    const lhcStart = searchCode.indexOf("ListHeaderComponent={");
    const afterLhc = searchCode.slice(lhcStart, lhcStart + 2000);
    expect(afterLhc).toContain("PriceChips");
  });

  it("should use SortChips in ListHeaderComponent", () => {
    const lhcStart = searchCode.indexOf("ListHeaderComponent={");
    const afterLhc = searchCode.slice(lhcStart, lhcStart + 2000);
    expect(afterLhc).toContain("SortChips");
  });

  it("should NOT have inline filter chip rendering in search.tsx", () => {
    expect(searchCode).not.toContain("FILTERS.map");
    expect(searchCode).not.toContain("styles.filterChip,");
  });

  it("should keep search.tsx below 950 LOC", () => {
    const lines = searchCode.split("\n").length;
    expect(lines).toBeLessThan(950);
  });
});

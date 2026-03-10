/**
 * Sprint 412 — Search Results Sorting Indicators
 *
 * Validates:
 * 1. SortResultsHeader component in DiscoverFilters
 * 2. SORT_DESCRIPTIONS constant with all sort keys
 * 3. SortChips enhanced with sort-specific icons
 * 4. search.tsx integration with SortResultsHeader
 * 5. Styles for sort results header
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. SortResultsHeader component
// ---------------------------------------------------------------------------
describe("SortResultsHeader component", () => {
  const filtersSrc = readFile("components/search/DiscoverFilters.tsx");

  it("exports SortResultsHeader function", () => {
    expect(filtersSrc).toContain("export function SortResultsHeader");
  });

  it("accepts count, sortBy, activeFilter props", () => {
    expect(filtersSrc).toContain("count: number");
    expect(filtersSrc).toContain("sortBy: string");
    expect(filtersSrc).toContain("activeFilter: string");
  });

  it("renders result count with plural logic", () => {
    expect(filtersSrc).toContain("count !== 1");
    expect(filtersSrc).toContain("result");
  });

  it("renders sort indicator with icon and label", () => {
    expect(filtersSrc).toContain("sortIndicator");
    expect(filtersSrc).toContain("sortInfo.icon");
    expect(filtersSrc).toContain("sortInfo.label");
  });

  it("shows active filter label when not All", () => {
    expect(filtersSrc).toContain('activeFilter !== "All"');
    expect(filtersSrc).toContain("filterLabel");
  });
});

// ---------------------------------------------------------------------------
// 2. SORT_DESCRIPTIONS constant
// ---------------------------------------------------------------------------
describe("SORT_DESCRIPTIONS constant", () => {
  const filtersSrc = readFile("components/search/DiscoverFilters.tsx");

  it("defines SORT_DESCRIPTIONS record", () => {
    expect(filtersSrc).toContain("SORT_DESCRIPTIONS");
  });

  it("includes ranked sort description", () => {
    expect(filtersSrc).toContain("trophy-outline");
    expect(filtersSrc).toContain("By Rank");
  });

  it("includes rated sort description", () => {
    expect(filtersSrc).toContain("Most Rated");
    expect(filtersSrc).toContain("star-outline");
  });

  it("includes trending sort description", () => {
    expect(filtersSrc).toContain("Trending");
    expect(filtersSrc).toContain("trending-up-outline");
  });

  it("includes relevant sort description", () => {
    expect(filtersSrc).toContain("Relevant");
    expect(filtersSrc).toContain("search-outline");
  });

  it("each description has label, icon, and hint", () => {
    expect(filtersSrc).toContain("label:");
    expect(filtersSrc).toContain("icon:");
    expect(filtersSrc).toContain("hint:");
  });
});

// ---------------------------------------------------------------------------
// 3. SortChips enhanced with icons
// ---------------------------------------------------------------------------
describe("SortChips — sort-specific icons", () => {
  const filtersSrc = readFile("components/search/DiscoverFilters.tsx");

  it("SortChips renders icon on active chip", () => {
    expect(filtersSrc).toContain("sortBy === key && <Ionicons");
  });

  it("options include icon names", () => {
    expect(filtersSrc).toContain('"trophy-outline"');
    expect(filtersSrc).toContain('"star-outline"');
    expect(filtersSrc).toContain('"trending-up-outline"');
  });

  it("has accessibility label for sort options", () => {
    expect(filtersSrc).toContain("Sort by");
    expect(filtersSrc).toContain("accessibilityLabel");
  });
});

// ---------------------------------------------------------------------------
// 4. search.tsx integration
// ---------------------------------------------------------------------------
describe("search.tsx — SortResultsHeader integration", () => {
  const searchSrc = readFile("app/(tabs)/search.tsx");

  it("imports SortResultsHeader from DiscoverFilters", () => {
    expect(searchSrc).toContain("SortResultsHeader");
    expect(searchSrc).toContain("DiscoverFilters");
  });

  it("renders SortResultsHeader component", () => {
    expect(searchSrc).toContain("<SortResultsHeader");
  });

  it("passes count, sortBy, and activeFilter props", () => {
    expect(searchSrc).toContain("count={");
    expect(searchSrc).toContain("sortBy={sortBy}");
    expect(searchSrc).toContain("activeFilter={activeFilter}");
  });
});

// ---------------------------------------------------------------------------
// 5. Styles
// ---------------------------------------------------------------------------
describe("DiscoverFilters — sort results header styles", () => {
  const filtersSrc = readFile("components/search/DiscoverFilters.tsx");

  it("has sortResultsHeader style", () => {
    expect(filtersSrc).toContain("sortResultsHeader:");
  });

  it("has sortResultsLeft style", () => {
    expect(filtersSrc).toContain("sortResultsLeft:");
  });

  it("has sortResultsCount style", () => {
    expect(filtersSrc).toContain("sortResultsCount:");
  });

  it("has sortIndicator style with amber background", () => {
    expect(filtersSrc).toContain("sortIndicator:");
    expect(filtersSrc).toContain("AMBER");
  });

  it("has sortIndicatorText style", () => {
    expect(filtersSrc).toContain("sortIndicatorText:");
  });
});

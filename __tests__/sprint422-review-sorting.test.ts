/**
 * Sprint 422 — Business Detail Review Sorting
 *
 * Validates:
 * 1. CollapsibleReviews has sort state and sort chips
 * 2. Sort options: Recent, Highest, Lowest, Most Weighted
 * 3. sortRatings function exists with all sort modes
 * 4. ReviewSortChips component with accessibility
 * 5. File health
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. Sort state in CollapsibleReviews
// ---------------------------------------------------------------------------
describe("CollapsibleReviews — sort state", () => {
  const src = readFile("components/business/CollapsibleReviews.tsx");

  it("has ReviewSortKey type with 4 options", () => {
    expect(src).toContain('"recent"');
    expect(src).toContain('"highest"');
    expect(src).toContain('"lowest"');
    expect(src).toContain('"weighted"');
  });

  it("has sortKey state defaulting to recent", () => {
    expect(src).toContain("useState<ReviewSortKey>(\"recent\")");
  });

  it("has handleSort function that resets visibleCount", () => {
    expect(src).toContain("handleSort");
    expect(src).toContain("setSortKey(key)");
    expect(src).toContain("setVisibleCount(5)");
  });
});

// ---------------------------------------------------------------------------
// 2. SORT_OPTIONS configuration
// ---------------------------------------------------------------------------
describe("CollapsibleReviews — SORT_OPTIONS", () => {
  const src = readFile("components/business/CollapsibleReviews.tsx");

  it("defines SORT_OPTIONS array with 4 entries", () => {
    expect(src).toContain("SORT_OPTIONS");
    expect(src).toContain('label: "Recent"');
    expect(src).toContain('label: "Highest"');
    expect(src).toContain('label: "Lowest"');
    expect(src).toContain('label: "Most Weighted"');
  });

  it("has icons for each sort option", () => {
    expect(src).toContain('icon: "time-outline"');
    expect(src).toContain('icon: "arrow-up"');
    expect(src).toContain('icon: "arrow-down"');
    expect(src).toContain('icon: "shield-checkmark-outline"');
  });
});

// ---------------------------------------------------------------------------
// 3. sortRatings function
// ---------------------------------------------------------------------------
describe("CollapsibleReviews — sortRatings function", () => {
  const src = readFile("components/business/CollapsibleReviews.tsx");

  it("has sortRatings function", () => {
    expect(src).toContain("function sortRatings(");
  });

  it("sorts by createdAt for recent", () => {
    expect(src).toContain("new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()");
  });

  it("sorts by rawScore descending for highest", () => {
    expect(src).toContain("b.rawScore - a.rawScore");
  });

  it("sorts by rawScore ascending for lowest", () => {
    expect(src).toContain("a.rawScore - b.rawScore");
  });

  it("sorts by weight descending for weighted", () => {
    expect(src).toContain("b.weight - a.weight");
  });

  it("creates a copy to avoid mutation", () => {
    expect(src).toContain("[...ratings]");
  });
});

// ---------------------------------------------------------------------------
// 4. ReviewSortChips component
// ---------------------------------------------------------------------------
describe("CollapsibleReviews — ReviewSortChips", () => {
  const src = readFile("components/business/CollapsibleReviews.tsx");

  it("exports ReviewSortChips component", () => {
    expect(src).toContain("export function ReviewSortChips");
  });

  it("has accessibility labels for sort buttons", () => {
    expect(src).toContain("Sort reviews by");
  });

  it("has accessibility state for selected chip", () => {
    expect(src).toContain("accessibilityState={{ selected: active }}");
  });

  it("renders sort chips inside CollapsibleReviews body", () => {
    expect(src).toContain("<ReviewSortChips activeSort={sortKey} onSort={handleSort} />");
  });
});

// ---------------------------------------------------------------------------
// 5. Sorted ratings wiring
// ---------------------------------------------------------------------------
describe("CollapsibleReviews — sorted ratings wiring", () => {
  const src = readFile("components/business/CollapsibleReviews.tsx");

  it("applies sortRatings before slicing", () => {
    expect(src).toContain("sortRatings(ratings, sortKey)");
    expect(src).toContain("sortedRatings.slice(0, visibleCount)");
  });
});

// ---------------------------------------------------------------------------
// 6. File health
// ---------------------------------------------------------------------------
describe("CollapsibleReviews — file health", () => {
  const src = readFile("components/business/CollapsibleReviews.tsx");

  it("is under 350 LOC", () => {
    expect(countLines(src)).toBeLessThan(350);
  });
});

// ---------------------------------------------------------------------------
// 7. business/[id].tsx health
// ---------------------------------------------------------------------------
describe("business/[id].tsx — file health", () => {
  const src = readFile("app/business/[id].tsx");

  it("is under 650 LOC threshold", () => {
    expect(countLines(src)).toBeLessThan(650);
  });
});

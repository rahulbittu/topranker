/**
 * Sprint 383: Discover Empty State Enhancements
 *
 * Extracted DiscoverEmptyState component with contextual messaging,
 * "Be the first" CTA, and city suggestions.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. DiscoverEmptyState component ──────────────────────────────────

describe("Sprint 383 — DiscoverEmptyState component", () => {
  const emptySrc = readFile("components/search/DiscoverEmptyState.tsx");

  it("exports DiscoverEmptyState function", () => {
    expect(emptySrc).toContain("export function DiscoverEmptyState");
  });

  it("exports DiscoverEmptyStateProps interface", () => {
    expect(emptySrc).toContain("export interface DiscoverEmptyStateProps");
  });

  it("accepts variant prop (list | map)", () => {
    expect(emptySrc).toContain('variant: "list" | "map"');
  });

  it("accepts query prop", () => {
    expect(emptySrc).toContain("query: string");
  });

  it("accepts selectedCuisine prop", () => {
    expect(emptySrc).toContain("selectedCuisine: string | null");
  });

  it("accepts city and activeFilter props", () => {
    expect(emptySrc).toContain("city: string");
    expect(emptySrc).toContain("activeFilter: string");
  });

  it("has contextual icon selection based on state", () => {
    expect(emptySrc).toContain("map-outline");
    expect(emptySrc).toContain("search-outline");
    expect(emptySrc).toContain("filter-outline");
    expect(emptySrc).toContain("restaurant-outline");
  });

  it("has 'Be the first to rate' CTA", () => {
    expect(emptySrc).toContain("Be the first to rate");
  });

  it("links to rankings page from CTA", () => {
    expect(emptySrc).toContain('router.push("/(tabs)/"');
  });

  it("has star-outline icon for CTA", () => {
    expect(emptySrc).toContain("star-outline");
  });

  it("has cuisine-aware dish suggestions", () => {
    expect(emptySrc).toContain("CUISINE_DISH_MAP");
  });

  it("has clear cuisine filter option", () => {
    expect(emptySrc).toContain("Show all cuisines");
  });

  it("has popular category suggestions for list variant", () => {
    expect(emptySrc).toContain("Popular in");
  });

  it("has nearby city suggestions", () => {
    expect(emptySrc).toContain("Try another city");
  });

  it("uses SUPPORTED_CITIES for city suggestions", () => {
    expect(emptySrc).toContain("SUPPORTED_CITIES");
  });

  it("has iconCircle style for visual polish", () => {
    expect(emptySrc).toContain("iconCircle");
  });

  it("has beFirstBtn style", () => {
    expect(emptySrc).toContain("beFirstBtn");
  });

  it("has cityChip style", () => {
    expect(emptySrc).toContain("cityChip");
  });
});

// ── 2. Search page integration ───────────────────────────────────────

describe("Sprint 383 — search.tsx integration", () => {
  const searchSrc = readFile("app/(tabs)/search.tsx");

  it("imports DiscoverEmptyState", () => {
    expect(searchSrc).toContain("DiscoverEmptyState");
  });

  it("uses DiscoverEmptyState for list variant", () => {
    expect(searchSrc).toContain('variant="list"');
  });

  it("uses DiscoverEmptyState for map variant", () => {
    expect(searchSrc).toContain('variant="map"');
  });

  it("passes query prop to empty state", () => {
    expect(searchSrc).toContain("query={query}");
  });

  it("passes selectedCuisine prop to empty state", () => {
    expect(searchSrc).toContain("selectedCuisine={selectedCuisine}");
  });

  it("passes onCityChange callback", () => {
    expect(searchSrc).toContain("onCityChange={setCity}");
  });

  it("search.tsx is under 800 LOC after extraction", () => {
    const lines = searchSrc.split("\n").length;
    expect(lines).toBeLessThan(800);
  });

  it("no longer has inline emptyDishSuggestions style", () => {
    expect(searchSrc).not.toContain("emptyDishSuggestions:");
  });
});

/**
 * Sprint 301 — Best In entry count preview tests
 *
 * Validates:
 * 1. BestInSection accepts entryCounts prop
 * 2. Card subtitle shows entry count when available
 * 3. Falls back to "Best in {city}" when no count
 * 4. search.tsx fetches dish-leaderboards for entry counts
 * 5. Passes entryCounts to BestInSection
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 301 — BestInSection entryCounts prop", () => {
  const src = fs.readFileSync(
    path.resolve("components/search/BestInSection.tsx"), "utf-8",
  );

  it("interface includes entryCounts optional prop", () => {
    expect(src).toMatch(/entryCounts\?:\s*Record<string,\s*number>/);
  });

  it("destructures entryCounts from props", () => {
    expect(src).toContain("entryCounts");
  });

  it("shows entry count when available", () => {
    expect(src).toMatch(/entryCounts\[cat\.slug\].*ranked/);
  });

  it("falls back to 'Best in city' when no count", () => {
    expect(src).toContain("Best in ${city}");
  });
});

describe("Sprint 301 — search.tsx dish entry count fetch", () => {
  const src = fs.readFileSync(
    path.resolve("app/(tabs)/search.tsx"), "utf-8",
  );

  it("fetches dish-leaderboards API for entry counts", () => {
    expect(src).toContain("/api/dish-leaderboards");
    // Sprint 313: query key changed to dish-boards-search (stores full DishBoardInfo[])
    expect(src).toContain("dish-boards-search");
  });

  it("builds entryCounts record from API response", () => {
    // Sprint 313: dishEntryCounts derived from dishBoards via useMemo
    expect(src).toContain("b.slug");
    expect(src).toContain("b.entryCount");
  });

  it("passes entryCounts to BestInSection", () => {
    // Sprint 571: redirected to DiscoverSections
    const discoverSrc = fs.readFileSync(
      path.resolve("components/search/DiscoverSections.tsx"), "utf-8",
    );
    expect(discoverSrc).toContain("entryCounts={dishEntryCounts}");
  });

  it("uses staleTime for caching", () => {
    // Sprint 313: staleTime on the dish-boards-search query
    expect(src).toMatch(/dish-boards-search.*staleTime/s);
  });
});

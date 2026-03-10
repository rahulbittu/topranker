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
    expect(src).toContain("dish-entry-counts");
  });

  it("builds entryCounts record from API response", () => {
    expect(src).toContain("board.dishSlug");
    expect(src).toContain("board.entryCount");
  });

  it("passes entryCounts to BestInSection", () => {
    expect(src).toContain("entryCounts={dishEntryCounts}");
  });

  it("uses staleTime for caching", () => {
    // Should have staleTime on the dish-entry-counts query
    expect(src).toMatch(/dish-entry-counts.*staleTime/s);
  });
});

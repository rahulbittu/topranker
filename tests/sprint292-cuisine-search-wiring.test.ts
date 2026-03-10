/**
 * Sprint 292 — Cuisine search wiring tests
 *
 * Validates:
 * 1. BestInSection exposes onCuisineChange callback
 * 2. search.tsx tracks selectedCuisine state and passes it to fetchBusinessSearch
 * 3. Query key includes selectedCuisine for cache invalidation
 * 4. Manual text input clears cuisine filter
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ── BestInSection Component ────────────────────────────────

describe("Sprint 292 — BestInSection onCuisineChange prop", () => {
  const src = fs.readFileSync(
    path.resolve("components/search/BestInSection.tsx"), "utf-8",
  );

  it("interface includes onCuisineChange optional callback", () => {
    expect(src).toMatch(/onCuisineChange\?:\s*\(cuisine:\s*string\s*\|\s*null\)\s*=>\s*void/);
  });

  it("destructures onCuisineChange from props", () => {
    expect(src).toContain("onCuisineChange");
  });

  it("calls onCuisineChange when All tab is tapped", () => {
    expect(src).toMatch(/onCuisineChange\?\.\(null\)/);
  });

  it("calls onCuisineChange when a cuisine tab is tapped", () => {
    expect(src).toMatch(/onCuisineChange\?\.\(cuisine\)/);
  });
});

// ── Search Screen Wiring ───────────────────────────────────

describe("Sprint 292 — search.tsx cuisine state wiring", () => {
  const src = fs.readFileSync(
    path.resolve("app/(tabs)/search.tsx"), "utf-8",
  );

  it("declares selectedCuisine state (via persistence hook)", () => {
    expect(src).toContain("selectedCuisine");
    expect(src).toContain("usePersistedCuisine");
  });

  it("passes selectedCuisine to fetchBusinessSearch", () => {
    expect(src).toMatch(/fetchBusinessSearch\([^)]*selectedCuisine/);
  });

  it("includes selectedCuisine in React Query key", () => {
    // Sprint 442: query key now also includes dietary + distance filters
    expect(src).toContain("selectedCuisine");
    expect(src).toMatch(/queryKey:\s*\["search",\s*city,\s*debouncedQuery,\s*selectedCuisine/);
  });

  it("passes onCuisineChange to BestInSection", () => {
    expect(src).toMatch(/onCuisineChange=\{.*setSelectedCuisine/);
  });

  it("clears cuisine when user types manually", () => {
    // onChangeText handler should clear selectedCuisine
    expect(src).toMatch(/onChangeText=.*setSelectedCuisine\(null\)/);
  });
});

// ── Integration ────────────────────────────────────────────

describe("Sprint 292 — full cuisine search flow", () => {
  it("BestInSection and search.tsx are properly connected", () => {
    const bestIn = fs.readFileSync(path.resolve("components/search/BestInSection.tsx"), "utf-8");
    const search = fs.readFileSync(path.resolve("app/(tabs)/search.tsx"), "utf-8");

    // BestInSection exports the callback
    expect(bestIn).toContain("onCuisineChange");
    // search.tsx imports BestInSection
    expect(search).toContain("BestInSection");
    // search.tsx uses the callback
    expect(search).toContain("onCuisineChange");
  });

  it("fetchBusinessSearch is called with cuisine from API module", () => {
    const api = fs.readFileSync(path.resolve("lib/api.ts"), "utf-8");
    expect(api).toMatch(/fetchBusinessSearch\([^)]*cuisine/);
  });
});

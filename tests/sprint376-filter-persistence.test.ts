import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 376: Search filter persistence", () => {
  const hookSrc = readFile("lib/hooks/useSearchPersistence.ts");
  const searchSrc = readFile("app/(tabs)/search.tsx");

  // ── usePersistedFilter hook ─────────────────────────────

  describe("usePersistedFilter hook", () => {
    it("should export usePersistedFilter function", () => {
      expect(hookSrc).toContain("export function usePersistedFilter");
    });

    it("should persist filter to discover_filter key", () => {
      expect(hookSrc).toContain('"discover_filter"');
    });

    it("should validate filter against VALID_FILTERS", () => {
      expect(hookSrc).toContain("VALID_FILTERS");
    });

    it("should return activeFilter and setActiveFilter", () => {
      expect(hookSrc).toContain("activeFilter");
      expect(hookSrc).toContain("setActiveFilter");
    });

    it("should define all valid filter types", () => {
      expect(hookSrc).toContain('"All"');
      expect(hookSrc).toContain('"Top 10"');
      expect(hookSrc).toContain('"Challenging"');
      expect(hookSrc).toContain('"Trending"');
      expect(hookSrc).toContain('"Open Now"');
      expect(hookSrc).toContain('"Near Me"');
    });
  });

  // ── usePersistedPrice hook ──────────────────────────────

  describe("usePersistedPrice hook", () => {
    it("should export usePersistedPrice function", () => {
      expect(hookSrc).toContain("export function usePersistedPrice");
    });

    it("should persist price to discover_price key", () => {
      expect(hookSrc).toContain('"discover_price"');
    });

    it("should handle null price (remove from storage)", () => {
      expect(hookSrc).toContain("AsyncStorage.removeItem");
    });

    it("should return priceFilter and setPriceFilter", () => {
      expect(hookSrc).toContain("priceFilter");
      expect(hookSrc).toContain("setPriceFilter");
    });
  });

  // ── usePersistedViewMode hook ───────────────────────────

  describe("usePersistedViewMode hook", () => {
    it("should export usePersistedViewMode function", () => {
      expect(hookSrc).toContain("export function usePersistedViewMode");
    });

    it("should persist view mode to discover_view_mode key", () => {
      expect(hookSrc).toContain('"discover_view_mode"');
    });

    it("should validate view mode as list or map", () => {
      expect(hookSrc).toContain('"list"');
      expect(hookSrc).toContain('"map"');
    });

    it("should return viewMode and setViewMode", () => {
      expect(hookSrc).toContain("viewMode");
      expect(hookSrc).toContain("setViewMode");
    });
  });

  // ── Search screen integration ───────────────────────────

  describe("Search screen uses persisted hooks", () => {
    it("should import usePersistedFilter", () => {
      expect(searchSrc).toContain("usePersistedFilter");
    });

    it("should import usePersistedPrice", () => {
      expect(searchSrc).toContain("usePersistedPrice");
    });

    it("should import usePersistedViewMode", () => {
      expect(searchSrc).toContain("usePersistedViewMode");
    });

    it("should use destructured activeFilter from hook", () => {
      expect(searchSrc).toContain("activeFilter, setActiveFilter");
      expect(searchSrc).toContain("usePersistedFilter");
    });

    it("should use destructured viewMode from hook", () => {
      expect(searchSrc).toContain("viewMode, setViewMode");
      expect(searchSrc).toContain("usePersistedViewMode");
    });

    it("should use destructured priceFilter from hook", () => {
      expect(searchSrc).toContain("priceFilter, setPriceFilter");
      expect(searchSrc).toContain("usePersistedPrice");
    });

    it("should not have local FilterType or ViewMode types", () => {
      expect(searchSrc).not.toContain('type FilterType =');
      expect(searchSrc).not.toContain('type ViewMode =');
    });
  });

  // ── search.tsx got smaller (removed local state) ───────

  describe("File size improvement", () => {
    it("search.tsx should be under 860 LOC (removed 4 lines of local types)", () => {
      const lines = searchSrc.split("\n").length;
      expect(lines).toBeLessThan(860);
    });
  });
});

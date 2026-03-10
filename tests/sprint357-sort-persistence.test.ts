import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 357: Search results sorting persistence", () => {
  const searchSrc = fs.readFileSync(
    path.resolve("app/(tabs)/search.tsx"), "utf-8"
  );
  const hookSrc = fs.readFileSync(
    path.resolve("lib/hooks/useSearchPersistence.ts"), "utf-8"
  );

  // ── Sort persistence ──────────────────────────────────────────

  describe("Sort preference persistence", () => {
    it("should use wrapper setSortBy that persists to AsyncStorage", () => {
      expect(hookSrc).toContain("const setSortBy = useCallback");
    });

    it("should save sort to discover_sort key", () => {
      expect(hookSrc).toContain('AsyncStorage.setItem("discover_sort", sort)');
    });

    it("should restore sort from AsyncStorage on mount", () => {
      expect(hookSrc).toContain('AsyncStorage.getItem("discover_sort")');
    });

    it("should validate restored sort value", () => {
      // Only accept valid sort values
      expect(hookSrc).toContain('"ranked" || val === "rated" || val === "trending"');
    });

    it("should call setSortByRaw on restore", () => {
      expect(hookSrc).toContain("setSortByRaw(val)");
    });

    it("should have raw state setter", () => {
      expect(hookSrc).toContain("setSortByRaw");
    });

    it("should default sort to ranked", () => {
      expect(hookSrc).toContain('"ranked"');
    });
  });

  // ── Existing sort functionality preserved ─────────────────────

  describe("Sort functionality unchanged", () => {
    it("should still sort by rank when ranked", () => {
      expect(searchSrc).toContain('sortBy === "ranked"');
    });

    it("should still sort by rating count when rated", () => {
      expect(searchSrc).toContain('sortBy === "rated"');
    });

    it("should still sort by rank delta when trending", () => {
      expect(searchSrc).toContain('sortBy === "trending"');
    });

    it("should still pass sortBy to SortChips", () => {
      expect(searchSrc).toContain("sortBy={sortBy}");
    });

    it("should still pass setSortBy to SortChips", () => {
      expect(searchSrc).toContain("onSortChange={setSortBy}");
    });
  });

  // ── Other persisted preferences preserved ─────────────────────

  describe("Other persistence unchanged", () => {
    it("should still persist cuisine (via hook)", () => {
      expect(hookSrc).toContain('discover_cuisine');
    });

    it("should still persist recent searches (via hook)", () => {
      expect(hookSrc).toContain('recent_searches');
    });

    it("should still persist discover tip (via hook)", () => {
      expect(hookSrc).toContain('discover_tip_dismissed');
    });
  });
});

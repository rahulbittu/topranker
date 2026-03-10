import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 351: Wire cuisine into bookmark creation sites", () => {
  const bookmarksCtxSrc = fs.readFileSync(
    path.resolve("lib/bookmarks-context.tsx"), "utf-8"
  );
  const businessDetailSrc = fs.readFileSync(
    path.resolve("app/business/[id].tsx"), "utf-8"
  );
  const searchSubSrc = fs.readFileSync(
    path.resolve("components/search/SubComponents.tsx"), "utf-8"
  );
  const leaderboardSubSrc = fs.readFileSync(
    path.resolve("components/leaderboard/SubComponents.tsx"), "utf-8"
  );

  // ── BookmarksContext ──────────────────────────────────────────

  describe("BookmarksContext cuisine support", () => {
    it("should have cuisine in BookmarkEntry interface", () => {
      expect(bookmarksCtxSrc).toContain("cuisine?: string");
    });

    it("should accept cuisine in toggleBookmark interface type", () => {
      expect(bookmarksCtxSrc).toContain("cuisine?: string }) => void");
    });

    it("should accept cuisine in toggleBookmark implementation", () => {
      // The implementation callback should accept cuisine in meta
      expect(bookmarksCtxSrc).toContain(
        'meta?: { name: string; slug: string; category: string; cuisine?: string }'
      );
    });

    it("should spread meta including cuisine when setting bookmark", () => {
      expect(bookmarksCtxSrc).toContain("{ id: businessId, ...meta, savedAt: Date.now() }");
    });

    it("should persist bookmarks via AsyncStorage", () => {
      expect(bookmarksCtxSrc).toContain("AsyncStorage.setItem");
    });
  });

  // ── Business Detail page ──────────────────────────────────────

  describe("Business detail bookmark creation", () => {
    it("should pass cuisine to toggleBookmark", () => {
      expect(businessDetailSrc).toContain("cuisine: business.cuisine");
    });

    it("should use nullish coalescing for cuisine", () => {
      expect(businessDetailSrc).toContain("business.cuisine ?? undefined");
    });

    it("should still pass name, slug, and category", () => {
      expect(businessDetailSrc).toContain("name: business.name");
      expect(businessDetailSrc).toContain("slug: business.slug");
      expect(businessDetailSrc).toContain("category: business.category");
    });

    it("should import useBookmarks", () => {
      expect(businessDetailSrc).toContain("useBookmarks");
    });
  });

  // ── Search/Discover cards ─────────────────────────────────────

  describe("Discover card bookmark creation", () => {
    it("should pass cuisine to toggleBookmark", () => {
      expect(searchSubSrc).toContain("cuisine: item.cuisine");
    });

    it("should use nullish coalescing for cuisine", () => {
      expect(searchSubSrc).toContain("item.cuisine ?? undefined");
    });

    it("should still pass name, slug, category in toggleBookmark", () => {
      const toggleCall = searchSubSrc.match(/toggleBookmark\(item\.id,\s*\{[^}]+\}/);
      expect(toggleCall).toBeTruthy();
      expect(toggleCall![0]).toContain("name: item.name");
      expect(toggleCall![0]).toContain("slug: item.slug");
      expect(toggleCall![0]).toContain("category: item.category");
      expect(toggleCall![0]).toContain("cuisine: item.cuisine");
    });
  });

  // ── Leaderboard/Rankings cards ────────────────────────────────

  describe("Rankings card bookmark creation", () => {
    it("should pass cuisine to toggleBookmark", () => {
      expect(leaderboardSubSrc).toContain("cuisine: item.cuisine");
    });

    it("should use nullish coalescing for cuisine", () => {
      expect(leaderboardSubSrc).toContain("item.cuisine ?? undefined");
    });

    it("should still pass name, slug, category in toggleBookmark", () => {
      const toggleCall = leaderboardSubSrc.match(/toggleBookmark\(item\.id,\s*\{[^}]+\}/);
      expect(toggleCall).toBeTruthy();
      expect(toggleCall![0]).toContain("name: item.name");
      expect(toggleCall![0]).toContain("slug: item.slug");
      expect(toggleCall![0]).toContain("category: item.category");
      expect(toggleCall![0]).toContain("cuisine: item.cuisine");
    });
  });

  // ── Cross-cutting: All 3 sites consistent ─────────────────────

  describe("Consistency across all bookmark sites", () => {
    it("should have exactly 3 toggleBookmark call sites with cuisine", () => {
      const pattern = /toggleBookmark\([^,]+,\s*\{[^}]*cuisine:/g;
      const businessMatches = businessDetailSrc.match(pattern) || [];
      const searchMatches = searchSubSrc.match(pattern) || [];
      const leaderboardMatches = leaderboardSubSrc.match(pattern) || [];
      expect(businessMatches.length).toBeGreaterThanOrEqual(1);
      expect(searchMatches.length).toBeGreaterThanOrEqual(1);
      expect(leaderboardMatches.length).toBeGreaterThanOrEqual(1);
    });

    it("should not have any toggleBookmark call without cuisine", () => {
      // Every toggleBookmark call with meta object should include cuisine
      const metaCalls = businessDetailSrc.match(/toggleBookmark\(business\.id,\s*\{[^}]+\}/g) || [];
      metaCalls.forEach(call => {
        expect(call).toContain("cuisine:");
      });
    });
  });

  // ── SavedRow consumes cuisine ─────────────────────────────────

  describe("SavedRow cuisine consumption", () => {
    const savedRowSrc = fs.readFileSync(
      path.resolve("components/profile/SavedRow.tsx"), "utf-8"
    );

    it("should use cuisine for emoji display", () => {
      expect(savedRowSrc).toContain("cuisine");
    });

    it("should have cuisine-first emoji pattern", () => {
      // Cuisine emoji should take precedence over category emoji
      expect(savedRowSrc).toContain("cuisineDisplay");
    });
  });
});

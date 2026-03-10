import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 352: Search suggestions UI refresh", () => {
  const searchSrc = fs.readFileSync(
    path.resolve("app/(tabs)/search.tsx"), "utf-8"
  );
  const overlaysSrc = fs.readFileSync(
    path.resolve("components/search/SearchOverlays.tsx"), "utf-8"
  );
  const apiSrc = fs.readFileSync(
    path.resolve("lib/api.ts"), "utf-8"
  );
  const storageSrc = fs.readFileSync(
    path.resolve("server/storage/businesses.ts"), "utf-8"
  );

  // ── Suggestion Chips Refresh ──────────────────────────────────

  describe("Suggestion chips UI refresh", () => {
    it("should have a suggestionsSection wrapper", () => {
      expect(searchSrc).toContain("suggestionsSection");
    });

    it("should display city name in suggestions label", () => {
      expect(searchSrc).toContain('Popular in {city.replace(/_/g, " ")}');
    });

    it("should have uppercase label style", () => {
      expect(searchSrc).toContain("textTransform");
    });

    it("should show result count when available", () => {
      expect(searchSrc).toContain("c.count > 0");
      expect(searchSrc).toContain("suggestionChipCount");
    });

    it("should have amber left border accent on chips", () => {
      expect(searchSrc).toContain("borderLeftWidth: 3");
      expect(searchSrc).toContain("borderLeftColor: AMBER");
    });

    it("should have separate emoji and info sections in chip", () => {
      expect(searchSrc).toContain("suggestionChipEmoji");
      expect(searchSrc).toContain("suggestionChipInfo");
    });

    it("should use popularCategories objects with count", () => {
      expect(searchSrc).toContain("popularCategories.slice(0, 6)");
      expect(searchSrc).toContain("c.category");
    });

    it("should have fallback categories with count: 0", () => {
      expect(searchSrc).toContain('category: "Tacos", count: 0');
    });

    it("should have letter spacing on label", () => {
      expect(searchSrc).toContain("letterSpacing: 0.8");
    });
  });

  // ── Autocomplete Dropdown Refresh ─────────────────────────────

  describe("Autocomplete dropdown refresh", () => {
    it("should display cuisine-first emoji for business results", () => {
      expect(overlaysSrc).toContain("item.cuisine || item.category");
    });

    it("should have autocompleteEmoji style", () => {
      expect(overlaysSrc).toContain("autocompleteEmoji");
    });

    it("should show score badge when weightedScore is available", () => {
      expect(overlaysSrc).toContain("item.weightedScore");
      expect(overlaysSrc).toContain("scoreBadge");
    });

    it("should format score to one decimal", () => {
      expect(overlaysSrc).toContain("weightedScore.toFixed(1)");
    });

    it("should have score badge with amber text", () => {
      expect(overlaysSrc).toContain("scoreBadgeText");
      expect(overlaysSrc).toContain("color: AMBER");
    });

    it("should still show dish matches with ranking badge", () => {
      expect(overlaysSrc).toContain("dishBadge");
      expect(overlaysSrc).toContain("Ranking");
    });

    it("should still show chevron forward for business results", () => {
      expect(overlaysSrc).toContain('"chevron-forward"');
    });
  });

  // ── API Type Update ───────────────────────────────────────────

  describe("AutocompleteSuggestion type update", () => {
    it("should include cuisine field in AutocompleteSuggestion", () => {
      expect(apiSrc).toContain("cuisine?: string");
    });

    it("should include weightedScore field in AutocompleteSuggestion", () => {
      expect(apiSrc).toContain("weightedScore?: number");
    });

    it("should still have core fields", () => {
      const typeBlock = apiSrc.slice(
        apiSrc.indexOf("type AutocompleteSuggestion"),
        apiSrc.indexOf("}", apiSrc.indexOf("type AutocompleteSuggestion")) + 1
      );
      expect(typeBlock).toContain("id: string");
      expect(typeBlock).toContain("name: string");
      expect(typeBlock).toContain("slug: string");
      expect(typeBlock).toContain("category: string");
      expect(typeBlock).toContain("neighborhood: string | null");
    });
  });

  // ── Server Autocomplete Update ────────────────────────────────

  describe("Server autocomplete endpoint", () => {
    it("should select cuisine in autocomplete query", () => {
      expect(storageSrc).toContain("cuisine: businesses.cuisine");
    });

    it("should select weightedScore in autocomplete query", () => {
      expect(storageSrc).toContain("weightedScore: businesses.weightedScore");
    });

    it("should return cuisine in result type", () => {
      const fnBlock = storageSrc.slice(
        storageSrc.indexOf("autocompleteBusinesses"),
        storageSrc.indexOf("return db", storageSrc.indexOf("autocompleteBusinesses"))
      );
      expect(fnBlock).toContain("cuisine?: string");
      expect(fnBlock).toContain("weightedScore?: number");
    });
  });

  // ── Recent Searches still functional ──────────────────────────

  describe("Recent searches panel unchanged", () => {
    it("should still render RecentSearchesPanel", () => {
      expect(overlaysSrc).toContain("RecentSearchesPanel");
    });

    it("should still show clear button", () => {
      expect(overlaysSrc).toContain("Clear");
    });

    it("should still use time-outline icon", () => {
      expect(overlaysSrc).toContain("time-outline");
    });
  });
});

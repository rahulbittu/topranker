/**
 * Sprint 622: Horizontal alignment fix + Discover white space cleanup
 * CEO feedback: Category chips, Best In cards, cuisine tabs, dish shortcuts all misaligned.
 * Discover list has too much white space between sections.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 622 — Horizontal Alignment + White Space", () => {
  const bestInSrc = readFile("components/search/BestInSection.tsx");
  const filtersSrc = readFile("components/search/DiscoverFilters.tsx");
  const searchSrc = readFile("app/(tabs)/search.tsx");

  describe("BestInSection alignment", () => {
    it("cuisineTabsScroll has paddingHorizontal: 16", () => {
      expect(bestInSrc).toContain("cuisineTabsScroll");
      // Check that the style block for cuisineTabsScroll includes paddingHorizontal: 16
      const match = bestInSrc.match(/cuisineTabsScroll:\s*\{([^}]+)\}/);
      expect(match).toBeTruthy();
      expect(match![1]).toContain("paddingHorizontal: 16");
    });

    it("dishShortcutsScroll has paddingHorizontal: 16", () => {
      const match = bestInSrc.match(/dishShortcutsScroll:\s*\{([^}]+)\}/);
      expect(match).toBeTruthy();
      expect(match![1]).toContain("paddingHorizontal: 16");
    });

    it("bestInScroll has paddingHorizontal: 16", () => {
      const match = bestInSrc.match(/bestInScroll:\s*\{([^}]+)\}/);
      expect(match).toBeTruthy();
      expect(match![1]).toContain("paddingHorizontal: 16");
    });

    it("bestInScroll no longer has paddingRight: 4", () => {
      const match = bestInSrc.match(/bestInScroll:\s*\{([^}]+)\}/);
      expect(match).toBeTruthy();
      expect(match![1]).not.toContain("paddingRight: 4");
    });

    it("bestInHeader relies on FlatList paddingHorizontal (no own padding)", () => {
      const match = bestInSrc.match(/bestInHeader:\s*\{([^}]+)\}/);
      expect(match).toBeTruthy();
      // FlatList provides paddingHorizontal: 16, so bestInHeader should NOT have its own
      expect(match![1]).not.toContain("paddingHorizontal");
    });
  });

  describe("DiscoverFilters alignment", () => {
    it("filterRow has paddingHorizontal: 16", () => {
      const match = filtersSrc.match(/filterRow:\s*\{([^}]+)\}/);
      expect(match).toBeTruthy();
      expect(match![1]).toContain("paddingHorizontal: 16");
    });

    it("priceRow relies on FlatList paddingHorizontal (no own padding)", () => {
      const match = filtersSrc.match(/priceRow:\s*\{([^}]+)\}/);
      expect(match).toBeTruthy();
      // FlatList provides paddingHorizontal: 16, so priceRow should NOT have its own
      expect(match![1]).not.toContain("paddingHorizontal");
    });

    it("sortRow relies on FlatList paddingHorizontal (no own padding)", () => {
      const match = filtersSrc.match(/sortRow:\s*\{([^}]+)\}/);
      expect(match).toBeTruthy();
      // FlatList provides paddingHorizontal: 16, so sortRow should NOT have its own
      expect(match![1]).not.toContain("paddingHorizontal");
    });
  });

  describe("White space tightened", () => {
    it("bestInSection marginBottom reduced to 8", () => {
      const match = bestInSrc.match(/bestInSection:\s*\{([^}]+)\}/);
      expect(match).toBeTruthy();
      expect(match![1]).toContain("marginBottom: 8");
    });

    it("bestInHeader marginBottom reduced to 6", () => {
      const match = bestInSrc.match(/bestInHeader:\s*\{([^}]+)\}/);
      expect(match).toBeTruthy();
      expect(match![1]).toContain("marginBottom: 6");
    });

    it("searchBox marginBottom reduced to 6", () => {
      expect(searchSrc).toContain("marginBottom: 6");
    });

    it("priceRow paddingBottom reduced to 6", () => {
      const match = filtersSrc.match(/priceRow:\s*\{([^}]+)\}/);
      expect(match).toBeTruthy();
      expect(match![1]).toContain("paddingBottom: 6");
    });

    it("sortRow paddingBottom reduced to 6", () => {
      const match = filtersSrc.match(/sortRow:\s*\{([^}]+)\}/);
      expect(match).toBeTruthy();
      expect(match![1]).toContain("paddingBottom: 6");
    });
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("BestInSection stays under 200 LOC", () => {
      const loc = bestInSrc.split("\n").length;
      expect(loc).toBeLessThan(200);
    });

    it("DiscoverFilters stays under 220 LOC", () => {
      const loc = filtersSrc.split("\n").length;
      expect(loc).toBeLessThan(220);
    });

    it("search.tsx stays under 610 LOC", () => {
      const loc = searchSrc.split("\n").length;
      expect(loc).toBeLessThan(610);
    });

    it("build under 750kb", () => {
      expect(thresholds.build.currentSizeKb).toBeLessThan(750);
    });

    it("tracks 30 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(30);
    });
  });
});

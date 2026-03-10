/**
 * Sprint 489: Search Skeleton Loading
 *
 * Tests:
 * 1. SearchResultsSkeleton component structure
 * 2. search.tsx imports and uses SearchResultsSkeleton
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 489: Search Skeleton Loading", () => {
  describe("SearchResultsSkeleton component", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../components/search/SearchResultsSkeleton.tsx"),
      "utf-8"
    );

    it("exports SearchResultsSkeleton function component", () => {
      expect(src).toContain("export function SearchResultsSkeleton");
    });

    it("defines SkeletonPulse animation block", () => {
      expect(src).toContain("function SkeletonPulse");
      expect(src).toContain("Animated.loop");
      expect(src).toContain("useNativeDriver: true");
    });

    it("renders filter chip skeletons in a row", () => {
      expect(src).toContain("ChipSkeleton");
      expect(src).toContain("chipsRow");
      expect(src).toContain("borderRadius: 16");
    });

    it("renders result count skeleton row", () => {
      expect(src).toContain("countRow");
      expect(src).toContain("justifyContent: \"space-between\"");
    });

    it("renders CardSkeleton with photo and text areas", () => {
      expect(src).toContain("function CardSkeleton");
      expect(src).toContain("height: 130");
      expect(src).toContain("cardBody");
    });

    it("renders 4 card skeletons matching search results layout", () => {
      const cardCount = (src.match(/<CardSkeleton \/>/g) || []).length;
      expect(cardCount).toBe(4);
    });

    it("card skeleton has name row with score placeholder", () => {
      expect(src).toContain("cardRow");
      expect(src).toContain('width: "65%"');
      expect(src).toContain("width: 40");
    });

    it("card skeleton has tag placeholders", () => {
      expect(src).toContain("cardTags");
      expect(src).toContain("width: 60");
      expect(src).toContain("width: 45");
    });

    it("uses pulsing opacity animation between 0.3 and 0.7", () => {
      expect(src).toContain("toValue: 0.7");
      expect(src).toContain("toValue: 0.3");
      expect(src).toContain("duration: 600");
    });

    it("uses Colors.surfaceRaised for skeleton blocks", () => {
      expect(src).toContain("Colors.surfaceRaised");
    });

    it("uses Colors.surface for card background", () => {
      expect(src).toContain("Colors.surface");
    });
  });

  describe("search.tsx skeleton integration", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../app/(tabs)/search.tsx"),
      "utf-8"
    );

    it("imports SearchResultsSkeleton from components", () => {
      expect(src).toContain('import { SearchResultsSkeleton } from "@/components/search/SearchResultsSkeleton"');
    });

    it("renders SearchResultsSkeleton when isLoading is true", () => {
      expect(src).toContain("<SearchResultsSkeleton />");
    });

    it("still imports DiscoverSkeleton for backward compatibility", () => {
      expect(src).toContain("DiscoverSkeleton");
    });
  });
});

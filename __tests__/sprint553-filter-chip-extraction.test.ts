/**
 * Sprint 553: Leaderboard filter chip extraction — index.tsx → LeaderboardFilterChips
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 553: Filter Chip Extraction", () => {
  describe("LeaderboardFilterChips.tsx (new component)", () => {
    const src = readFile("components/leaderboard/LeaderboardFilterChips.tsx");
    const loc = src.split("\n").length;

    it("is a standalone component under 90 LOC", () => {
      expect(loc).toBeGreaterThan(50);
      expect(loc).toBeLessThan(90);
    });

    it("exports LeaderboardFilterChips function", () => {
      expect(src).toContain("export function LeaderboardFilterChips");
    });

    it("has typed props interface", () => {
      expect(src).toContain("LeaderboardFilterChipsProps");
      expect(src).toContain("neighborhoods: string[]");
      expect(src).toContain("neighborhoodFilter: string | null");
      expect(src).toContain("priceFilter: string | null");
    });

    it("defines PRICE_OPTIONS internally", () => {
      expect(src).toContain('PRICE_OPTIONS');
      expect(src).toContain('"$"');
      expect(src).toContain('"$$$$"');
    });

    it("renders neighborhood chips with location icon", () => {
      expect(src).toContain("location-outline");
      expect(src).toContain("neighborhoods.slice(0, 8)");
    });

    it("renders price chips", () => {
      expect(src).toContain("PRICE_OPTIONS.map");
    });

    it("has clear button with close-circle icon", () => {
      expect(src).toContain("close-circle");
      expect(src).toContain("Clear");
    });

    it("uses Haptics for selection feedback", () => {
      expect(src).toContain("Haptics.selectionAsync");
    });

    it("has horizontal ScrollView", () => {
      expect(src).toContain("ScrollView");
      expect(src).toContain("horizontal");
    });

    it("has chip and chipActive styles", () => {
      expect(src).toContain("chip:");
      expect(src).toContain("chipActive:");
      expect(src).toContain("chipText:");
      expect(src).toContain("chipTextActive:");
    });
  });

  describe("index.tsx (reduced after extraction)", () => {
    const src = readFile("app/(tabs)/index.tsx");
    const loc = src.split("\n").length;

    it("index.tsx is under 450 LOC (reduced from 505)", () => {
      expect(loc).toBeLessThan(450);
    });

    it("imports LeaderboardFilterChips", () => {
      expect(src).toContain("LeaderboardFilterChips");
    });

    it("no longer has inline PRICE_OPTIONS", () => {
      expect(src).not.toContain("PRICE_OPTIONS");
    });

    it("no longer has filterChip styles", () => {
      expect(src).not.toContain("filterChipRow:");
      expect(src).not.toContain("filterChipContent:");
    });

    it("no longer imports ScrollView", () => {
      expect(src).not.toContain("ScrollView");
    });

    it("still has filter state variables", () => {
      expect(src).toContain("neighborhoodFilter");
      expect(src).toContain("priceFilter");
    });

    it("passes filter props to LeaderboardFilterChips", () => {
      expect(src).toContain("setNeighborhoodFilter={setNeighborhoodFilter}");
      expect(src).toContain("setPriceFilter={setPriceFilter}");
    });
  });
});

/**
 * Sprint 477: DateRangeFilter Extraction
 *
 * Tests:
 * 1. New DateRangeFilter.tsx component exists with correct exports
 * 2. RatingHistorySection uses extracted component
 * 3. LOC reduction for RatingHistorySection
 * 4. Re-exports for backward compatibility
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (f: string) => fs.readFileSync(path.resolve(__dirname, "..", f), "utf-8");

describe("Sprint 477: DateRangeFilter Extraction", () => {
  describe("DateRangeFilter.tsx", () => {
    const src = readFile("components/profile/DateRangeFilter.tsx");

    it("exports DateRangeFilter function component", () => {
      expect(src).toContain("export function DateRangeFilter");
    });

    it("exports DateRangePreset type", () => {
      expect(src).toContain("export type DateRangePreset");
    });

    it("exports getPresetDates function", () => {
      expect(src).toContain("export function getPresetDates");
    });

    it("exports applyDateFilter function", () => {
      expect(src).toContain("export function applyDateFilter");
    });

    it("exports DATE_RANGE_PRESETS array", () => {
      expect(src).toContain("DATE_RANGE_PRESETS");
    });

    it("has all 4 preset options plus custom", () => {
      expect(src).toContain("All Time");
      expect(src).toContain("7 Days");
      expect(src).toContain("30 Days");
      expect(src).toContain("90 Days");
      expect(src).toContain("Custom");
    });

    it("imports filterByDateRange from export utils", () => {
      expect(src).toContain("filterByDateRange");
    });

    it("has calendar icon for custom chip", () => {
      expect(src).toContain("calendar-outline");
    });

    it("shows custom range indicator when active", () => {
      expect(src).toContain("customRangeIndicator");
      expect(src).toContain("onwards");
    });

    it("accepts activePreset, onPresetChange, customStart, customEnd props", () => {
      expect(src).toContain("activePreset");
      expect(src).toContain("onPresetChange");
      expect(src).toContain("customStart");
      expect(src).toContain("customEnd");
      expect(src).toContain("onCustomRangeSet");
    });

    it("has own StyleSheet for date filter styles", () => {
      expect(src).toContain("dateFilterRow");
      expect(src).toContain("dateChip");
      expect(src).toContain("dateChipActive");
    });

    it("is under 180 LOC", () => {
      expect(src.split("\n").length).toBeLessThan(180);
    });
  });

  describe("RatingHistorySection.tsx integration", () => {
    const src = readFile("components/profile/RatingHistorySection.tsx");

    it("imports DateRangeFilter from extracted component", () => {
      expect(src).toContain("import { DateRangeFilter");
      expect(src).toContain("@/components/profile/DateRangeFilter");
    });

    it("imports applyDateFilter from extracted module", () => {
      expect(src).toContain("applyDateFilter");
    });

    it("renders DateRangeFilter component", () => {
      expect(src).toContain("<DateRangeFilter");
    });

    it("passes activePreset and onPresetChange props", () => {
      expect(src).toContain("activePreset={datePreset}");
      expect(src).toContain("onPresetChange={handlePresetChange}");
    });

    it("uses applyDateFilter for filtered history", () => {
      expect(src).toContain("applyDateFilter(ratingHistory");
    });

    it("re-exports for backward compatibility", () => {
      expect(src).toContain("export { DateRangeFilter");
      expect(src).toContain("export { getPresetDates");
    });

    it("is under 215 LOC (was 319)", () => {
      expect(src.split("\n").length).toBeLessThan(215);
    });

    it("no longer has inline dateFilterRow style", () => {
      expect(src).not.toContain("dateFilterRow:");
    });

    it("no longer has inline dateChip style", () => {
      expect(src).not.toContain("dateChip:");
    });

    it("still has filteredHistory for pagination and export", () => {
      expect(src).toContain("filteredHistory.length");
      expect(src).toContain("ratings={filteredHistory}");
    });
  });
});

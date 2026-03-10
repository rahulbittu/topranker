/**
 * Sprint 474: Rating History Date Range Filter UI
 * Sprint 477: Tests redirected after DateRangeFilter extraction
 *
 * Tests:
 * 1. DateRangeFilter component has date range types and presets
 * 2. RatingHistorySection integrates with extracted filter
 * 3. Filtered ratings passed to export and display
 * 4. filterByDateRange utility
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 474: Rating History Date Range Filter", () => {
  describe("DateRangeFilter component (extracted Sprint 477)", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../components/profile/DateRangeFilter.tsx"),
      "utf-8"
    );

    it("imports filterByDateRange from rating-export-utils", () => {
      expect(src).toContain('import { filterByDateRange } from "@/lib/rating-export-utils"');
    });

    it("defines DateRangePreset type with all options", () => {
      expect(src).toContain("DateRangePreset");
      expect(src).toContain('"all"');
      expect(src).toContain('"7d"');
      expect(src).toContain('"30d"');
      expect(src).toContain('"90d"');
      expect(src).toContain('"custom"');
    });

    it("has date range preset chips array", () => {
      expect(src).toContain("DATE_RANGE_PRESETS");
      expect(src).toContain("All Time");
      expect(src).toContain("7 Days");
      expect(src).toContain("30 Days");
      expect(src).toContain("90 Days");
    });

    it("has getPresetDates utility function", () => {
      expect(src).toContain("function getPresetDates");
      expect(src).toContain("86400000");
    });

    it("renders date filter chip row", () => {
      expect(src).toContain("dateFilterRow");
      expect(src).toContain("DATE_RANGE_PRESETS.map");
    });

    it("has Custom chip with calendar icon", () => {
      expect(src).toContain("calendar-outline");
      expect(src).toContain("Custom");
      expect(src).toContain("handleCustomRange");
    });

    it("shows custom range indicator when custom is active", () => {
      expect(src).toContain("customRangeIndicator");
      expect(src).toContain("customStart &&");
      expect(src).toContain("onwards");
    });

    it("has active chip styling", () => {
      expect(src).toContain("dateChipActive");
      expect(src).toContain("dateChipTextActive");
    });
  });

  describe("RatingHistorySection integration", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../components/profile/RatingHistorySection.tsx"),
      "utf-8"
    );

    it("tracks datePreset state (default all)", () => {
      expect(src).toContain("datePreset, setDatePreset");
      expect(src).toContain('useState<DateRangePreset>("all")');
    });

    it("tracks custom start and end dates", () => {
      expect(src).toContain("customStart, setCustomStart");
      expect(src).toContain("customEnd, setCustomEnd");
    });

    it("computes filteredHistory using useMemo", () => {
      expect(src).toContain("filteredHistory = useMemo");
      expect(src).toContain("applyDateFilter(ratingHistory");
    });

    it("passes filteredHistory to RatingExportButton", () => {
      expect(src).toContain("ratings={filteredHistory}");
    });

    it("renders filteredHistory.slice for pagination", () => {
      expect(src).toContain("filteredHistory.slice(0, historyPageSize)");
    });

    it("show more uses filteredHistory count", () => {
      expect(src).toContain("filteredHistory.length > historyPageSize");
      expect(src).toContain("filteredHistory.length - historyPageSize");
    });

    it("displays filtered count with total when filter active", () => {
      expect(src).toContain('datePreset !== "all"');
      expect(src).toContain("ratingHistory.length");
    });

    it("resets page size when changing date preset", () => {
      expect(src).toContain("setHistoryPageSize(10)");
    });
  });

  describe("filterByDateRange utility", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../lib/rating-export-utils.ts"),
      "utf-8"
    );

    it("exports filterByDateRange function", () => {
      expect(src).toContain("export function filterByDateRange");
    });

    it("accepts optional startDate and endDate", () => {
      expect(src).toContain("startDate?: string");
      expect(src).toContain("endDate?: string");
    });

    it("filters by start date (inclusive)", () => {
      expect(src).toContain(">= start");
    });

    it("filters by end date (inclusive with +1 day)", () => {
      expect(src).toContain("86400000");
      expect(src).toContain("< end");
    });
  });
});

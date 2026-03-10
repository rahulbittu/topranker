/**
 * Sprint 407: Business hours display improvements
 * Validates week overview dots, next-open-time, duration, relative time
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 407 — Business Hours Display Improvements", () => {
  const hoursSrc = readFile("components/business/OpeningHoursCard.tsx");

  describe("Week overview dots", () => {
    it("defines WeekOverviewDots component", () => {
      expect(hoursSrc).toContain("function WeekOverviewDots");
    });

    it("uses DAY_ABBREVS for compact labels", () => {
      expect(hoursSrc).toContain('DAY_ABBREVS = ["S", "M", "T", "W", "T", "F", "S"]');
    });

    it("renders dot per day with open/closed styling", () => {
      expect(hoursSrc).toContain("weekDotOpen");
      expect(hoursSrc).toContain("weekDotClosed");
    });

    it("highlights today's dot", () => {
      expect(hoursSrc).toContain("weekDotToday");
      expect(hoursSrc).toContain("weekDotLabelToday");
    });

    it("shows dots only in collapsed state", () => {
      expect(hoursSrc).toContain("{!expanded && <WeekOverviewDots");
    });

    it("has weekDots row style", () => {
      expect(hoursSrc).toContain("weekDots:");
      expect(hoursSrc).toContain("weekDotCol:");
    });
  });

  describe("Next opening time", () => {
    it("defines getNextOpenInfo function", () => {
      expect(hoursSrc).toContain("function getNextOpenInfo");
    });

    it("checks up to 7 days ahead", () => {
      expect(hoursSrc).toContain("offset <= 7");
    });

    it("uses 'tomorrow' for next day", () => {
      expect(hoursSrc).toContain('"tomorrow"');
    });

    it("shows day name for further-out days", () => {
      expect(hoursSrc).toContain("DAY_NAMES[idx].charAt(0).toUpperCase()");
    });

    it("returns formatted 'Opens X at Y' string", () => {
      expect(hoursSrc).toContain("`Opens ${dayLabel} at ${openTime}`");
    });
  });

  describe("Hours duration display", () => {
    it("defines getHoursDuration function", () => {
      expect(hoursSrc).toContain("function getHoursDuration");
    });

    it("computes duration from time range", () => {
      expect(hoursSrc).toContain("closeMin - openMin");
    });

    it("formats as hours and minutes", () => {
      expect(hoursSrc).toContain("`${hrs}h ${mins}m`");
      expect(hoursSrc).toContain("`${hrs}h`");
    });

    it("shows duration with hourglass icon when open", () => {
      expect(hoursSrc).toContain('"hourglass-outline"');
      expect(hoursSrc).toContain("durationText");
      expect(hoursSrc).toContain("today");
    });

    it("only shows duration in collapsed state when open", () => {
      expect(hoursSrc).toContain("{!expanded && effectiveOpen && duration");
    });
  });

  describe("Relative time for near-opening", () => {
    it("shows relative time when opening within 2 hours", () => {
      expect(hoursSrc).toContain("minsUntilOpen <= 120");
    });

    it("formats as Opens in Xh Ym or Xmin", () => {
      expect(hoursSrc).toContain("`Opens in ${rel}`");
    });
  });

  describe("Day parsing helpers", () => {
    it("defines DAY_NAMES array", () => {
      expect(hoursSrc).toContain("DAY_NAMES = [");
    });

    it("defines isDayOpen helper", () => {
      expect(hoursSrc).toContain("function isDayOpen");
    });

    it("defines getOpeningTime helper", () => {
      expect(hoursSrc).toContain("function getOpeningTime");
    });
  });

  describe("Existing functionality preserved", () => {
    it("still has parseTime function", () => {
      expect(hoursSrc).toContain("function parseTime");
    });

    it("still has getTodayStatus function", () => {
      expect(hoursSrc).toContain("function getTodayStatus");
    });

    it("still has closing soon badge", () => {
      expect(hoursSrc).toContain("closingSoonBadge");
      expect(hoursSrc).toContain("Closing soon");
    });

    it("still has expanded day list with today highlight", () => {
      expect(hoursSrc).toContain("hoursRowToday");
      expect(hoursSrc).toContain("hoursTextToday");
    });
  });
});

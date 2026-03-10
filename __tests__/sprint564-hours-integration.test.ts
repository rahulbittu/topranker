/**
 * Sprint 564: Hours integration end-to-end test
 * Covers the full pipeline: weekday_text → periods → computeOpenStatus
 * Plus roundtrip conversion and route-level auto-wiring
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { weekdayTextToPeriods, periodsToWeekdayText, computeOpenStatus } from "../server/hours-utils";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

// Standard Dallas Indian restaurant hours
const WEEKDAY_TEXT = [
  "Monday: 11:00 AM – 10:00 PM",
  "Tuesday: 11:00 AM – 10:00 PM",
  "Wednesday: 11:00 AM – 10:00 PM",
  "Thursday: 11:00 AM – 10:00 PM",
  "Friday: 11:00 AM – 11:00 PM",
  "Saturday: 11:00 AM – 11:00 PM",
  "Sunday: 12:00 PM – 9:00 PM",
];

describe("Sprint 564: Hours Integration End-to-End", () => {
  describe("Pipeline: weekday_text → periods → computeOpenStatus", () => {
    const periods = weekdayTextToPeriods(WEEKDAY_TEXT);

    it("converts all 7 days to periods", () => {
      expect(periods).toHaveLength(7);
    });

    it("Monday (day 1) has correct open/close times", () => {
      const mon = periods.find(p => p.open.day === 1);
      expect(mon).toBeDefined();
      expect(mon!.open.time).toBe("1100");
      expect(mon!.close!.time).toBe("2200");
    });

    it("Friday (day 5) closes at 2300", () => {
      const fri = periods.find(p => p.open.day === 5);
      expect(fri).toBeDefined();
      expect(fri!.close!.time).toBe("2300");
    });

    it("Sunday (day 0) opens at 1200, closes at 2100", () => {
      const sun = periods.find(p => p.open.day === 0);
      expect(sun).toBeDefined();
      expect(sun!.open.time).toBe("1200");
      expect(sun!.close!.time).toBe("2100");
    });

    it("computeOpenStatus returns open during business hours", () => {
      // Monday at 2:30 PM Central = should be open
      const monday230pm = new Date("2026-03-09T14:30:00-06:00"); // CST Monday
      const status = computeOpenStatus({ periods }, monday230pm);
      expect(status.isOpen).toBe(true);
      expect(status.closingTime).toBe("22:00");
    });

    it("computeOpenStatus returns closed before opening", () => {
      // Monday at 9:00 AM Central = before 11:00 AM open
      const monday9am = new Date("2026-03-09T09:00:00-06:00");
      const status = computeOpenStatus({ periods }, monday9am);
      expect(status.isOpen).toBe(false);
      expect(status.nextOpenTime).toBe("11:00");
    });

    it("computeOpenStatus returns closed after closing", () => {
      // Monday at 10:30 PM Central = after 10:00 PM close
      const monday1030pm = new Date("2026-03-09T22:30:00-06:00");
      const status = computeOpenStatus({ periods }, monday1030pm);
      expect(status.isOpen).toBe(false);
    });

    it("computeOpenStatus returns todayHours when weekday_text provided", () => {
      const monday230pm = new Date("2026-03-09T14:30:00-06:00");
      const status = computeOpenStatus({ weekday_text: WEEKDAY_TEXT, periods }, monday230pm);
      expect(status.todayHours).toContain("11:00 AM");
      expect(status.todayHours).toContain("10:00 PM");
    });
  });

  describe("Roundtrip: weekday_text → periods → weekday_text", () => {
    it("roundtrips standard hours without loss", () => {
      const periods = weekdayTextToPeriods(WEEKDAY_TEXT);
      const roundtripped = periodsToWeekdayText(periods);
      expect(roundtripped).toHaveLength(7);
      // Check each day matches
      for (let i = 0; i < 7; i++) {
        expect(roundtripped[i]).toBe(WEEKDAY_TEXT[i]);
      }
    });

    it("handles Closed days in roundtrip", () => {
      const withClosed = [...WEEKDAY_TEXT];
      withClosed[0] = "Monday: Closed"; // Closed Monday
      const periods = weekdayTextToPeriods(withClosed);
      expect(periods).toHaveLength(6); // 6 days with periods
      const roundtripped = periodsToWeekdayText(periods);
      expect(roundtripped[0]).toBe("Monday: Closed");
    });

    it("handles 24-hour days in roundtrip", () => {
      const with24h = [...WEEKDAY_TEXT];
      with24h[4] = "Friday: Open 24 hours";
      const periods = weekdayTextToPeriods(with24h);
      const fri = periods.find(p => p.open.day === 5);
      expect(fri).toBeDefined();
      expect(fri!.close).toBeUndefined(); // 24-hour has no close
      const roundtripped = periodsToWeekdayText(periods);
      expect(roundtripped[4]).toBe("Friday: Open 24 hours");
    });
  });

  describe("Edge cases", () => {
    it("overnight hours convert correctly", () => {
      const overnight = [
        "Monday: 5:00 PM – 2:00 AM",
        "Tuesday: Closed",
        "Wednesday: Closed",
        "Thursday: Closed",
        "Friday: 5:00 PM – 2:00 AM",
        "Saturday: 5:00 PM – 2:00 AM",
        "Sunday: Closed",
      ];
      const periods = weekdayTextToPeriods(overnight);
      const mon = periods.find(p => p.open.day === 1);
      expect(mon).toBeDefined();
      expect(mon!.open.time).toBe("1700");
      expect(mon!.close!.day).toBe(2); // closes Tuesday
      expect(mon!.close!.time).toBe("0200");
    });

    it("computeOpenStatus handles null hours gracefully", () => {
      const status = computeOpenStatus(null);
      expect(status.isOpen).toBe(false);
      expect(status.closingTime).toBeNull();
    });

    it("computeOpenStatus handles empty periods", () => {
      const status = computeOpenStatus({ periods: [] });
      expect(status.isOpen).toBe(false);
    });

    it("AM/PM boundary: 12:00 PM converts to 1200", () => {
      const noon = ["Monday: 12:00 PM – 1:00 PM", "Tuesday: Closed", "Wednesday: Closed", "Thursday: Closed", "Friday: Closed", "Saturday: Closed", "Sunday: Closed"];
      const periods = weekdayTextToPeriods(noon);
      const mon = periods.find(p => p.open.day === 1);
      expect(mon!.open.time).toBe("1200");
      expect(mon!.close!.time).toBe("1300");
    });

    it("AM/PM boundary: 12:00 AM converts to 0000", () => {
      const midnight = ["Monday: 12:00 AM – 6:00 AM", "Tuesday: Closed", "Wednesday: Closed", "Thursday: Closed", "Friday: Closed", "Saturday: Closed", "Sunday: Closed"];
      const periods = weekdayTextToPeriods(midnight);
      const mon = periods.find(p => p.open.day === 1);
      expect(mon!.open.time).toBe("0000");
      expect(mon!.close!.time).toBe("0600");
    });
  });

  describe("Route-level auto-wiring (source verification)", () => {
    const routeSrc = readFile("server/routes-owner-dashboard.ts");

    it("PUT /hours route auto-converts weekday_text to periods", () => {
      expect(routeSrc).toContain("weekdayTextToPeriods");
    });

    it("only converts when periods are missing", () => {
      expect(routeSrc).toContain("!openingHours.periods");
    });

    it("imports weekdayTextToPeriods from hours-utils", () => {
      expect(routeSrc).toContain("hours-utils");
    });
  });

  describe("HoursEditor → route → storage pipeline (source verification)", () => {
    const editorSrc = readFile("components/dashboard/HoursEditor.tsx");
    const routeSrc = readFile("server/routes-owner-dashboard.ts");
    const storageSrc = readFile("server/storage/businesses.ts");

    it("HoursEditor submits weekday_text via updateBusinessHours", () => {
      expect(editorSrc).toContain("weekday_text: hours");
      expect(editorSrc).toContain("updateBusinessHours");
    });

    it("route converts weekday_text to periods", () => {
      expect(routeSrc).toContain("weekdayTextToPeriods");
    });

    it("storage function updates openingHours in DB", () => {
      expect(storageSrc).toContain("updateBusinessHours");
      expect(storageSrc).toContain("openingHours");
      expect(storageSrc).toContain("hoursLastUpdated");
    });

    it("computeOpenStatus reads periods from stored data", () => {
      const utilsSrc = readFile("server/hours-utils.ts");
      expect(utilsSrc).toContain("function computeOpenStatus");
      expect(utilsSrc).toContain("hours.periods");
    });
  });
});

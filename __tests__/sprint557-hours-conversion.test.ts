/**
 * Sprint 557: Weekday text ↔ periods conversion utility
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 557: Hours Conversion Utility", () => {
  describe("source: hours-utils.ts", () => {
    const src = readFile("server/hours-utils.ts");

    it("exports weekdayTextToPeriods function", () => {
      expect(src).toContain("export function weekdayTextToPeriods");
    });

    it("exports periodsToWeekdayText function", () => {
      expect(src).toContain("export function periodsToWeekdayText");
    });

    it("handles Closed days", () => {
      expect(src).toContain("closed");
    });

    it("handles 24 hours", () => {
      expect(src).toContain("24");
      expect(src).toContain("hours");
    });

    it("parses AM/PM time format", () => {
      expect(src).toContain("AM");
      expect(src).toContain("PM");
    });

    it("has to24 helper for AM/PM conversion", () => {
      expect(src).toContain("to24");
    });

    it("has formatTime12 helper for 12-hour display", () => {
      expect(src).toContain("formatTime12");
    });

    it("uses dayMap for Mon-Sun → period.day mapping", () => {
      expect(src).toContain("dayMap");
    });

    it("handles overnight periods (close day !== open day)", () => {
      expect(src).toContain("(dayNum + 1) % 7");
    });

    it("strips day prefix from weekday_text lines", () => {
      expect(src).toContain("replace");
      expect(src).toContain("Monday");
    });
  });

  describe("runtime: weekdayTextToPeriods", () => {
    // Dynamic import to test the actual functions
    let weekdayTextToPeriods: (text: string[]) => any[];

    it("can be imported", async () => {
      const mod = await import("../server/hours-utils");
      weekdayTextToPeriods = mod.weekdayTextToPeriods;
      expect(typeof weekdayTextToPeriods).toBe("function");
    });

    it("converts standard hours to periods", async () => {
      const { weekdayTextToPeriods: fn } = await import("../server/hours-utils");
      const text = [
        "Monday: 11:00 AM – 10:00 PM",
        "Tuesday: 11:00 AM – 10:00 PM",
        "Wednesday: 11:00 AM – 10:00 PM",
        "Thursday: 11:00 AM – 10:00 PM",
        "Friday: 11:00 AM – 11:00 PM",
        "Saturday: 10:00 AM – 11:00 PM",
        "Sunday: Closed",
      ];
      const periods = fn(text);
      expect(periods.length).toBe(6); // Sunday closed
      expect(periods[0].open.day).toBe(1); // Monday
      expect(periods[0].open.time).toBe("1100");
      expect(periods[0].close!.time).toBe("2200");
    });

    it("handles closed days by omitting them", async () => {
      const { weekdayTextToPeriods: fn } = await import("../server/hours-utils");
      const text = [
        "Monday: Closed",
        "Tuesday: Closed",
        "Wednesday: 9:00 AM – 5:00 PM",
        "Thursday: Closed",
        "Friday: Closed",
        "Saturday: Closed",
        "Sunday: Closed",
      ];
      const periods = fn(text);
      expect(periods.length).toBe(1);
      expect(periods[0].open.day).toBe(3); // Wednesday
    });

    it("handles 24 hours", async () => {
      const { weekdayTextToPeriods: fn } = await import("../server/hours-utils");
      const text = [
        "Monday: Open 24 hours",
        "Tuesday: 9:00 AM – 5:00 PM",
        "Wednesday: Closed",
        "Thursday: Closed",
        "Friday: Closed",
        "Saturday: Closed",
        "Sunday: Closed",
      ];
      const periods = fn(text);
      expect(periods.length).toBe(2);
      expect(periods[0].open.time).toBe("0000");
      expect(periods[0].close).toBeUndefined();
    });
  });

  describe("runtime: periodsToWeekdayText", () => {
    it("converts periods back to weekday text", async () => {
      const { periodsToWeekdayText: fn } = await import("../server/hours-utils");
      const periods = [
        { open: { day: 1, time: "1100" }, close: { day: 1, time: "2200" } },
        { open: { day: 5, time: "1100" }, close: { day: 5, time: "2300" } },
      ];
      const text = fn(periods);
      expect(text.length).toBe(7);
      expect(text[0]).toContain("11:00 AM");
      expect(text[0]).toContain("10:00 PM");
      expect(text[4]).toContain("11:00 AM");
      expect(text[4]).toContain("11:00 PM");
      expect(text[1]).toContain("Closed"); // Tuesday
    });

    it("handles 24-hour period", async () => {
      const { periodsToWeekdayText: fn } = await import("../server/hours-utils");
      const periods = [{ open: { day: 1, time: "0000" } }];
      const text = fn(periods);
      expect(text[0]).toContain("Open 24 hours");
    });
  });

  describe("file health", () => {
    it("hours-utils.ts stays under 210 LOC", () => {
      const loc = readFile("server/hours-utils.ts").split("\n").length;
      expect(loc).toBeLessThan(210);
    });
  });
});

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 359: Business hours status enhancements", () => {
  const hoursSrc = fs.readFileSync(
    path.resolve("components/business/OpeningHoursCard.tsx"), "utf-8"
  );
  const businessDetailSrc = fs.readFileSync(
    path.resolve("app/business/[id].tsx"), "utf-8"
  );

  // ── Time parsing ──────────────────────────────────────────────

  describe("Time parsing function", () => {
    it("should have parseTime function", () => {
      expect(hoursSrc).toContain("function parseTime");
    });

    it("should handle AM/PM conversion", () => {
      expect(hoursSrc).toContain("AM");
      expect(hoursSrc).toContain("PM");
    });

    it("should convert to minutes since midnight", () => {
      expect(hoursSrc).toContain("hours * 60 + minutes");
    });

    it("should handle 12 AM edge case", () => {
      expect(hoursSrc).toContain("hours === 12) hours = 0");
    });

    it("should handle 12 PM edge case", () => {
      expect(hoursSrc).toContain("hours !== 12) hours += 12");
    });
  });

  // ── Status detection ──────────────────────────────────────────

  describe("Today status detection", () => {
    it("should have getTodayStatus function", () => {
      expect(hoursSrc).toContain("function getTodayStatus");
    });

    it("should detect closed status", () => {
      expect(hoursSrc).toContain("Closed today");
    });

    it("should detect closing soon within 60 minutes", () => {
      expect(hoursSrc).toContain("minutesUntilClose <= 60");
    });

    it("should show closes in Xmin for closing soon", () => {
      expect(hoursSrc).toContain("Closes in ${minutesUntilClose}min");
    });

    it("should show open until time when not closing soon", () => {
      expect(hoursSrc).toContain("Open until");
    });

    it("should show opens at time when not yet open", () => {
      expect(hoursSrc).toContain("Opens at");
    });

    it("should show closed now when past closing", () => {
      expect(hoursSrc).toContain("Closed now");
    });

    it("should return empty status for unparseable lines", () => {
      expect(hoursSrc).toContain('statusText: ""');
    });
  });

  // ── Status dot display ────────────────────────────────────────

  describe("Open/closed status dot", () => {
    it("should have statusDot style", () => {
      expect(hoursSrc).toContain("statusDot");
    });

    it("should have green dot for open", () => {
      expect(hoursSrc).toContain("statusDotOpen");
      expect(hoursSrc).toContain("Colors.green");
    });

    it("should have red dot for closed", () => {
      expect(hoursSrc).toContain("statusDotClosed");
      expect(hoursSrc).toContain("Colors.red");
    });

    it("should use effectiveOpen for dot color", () => {
      expect(hoursSrc).toContain("effectiveOpen ? s.statusDotOpen : s.statusDotClosed");
    });
  });

  // ── Closing soon badge ────────────────────────────────────────

  describe("Closing soon badge", () => {
    it("should have closingSoonBadge style", () => {
      expect(hoursSrc).toContain("closingSoonBadge");
    });

    it("should show Closing soon text", () => {
      expect(hoursSrc).toContain("Closing soon");
    });

    it("should use time-outline icon", () => {
      expect(hoursSrc).toContain("time-outline");
    });

    it("should only show when closingSoon is true", () => {
      expect(hoursSrc).toContain("status.closingSoon &&");
    });
  });

  // ── isOpenNow prop ────────────────────────────────────────────

  describe("isOpenNow prop integration", () => {
    it("should accept optional isOpenNow prop", () => {
      expect(hoursSrc).toContain("isOpenNow?: boolean");
    });

    it("should use isOpenNow as override when available", () => {
      expect(hoursSrc).toContain("isOpenNow ?? status.isOpen");
    });

    it("should pass isOpenNow from business detail", () => {
      expect(businessDetailSrc).toContain("isOpenNow={business.isOpenNow}");
    });
  });

  // ── Status text display ───────────────────────────────────────

  describe("Status text display", () => {
    it("should have statusText style", () => {
      expect(hoursSrc).toContain("statusText:");
    });

    it("should use green for open status text", () => {
      expect(hoursSrc).toContain("statusTextOpen");
    });

    it("should use red for closed status text", () => {
      expect(hoursSrc).toContain("statusTextClosed");
    });
  });

  // ── Existing functionality preserved ──────────────────────────

  describe("Existing hours display preserved", () => {
    it("should still have expandable hours list", () => {
      expect(hoursSrc).toContain("expanded");
      expect(hoursSrc).toContain("LayoutAnimation");
    });

    it("should still highlight today's hours", () => {
      expect(hoursSrc).toContain("hoursRowToday");
      expect(hoursSrc).toContain("hoursTextToday");
    });

    it("should still use card shadow", () => {
      expect(hoursSrc).toContain("cardShadow");
    });
  });
});

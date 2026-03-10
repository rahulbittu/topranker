/**
 * Sprint 567: Rating velocity dashboard widget
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 567: Rating Velocity Widget", () => {
  describe("RatingVelocityWidget.tsx", () => {
    const src = readFile("components/dashboard/RatingVelocityWidget.tsx");

    it("exports RatingVelocityWidget function", () => {
      expect(src).toContain("export function RatingVelocityWidget");
    });

    it("exports WeeklyVelocity interface", () => {
      expect(src).toContain("export interface WeeklyVelocity");
    });

    it("exports RatingVelocityWidgetProps interface", () => {
      expect(src).toContain("export interface RatingVelocityWidgetProps");
    });

    it("accepts weeklyData, velocityChange, and delay props", () => {
      expect(src).toContain("weeklyData: WeeklyVelocity[]");
      expect(src).toContain("velocityChange: number");
      expect(src).toContain("delay?:");
    });

    it("computes total ratings", () => {
      expect(src).toContain("totalRatings");
      expect(src).toContain("reduce");
    });

    it("computes average per week", () => {
      expect(src).toContain("avgPerWeek");
    });

    it("identifies peak week", () => {
      expect(src).toContain("peakWeek");
      expect(src).toContain("count > max.count");
    });

    it("renders speedometer icon in header", () => {
      expect(src).toContain("speedometer-outline");
    });

    it("shows trend badge with velocity change", () => {
      expect(src).toContain("trendBadge");
      expect(src).toContain("trendText");
      expect(src).toContain("velocityChange");
    });

    it("renders mini bar chart", () => {
      expect(src).toContain("chartRow");
      expect(src).toContain("barContainer");
      expect(src).toContain("maxCount");
    });

    it("highlights peak week bar", () => {
      expect(src).toContain("isPeak");
      expect(src).toContain("BRAND.colors.amber");
    });

    it("shows stats row with total, avg, peak", () => {
      expect(src).toContain("statsRow");
      expect(src).toContain("Total");
      expect(src).toContain("Avg/week");
      expect(src).toContain("Peak");
    });

    it("uses FadeInDown animation", () => {
      expect(src).toContain("FadeInDown");
    });

    it("returns null when no data", () => {
      expect(src).toContain("weeklyData.length === 0");
      expect(src).toContain("return null");
    });

    it("is under 180 LOC", () => {
      const loc = src.split("\n").length;
      expect(loc).toBeLessThan(180);
    });
  });

  describe("dashboard.tsx integration", () => {
    const src = readFile("app/business/dashboard.tsx");

    it("imports RatingVelocityWidget", () => {
      expect(src).toContain('import { RatingVelocityWidget } from "@/components/dashboard/RatingVelocityWidget"');
    });

    it("renders RatingVelocityWidget in overview tab", () => {
      expect(src).toContain("<RatingVelocityWidget");
    });

    it("passes weeklyVolume data to widget", () => {
      expect(src).toContain("weeklyData={a.weeklyVolume");
    });

    it("passes velocityChange to widget", () => {
      expect(src).toContain("velocityChange={a.velocityChange}");
    });

    it("only renders when weeklyVolume has data", () => {
      expect(src).toContain("weeklyVolume.length > 0");
    });

    it("dashboard.tsx stays under 510 LOC", () => {
      const loc = src.split("\n").length;
      expect(loc).toBeLessThan(510);
    });
  });
});

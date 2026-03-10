/**
 * Sprint 478: Business Owner Dashboard Analytics
 *
 * Tests:
 * 1. dashboard-analytics.ts exports and structure
 * 2. routes-businesses.ts dashboard endpoint integration
 * 3. Pro vs Free tiering for trend data
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 478: Dashboard Analytics", () => {
  describe("dashboard-analytics.ts module", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../server/dashboard-analytics.ts"),
      "utf-8"
    );

    it("exports RatingVolumePoint interface", () => {
      expect(src).toContain("export interface RatingVolumePoint");
      expect(src).toContain("period: string");
      expect(src).toContain("count: number");
      expect(src).toContain("avgScore: number");
    });

    it("exports DashboardTrend interface", () => {
      expect(src).toContain("export interface DashboardTrend");
      expect(src).toContain("weeklyVolume: RatingVolumePoint[]");
      expect(src).toContain("monthlyVolume: RatingVolumePoint[]");
      expect(src).toContain("velocityChange: number");
      expect(src).toContain("sparklineScores: number[]");
    });

    it("exports computeWeeklyVolume with default 12 weeks", () => {
      expect(src).toContain("export function computeWeeklyVolume");
      expect(src).toContain("weeks: number = 12");
    });

    it("computes weekly volume by iterating weeks backwards", () => {
      expect(src).toContain("for (let w = weeks - 1; w >= 0; w--)");
      expect(src).toContain("7 * 86400000");
    });

    it("calculates average score per week", () => {
      expect(src).toContain("parseFloat(r.rawScore)");
      expect(src).toContain("scores.reduce((a, b) => a + b, 0)");
    });

    it("exports computeMonthlyVolume with default 6 months", () => {
      expect(src).toContain("export function computeMonthlyVolume");
      expect(src).toContain("months: number = 6");
    });

    it("computes monthly volume using calendar months", () => {
      expect(src).toContain("now.getMonth() - m");
      expect(src).toContain("now.getMonth() - m + 1");
    });

    it("exports computeVelocityChange function", () => {
      expect(src).toContain("export function computeVelocityChange");
    });

    it("compares recent 2 weeks vs previous 2 weeks for velocity", () => {
      expect(src).toContain("weeklyVolume.slice(-2)");
      expect(src).toContain("weeklyVolume.slice(-4, -2)");
    });

    it("handles zero previous volume gracefully", () => {
      expect(src).toContain("if (previous === 0) return recent > 0 ? 100 : 0");
    });

    it("exports extractSparklineScores with default limit 20", () => {
      expect(src).toContain("export function extractSparklineScores");
      expect(src).toContain("limit: number = 20");
    });

    it("reverses sparkline scores for chart rendering (oldest to newest)", () => {
      expect(src).toContain(".reverse()");
      expect(src).toContain("Oldest to newest");
    });

    it("exports buildDashboardTrend as main entry point", () => {
      expect(src).toContain("export function buildDashboardTrend");
      expect(src).toContain("computeWeeklyVolume(ratings)");
      expect(src).toContain("computeMonthlyVolume(ratings)");
      expect(src).toContain("computeVelocityChange(weeklyVolume)");
      expect(src).toContain("extractSparklineScores(ratings)");
    });

    it("is under 150 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(150);
    });
  });

  describe("routes-businesses.ts dashboard integration", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../server/routes-businesses.ts"),
      "utf-8"
    );

    it("imports buildDashboardTrend from dashboard-analytics", () => {
      expect(src).toContain('import { buildDashboardTrend } from "./dashboard-analytics"');
    });

    it("fetches all ratings for trend analysis (200 limit)", () => {
      expect(src).toContain("getBusinessRatings(business.id, 1, 200)");
      expect(src).toContain("all ratings for trend analysis");
    });

    it("calls buildDashboardTrend with allRatingsResult", () => {
      expect(src).toContain("buildDashboardTrend(allRatingsResult.ratings");
    });

    it("includes weeklyVolume in dashboard response", () => {
      expect(src).toContain("weeklyVolume:");
      expect(src).toContain("trendData.weeklyVolume");
    });

    it("includes monthlyVolume in dashboard response", () => {
      expect(src).toContain("monthlyVolume:");
      expect(src).toContain("trendData.monthlyVolume");
    });

    it("includes velocityChange in dashboard response", () => {
      expect(src).toContain("velocityChange: trendData.velocityChange");
    });

    it("includes sparklineScores in dashboard response", () => {
      expect(src).toContain("sparklineScores: trendData.sparklineScores");
    });

    it("tiers weeklyVolume: Pro gets full, Free gets last 4 weeks", () => {
      expect(src).toContain("isPro ? trendData.weeklyVolume : trendData.weeklyVolume.slice(-4)");
    });

    it("tiers monthlyVolume: Pro gets full, Free gets last 3 months", () => {
      expect(src).toContain("isPro ? trendData.monthlyVolume : trendData.monthlyVolume.slice(-3)");
    });
  });
});

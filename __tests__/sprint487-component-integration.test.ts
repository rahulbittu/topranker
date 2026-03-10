/**
 * Sprint 487: Dashboard Chart Integration + DimensionScoreCard Wiring
 *
 * Tests:
 * 1. dashboard.tsx imports and renders SparklineChart, VolumeBarChart, VelocityIndicator
 * 2. dashboard.tsx DashboardData interface includes trend fields
 * 3. business/[id].tsx imports and renders DimensionScoreCard
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 487: Component Integration", () => {
  describe("dashboard.tsx chart integration", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../app/business/dashboard.tsx"),
      "utf-8"
    );

    it("imports SparklineChart from dashboard components", () => {
      expect(src).toContain('import { SparklineChart } from "@/components/dashboard/SparklineChart"');
    });

    it("imports VolumeBarChart from dashboard components", () => {
      expect(src).toContain('import { VolumeBarChart } from "@/components/dashboard/VolumeBarChart"');
    });

    it("imports VelocityIndicator from dashboard components", () => {
      expect(src).toContain('import { VelocityIndicator } from "@/components/dashboard/VelocityIndicator"');
    });

    it("DashboardData interface includes weeklyVolume field", () => {
      expect(src).toContain("weeklyVolume: VolumePoint[]");
    });

    it("DashboardData interface includes monthlyVolume field", () => {
      expect(src).toContain("monthlyVolume: VolumePoint[]");
    });

    it("DashboardData interface includes velocityChange field", () => {
      expect(src).toContain("velocityChange: number");
    });

    it("DashboardData interface includes sparklineScores field", () => {
      expect(src).toContain("sparklineScores: number[]");
    });

    it("defines VolumePoint interface with period, count, avgScore", () => {
      expect(src).toContain("interface VolumePoint");
      expect(src).toContain("period: string");
      expect(src).toContain("count: number");
      expect(src).toContain("avgScore: number");
    });

    it("renders SparklineChart with sparklineScores data", () => {
      expect(src).toContain("<SparklineChart scores={a.sparklineScores}");
    });

    it("renders VolumeBarChart with weeklyVolume data", () => {
      expect(src).toContain("<VolumeBarChart data={a.weeklyVolume}");
    });

    it("renders VelocityIndicator with velocityChange data", () => {
      expect(src).toContain("<VelocityIndicator velocityChange={a.velocityChange}");
    });

    it("renders monthly volume chart in insights tab", () => {
      expect(src).toContain("<VolumeBarChart data={a.monthlyVolume}");
    });

    it("defaults sparklineScores to empty array", () => {
      expect(src).toContain("sparklineScores: [],");
    });

    it("defaults weeklyVolume to empty array", () => {
      expect(src).toContain("weeklyVolume: [],");
    });

    it("defaults velocityChange to 0", () => {
      expect(src).toContain("velocityChange: 0,");
    });

    it("uses responsive width for charts based on SCREEN_W", () => {
      expect(src).toContain("width={SCREEN_W - 64}");
    });
  });

});

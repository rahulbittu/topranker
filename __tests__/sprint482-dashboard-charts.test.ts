/**
 * Sprint 482: Dashboard Chart Components
 *
 * Tests:
 * 1. SparklineChart component structure
 * 2. VolumeBarChart component structure
 * 3. VelocityIndicator component structure
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const DASHBOARD_DIR = path.resolve(__dirname, "../components/dashboard");

describe("Sprint 482: Dashboard Chart Components", () => {
  describe("SparklineChart", () => {
    const src = fs.readFileSync(path.join(DASHBOARD_DIR, "SparklineChart.tsx"), "utf-8");

    it("exports SparklineChart function component", () => {
      expect(src).toContain("export function SparklineChart");
    });

    it("exports SparklineChartProps interface", () => {
      expect(src).toContain("export interface SparklineChartProps");
    });

    it("accepts scores array, width, height, label props", () => {
      expect(src).toContain("scores: number[]");
      expect(src).toContain("width?: number");
      expect(src).toContain("height?: number");
      expect(src).toContain("label?: string");
    });

    it("shows empty state for less than 2 scores", () => {
      expect(src).toContain("scores.length < 2");
      expect(src).toContain("Not enough data");
    });

    it("computes min/max range for normalization", () => {
      expect(src).toContain("Math.min(...scores)");
      expect(src).toContain("Math.max(...scores)");
    });

    it("renders dots at computed positions", () => {
      expect(src).toContain("points.map");
      expect(src).toContain("left: p.x");
      expect(src).toContain("top: p.y");
    });

    it("shows trend color based on first vs last score", () => {
      expect(src).toContain("trendUp = scores[scores.length - 1] >= scores[0]");
      expect(src).toContain("trendColor");
    });

    it("shows endpoint values when showEndpoints is true", () => {
      expect(src).toContain("showEndpoints");
      expect(src).toContain("endpointRow");
      expect(src).toContain("scores[0].toFixed(1)");
    });
  });

  describe("VolumeBarChart", () => {
    const src = fs.readFileSync(path.join(DASHBOARD_DIR, "VolumeBarChart.tsx"), "utf-8");

    it("exports VolumeBarChart function component", () => {
      expect(src).toContain("export function VolumeBarChart");
    });

    it("exports VolumeBarChartProps and VolumePoint interfaces", () => {
      expect(src).toContain("export interface VolumeBarChartProps");
      expect(src).toContain("export interface VolumePoint");
    });

    it("VolumePoint has period, count, avgScore", () => {
      expect(src).toContain("period: string");
      expect(src).toContain("count: number");
      expect(src).toContain("avgScore: number");
    });

    it("shows empty state for no data", () => {
      expect(src).toContain("data.length === 0");
      expect(src).toContain("No data available");
    });

    it("normalizes bar heights relative to max count", () => {
      expect(src).toContain("Math.max(...data.map(d => d.count)");
      expect(src).toContain("(d.count / maxCount) * chartH");
    });

    it("renders bars with computed width based on data length", () => {
      expect(src).toContain("barWidth");
      expect(src).toContain("data.map");
    });

    it("shows period labels when showLabels is true", () => {
      expect(src).toContain("showLabels");
      expect(src).toContain("formatPeriodLabel");
    });

    it("shows count above each bar", () => {
      expect(src).toContain("barCount");
      expect(src).toContain("{d.count}");
    });
  });

  describe("VelocityIndicator", () => {
    const src = fs.readFileSync(path.join(DASHBOARD_DIR, "VelocityIndicator.tsx"), "utf-8");

    it("exports VelocityIndicator function component", () => {
      expect(src).toContain("export function VelocityIndicator");
    });

    it("exports VelocityIndicatorProps interface", () => {
      expect(src).toContain("export interface VelocityIndicatorProps");
    });

    it("accepts velocityChange and label props", () => {
      expect(src).toContain("velocityChange: number");
      expect(src).toContain("label?: string");
    });

    it("shows trending-up icon for positive velocity", () => {
      expect(src).toContain("trending-up");
      expect(src).toContain("isPositive");
    });

    it("shows trending-down icon for negative velocity", () => {
      expect(src).toContain("trending-down");
    });

    it("shows neutral state for zero change", () => {
      expect(src).toContain("isNeutral");
      expect(src).toContain("No change");
      expect(src).toContain("remove-outline");
    });

    it("displays percentage change text", () => {
      expect(src).toContain("absChange");
      expect(src).toContain('`${isPositive ? "+" : "-"}${absChange}%`');
    });

    it("uses green for positive, red for negative colors", () => {
      expect(src).toContain("#22C55E");
      expect(src).toContain("#EF4444");
    });

    it("shows descriptive sublabel", () => {
      expect(src).toContain("More ratings than previous period");
      expect(src).toContain("Fewer ratings than previous period");
    });
  });
});

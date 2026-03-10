/**
 * Sprint 484: Rating Dimension Breakdown
 *
 * Tests:
 * 1. dimension-breakdown.ts computation module
 * 2. DimensionScoreCard component structure
 * 3. routes-businesses.ts endpoint integration
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 484: Dimension Breakdown", () => {
  describe("dimension-breakdown.ts computation module", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../server/dimension-breakdown.ts"),
      "utf-8"
    );

    it("exports computeDimensionBreakdown function", () => {
      expect(src).toContain("export function computeDimensionBreakdown");
    });

    it("exports DimensionBreakdownResult interface", () => {
      expect(src).toContain("export interface DimensionBreakdownResult");
      expect(src).toContain("dimensions: DimensionData");
      expect(src).toContain("visitTypeDistribution: VisitTypeDistribution");
      expect(src).toContain('primaryVisitType: "dineIn" | "delivery" | "takeaway"');
    });

    it("exports DimensionData interface with all 6 dimensions", () => {
      expect(src).toContain("export interface DimensionData");
      expect(src).toContain("food: number");
      expect(src).toContain("service: number");
      expect(src).toContain("vibe: number");
      expect(src).toContain("packaging: number");
      expect(src).toContain("waitTime: number");
      expect(src).toContain("value: number");
    });

    it("exports VisitTypeDistribution interface", () => {
      expect(src).toContain("export interface VisitTypeDistribution");
      expect(src).toContain("dineIn: number");
      expect(src).toContain("delivery: number");
      expect(src).toContain("takeaway: number");
    });

    it("counts visit type distribution from ratings", () => {
      expect(src).toContain("dist.dineIn++");
      expect(src).toContain("dist.delivery++");
      expect(src).toContain("dist.takeaway++");
    });

    it("computes averages for each dimension", () => {
      expect(src).toContain("avgOrZero(food)");
      expect(src).toContain("avgOrZero(service)");
      expect(src).toContain("avgOrZero(vibe)");
      expect(src).toContain("avgOrZero(packaging)");
      expect(src).toContain("avgOrZero(waitTime)");
      expect(src).toContain("avgOrZero(value)");
    });

    it("determines primary visit type from max count", () => {
      expect(src).toContain("primaryVisitType");
      expect(src).toContain("Math.max(dist.dineIn, dist.delivery, dist.takeaway)");
    });

    it("handles null dimension scores gracefully", () => {
      expect(src).toContain("toNum");
      expect(src).toContain("if (f !== null) food.push(f)");
    });
  });

  describe("DimensionScoreCard component", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../components/business/DimensionScoreCard.tsx"),
      "utf-8"
    );

    it("exports DimensionScoreCard function component", () => {
      expect(src).toContain("export function DimensionScoreCard");
    });

    it("exports DIMENSION_CONFIGS with visit type definitions", () => {
      expect(src).toContain("export const DIMENSION_CONFIGS");
      expect(src).toContain("dineIn:");
      expect(src).toContain("delivery:");
      expect(src).toContain("takeaway:");
    });

    it("defines dine-in dimensions: Food 50%, Service 25%, Vibe 25%", () => {
      expect(src).toContain('weight: 0.50');
      expect(src).toContain('weight: 0.25');
    });

    it("queries dimension-breakdown API endpoint", () => {
      expect(src).toContain("/api/businesses/${businessId}/dimension-breakdown");
    });

    it("renders horizontal score bars for each dimension", () => {
      expect(src).toContain("barContainer");
      expect(src).toContain("barFill");
      expect(src).toContain("width:");
    });

    it("shows dimension weight percentage", () => {
      expect(src).toContain("dimensionWeight");
      expect(src).toContain("Math.round(dim.weight * 100)");
    });

    it("shows visit type distribution bar", () => {
      expect(src).toContain("distributionBar");
      expect(src).toContain("segmentDineIn");
      expect(src).toContain("segmentDelivery");
      expect(src).toContain("segmentTakeaway");
    });

    it("shows distribution legend with percentages", () => {
      expect(src).toContain("DistributionLabel");
      expect(src).toContain("legendDot");
      expect(src).toContain("Math.round((count / total) * 100)");
    });

    it("returns null for zero ratings", () => {
      expect(src).toContain("data.totalRatings === 0) return null");
    });
  });

  describe("routes-business-analytics.ts endpoint", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../server/routes-business-analytics.ts"),
      "utf-8"
    );

    it("imports computeDimensionBreakdown from dimension-breakdown", () => {
      expect(src).toContain('import { computeDimensionBreakdown } from "./dimension-breakdown"');
    });

    it("has GET /api/businesses/:id/dimension-breakdown endpoint", () => {
      expect(src).toContain('"/api/businesses/:id/dimension-breakdown"');
    });

    it("calls computeDimensionBreakdown with ratings", () => {
      expect(src).toContain("computeDimensionBreakdown(ratings");
    });
  });
});

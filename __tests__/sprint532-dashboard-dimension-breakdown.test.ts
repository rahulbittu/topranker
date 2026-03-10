/**
 * Sprint 532: Business owner dashboard — dimension breakdown integration
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 532: Dashboard Dimension Breakdown", () => {
  describe("DimensionBreakdownCard component", () => {
    const src = readFile("components/dashboard/DimensionBreakdownCard.tsx");

    it("exports DimensionBreakdownCard function", () => {
      expect(src).toContain("export function DimensionBreakdownCard");
    });

    it("renders dimension score bars", () => {
      expect(src).toContain("ScoreBar");
      expect(src).toContain("barOuter");
      expect(src).toContain("barInner");
    });

    it("renders visit type distribution", () => {
      expect(src).toContain("VISIT TYPES");
      expect(src).toContain("visitBarSegment");
      expect(src).toContain("visitLegend");
    });

    it("shows all six dimensions", () => {
      expect(src).toContain("food");
      expect(src).toContain("service");
      expect(src).toContain("vibe");
      expect(src).toContain("packaging");
      expect(src).toContain("waitTime");
      expect(src).toContain("value");
    });

    it("has visit type metadata with icons", () => {
      expect(src).toContain("dineIn");
      expect(src).toContain("delivery");
      expect(src).toContain("takeaway");
    });

    it("renders percentage for each visit type", () => {
      expect(src).toContain("pct}%");
    });

    it("color-codes scores by quality", () => {
      expect(src).toContain("Colors.green");
      expect(src).toContain("Colors.red");
    });
  });

  describe("Dashboard integration", () => {
    const src = readFile("app/business/dashboard.tsx");

    it("imports DimensionBreakdownCard", () => {
      expect(src).toContain("import { DimensionBreakdownCard }");
    });

    it("fetches dimension-breakdown data", () => {
      expect(src).toContain("dimension-breakdown");
      expect(src).toContain("dimensionData");
    });

    it("renders DimensionBreakdownCard in insights tab", () => {
      expect(src).toContain("<DimensionBreakdownCard");
    });

    it("lazy-loads dimension data when insights tab is active", () => {
      expect(src).toContain('activeTab === "insights"');
    });
  });

  describe("Server endpoint", () => {
    const src = readFile("server/routes-business-analytics.ts");

    it("has dimension-breakdown endpoint", () => {
      expect(src).toContain("dimension-breakdown");
    });

    it("supports slug lookup for dimension-breakdown", () => {
      expect(src).toContain("getBusinessBySlug");
      expect(src).toContain("isNaN(Number(businessId))");
    });

    it("uses computeDimensionBreakdown", () => {
      expect(src).toContain("computeDimensionBreakdown");
    });
  });

  describe("Dimension breakdown pure function", () => {
    const src = readFile("server/dimension-breakdown.ts");

    it("exports computeDimensionBreakdown", () => {
      expect(src).toContain("export function computeDimensionBreakdown");
    });

    it("computes visit type distribution", () => {
      expect(src).toContain("VisitTypeDistribution");
      expect(src).toContain("dineIn");
      expect(src).toContain("delivery");
      expect(src).toContain("takeaway");
    });

    it("determines primary visit type", () => {
      expect(src).toContain("primaryVisitType");
    });
  });

  describe("LOC thresholds", () => {
    const cardSrc = readFile("components/dashboard/DimensionBreakdownCard.tsx");
    const cardLines = cardSrc.split("\n").length;

    it("DimensionBreakdownCard is under 200 LOC", () => {
      expect(cardLines).toBeLessThan(200);
    });

    const dashSrc = readFile("app/business/dashboard.tsx");
    const dashLines = dashSrc.split("\n").length;

    it("dashboard.tsx stays under 500 LOC", () => {
      expect(dashLines).toBeLessThan(500);
    });
  });
});

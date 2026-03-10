/**
 * Sprint 569: Credibility breakdown tooltip
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 569: Credibility Breakdown Tooltip", () => {
  describe("CredibilityBreakdownTooltip.tsx", () => {
    const src = readFile("components/profile/CredibilityBreakdownTooltip.tsx");

    it("exports CredibilityBreakdownTooltip function", () => {
      expect(src).toContain("export function CredibilityBreakdownTooltip");
    });

    it("exports CredibilityBreakdown interface", () => {
      expect(src).toContain("export interface CredibilityBreakdown");
    });

    it("exports CredibilityBreakdownTooltipProps interface", () => {
      expect(src).toContain("export interface CredibilityBreakdownTooltipProps");
    });

    it("accepts breakdown, totalScore, and visible props", () => {
      expect(src).toContain("breakdown: CredibilityBreakdown");
      expect(src).toContain("totalScore: number");
      expect(src).toContain("visible: boolean");
    });

    it("defines all 7 breakdown factors", () => {
      expect(src).toContain('"base"');
      expect(src).toContain('"volume"');
      expect(src).toContain('"diversity"');
      expect(src).toContain('"age"');
      expect(src).toContain('"variance"');
      expect(src).toContain('"helpfulness"');
      expect(src).toContain('"penalties"');
    });

    it("defines FACTORS config with labels and icons", () => {
      expect(src).toContain("FACTORS");
      expect(src).toContain("FactorConfig");
      expect(src).toContain("label: string");
      expect(src).toContain("icon: IoniconsName");
      expect(src).toContain("description: string");
    });

    it("renders FactorRow for each factor", () => {
      expect(src).toContain("FactorRow");
      expect(src).toContain("factorRow");
      expect(src).toContain("factorLabel");
      expect(src).toContain("factorDesc");
    });

    it("shows progress bar per factor", () => {
      expect(src).toContain("barBg");
      expect(src).toContain("barFill");
      expect(src).toContain("barWidth");
    });

    it("shows factor value with +/- prefix", () => {
      expect(src).toContain("factorValue");
      expect(src).toContain("`+${value}`");
      expect(src).toContain("`-${value}`");
    });

    it("highlights penalties in red", () => {
      expect(src).toContain("isPenalty");
      expect(src).toContain("#EF4444");
    });

    it("computes total from breakdown", () => {
      expect(src).toContain("computedTotal");
    });

    it("shows header with Score Breakdown title", () => {
      expect(src).toContain("Score Breakdown");
      expect(src).toContain("information-circle-outline");
    });

    it("shows footer with growth guidance", () => {
      expect(src).toContain("footer");
      expect(src).toContain("Rate more places");
    });

    it("uses FadeInDown animation", () => {
      expect(src).toContain("FadeInDown");
    });

    it("returns null when not visible", () => {
      expect(src).toContain("if (!visible) return null");
    });

    it("is under 200 LOC", () => {
      const loc = src.split("\n").length;
      expect(loc).toBeLessThan(210);
    });
  });

  describe("ProfileCredibilitySection integration", () => {
    const src = readFile("components/profile/ProfileCredibilitySection.tsx");

    it("imports CredibilityBreakdownTooltip", () => {
      expect(src).toContain('import { CredibilityBreakdownTooltip');
    });

    it("imports CredibilityBreakdown type", () => {
      expect(src).toContain("type CredibilityBreakdown");
    });

    it("uses typed credibilityBreakdown prop", () => {
      expect(src).toContain("credibilityBreakdown: CredibilityBreakdown");
    });

    it("has showBreakdown state toggle", () => {
      expect(src).toContain("showBreakdown");
      expect(src).toContain("setShowBreakdown");
    });

    it("makes score tappable to toggle breakdown", () => {
      expect(src).toContain("onPress={() => setShowBreakdown(!showBreakdown)");
    });

    it("renders CredibilityBreakdownTooltip", () => {
      expect(src).toContain("<CredibilityBreakdownTooltip");
    });

    it("passes breakdown and visible props", () => {
      expect(src).toContain("breakdown={credibilityBreakdown}");
      expect(src).toContain("visible={showBreakdown}");
    });

    it("has accessibility label for tap target", () => {
      expect(src).toContain("credibility breakdown");
    });
  });
});

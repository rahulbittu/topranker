/**
 * Sprint 523: Push Experiment Results Dashboard
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 523: Experiment Results Dashboard", () => {
  describe("components/admin/ExperimentResultsCard.tsx", () => {
    const src = readFile("components/admin/ExperimentResultsCard.tsx");

    it("exports ExperimentResultsCard component", () => {
      expect(src).toContain("export function ExperimentResultsCard");
    });

    it("accepts experiments prop", () => {
      expect(src).toContain("experiments: PushExperimentData[]");
    });

    it("renders ConfidenceBar with lower/center/upper", () => {
      expect(src).toContain("function ConfidenceBar");
      expect(src).toContain("lower: number");
      expect(src).toContain("center: number");
      expect(src).toContain("upper: number");
    });

    it("renders confidence interval track with bar and center marker", () => {
      expect(src).toContain("ciTrack");
      expect(src).toContain("ciBar");
      expect(src).toContain("ciCenter");
    });

    it("renders WinnerBadge with variant name and lift", () => {
      expect(src).toContain("function WinnerBadge");
      expect(src).toContain("variant: string");
      expect(src).toContain("lift: number");
      expect(src).toContain("trophy");
    });

    it("shows lift percentage in winner badge", () => {
      expect(src).toContain("lift.toFixed(1)");
      expect(src).toContain("% lift");
    });

    it("renders SignificanceMeter", () => {
      expect(src).toContain("function SignificanceMeter");
      expect(src).toContain("Statistically significant");
      expect(src).toContain("Insufficient data");
    });

    it("uses green/red dot for significance status", () => {
      expect(src).toContain("sigDot");
      expect(src).toContain("Colors.green");
      expect(src).toContain("Colors.red");
    });

    it("renders ActionRecommendation with contextual advice", () => {
      expect(src).toContain("function ActionRecommendation");
      expect(src).toContain("treatment_winning");
      expect(src).toContain("control_winning");
      expect(src).toContain("promising");
      expect(src).toContain("inconclusive");
      expect(src).toContain("insufficient_data");
    });

    it("uses bulb icon for action recommendation", () => {
      expect(src).toContain("bulb-outline");
    });

    it("detects winner from sorted conversion rates", () => {
      expect(src).toContain("sort((a, b) => b.conversionRate - a.conversionRate)");
    });

    it("calculates lift between best and second variant", () => {
      expect(src).toContain("best.conversionRate - second.conversionRate");
    });

    it("renders variant comparison rows", () => {
      expect(src).toContain("Variant Comparison");
      expect(src).toContain("compRow");
    });

    it("highlights best variant in green", () => {
      expect(src).toContain("compBest");
      expect(src).toContain("v === best");
    });

    it("renders bar-chart-outline icon in header", () => {
      expect(src).toContain("bar-chart-outline");
      expect(src).toContain("Experiment Results");
    });

    it("returns null for empty experiments", () => {
      expect(src).toContain("experiments.length === 0");
      expect(src).toContain("return null");
    });

    it("uses brand colors", () => {
      expect(src).toContain("BRAND.colors.amber");
    });

    it("stays under 220 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(220);
    });
  });

  describe("app/admin/index.tsx — results card wiring", () => {
    const src = readFile("app/admin/index.tsx");

    it("imports ExperimentResultsCard", () => {
      expect(src).toContain("ExperimentResultsCard");
      expect(src).toContain("@/components/admin/ExperimentResultsCard");
    });

    it("renders ExperimentResultsCard with pushExperiments", () => {
      expect(src).toContain("<ExperimentResultsCard");
      expect(src).toContain("experiments={pushExperiments}");
    });
  });
});

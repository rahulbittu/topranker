/**
 * Sprint 512: Admin Push Experiment UI Card
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 512: Push Experiment UI", () => {
  describe("components/admin/PushExperimentsCard.tsx", () => {
    const src = readFile("components/admin/PushExperimentsCard.tsx");

    it("exports PushExperimentsCard component", () => {
      expect(src).toContain("export function PushExperimentsCard");
    });

    it("exports PushExperimentData type", () => {
      expect(src).toContain("export interface PushExperimentData");
    });

    it("renders recommendation badges", () => {
      expect(src).toContain("RecommendationBadge");
      expect(src).toContain("treatment_winning");
      expect(src).toContain("control_winning");
      expect(src).toContain("promising");
      expect(src).toContain("insufficient_data");
    });

    it("renders variant rows with stats", () => {
      expect(src).toContain("VariantRow");
      expect(src).toContain("exposures");
      expect(src).toContain("outcomes");
      expect(src).toContain("conversionRate");
    });

    it("shows empty state when no experiments", () => {
      expect(src).toContain("No active experiments");
    });

    it("shows experiment description and category", () => {
      expect(src).toContain("exp.description");
      expect(src).toContain("exp.category");
    });

    it("shows active/ended status", () => {
      expect(src).toContain("exp.active");
      expect(src).toContain("Active");
      expect(src).toContain("Ended");
    });

    it("shows total exposure count", () => {
      expect(src).toContain("totalExposures");
    });

    it("color-codes conversion rates", () => {
      expect(src).toContain("rateGood");
      expect(src).toContain("rateLow");
    });

    it("stays under 220 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(220);
    });
  });

  describe("app/admin/index.tsx — wiring", () => {
    const src = readFile("app/admin/index.tsx");

    it("imports PushExperimentsCard", () => {
      expect(src).toContain("PushExperimentsCard");
      expect(src).toContain("@/components/admin/PushExperimentsCard");
    });

    it("has useQuery for push experiments", () => {
      expect(src).toContain("admin-push-experiments");
    });

    it("fetches from /api/admin/push-experiments", () => {
      expect(src).toContain("/api/admin/push-experiments");
    });

    it("renders PushExperimentsCard in overview", () => {
      expect(src).toContain("<PushExperimentsCard experiments={pushExperiments}");
    });

    it("retains NotificationInsightsCard", () => {
      expect(src).toContain("NotificationInsightsCard");
    });

    it("admin dashboard stays under 650 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(650);
    });
  });
});

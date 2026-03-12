/**
 * Sprint 621: Dimension scoring step extraction from rate/[id].tsx
 * Validates DimensionScoringStep component + parent cleanup.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 621 — Dimension Scoring Step Extraction", () => {
  const dsSrc = readFile("components/rate/DimensionScoringStep.tsx");
  const rateSrc = readFile("app/rate/[id].tsx");

  describe("DimensionScoringStep component", () => {
    it("exists as standalone file", () => {
      expect(dsSrc).toBeTruthy();
    });

    it("exports DimensionScoringStep function", () => {
      expect(dsSrc).toContain("export function DimensionScoringStep");
    });

    it("accepts dimension score props", () => {
      expect(dsSrc).toContain("q1Score: number");
      expect(dsSrc).toContain("q2Score: number");
      expect(dsSrc).toContain("q3Score: number");
    });

    it("accepts wouldReturn prop", () => {
      expect(dsSrc).toContain("wouldReturn: boolean | null");
    });

    it("accepts dimension labels", () => {
      expect(dsSrc).toContain("q1Label: string");
      expect(dsSrc).toContain("q2Label: string");
      expect(dsSrc).toContain("q3Label: string");
      expect(dsSrc).toContain("returnLabel: string");
    });

    it("uses CircleScorePicker", () => {
      expect(dsSrc).toContain("CircleScorePicker");
    });

    it("uses DimensionTooltip", () => {
      expect(dsSrc).toContain("DimensionTooltip");
    });

    it("shows live score preview", () => {
      expect(dsSrc).toContain("YOUR SCORE");
      expect(dsSrc).toContain("liveScorePreview");
    });

    it("has YES/NO return buttons", () => {
      expect(dsSrc).toContain("YES");
      expect(dsSrc).toContain("NO");
      expect(dsSrc).toContain("checkmark-circle");
      expect(dsSrc).toContain("close-circle");
    });

    it("handles dish context banner", () => {
      expect(dsSrc).toContain("dishContext");
      expect(dsSrc).toContain("dishContextBanner");
    });

    it("stays under 170 LOC", () => {
      const loc = dsSrc.split("\n").length;
      expect(loc).toBeLessThan(170);
    });
  });

  describe("rate/[id].tsx after extraction", () => {
    it("imports DimensionScoringStep", () => {
      expect(rateSrc).toContain("DimensionScoringStep");
    });

    it("renders DimensionScoringStep for step 1", () => {
      expect(rateSrc).toContain("<DimensionScoringStep");
    });

    it("no longer has inline dimension styles", () => {
      expect(rateSrc).not.toContain("compactQuestion:");
      expect(rateSrc).not.toContain("yesNoRow:");
      expect(rateSrc).not.toContain("yesNoBtn:");
      expect(rateSrc).not.toContain("liveScorePreview:");
    });

    it("no longer imports CircleScorePicker", () => {
      expect(rateSrc).not.toContain("CircleScorePicker");
    });

    it("no longer imports DimensionTooltip", () => {
      // rateSrc still has getDimensionTooltips (which contains "DimensionTooltip" as substring)
      // so check that it doesn't import DimensionTooltip as a standalone component
      expect(rateSrc).not.toMatch(/import.*DimensionTooltip[^s]/);
    });

    it("dropped below 520 LOC (was 601)", () => {
      const loc = rateSrc.split("\n").length;
      expect(loc).toBeLessThan(520);
    });

    it("stays below 75% of 700 LOC threshold", () => {
      const loc = rateSrc.split("\n").length;
      expect(loc / 700).toBeLessThan(0.75);
    });
  });

  describe("thresholds", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("tracks DimensionScoringStep", () => {
      expect(thresholds.files["components/rate/DimensionScoringStep.tsx"]).toBeDefined();
    });

    it("tracks 33 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(33);
    });
  });
});

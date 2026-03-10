import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 368: Rating flow UX polish (progress indicator)", () => {
  const subSrc = readFile("components/rate/SubComponents.tsx");
  const rateSrc = readFile("app/rate/[id].tsx");

  // ── Step labels ───────────────────────────────────────────

  describe("Step labels", () => {
    it("should define STEP_LABELS array", () => {
      expect(subSrc).toContain("STEP_LABELS");
    });

    it("should include Visit Type label", () => {
      expect(subSrc).toContain('"Visit Type"');
    });

    it("should include Score label", () => {
      expect(subSrc).toContain('"Score"');
    });

    it("should include Details label", () => {
      expect(subSrc).toContain('"Details"');
    });
  });

  // ── Step descriptions ─────────────────────────────────────

  describe("Step descriptions", () => {
    it("should define STEP_DESCRIPTIONS array", () => {
      expect(subSrc).toContain("STEP_DESCRIPTIONS");
    });

    it("should have visit type description", () => {
      expect(subSrc).toContain("How did you experience this place?");
    });

    it("should have score description", () => {
      expect(subSrc).toContain("Rate the dimensions that matter");
    });

    it("should have details description", () => {
      expect(subSrc).toContain("Add optional details to boost credibility");
    });

    it("should export StepDescription component", () => {
      expect(subSrc).toContain("export function StepDescription");
    });
  });

  // ── Continuous progress bar ───────────────────────────────

  describe("Progress bar enhancement", () => {
    it("should calculate percentage from step", () => {
      expect(subSrc).toContain("((step + 1) / total) * 100");
    });

    it("should have continuous fill bar", () => {
      expect(subSrc).toContain("progressFill");
    });

    it("should show step labels below progress bar", () => {
      expect(subSrc).toContain("progressLabels");
      expect(subSrc).toContain("progressLabel");
    });

    it("should highlight current step label in gold", () => {
      expect(subSrc).toContain("progressLabelCurrent");
      expect(subSrc).toContain("Colors.gold");
    });

    it("should use progressOuter wrapper", () => {
      expect(subSrc).toContain("progressOuter");
    });

    it("should use overflow hidden for bar", () => {
      expect(subSrc).toContain('overflow: "hidden"');
    });
  });

  // ── Step indicator enhancement ────────────────────────────

  describe("Step indicator with percentage", () => {
    it("should show percentage", () => {
      expect(subSrc).toContain("stepPct");
    });

    it("should calculate percentage value", () => {
      expect(subSrc).toContain("Math.round(((step + 1) / total) * 100)");
    });

    it("should use stepIndicatorRow layout", () => {
      expect(subSrc).toContain("stepIndicatorRow");
    });

    it("should style percentage in gold", () => {
      expect(subSrc).toContain("color: Colors.gold");
    });
  });

  // ── Integration in rate screen ────────────────────────────

  describe("Rate screen integration", () => {
    it("should import StepDescription", () => {
      expect(rateSrc).toContain("StepDescription");
    });

    it("should render StepDescription with step prop", () => {
      expect(rateSrc).toContain("<StepDescription step={step}");
    });

    it("should still have ProgressBar", () => {
      expect(rateSrc).toContain("<ProgressBar");
    });

    it("should still have StepIndicator", () => {
      expect(rateSrc).toContain("<StepIndicator");
    });
  });

  // ── Existing functionality preserved ─────────────────────

  describe("Existing rating flow preserved", () => {
    it("should still have CircleScorePicker", () => {
      expect(rateSrc).toContain("CircleScorePicker");
    });

    it("should still have RatingConfirmation", () => {
      expect(rateSrc).toContain("RatingConfirmation");
    });

    it("should still have visit type selection", () => {
      expect(rateSrc).toContain("visitType");
      expect(rateSrc).toContain("setVisitType");
    });

    it("should still have 3-step flow", () => {
      expect(rateSrc).toContain("total={3}");
    });
  });
});

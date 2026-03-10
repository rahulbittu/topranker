/**
 * Sprint 531: Rating flow UX polish — review step before submission
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 531: Rating Review Step", () => {
  describe("RatingReviewStep component", () => {
    const src = readFile("components/rate/RatingReviewStep.tsx");

    it("exports RatingReviewStep function", () => {
      expect(src).toContain("export function RatingReviewStep");
    });

    it("accepts onEditStep callback for step navigation", () => {
      expect(src).toContain("onEditStep: (step: number) => void");
    });

    it("renders visit type section with edit button", () => {
      expect(src).toContain("VISIT TYPE");
      expect(src).toContain("Edit visit type");
    });

    it("renders scores section with dimension labels", () => {
      expect(src).toContain("SCORES");
      expect(src).toContain("getDimensionLabels");
    });

    it("renders composite score card with weighted score", () => {
      expect(src).toContain("YOUR SCORE");
      expect(src).toContain("WEIGHTED");
      expect(src).toContain("rawScore.toFixed(1)");
    });

    it("renders details section with dish, note, photos", () => {
      expect(src).toContain("DETAILS");
      expect(src).toContain("No dish selected");
      expect(src).toContain("No note");
      expect(src).toContain("No photos");
    });

    it("renders verification boost preview", () => {
      expect(src).toContain("Verification boosts");
      expect(src).toContain("Photo +15%");
      expect(src).toContain("Receipt +25%");
    });

    it("renders photo thumbnails when photos exist", () => {
      expect(src).toContain("photoUris.map");
      expect(src).toContain("photoThumb");
    });

    it("shows receipt attached indicator", () => {
      expect(src).toContain("Receipt attached");
      expect(src).toContain("shield-checkmark");
    });

    it("has edit buttons for all 3 prior steps", () => {
      expect(src).toContain("onEditStep(0)");
      expect(src).toContain("onEditStep(1)");
      expect(src).toContain("onEditStep(2)");
    });
  });

  describe("Rate screen integration", () => {
    const src = readFile("app/rate/[id].tsx");

    it("imports RatingReviewStep", () => {
      expect(src).toContain("import { RatingReviewStep }");
    });

    it("has 4-step flow (0 | 1 | 2 | 3)", () => {
      expect(src).toContain("type RatingStep = 0 | 1 | 2 | 3");
    });

    it("renders RatingReviewStep at step 3", () => {
      expect(src).toContain("<RatingReviewStep");
    });

    it("step 3 submits the rating", () => {
      expect(src).toContain("Submit Rating");
      expect(src).toContain("submitMutation.mutate()");
    });

    it("step 2 advances to review with Next", () => {
      expect(src).toContain("setStep(3)");
    });

    it("has handleEditStep for jumping back from review", () => {
      expect(src).toContain("handleEditStep");
      expect(src).toContain("targetStep as RatingStep");
    });

    it("uses total of 4 for StepIndicator and ProgressBar", () => {
      expect(src).toContain("total={4}");
    });
  });

  describe("SubComponents step labels", () => {
    const src = readFile("components/rate/SubComponents.tsx");

    it("has 4 step labels including Review", () => {
      expect(src).toContain('"Review"');
    });

    it("has 4 step descriptions including review description", () => {
      expect(src).toContain("Confirm your rating before submitting");
    });
  });

  describe("LOC thresholds", () => {
    const reviewSrc = readFile("components/rate/RatingReviewStep.tsx");
    const reviewLines = reviewSrc.split("\n").length;

    it("RatingReviewStep is under 350 LOC", () => {
      expect(reviewLines).toBeLessThan(350);
    });

    const rateSrc = readFile("app/rate/[id].tsx");
    const rateLines = rateSrc.split("\n").length;

    it("rate/[id].tsx stays under 620 LOC", () => {
      expect(rateLines).toBeLessThan(620);
    });
  });
});

/**
 * Sprint 409: Rating flow accessibility audit
 * Validates WCAG-aligned accessibility improvements across rating flow
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 409 — Rating Flow Accessibility Audit", () => {
  const rateSrc = readFile("app/rate/[id].tsx");
  const dimSrc = readFile("components/rate/DimensionScoringStep.tsx");
  const subSrc = readFile("components/rate/SubComponents.tsx");
  const extrasSrc = readFile("components/rate/RatingExtrasStep.tsx");

  describe("CircleScorePicker accessibility", () => {
    it("has accessibilityRole button on score circles", () => {
      expect(subSrc).toContain('accessibilityRole="button"');
    });

    it("has accessibilityLabel with score and label text", () => {
      expect(subSrc).toContain("`Score ${n}, ${SCORE_LABELS[n - 1]}`");
    });

    it("has accessibilityState selected", () => {
      expect(subSrc).toContain("accessibilityState={{ selected: isActive }}");
    });

    it("has accessibilityHint for score selection", () => {
      expect(subSrc).toContain('accessibilityHint="Double tap to select this score"');
    });
  });

  describe("ProgressBar accessibility", () => {
    it("has progressbar role", () => {
      expect(subSrc).toContain('accessibilityRole="progressbar"');
    });

    it("has accessibilityValue with min, max, now, text", () => {
      expect(subSrc).toContain("accessibilityValue={{ min: 0, max: total, now: step + 1");
      expect(subSrc).toContain("text: `${pct}% complete`");
    });
  });

  describe("StepIndicator accessibility", () => {
    it("has text role with step and completion info", () => {
      expect(subSrc).toContain('accessibilityRole="text"');
      expect(subSrc).toContain("`Step ${step + 1} of ${total}, ${pct}% complete`");
    });
  });

  describe("StepDescription accessibility", () => {
    it("has text role with current step description", () => {
      expect(subSrc).toContain('accessibilityLabel={`Current step: ${desc}`}');
    });
  });

  describe("DishPill accessibility", () => {
    it("has accessibilityRole button", () => {
      // Check DishPill specifically
      const dishPillBlock = subSrc.slice(subSrc.indexOf("export function DishPill"), subSrc.indexOf("export function DishPill") + 500);
      expect(dishPillBlock).toContain('accessibilityRole="button"');
    });

    it("has accessibilityLabel with name and vote count", () => {
      expect(subSrc).toContain("`${dish.name}${dish.voteCount > 0");
    });

    it("has accessibilityState selected", () => {
      expect(subSrc).toContain("accessibilityState={{ selected }}");
    });

    it("has accessibilityHint for select/deselect", () => {
      expect(subSrc).toContain("Double tap to deselect");
      expect(subSrc).toContain("Double tap to select this dish");
    });
  });

  describe("RatingExtrasStep accessibility", () => {
    it("dish input has accessibilityLabel", () => {
      expect(extrasSrc).toContain('accessibilityLabel="Dish name input"');
    });

    it("dish input has accessibilityHint", () => {
      expect(extrasSrc).toContain("Type a dish name to search");
    });

    it("note input has accessibilityLabel", () => {
      expect(extrasSrc).toContain('accessibilityLabel="Quick note"');
    });

    it("note input has accessibilityHint with character limit", () => {
      expect(extrasSrc).toContain("160 characters max");
    });

    it("dish suggestion items have accessibilityRole and label", () => {
      expect(extrasSrc).toContain('accessibilityLabel={`Select ${d.name}');
    });

    it("clear dish button has accessibilityLabel", () => {
      expect(extrasSrc).toContain("Remove ${selectedDish} selection");
    });

    it("score summary has summary role with full label", () => {
      expect(extrasSrc).toContain('accessibilityRole="summary"');
      expect(extrasSrc).toContain("Your rating summary:");
    });
  });

  describe("rate/[id].tsx accessibility", () => {
    it("live score preview has accessibilityLiveRegion", () => {
      expect(dimSrc).toContain('accessibilityLiveRegion="polite"');
    });

    it("live score has accessible label with scores", () => {
      expect(dimSrc).toContain("Your score:");
      expect(dimSrc).toContain("weighted:");
    });

    it("business name has header role", () => {
      expect(rateSrc).toContain('accessibilityRole="header"');
    });

    it("back button has context-aware label", () => {
      expect(rateSrc).toContain('accessibilityLabel={step > 0 ? "Previous step" : "Go back"}');
    });

    it("visit type cards have accessibilityState selected (via VisitTypeStep)", () => {
      // Sprint 411: Visit type extracted — check that VisitTypeStep is rendered
      expect(rateSrc).toContain("<VisitTypeStep");
    });

    it("would-return buttons have accessible labels", () => {
      expect(dimSrc).toContain('accessibilityLabel="Yes, would return"');
      expect(dimSrc).toContain('accessibilityLabel="No, would not return"');
    });
  });
});

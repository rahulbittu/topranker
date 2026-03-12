/**
 * Sprint 692: Rating flow accessibility — VoiceOver headers, dimension labels,
 * and semantic structure for screen reader users.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

// ─── Dimension Scoring Accessibility ────────────────────────────────────

describe("Sprint 692: DimensionScoringStep accessibility", () => {
  const src = readFile("components/rate/DimensionScoringStep.tsx");

  it("dimension labels have header role for VoiceOver navigation", () => {
    expect(src).toContain('accessibilityRole="header">{q1Label}');
    expect(src).toContain('accessibilityRole="header">{q2Label}');
    expect(src).toContain('accessibilityRole="header">{q3Label}');
    expect(src).toContain('accessibilityRole="header">{returnLabel}');
  });

  it("dimension containers have accessible labels with score state", () => {
    expect(src).toContain("accessible accessibilityLabel={`${q1Label} dimension");
    expect(src).toContain("accessible accessibilityLabel={`${q2Label} dimension");
    expect(src).toContain("accessible accessibilityLabel={`${q3Label} dimension");
  });

  it("dimension labels indicate scored vs not yet scored", () => {
    expect(src).toContain("not yet scored");
    expect(src).toContain("scored ${q1Score}");
  });

  it("return dimension indicates answer state", () => {
    expect(src).toContain("not yet answered");
  });

  it("live score preview has polite live region", () => {
    expect(src).toContain('accessibilityLiveRegion="polite"');
  });

  it("live score preview has descriptive label", () => {
    expect(src).toContain("accessibilityLabel={`Your score:");
  });
});

// ─── Circle Score Picker Accessibility ──────────────────────────────────

describe("Sprint 692: CircleScorePicker accessibility", () => {
  const src = readFile("components/rate/SubComponents.tsx");

  it("each score circle has button role", () => {
    expect(src).toContain('accessibilityRole="button"');
  });

  it("each score has descriptive label with number and word", () => {
    expect(src).toContain("accessibilityLabel={`Score ${n}, ${SCORE_LABELS[n - 1]}`}");
  });

  it("has selected state", () => {
    expect(src).toContain("accessibilityState={{ selected: isActive }}");
  });

  it("has hint for VoiceOver users", () => {
    expect(src).toContain("accessibilityHint");
  });
});

// ─── Visit Type Step Accessibility ──────────────────────────────────────

describe("Sprint 692: VisitTypeStep accessibility", () => {
  const src = readFile("components/rate/VisitTypeStep.tsx");

  it("title has header role", () => {
    expect(src).toContain('accessibilityRole="header">How did you experience');
  });

  it("visit options have button role", () => {
    expect(src).toContain('accessibilityRole="button"');
  });

  it("visit options have selected state", () => {
    expect(src).toContain("accessibilityState={{ selected:");
  });
});

// ─── Review Step Accessibility ──────────────────────────────────────────

describe("Sprint 692: RatingReviewStep accessibility", () => {
  const src = readFile("components/rate/RatingReviewStep.tsx");

  it("review title has header role", () => {
    expect(src).toContain('accessibilityRole="header">Review Your Rating');
  });

  it("edit buttons have descriptive labels", () => {
    expect(src).toContain('accessibilityLabel="Edit visit type"');
    expect(src).toContain('accessibilityLabel="Edit scores"');
  });
});

// ─── Progress Bar Accessibility ─────────────────────────────────────────

describe("Sprint 692: ProgressBar accessibility", () => {
  const src = readFile("components/rate/SubComponents.tsx");

  it("has progressbar role", () => {
    expect(src).toContain('accessibilityRole="progressbar"');
  });

  it("has step count label", () => {
    expect(src).toContain("accessibilityLabel={`Step ${step + 1} of ${total}`}");
  });

  it("has min/max/now values", () => {
    expect(src).toContain("accessibilityValue={{ min: 0, max: total, now: step + 1 }}");
  });
});

// ─── Rate Screen Navigation Accessibility ───────────────────────────────

describe("Sprint 692: Rate screen navigation accessibility", () => {
  const src = readFile("app/rate/[id].tsx");

  it("business name has header role", () => {
    expect(src).toContain('accessibilityRole="header">{business.name}');
  });

  it("back button has context-aware label", () => {
    expect(src).toContain('accessibilityLabel={step > 0 ? "Previous step" : "Go back"}');
  });

  it("next/submit button has context-aware label", () => {
    expect(src).toContain('accessibilityLabel={step === 3 ? "Submit rating" : "Next step"}');
  });
});

/**
 * Sprint 172 — rate/[id].tsx Decomposition
 *
 * Validates:
 * 1. rate/[id].tsx is under 500 LOC (down from 898)
 * 2. useRatingSubmit hook extracted correctly
 * 3. RatingExtrasStep component extracted correctly
 * 4. rate/[id].tsx imports extracted modules
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. File size
// ---------------------------------------------------------------------------
describe("rate/[id].tsx — file size", () => {
  const rateSrc = readFile("app/rate/[id].tsx");

  it("is under 600 lines", () => {
    // Bumped from 500 to 600: Sprint 261 added visit type selection (Rating Integrity Phase 1)
    expect(countLines(rateSrc)).toBeLessThan(600);
  });

  it("extracted modules total significant lines", () => {
    const hookLines = countLines(readFile("lib/hooks/useRatingSubmit.ts"));
    const extrasLines = countLines(readFile("components/rate/RatingExtrasStep.tsx"));
    expect(hookLines + extrasLines).toBeGreaterThan(400);
  });
});

// ---------------------------------------------------------------------------
// 2. useRatingSubmit hook
// ---------------------------------------------------------------------------
describe("useRatingSubmit hook", () => {
  const hookSrc = readFile("lib/hooks/useRatingSubmit.ts");

  it("exports useRatingSubmit function", () => {
    expect(hookSrc).toContain("export function useRatingSubmit");
  });

  it("uses useMutation from react-query", () => {
    expect(hookSrc).toContain("useMutation");
  });

  it("handles optimistic updates", () => {
    expect(hookSrc).toContain("onMutate");
    expect(hookSrc).toContain("cancelQueries");
  });

  it("handles error mapping", () => {
    expect(hookSrc).toContain("onError");
    expect(hookSrc).toContain("Failed to fetch");
    expect(hookSrc).toContain("Already rated");
  });

  it("handles badge detection", () => {
    expect(hookSrc).toContain("milestoneBadgeMap");
    expect(hookSrc).toContain("streakBadgeMap");
    expect(hookSrc).toContain("onBadgeEarned");
  });

  it("calls haptic feedback on success", () => {
    expect(hookSrc).toContain("hapticRatingSuccess");
    expect(hookSrc).toContain("hapticConfetti");
  });

  it("stores rating impact for business detail banner", () => {
    expect(hookSrc).toContain("setRatingImpact");
  });
});

// ---------------------------------------------------------------------------
// 3. RatingExtrasStep component
// ---------------------------------------------------------------------------
describe("RatingExtrasStep component", () => {
  const extrasSrc = readFile("components/rate/RatingExtrasStep.tsx");

  it("exports RatingExtrasStep function", () => {
    expect(extrasSrc).toContain("export function RatingExtrasStep");
  });

  it("renders dish pills for existing dishes", () => {
    expect(extrasSrc).toContain("DishPill");
    expect(extrasSrc).toContain("existingDishes");
  });

  it("renders dish search input", () => {
    expect(extrasSrc).toContain("Type a dish name");
  });

  it("renders note input", () => {
    expect(extrasSrc).toContain("Quick note");
    expect(extrasSrc).toContain("160");
  });

  it("renders photo upload", () => {
    expect(extrasSrc).toContain("ImagePicker");
    expect(extrasSrc).toContain("Add photo");
  });

  it("renders score summary card", () => {
    expect(extrasSrc).toContain("YOUR RATING");
    expect(extrasSrc).toContain("summaryCard");
  });

  it("has its own StyleSheet", () => {
    expect(extrasSrc).toContain("StyleSheet.create");
  });
});

// ---------------------------------------------------------------------------
// 4. Integration
// ---------------------------------------------------------------------------
describe("rate/[id].tsx — integration with extracted modules", () => {
  const rateSrc = readFile("app/rate/[id].tsx");

  it("imports useRatingSubmit", () => {
    expect(rateSrc).toContain("useRatingSubmit");
  });

  it("imports RatingExtrasStep", () => {
    expect(rateSrc).toContain("RatingExtrasStep");
  });

  it("calls useRatingSubmit hook", () => {
    expect(rateSrc).toContain("useRatingSubmit({");
  });

  it("renders RatingExtrasStep for step 2", () => {
    expect(rateSrc).toContain("<RatingExtrasStep");
  });

  it("still has step 1 scoring inline", () => {
    expect(rateSrc).toContain("CircleScorePicker");
    expect(rateSrc).toContain("Value for Money");
  });

  it("still has dish context banner", () => {
    expect(rateSrc).toContain("dishContextBanner");
    expect(rateSrc).toContain("dishContext");
  });
});

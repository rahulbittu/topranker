/**
 * Sprint 346: Rate screen extraction
 * - Extracted animation + timing hooks from rate/[id].tsx
 * - useDimensionHighlight, useDimensionTiming, useConfirmationAnimations
 */
import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";

let rateSrc = "";
let hookSrc = "";

beforeAll(() => {
  rateSrc = fs.readFileSync(path.resolve("app/rate/[id].tsx"), "utf-8");
  hookSrc = fs.readFileSync(path.resolve("lib/hooks/useRatingAnimations.ts"), "utf-8");
});

// ── Extracted hook file ──────────────────────────────────────────
describe("useRatingAnimations hook", () => {
  it("should exist", () => {
    expect(hookSrc.length).toBeGreaterThan(0);
  });

  it("should export useDimensionHighlight", () => {
    expect(hookSrc).toContain("export function useDimensionHighlight");
  });

  it("should export useDimensionTiming", () => {
    expect(hookSrc).toContain("export function useDimensionTiming");
  });

  it("should export useConfirmationAnimations", () => {
    expect(hookSrc).toContain("export function useConfirmationAnimations");
  });

  it("should use interpolateColor for highlight", () => {
    expect(hookSrc).toContain("interpolateColor");
  });

  it("should use withTiming for highlight animation", () => {
    expect(hookSrc).toContain("withTiming(shouldHighlight ? 1 : 0");
  });

  it("should track timing with refs", () => {
    expect(hookSrc).toContain("timingRef");
    expect(hookSrc).toContain("startRef");
  });

  it("should have confirmation animations with spring", () => {
    expect(hookSrc).toContain("withSpring(1, { damping: 12");
  });

  it("should calculate tier progress", () => {
    expect(hookSrc).toContain("TIER_SCORE_RANGES");
    expect(hookSrc).toContain("getCredibilityTier");
  });
});

// ── Rate screen uses hooks ───────────────────────────────────────
describe("Rate screen hook integration", () => {
  it("should import extracted hooks", () => {
    expect(rateSrc).toContain("useDimensionHighlight");
    expect(rateSrc).toContain("useDimensionTiming");
    expect(rateSrc).toContain("useConfirmationAnimations");
  });

  it("should call useDimensionHighlight with correct params", () => {
    expect(rateSrc).toContain("useDimensionHighlight({");
    expect(rateSrc).toContain("focusedDimension, q1Score, q2Score, q3Score, wouldReturn");
  });

  it("should call useConfirmationAnimations", () => {
    expect(rateSrc).toContain("useConfirmationAnimations(");
    expect(rateSrc).toContain("showConfirm");
  });

  it("should call useDimensionTiming", () => {
    expect(rateSrc).toContain("useDimensionTiming(focusedDimension)");
  });

  it("should destructure dim styles from highlight hook", () => {
    expect(rateSrc).toContain("dim0Style, dim1Style, dim2Style, dim3Style");
  });

  it("should destructure confirmation styles", () => {
    expect(rateSrc).toContain("confirmIconStyle, rankStyle, tierBarStyle");
  });
});

// ── LOC reduction ────────────────────────────────────────────────
describe("Rate screen LOC reduction", () => {
  it("should be under 650 lines after extraction", () => {
    const lines = rateSrc.split("\n").length;
    expect(lines).toBeLessThan(650);
  });

  it("should not contain inline interpolateColor", () => {
    expect(rateSrc).not.toContain("interpolateColor");
  });

  it("should not contain inline useSharedValue", () => {
    expect(rateSrc).not.toContain("useSharedValue");
  });

  it("should not import pct (moved to hook)", () => {
    expect(rateSrc).not.toContain("from \"@/lib/style-helpers\"");
  });

  it("should not import TIER_SCORE_RANGES (moved to hook)", () => {
    expect(rateSrc).not.toContain("TIER_SCORE_RANGES");
  });
});

// ── Backwards compatibility ──────────────────────────────────────
describe("Backwards compatibility", () => {
  it("should still use Animated.View for dimensions", () => {
    expect(rateSrc).toContain("<Animated.View style={[styles.compactQuestion, dim0Style]}");
  });

  it("should still pass dimensionTimingMs to submit", () => {
    expect(rateSrc).toContain("dimensionTimingMs: dimensionTimingRef.current");
  });

  it("should still have scroll-to-focus", () => {
    expect(rateSrc).toContain("scrollViewRef.current.scrollTo");
  });

  it("should still have FadeIn for step transitions", () => {
    expect(rateSrc).toContain("FadeIn.duration(300)");
  });
});

/**
 * Sprint 342: Rating flow animation polish
 * - Animated fade-in highlight replaces static focusedQuestion style
 * - Uses Reanimated interpolateColor for smooth transitions
 * - 4 dimension highlight shared values
 */
import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";

let rateSrc = "";
let hookSrc = "";

let dimSrc = "";

beforeAll(() => {
  rateSrc = fs.readFileSync(path.resolve("app/rate/[id].tsx"), "utf-8");
  hookSrc = fs.readFileSync(path.resolve("lib/hooks/useRatingAnimations.ts"), "utf-8");
  dimSrc = fs.readFileSync(path.resolve("components/rate/DimensionScoringStep.tsx"), "utf-8");
});

describe("Animated dimension highlight (Sprint 346: extracted to hook)", () => {
  it("should use interpolateColor in hook", () => {
    expect(hookSrc).toContain("interpolateColor");
  });

  it("should create 4 dimension highlight shared values in hook", () => {
    expect(hookSrc).toContain("dim0");
    expect(hookSrc).toContain("dim1");
    expect(hookSrc).toContain("dim2");
    expect(hookSrc).toContain("dim3");
  });

  it("should use useSharedValue for highlights in hook", () => {
    expect(hookSrc).toMatch(/dim0\s*=\s*useSharedValue/);
  });

  it("should animate highlight with withTiming in hook", () => {
    expect(hookSrc).toContain("withTiming(shouldHighlight ? 1 : 0");
  });

  it("should use Easing.out(Easing.cubic) for smooth deceleration", () => {
    expect(hookSrc).toContain("Easing.out(Easing.cubic)");
  });

  it("should use interpolateColor for background transition", () => {
    expect(hookSrc).toContain('interpolateColor(h.value, [0, 1], ["transparent", "rgba(196,154,26,0.06)"])');
  });

  it("should use interpolateColor for border transition", () => {
    expect(hookSrc).toContain('interpolateColor(h.value, [0, 1], ["transparent", "rgba(196,154,26,0.15)"])');
  });

  it("should animate with 300ms duration", () => {
    expect(hookSrc).toContain("duration: 300");
  });
});

describe("Animated.View for dimensions", () => {
  it("should use Animated.View for dimension containers", () => {
    // Sprint 621: dimensions extracted to DimensionScoringStep (uses `s.` not `styles.`)
    expect(dimSrc).toContain("<Animated.View style={[s.compactQuestion, dim0Style]}");
    expect(dimSrc).toContain("<Animated.View style={[s.compactQuestion, dim1Style]}");
    expect(dimSrc).toContain("<Animated.View style={[s.compactQuestion, dim2Style]}");
    expect(dimSrc).toContain("<Animated.View style={[s.compactQuestion, dim3Style]}");
  });

  it("should close with Animated.View tags", () => {
    // Count Animated.View closing tags — should have at least 4 for dimensions
    const closingTags = (dimSrc.match(/<\/Animated\.View>/g) || []).length;
    expect(closingTags).toBeGreaterThanOrEqual(4);
  });

  it("should not have static focusedQuestion style", () => {
    // The static style should be removed since animation handles it
    expect(dimSrc).not.toContain("focusedQuestion:");
    expect(dimSrc).not.toContain("styles.focusedQuestion");
  });

  it("should still preserve onLayout for scroll-to-focus", () => {
    expect(dimSrc).toContain("onDimensionLayout(0, e.nativeEvent.layout.y)");
    expect(dimSrc).toContain("onDimensionLayout(1, e.nativeEvent.layout.y)");
    expect(dimSrc).toContain("onDimensionLayout(2, e.nativeEvent.layout.y)");
    expect(dimSrc).toContain("onDimensionLayout(3, e.nativeEvent.layout.y)");
  });
});

describe("Sprint 342 backwards compatibility", () => {
  it("should still have scroll-to-focus effect", () => {
    expect(rateSrc).toContain("scrollViewRef.current.scrollTo");
  });

  it("should still have auto-advance handlers", () => {
    expect(rateSrc).toContain("handleQ1");
    expect(rateSrc).toContain("handleQ2");
    expect(rateSrc).toContain("handleQ3");
    expect(rateSrc).toContain("handleReturn");
  });

  it("should still use FadeIn for step transitions", () => {
    expect(dimSrc).toContain("FadeIn.duration(300)");
  });

  it("should still have confirmation animations (via hook)", () => {
    expect(rateSrc).toContain("confirmIconStyle");
    expect(rateSrc).toContain("rankStyle");
    expect(rateSrc).toContain("tierBarStyle");
  });
});

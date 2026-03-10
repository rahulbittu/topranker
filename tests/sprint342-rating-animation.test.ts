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

beforeAll(() => {
  rateSrc = fs.readFileSync(path.resolve("app/rate/[id].tsx"), "utf-8");
});

describe("Animated dimension highlight", () => {
  it("should import interpolateColor from reanimated", () => {
    expect(rateSrc).toContain("interpolateColor");
  });

  it("should create 4 dimension highlight shared values", () => {
    expect(rateSrc).toContain("dim0Highlight");
    expect(rateSrc).toContain("dim1Highlight");
    expect(rateSrc).toContain("dim2Highlight");
    expect(rateSrc).toContain("dim3Highlight");
  });

  it("should use useSharedValue for highlights", () => {
    expect(rateSrc).toMatch(/dim0Highlight\s*=\s*useSharedValue/);
  });

  it("should animate highlight with withTiming", () => {
    expect(rateSrc).toContain("withTiming(shouldHighlight ? 1 : 0");
  });

  it("should use Easing.out(Easing.cubic) for smooth deceleration", () => {
    expect(rateSrc).toContain("Easing.out(Easing.cubic)");
  });

  it("should use interpolateColor for background transition", () => {
    expect(rateSrc).toContain('interpolateColor(highlight.value, [0, 1], ["transparent", "rgba(196,154,26,0.06)"])');
  });

  it("should use interpolateColor for border transition", () => {
    expect(rateSrc).toContain('interpolateColor(highlight.value, [0, 1], ["transparent", "rgba(196,154,26,0.15)"])');
  });

  it("should animate with 300ms duration", () => {
    expect(rateSrc).toContain("duration: 300");
  });
});

describe("Animated.View for dimensions", () => {
  it("should use Animated.View for dimension containers", () => {
    // All 4 dimensions should use Animated.View, not plain View
    expect(rateSrc).toContain("<Animated.View style={[styles.compactQuestion, dim0Style]}");
    expect(rateSrc).toContain("<Animated.View style={[styles.compactQuestion, dim1Style]}");
    expect(rateSrc).toContain("<Animated.View style={[styles.compactQuestion, dim2Style]}");
    expect(rateSrc).toContain("<Animated.View style={[styles.compactQuestion, dim3Style]}");
  });

  it("should close with Animated.View tags", () => {
    // Count Animated.View closing tags — should have at least 4 for dimensions
    const closingTags = (rateSrc.match(/<\/Animated\.View>/g) || []).length;
    expect(closingTags).toBeGreaterThanOrEqual(4);
  });

  it("should not have static focusedQuestion style", () => {
    // The static style should be removed since animation handles it
    expect(rateSrc).not.toContain("focusedQuestion:");
    expect(rateSrc).not.toContain("styles.focusedQuestion");
  });

  it("should still preserve onLayout for scroll-to-focus", () => {
    expect(rateSrc).toContain("dimensionYPositions.current[0] = e.nativeEvent.layout.y");
    expect(rateSrc).toContain("dimensionYPositions.current[1] = e.nativeEvent.layout.y");
    expect(rateSrc).toContain("dimensionYPositions.current[2] = e.nativeEvent.layout.y");
    expect(rateSrc).toContain("dimensionYPositions.current[3] = e.nativeEvent.layout.y");
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
    expect(rateSrc).toContain("FadeIn.duration(300)");
  });

  it("should still have confirmation animations", () => {
    expect(rateSrc).toContain("confirmScale");
    expect(rateSrc).toContain("rankSlide");
    expect(rateSrc).toContain("tierProgress");
  });
});

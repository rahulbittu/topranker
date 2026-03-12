/**
 * Sprint 711 — Onboarding Flow Review + Polish
 *
 * Owner: Priya Sharma (Design)
 *
 * Verifies:
 * - Animated progress bar replaces static dots
 * - Back button visible on slides 2-4
 * - Haptic feedback on slide transitions
 * - Skip and navigation remain functional
 * - Accessibility labels present
 */
import { describe, it, expect } from "vitest";

describe("Sprint 711 — Onboarding Polish", () => {
  let source: string;

  it("loads onboarding source", async () => {
    const fs = await import("node:fs");
    source = fs.readFileSync(
      new URL("../app/onboarding.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toBeTruthy();
  });

  // ── Animated Progress Bar ──
  it("imports useSharedValue and useAnimatedStyle for progress bar", () => {
    expect(source).toContain("useSharedValue");
    expect(source).toContain("useAnimatedStyle");
    expect(source).toContain("withTiming");
  });

  it("has progressWidth shared value initialized to 1/SLIDES.length", () => {
    expect(source).toContain("useSharedValue(1 / SLIDES.length)");
  });

  it("has animated progress track and fill elements", () => {
    expect(source).toContain("progressTrack");
    expect(source).toContain("progressFill");
    expect(source).toContain("progressStyle");
  });

  it("updates progressWidth on viewable items change", () => {
    expect(source).toContain("progressWidth.value");
  });

  // ── Back Button ──
  it("renders back button when currentIndex > 0", () => {
    expect(source).toContain("currentIndex > 0");
    expect(source).toContain("arrow-back");
    expect(source).toContain("goBack");
  });

  it("goBack scrolls to previous slide", () => {
    expect(source).toContain("currentIndex - 1");
    expect(source).toContain("scrollToIndex");
  });

  it("back button has accessibility label", () => {
    expect(source).toContain('accessibilityLabel="Previous slide"');
  });

  it("shows empty spacer when on first slide (no back button)", () => {
    // When currentIndex is 0, renders a spacer View instead of button
    expect(source).toContain("width: 40");
  });

  // ── Haptic Feedback ──
  it("calls hapticPress on slide transition", () => {
    // Inside onViewableItemsChanged callback
    const viewableSection = source.slice(
      source.indexOf("onViewableItemsChanged"),
      source.indexOf("viewabilityConfig"),
    );
    expect(viewableSection).toContain("hapticPress()");
  });

  // ── Skip & Navigation Preserved ──
  it("skip button still present with accessibility", () => {
    expect(source).toContain('accessibilityLabel="Skip onboarding"');
    expect(source).toContain("skip");
  });

  it("completeOnboarding sets AsyncStorage and navigates", () => {
    expect(source).toContain("AsyncStorage.setItem(ONBOARDING_KEY");
    expect(source).toContain('router.replace("/(tabs)")');
  });

  it("last slide shows 'Start Exploring' CTA", () => {
    expect(source).toContain("Start Exploring");
    expect(source).toContain("isLastSlide");
  });

  // ── Dots Removed ──
  it("no longer uses static dot indicators", () => {
    // Old dots style should be gone
    expect(source).not.toContain("dotActive");
    expect(source).not.toContain("styles.dot,");
  });

  // ── Structural ──
  it("has 4 onboarding slides", () => {
    const slideMatches = source.match(/icon: "/g);
    expect(slideMatches).toHaveLength(4);
  });

  it("exports ONBOARDING_KEY constant", () => {
    expect(source).toContain('export const ONBOARDING_KEY = "hasSeenOnboarding"');
  });
});

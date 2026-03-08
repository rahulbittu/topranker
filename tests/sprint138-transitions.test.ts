/**
 * Sprint 138 — Screen Transitions & Micro-Interaction Tests
 *
 * Validates the animation wrapper components (FadeInView, SlideUpView)
 * and the useTabPressAnimation hook structure. Since react-native cannot
 * be parsed by vitest, we test via fs + AST-level validation of the
 * source modules' exports and structure.
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Helper — read source file content
// ---------------------------------------------------------------------------

function readSource(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf-8");
}

// ---------------------------------------------------------------------------
// _layout.tsx — Screen transition configuration
// ---------------------------------------------------------------------------

describe("Root _layout.tsx screen transitions", () => {
  const src = readSource("app/_layout.tsx");

  it("sets default animation to slide_from_right with 250ms duration", () => {
    expect(src).toContain('animation: "slide_from_right"');
    expect(src).toContain("animationDuration: 250");
  });

  it("uses fade animation for legal/terms", () => {
    // Match the legal/terms screen line
    const termsLine = src.split("\n").find((l) => l.includes('legal/terms'));
    expect(termsLine).toBeDefined();
    expect(termsLine).toContain('animation: "fade"');
  });

  it("uses fade animation for legal/privacy", () => {
    const privacyLine = src.split("\n").find((l) => l.includes('legal/privacy'));
    expect(privacyLine).toBeDefined();
    expect(privacyLine).toContain('animation: "fade"');
  });

  it("uses slide_from_right for business/[id]", () => {
    const line = src.split("\n").find((l) => l.includes('business/[id]'));
    expect(line).toBeDefined();
    expect(line).toContain('animation: "slide_from_right"');
  });

  it("uses slide_from_bottom for auth/login modal", () => {
    const line = src.split("\n").find((l) => l.includes('auth/login'));
    expect(line).toBeDefined();
    expect(line).toContain('animation: "slide_from_bottom"');
  });

  it("uses slide_from_bottom for rate/[id] modal", () => {
    const line = src.split("\n").find((l) => l.includes('rate/[id]'));
    expect(line).toBeDefined();
    expect(line).toContain('animation: "slide_from_bottom"');
  });

  it("uses fade animation for onboarding", () => {
    const line = src.split("\n").find((l) => l.includes("onboarding") && l.includes("animation"));
    expect(line).toBeDefined();
    expect(line).toContain('animation: "fade"');
  });
});

// ---------------------------------------------------------------------------
// useTabPressAnimation hook
// ---------------------------------------------------------------------------

describe("useTabPressAnimation", () => {
  const src = readSource("hooks/useTabPressAnimation.ts");

  it("exports useTabPressAnimation function", () => {
    expect(src).toContain("export function useTabPressAnimation");
  });

  it("returns scaleStyle and onTabPress", () => {
    expect(src).toContain("return { scaleStyle, onTabPress }");
  });

  it("implements the bounce sequence: 0.92 -> 1.05 -> 1", () => {
    expect(src).toContain("toValue: 0.92");
    expect(src).toContain("toValue: 1.05");
  });

  it("uses Animated.sequence for the bounce", () => {
    expect(src).toContain("Animated.sequence");
  });

  it("total duration is roughly 200ms (60+80+60)", () => {
    expect(src).toContain("duration: 60");
    expect(src).toContain("duration: 80");
  });

  it("uses useNativeDriver: true", () => {
    expect(src).toContain("useNativeDriver: true");
  });
});

// ---------------------------------------------------------------------------
// FadeInView component
// ---------------------------------------------------------------------------

describe("FadeInView", () => {
  const src = readSource("components/animations/FadeInView.tsx");

  it("exports FadeInView component", () => {
    expect(src).toContain("export function FadeInView");
  });

  it("accepts delay prop with default 0", () => {
    expect(src).toContain("delay = 0");
  });

  it("accepts duration prop with default 300", () => {
    expect(src).toContain("duration = 300");
  });

  it("accepts style and children props", () => {
    expect(src).toContain("style?: StyleProp<ViewStyle>");
    expect(src).toContain("children: React.ReactNode");
  });

  it("animates opacity from 0 to 1", () => {
    expect(src).toContain("new Animated.Value(0)");
    expect(src).toContain("toValue: 1");
  });

  it("uses useNativeDriver", () => {
    expect(src).toContain("useNativeDriver: true");
  });

  it("wraps children in Animated.View with opacity style", () => {
    expect(src).toContain("<Animated.View");
    expect(src).toContain("opacity");
    expect(src).toContain("{children}");
  });
});

// ---------------------------------------------------------------------------
// SlideUpView component
// ---------------------------------------------------------------------------

describe("SlideUpView", () => {
  const src = readSource("components/animations/SlideUpView.tsx");

  it("exports SlideUpView component", () => {
    expect(src).toContain("export function SlideUpView");
  });

  it("accepts delay prop with default 0", () => {
    expect(src).toContain("delay = 0");
  });

  it("accepts duration prop with default 300", () => {
    expect(src).toContain("duration = 300");
  });

  it("accepts distance prop with default 20", () => {
    expect(src).toContain("distance = 20");
  });

  it("combines translateY and opacity animations", () => {
    expect(src).toContain("new Animated.Value(0)");         // opacity
    expect(src).toContain("new Animated.Value(distance)");  // translateY
    expect(src).toContain("Animated.parallel");
  });

  it("uses useNativeDriver", () => {
    expect(src).toContain("useNativeDriver: true");
  });

  it("wraps children in Animated.View with transform + opacity", () => {
    expect(src).toContain("<Animated.View");
    expect(src).toContain("translateY");
    expect(src).toContain("opacity");
    expect(src).toContain("{children}");
  });
});

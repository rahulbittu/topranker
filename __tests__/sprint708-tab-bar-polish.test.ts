/**
 * Sprint 708: Tab bar active state polish — animated indicator dot.
 * Active tab now shows a spring-animated amber dot below the icon.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

// ─── Active Indicator Dot ───────────────────────────────────────────────

describe("Sprint 708: Tab bar active dot", () => {
  const src = readFile("app/(tabs)/_layout.tsx");

  it("has dotScale shared value", () => {
    expect(src).toContain("dotScale");
    expect(src).toContain("useSharedValue(0)");
  });

  it("has dotOpacity shared value", () => {
    expect(src).toContain("dotOpacity");
  });

  it("animates dot in on focus with spring", () => {
    expect(src).toContain("dotScale.value = withSpring(1");
  });

  it("animates dot out on unfocus", () => {
    expect(src).toContain("dotScale.value = withSpring(0");
  });

  it("renders activeDot Animated.View", () => {
    expect(src).toContain("tabStyles.activeDot");
  });

  it("has activeDot style with amber color", () => {
    expect(src).toContain("activeDot:");
    expect(src).toContain("backgroundColor: AMBER");
  });

  it("dot is 4px circle", () => {
    expect(src).toContain("width: 4");
    expect(src).toContain("height: 4");
    expect(src).toContain("borderRadius: 2");
  });

  it("dot positioned below icon", () => {
    expect(src).toContain("bottom: -6");
  });

  it("has sprint 708 comment", () => {
    expect(src).toContain("Sprint 708: Active tab indicator dot");
  });
});

// ─── Existing Tab Bar Features Preserved ────────────────────────────────

describe("Sprint 708: Existing tab bar preserved", () => {
  const src = readFile("app/(tabs)/_layout.tsx");

  it("still has icon scale animation", () => {
    expect(src).toContain("scale.value = withSpring(1.12");
  });

  it("still has golden glow animation", () => {
    expect(src).toContain("glowOpacity");
    expect(src).toContain("glowScale");
  });

  it("still has haptic feedback on tab switch", () => {
    expect(src).toContain("hapticTabSwitch()");
  });

  it("still uses BRAND amber for active tint", () => {
    expect(src).toContain("tabBarActiveTintColor: BRAND.colors.amber");
  });

  it("still uses DMSans font for labels", () => {
    expect(src).toContain("DMSans_600SemiBold");
  });

  it("has all 4 tab screens", () => {
    expect(src).toContain('title: "Rankings"');
    expect(src).toContain('title: "Challenger"');
    expect(src).toContain('title: "Discover"');
    expect(src).toContain('title: "Profile"');
  });
});

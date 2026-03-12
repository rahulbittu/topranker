/**
 * Sprint 691: Loading polish — shimmer improvements + skeleton-to-content transitions.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

// ─── Skeleton Shimmer Improvements ──────────────────────────────────────

describe("Sprint 691: Skeleton shimmer uses Reanimated", () => {
  const src = readFile("components/Skeleton.tsx");

  it("imports reanimated", () => {
    expect(src).toContain("react-native-reanimated");
  });

  it("uses useSharedValue for shimmer", () => {
    expect(src).toContain("useSharedValue");
  });

  it("uses useAnimatedStyle", () => {
    expect(src).toContain("useAnimatedStyle");
  });

  it("uses withRepeat for continuous shimmer", () => {
    expect(src).toContain("withRepeat");
  });

  it("uses withSequence for shimmer cycle", () => {
    expect(src).toContain("withSequence");
  });

  it("uses ease-in-out easing for smooth shimmer", () => {
    expect(src).toContain("Easing.inOut");
  });

  it("shimmer cycles between 0.25 and 0.65 opacity", () => {
    expect(src).toContain("0.25");
    expect(src).toContain("0.65");
  });

  it("shimmer duration is 700ms per half-cycle (1400ms total)", () => {
    expect(src).toContain("duration: 700");
  });
});

// ─── SkeletonToContent Transition ───────────────────────────────────────

describe("Sprint 691: SkeletonToContent component", () => {
  const src = readFile("components/Skeleton.tsx");

  it("exports SkeletonToContent", () => {
    expect(src).toContain("export function SkeletonToContent");
  });

  it("accepts visible prop", () => {
    expect(src).toContain("visible: boolean");
  });

  it("fades in with opacity animation", () => {
    expect(src).toContain("opacity.value = withTiming(1");
  });

  it("slides up with translateY animation", () => {
    expect(src).toContain("translateY.value = withTiming(0");
  });

  it("uses 350ms transition duration", () => {
    expect(src).toContain("duration: 350");
  });

  it("returns null when not visible", () => {
    expect(src).toContain("if (!visible) return null");
  });
});

// ─── Rankings Integration ───────────────────────────────────────────────

describe("Sprint 691: Rankings uses SkeletonToContent", () => {
  const src = readFile("app/(tabs)/index.tsx");

  it("imports SkeletonToContent", () => {
    expect(src).toContain("SkeletonToContent");
  });

  it("wraps content in SkeletonToContent", () => {
    expect(src).toContain("<SkeletonToContent");
    expect(src).toContain("</SkeletonToContent>");
  });
});

// ─── Existing Skeletons Still Work ──────────────────────────────────────

describe("Sprint 691: Existing skeletons preserved", () => {
  const src = readFile("components/Skeleton.tsx");

  it("exports LeaderboardSkeleton", () => {
    expect(src).toContain("export function LeaderboardSkeleton");
  });

  it("exports BusinessDetailSkeleton", () => {
    expect(src).toContain("export function BusinessDetailSkeleton");
  });

  it("exports ChallengerSkeleton", () => {
    expect(src).toContain("export function ChallengerSkeleton");
  });

  it("exports ProfileSkeleton", () => {
    expect(src).toContain("export function ProfileSkeleton");
  });

  it("exports DiscoverSkeleton", () => {
    expect(src).toContain("export function DiscoverSkeleton");
  });
});

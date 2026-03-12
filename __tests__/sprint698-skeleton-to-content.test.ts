/**
 * Sprint 698: SkeletonToContent adoption in remaining screens.
 * Discover, Challenger, and Profile now use SkeletonToContent for fade+slide transitions.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

// ─── Discover (search.tsx) ──────────────────────────────────────────────

describe("Sprint 698: Discover SkeletonToContent", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("imports SkeletonToContent from Skeleton", () => {
    expect(src).toContain("SkeletonToContent");
    expect(src).toContain('from "@/components/Skeleton"');
  });

  it("wraps content with SkeletonToContent visible={!isLoading}", () => {
    expect(src).toContain("<SkeletonToContent visible={!isLoading}>");
    expect(src).toContain("</SkeletonToContent>");
  });

  it("still shows SearchResultsSkeleton during loading", () => {
    expect(src).toContain("<SearchResultsSkeleton />");
  });

  it("still shows ErrorState on error", () => {
    expect(src).toContain('title="Could not load results"');
  });
});

// ─── Challenger ─────────────────────────────────────────────────────────

describe("Sprint 698: Challenger SkeletonToContent", () => {
  const src = readFile("app/(tabs)/challenger.tsx");

  it("imports SkeletonToContent from Skeleton", () => {
    expect(src).toContain("SkeletonToContent");
    expect(src).toContain('from "@/components/Skeleton"');
  });

  it("wraps content with SkeletonToContent visible={!isLoading}", () => {
    expect(src).toContain("<SkeletonToContent visible={!isLoading}>");
    expect(src).toContain("</SkeletonToContent>");
  });

  it("still shows ChallengerSkeleton during loading", () => {
    expect(src).toContain("<ChallengerSkeleton />");
  });

  it("still shows ErrorState on error", () => {
    expect(src).toContain("Couldn't load challenges");
  });
});

// ─── Profile ────────────────────────────────────────────────────────────

describe("Sprint 698: Profile SkeletonToContent", () => {
  const src = readFile("app/(tabs)/profile.tsx");

  it("imports SkeletonToContent from Skeleton", () => {
    expect(src).toContain("SkeletonToContent");
    expect(src).toContain('from "@/components/Skeleton"');
  });

  it("wraps ProfileContent with SkeletonToContent", () => {
    expect(src).toContain("<SkeletonToContent visible={!profileLoading}>");
    expect(src).toContain("</SkeletonToContent>");
  });

  it("still shows ProfileSkeleton during loading", () => {
    expect(src).toContain("<ProfileSkeleton />");
  });

  it("still shows ErrorState on error", () => {
    expect(src).toContain("Couldn't load your profile");
  });
});

// ─── SkeletonToContent Component Quality ────────────────────────────────

describe("Sprint 698: SkeletonToContent component", () => {
  const src = readFile("components/Skeleton.tsx");

  it("exports SkeletonToContent", () => {
    expect(src).toContain("export function SkeletonToContent");
  });

  it("uses 350ms fade duration", () => {
    expect(src).toContain("duration: 350");
  });

  it("uses 8px translateY for slide effect", () => {
    expect(src).toContain("useSharedValue(8)");
  });

  it("uses Easing.out(Easing.cubic) for natural deceleration", () => {
    expect(src).toContain("Easing.out(Easing.cubic)");
  });
});

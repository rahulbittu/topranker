/**
 * Sprint 696: Orphaned error style cleanup across tab screens.
 * Validates that dead error styles were removed after ErrorState adoption.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

// ─── Rankings ───────────────────────────────────────────────────────────

describe("Sprint 696: Rankings — no orphaned error styles", () => {
  const src = readFile("app/(tabs)/index.tsx");

  it("no errorIcon style", () => {
    expect(src).not.toContain("errorIcon:");
  });

  it("no retryButton style", () => {
    expect(src).not.toContain("retryButton:");
  });

  it("no retryButtonText style", () => {
    expect(src).not.toContain("retryButtonText:");
  });

  it("still uses ErrorState", () => {
    expect(src).toContain("<ErrorState");
  });
});

// ─── Discover ───────────────────────────────────────────────────────────

describe("Sprint 696: Discover — no orphaned error styles", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("no retryButton style", () => {
    expect(src).not.toContain("retryButton:");
  });

  it("no retryButtonText style", () => {
    expect(src).not.toContain("retryButtonText:");
  });

  it("no errorIcon style", () => {
    expect(src).not.toContain("errorIcon:");
  });

  it("still uses ErrorState", () => {
    expect(src).toContain("<ErrorState");
  });
});

// ─── Profile ────────────────────────────────────────────────────────────

describe("Sprint 696: Profile — no orphaned error styles", () => {
  const src = readFile("app/(tabs)/profile.tsx");

  it("no errorContainer style", () => {
    expect(src).not.toContain("errorContainer:");
  });

  it("no errorTitle style", () => {
    expect(src).not.toContain("errorTitle:");
  });

  it("no errorSubtitle style", () => {
    expect(src).not.toContain("errorSubtitle:");
  });

  it("no retryButton style", () => {
    expect(src).not.toContain("retryButton:");
  });

  it("no retryButtonText style", () => {
    expect(src).not.toContain("retryButtonText:");
  });

  it("still uses ErrorState", () => {
    expect(src).toContain("<ErrorState");
  });
});

// ─── Challenger ─────────────────────────────────────────────────────────

describe("Sprint 696: Challenger — no orphaned error styles", () => {
  const src = readFile("app/(tabs)/challenger.tsx");

  it("no errorState style", () => {
    expect(src).not.toContain("errorState:");
  });

  it("no errorText style", () => {
    expect(src).not.toContain("errorText:");
  });

  it("no errorSubtext style", () => {
    expect(src).not.toContain("errorSubtext:");
  });

  it("no retryButton style", () => {
    expect(src).not.toContain("retryButton:");
  });

  it("no retryText style definition", () => {
    // retryText as a style key — not the same as retryText in JSX
    expect(src).not.toContain("retryText:");
  });

  it("still uses ErrorState", () => {
    expect(src).toContain("<ErrorState");
  });
});

// ─── Skeleton Cleanup ───────────────────────────────────────────────────

describe("Sprint 696: Skeleton.tsx cleanup", () => {
  const src = readFile("components/Skeleton.tsx");

  it("does not import legacy Animated", () => {
    expect(src).not.toContain("import { Animated");
    expect(src).not.toContain("{ Animated,");
  });

  it("uses Reanimated for shimmer", () => {
    expect(src).toContain("react-native-reanimated");
  });
});

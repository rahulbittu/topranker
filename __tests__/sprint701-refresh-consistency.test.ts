/**
 * Sprint 701: Pull-to-refresh consistency across all tabs.
 * All 4 tabs now use React Query's isRefetching instead of manual refreshing state.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

// ─── Rankings (index.tsx) ───────────────────────────────────────────────

describe("Sprint 701: Rankings refresh pattern", () => {
  const src = readFile("app/(tabs)/index.tsx");

  it("uses isRefetching from React Query", () => {
    expect(src).toContain("isRefetching");
  });

  it("passes isRefetching to RefreshControl", () => {
    expect(src).toContain("refreshing={isRefetching}");
  });

  it("does NOT use manual refreshing state", () => {
    expect(src).not.toContain("setRefreshing");
  });

  it("has haptic feedback on refresh", () => {
    expect(src).toContain("hapticPullRefresh()");
  });
});

// ─── Discover (search.tsx) ──────────────────────────────────────────────

describe("Sprint 701: Discover refresh pattern", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("uses isRefetching from React Query", () => {
    expect(src).toContain("isRefetching");
  });

  it("passes isRefetching to RefreshControl", () => {
    expect(src).toContain("refreshing={isRefetching}");
  });

  it("does NOT use manual refreshing state", () => {
    expect(src).not.toContain("setRefreshing");
  });

  it("has haptic feedback on refresh", () => {
    expect(src).toContain("hapticPullRefresh()");
  });
});

// ─── Challenger ─────────────────────────────────────────────────────────

describe("Sprint 701: Challenger refresh pattern", () => {
  const src = readFile("app/(tabs)/challenger.tsx");

  it("uses isRefetching from React Query", () => {
    expect(src).toContain("isRefetching");
  });

  it("passes isRefetching to RefreshControl", () => {
    expect(src).toContain("refreshing={isRefetching}");
  });

  it("does NOT use manual refreshing state", () => {
    expect(src).not.toContain("setRefreshing");
  });

  it("does NOT import useState (no longer needed)", () => {
    expect(src).not.toContain("useState");
  });

  it("has haptic feedback on refresh", () => {
    expect(src).toContain("hapticPullRefresh()");
  });
});

// ─── Profile ────────────────────────────────────────────────────────────

describe("Sprint 701: Profile refresh pattern", () => {
  const src = readFile("app/(tabs)/profile.tsx");

  it("destructures isRefetching from useQuery", () => {
    expect(src).toContain("isRefetching");
  });

  it("passes isRefetching to ProfileContent", () => {
    expect(src).toContain("isRefetching={isRefetching}");
  });

  it("ProfileContent accepts isRefetching prop", () => {
    expect(src).toContain("isRefetching: boolean");
  });

  it("passes isRefetching to RefreshControl", () => {
    expect(src).toContain("refreshing={isRefetching}");
  });

  it("does NOT use manual setRefreshing state", () => {
    expect(src).not.toContain("setRefreshing");
  });

  it("has haptic feedback on refresh", () => {
    expect(src).toContain("hapticPullRefresh()");
  });
});

// ─── Consistency Check ──────────────────────────────────────────────────

describe("Sprint 701: All tabs use same refresh pattern", () => {
  const rankings = readFile("app/(tabs)/index.tsx");
  const discover = readFile("app/(tabs)/search.tsx");
  const challenger = readFile("app/(tabs)/challenger.tsx");
  const profile = readFile("app/(tabs)/profile.tsx");

  it("all tabs import RefreshControl", () => {
    expect(rankings).toContain("RefreshControl");
    expect(discover).toContain("RefreshControl");
    expect(challenger).toContain("RefreshControl");
    expect(profile).toContain("RefreshControl");
  });

  it("no tab uses manual refreshing state pattern", () => {
    const manualPattern = "setRefreshing(true)";
    expect(rankings).not.toContain(manualPattern);
    expect(discover).not.toContain(manualPattern);
    expect(challenger).not.toContain(manualPattern);
    expect(profile).not.toContain(manualPattern);
  });

  it("all tabs use BRAND amber for tintColor", () => {
    // All tabs reference the amber constant for RefreshControl tintColor
    expect(rankings).toContain("tintColor={AMBER}");
    expect(discover).toContain("tintColor={AMBER}");
    expect(profile).toContain("tintColor={AMBER}");
    // Challenger uses the expanded form
    expect(challenger).toContain("tintColor={BRAND.colors.amber}");
  });
});

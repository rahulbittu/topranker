/**
 * Sprint 706: Haptic feedback consistency — centralized haptic functions.
 * All 4 tabs now use hapticPullRefresh/hapticPress from lib/audio instead of direct Haptics.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

// ─── Rankings (index.tsx) ───────────────────────────────────────────────

describe("Sprint 706: Rankings haptic consistency", () => {
  const src = readFile("app/(tabs)/index.tsx");

  it("imports hapticPullRefresh from lib/audio", () => {
    expect(src).toContain("hapticPullRefresh");
    expect(src).toContain('@/lib/audio"');
  });

  it("uses hapticPullRefresh in onRefresh", () => {
    expect(src).toContain("hapticPullRefresh()");
  });

  it("uses hapticPress for button interactions", () => {
    expect(src).toContain("hapticPress()");
  });

  it("does NOT use direct Haptics import", () => {
    expect(src).not.toContain('import * as Haptics from "expo-haptics"');
  });
});

// ─── Discover (search.tsx) ──────────────────────────────────────────────

describe("Sprint 706: Discover haptic consistency", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("imports hapticPullRefresh from lib/audio", () => {
    expect(src).toContain("hapticPullRefresh");
    expect(src).toContain('@/lib/audio"');
  });

  it("uses hapticPullRefresh in onRefresh", () => {
    expect(src).toContain("hapticPullRefresh()");
  });

  it("uses hapticPress for view mode toggle", () => {
    expect(src).toContain("hapticPress()");
  });

  it("does NOT use direct Haptics import", () => {
    expect(src).not.toContain('import * as Haptics from "expo-haptics"');
  });
});

// ─── Challenger ─────────────────────────────────────────────────────────

describe("Sprint 706: Challenger haptic consistency", () => {
  const src = readFile("app/(tabs)/challenger.tsx");

  it("imports hapticPullRefresh from lib/audio", () => {
    expect(src).toContain("hapticPullRefresh");
    expect(src).toContain('@/lib/audio"');
  });

  it("uses hapticPullRefresh in onRefresh", () => {
    expect(src).toContain("hapticPullRefresh()");
  });

  it("does NOT use direct Haptics import", () => {
    expect(src).not.toContain('import * as Haptics from "expo-haptics"');
  });
});

// ─── Profile ────────────────────────────────────────────────────────────

describe("Sprint 706: Profile haptic consistency", () => {
  const src = readFile("app/(tabs)/profile.tsx");

  it("imports hapticPullRefresh from lib/audio", () => {
    expect(src).toContain("hapticPullRefresh");
    expect(src).toContain('@/lib/audio"');
  });

  it("uses hapticPullRefresh in onRefresh", () => {
    expect(src).toContain("hapticPullRefresh()");
  });

  it("does NOT use direct Haptics import", () => {
    expect(src).not.toContain('import * as Haptics from "expo-haptics"');
  });
});

// ─── Centralized Haptic Functions ───────────────────────────────────────

describe("Sprint 706: lib/audio haptic functions", () => {
  const src = readFile("lib/audio.ts");

  it("exports hapticPullRefresh", () => {
    expect(src).toContain("export function hapticPullRefresh");
  });

  it("hapticPullRefresh uses Medium impact", () => {
    expect(src).toContain("ImpactFeedbackStyle.Medium");
  });

  it("exports hapticPress", () => {
    expect(src).toContain("export function hapticPress");
  });

  it("hapticPress uses Light impact", () => {
    expect(src).toContain("ImpactFeedbackStyle.Light");
  });

  it("all haptic functions guard for web", () => {
    expect(src).toContain('Platform.OS === "web"');
  });
});

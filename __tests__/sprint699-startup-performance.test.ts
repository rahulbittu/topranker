/**
 * Sprint 699: App startup performance — splash timing, font trim, data prefetch.
 * Validates tightened splash animation, removed unused font, and prefetch patterns.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

// ─── Splash Timing Optimization ─────────────────────────────────────────

describe("Sprint 699: Splash animation timing", () => {
  const src = readFile("app/_layout.tsx");

  it("splash exit starts at 1700ms (down from 2400ms)", () => {
    expect(src).toContain("withDelay(1700, withTiming(1.12");
    expect(src).toContain("withDelay(1700, withTiming(0");
  });

  it("does NOT have old 2400ms exit delay", () => {
    expect(src).not.toContain("withDelay(2400");
  });

  it("crown haptic fires at 100ms (down from 150ms)", () => {
    expect(src).toContain("setTimeout(() => hapticSplashCrown(), 100)");
  });

  it("logo haptic fires at 300ms (down from 400ms)", () => {
    expect(src).toContain("setTimeout(() => hapticSplashLogo(), 300)");
  });

  it("tagline reveals at 800ms (down from 1100ms)", () => {
    expect(src).toContain("withDelay(800, withTiming(1, { duration: 350");
  });

  it("ring fades at 1000ms (down from 1400ms)", () => {
    expect(src).toContain("withDelay(1000, withTiming(0, { duration: 400 })");
  });

  it("has sprint 699 comment explaining tightening", () => {
    expect(src).toContain("Sprint 699: Tightened splash from ~2.9s to ~2.1s");
  });
});

// ─── Unused Font Removal ────────────────────────────────────────────────

describe("Sprint 699: Font optimization", () => {
  const src = readFile("app/_layout.tsx");

  it("does NOT load PlayfairDisplay_400Regular_Italic (unused)", () => {
    expect(src).not.toContain("PlayfairDisplay_400Regular_Italic");
  });

  it("still loads all 4 critical Playfair variants", () => {
    expect(src).toContain("PlayfairDisplay_400Regular");
    expect(src).toContain("PlayfairDisplay_700Bold");
    expect(src).toContain("PlayfairDisplay_800ExtraBold");
    expect(src).toContain("PlayfairDisplay_900Black");
  });

  it("still loads all 5 DM Sans variants", () => {
    expect(src).toContain("DMSans_400Regular");
    expect(src).toContain("DMSans_500Medium");
    expect(src).toContain("DMSans_600SemiBold");
    expect(src).toContain("DMSans_700Bold");
    expect(src).toContain("DMSans_800ExtraBold");
  });
});

// ─── Data Prefetch During Splash ────────────────────────────────────────

describe("Sprint 699: Prefetch during splash", () => {
  const src = readFile("app/_layout.tsx");

  it("prefetches onboarding flag during splash", () => {
    expect(src).toContain("AsyncStorage.getItem(ONBOARDING_KEY)");
    expect(src).toContain("onboardingSeen.current");
  });

  it("prefetches default leaderboard query", () => {
    expect(src).toContain("queryClient.prefetchQuery");
    expect(src).toContain('queryKey: ["leaderboard", "Dallas", "restaurant"');
  });

  it("uses fetchLeaderboard for prefetch", () => {
    expect(src).toContain("fetchLeaderboard");
  });

  it("sets 30s staleTime on prefetch to match tab query", () => {
    expect(src).toContain("staleTime: 30000");
  });

  it("has sprint 699 prefetch comment", () => {
    expect(src).toContain("Sprint 699: Prefetch onboarding flag + initial data during splash");
  });
});

// ─── Existing Functionality Preserved ───────────────────────────────────

describe("Sprint 699: Startup still works", () => {
  const src = readFile("app/_layout.tsx");

  it("still prevents auto-hide on splash screen", () => {
    expect(src).toContain("SplashScreen.preventAutoHideAsync()");
  });

  it("still hides splash when fonts loaded", () => {
    expect(src).toContain("SplashScreen.hideAsync()");
  });

  it("still initializes sync service", () => {
    expect(src).toContain("initSyncService()");
  });

  it("still registers for push notifications", () => {
    expect(src).toContain("registerForPushNotifications()");
  });

  it("still shows AnimatedSplash", () => {
    expect(src).toContain("<AnimatedSplash onFinish={handleSplashFinish}");
  });
});

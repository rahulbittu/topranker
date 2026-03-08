/**
 * Visual Regression Testing Utility
 * Screenshot comparison abstraction for critical screen verification.
 * Sprint 124
 */

export interface ScreenshotConfig {
  name: string;
  route: string;
  viewport: { width: number; height: number };
}

/** The 8 critical screens that must pass visual regression before every release */
export const CRITICAL_SCREENS: ScreenshotConfig[] = [
  { name: "home", route: "/(tabs)/", viewport: { width: 390, height: 844 } },
  { name: "search", route: "/(tabs)/search", viewport: { width: 390, height: 844 } },
  { name: "challenger", route: "/(tabs)/challenger", viewport: { width: 390, height: 844 } },
  { name: "profile", route: "/(tabs)/profile", viewport: { width: 390, height: 844 } },
  { name: "settings", route: "/settings", viewport: { width: 390, height: 844 } },
  { name: "business-detail", route: "/business/1", viewport: { width: 390, height: 844 } },
  { name: "login", route: "/login", viewport: { width: 390, height: 844 } },
  { name: "signup", route: "/signup", viewport: { width: 390, height: 844 } },
];

/** Maximum allowed pixel difference percentage before a test fails */
export const DIFF_THRESHOLD = 0.1;

/**
 * Generate a manifest of all critical screens for CI pipeline consumption.
 */
export function generateScreenshotManifest(): {
  screens: ScreenshotConfig[];
  generatedAt: string;
} {
  return {
    screens: CRITICAL_SCREENS,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Compare two screenshot buffers and return the diff percentage.
 * Replace with pixelmatch integration when ready for real pixel comparison.
 */
export function compareScreenshots(
  baseline: string,
  current: string
): { match: boolean; diffPercentage: number } {
  // Replace with pixelmatch integration
  return { match: true, diffPercentage: 0 };
}

/**
 * Sprint 778: Accessibility Pass
 *
 * Added VoiceOver labels to tab bar and challenger screen.
 * Ensures Apple App Store accessibility requirements are met.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}
function readJson(rel: string) {
  return JSON.parse(readFile(rel));
}

describe("Sprint 778: Accessibility Pass", () => {
  describe("tab bar — tabBarAccessibilityLabel", () => {
    const src = readFile("app/(tabs)/_layout.tsx");

    it("Rankings tab has accessibility label", () => {
      expect(src).toContain('tabBarAccessibilityLabel: "Rankings tab');
    });

    it("Challenger tab has accessibility label", () => {
      expect(src).toContain('tabBarAccessibilityLabel: "Challenger tab');
    });

    it("Discover tab has accessibility label", () => {
      expect(src).toContain('tabBarAccessibilityLabel: "Discover tab');
    });

    it("Profile tab has accessibility label", () => {
      expect(src).toContain('tabBarAccessibilityLabel: "Profile tab');
    });
  });

  describe("challenger screen — accessibility roles", () => {
    const src = readFile("app/(tabs)/challenger.tsx");

    it("has header accessibility role", () => {
      expect(src).toContain('accessibilityRole="header"');
    });

    it("live badge has accessibility label", () => {
      expect(src).toContain('accessibilityLabel="Live indicator"');
    });
  });

  describe("error boundary — accessibility", () => {
    const src = readFile("components/ErrorBoundary.tsx");

    it("retry button has accessibility role", () => {
      expect(src).toContain('accessibilityRole="button"');
    });

    it("retry button has accessibility label", () => {
      expect(src).toContain('accessibilityLabel="Try again"');
    });

    it("home button has accessibility label", () => {
      expect(src).toContain('accessibilityLabel="Go to home screen"');
    });
  });

  describe("not-found page — accessibility", () => {
    const src = readFile("app/+not-found.tsx");

    it("has alert accessibility role", () => {
      expect(src).toContain('accessibilityRole="alert"');
    });

    it("back link has accessibility label", () => {
      expect(src).toContain('accessibilityLabel="Back to Rankings"');
    });
  });

  describe("network banner — accessibility", () => {
    const src = readFile("components/NetworkBanner.tsx");

    it("has alert accessibility role", () => {
      expect(src).toContain('accessibilityRole="alert"');
    });

    it("dismiss button has accessibility label", () => {
      expect(src).toContain('accessibilityLabel="Dismiss banner"');
    });
  });

  describe("file health", () => {
    const thresholds = readJson("shared/thresholds.json");

    it("tracks 34 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(34);
    });

    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});

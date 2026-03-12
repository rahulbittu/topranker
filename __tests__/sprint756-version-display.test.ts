/**
 * Sprint 756: Version Display in Profile
 *
 * Validates that the app version is visible in the profile screen
 * for beta debugging purposes.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 756: Version Display", () => {
  describe("ProfileBottomSection", () => {
    const src = readFile("components/profile/ProfileBottomSection.tsx");

    it("imports APP_VERSION", () => {
      expect(src).toContain("APP_VERSION");
    });

    it("imports BUILD_NUMBER", () => {
      expect(src).toContain("BUILD_NUMBER");
    });

    it("displays version label", () => {
      expect(src).toContain("versionLabel");
    });

    it("includes platform identifier", () => {
      expect(src).toContain("Platform.OS");
    });

    it("uses small font for version", () => {
      expect(src).toContain("fontSize: 11");
    });

    it("uses tertiary color for subtlety", () => {
      expect(src).toContain("Colors.textTertiary");
    });
  });

  describe("app-env exports", () => {
    const appEnv = readFile("lib/app-env.ts");

    it("exports APP_VERSION", () => {
      expect(appEnv).toContain("export const APP_VERSION");
    });

    it("exports BUILD_NUMBER", () => {
      expect(appEnv).toContain("export const BUILD_NUMBER");
    });

    it("falls back to 1.0.0", () => {
      expect(appEnv).toContain('"1.0.0"');
    });
  });

  describe("feedback form includes version", () => {
    const feedback = readFile("app/feedback.tsx");

    it("sends appVersion in feedback", () => {
      expect(feedback).toContain("appVersion");
    });

    it("sends buildNumber in feedback", () => {
      expect(feedback).toContain("buildNumber");
    });
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("tracks 34 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(34);
    });

    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      const sizeKb = buildSrc.length / 1024;
      expect(sizeKb).toBeLessThan(750);
    });
  });
});

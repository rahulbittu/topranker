/**
 * Sprint 757: Pre-Submit Script Railway Checks
 *
 * Validates that the pre-submit script includes Railway deployment
 * readiness checks from Sprints 751-753.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 757: Pre-Submit Railway Checks", () => {
  const script = readFile("scripts/pre-submit-check.sh");

  describe("Railway deployment checks", () => {
    it("checks /_health endpoint", () => {
      expect(script).toContain("/_health");
    });

    it("checks /_ready endpoint", () => {
      expect(script).toContain("/_ready");
    });

    it("checks CORS expo-platform header", () => {
      expect(script).toContain("expo-platform");
    });

    it("checks CSP Railway domains", () => {
      expect(script).toContain("railway.app");
    });
  });

  describe("existing security checks still present", () => {
    it("checks Math.random() IDs", () => {
      expect(script).toContain("Math.random");
    });

    it("checks SHARE_BASE_URL", () => {
      expect(script).toContain("SHARE_BASE_URL");
    });

    it("checks config.siteUrl", () => {
      expect(script).toContain("config.siteUrl");
    });

    it("checks empty catches", () => {
      expect(script).toContain("empty catch");
    });

    it("checks isReceipt validation", () => {
      expect(script).toContain("isReceipt");
    });

    it("checks URL protocol validation", () => {
      expect(script).toContain("URL protocol");
    });
  });

  describe("app config checks still present", () => {
    it("checks bundle ID", () => {
      expect(script).toContain("bundleIdentifier");
    });

    it("checks privacy manifest", () => {
      expect(script).toContain("privacyManifests");
    });

    it("checks encryption exemption", () => {
      expect(script).toContain("usesNonExemptEncryption");
    });

    it("checks ASC App ID", () => {
      expect(script).toContain("ascAppId");
    });
  });

  describe("script structure", () => {
    it("uses set -e for fail-fast", () => {
      expect(script).toContain("set -e");
    });

    it("has pass/fail/warn counters", () => {
      expect(script).toContain("PASS=0");
      expect(script).toContain("FAIL=0");
    });

    it("exits with error on failures", () => {
      expect(script).toContain("exit 1");
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

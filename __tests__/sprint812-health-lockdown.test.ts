/**
 * Sprint 812: Health Endpoint Lockdown
 *
 * Splits /api/health into:
 * - /api/health — public liveness (status, version, uptime, timestamp)
 * - /api/health/diagnostics — admin-gated full diagnostics
 *
 * Per external critique 800-804: "Lock down /api/health exposure.
 * Split public liveness from internal diagnostics."
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 812: Health Endpoint Lockdown", () => {
  const healthSrc = readFile("server/routes-health.ts");

  describe("public /api/health is minimal", () => {
    it("has /api/health route", () => {
      expect(healthSrc).toContain('"/api/health"');
    });

    it("public health does NOT expose memory", () => {
      // Find the public health handler (first /api/health occurrence)
      const publicIdx = healthSrc.indexOf('"/api/health"');
      const diagnosticsIdx = healthSrc.indexOf('"/api/health/diagnostics"');
      const publicSection = healthSrc.slice(publicIdx, diagnosticsIdx);
      expect(publicSection).not.toContain("memoryUsage");
      expect(publicSection).not.toContain("heapUsed");
    });

    it("public health does NOT expose environment", () => {
      const publicIdx = healthSrc.indexOf('"/api/health"');
      const diagnosticsIdx = healthSrc.indexOf('"/api/health/diagnostics"');
      const publicSection = healthSrc.slice(publicIdx, diagnosticsIdx);
      expect(publicSection).not.toContain("environment");
      expect(publicSection).not.toContain("nodeVersion");
    });

    it("public health does NOT expose push stats", () => {
      const publicIdx = healthSrc.indexOf('"/api/health"');
      const diagnosticsIdx = healthSrc.indexOf('"/api/health/diagnostics"');
      const publicSection = healthSrc.slice(publicIdx, diagnosticsIdx);
      expect(publicSection).not.toContain("push:");
      expect(publicSection).not.toContain("pushStats");
    });

    it("public health does NOT expose logs or rate limiter", () => {
      const publicIdx = healthSrc.indexOf('"/api/health"');
      const diagnosticsIdx = healthSrc.indexOf('"/api/health/diagnostics"');
      const publicSection = healthSrc.slice(publicIdx, diagnosticsIdx);
      expect(publicSection).not.toContain("getLogStats");
      expect(publicSection).not.toContain("getRateLimitStats");
    });
  });

  describe("/api/health/diagnostics is admin-gated", () => {
    it("has /api/health/diagnostics route", () => {
      expect(healthSrc).toContain('"/api/health/diagnostics"');
    });

    it("checks admin auth", () => {
      expect(healthSrc).toContain("isAdminEmail");
      expect(healthSrc).toContain("403");
    });

    it("includes full diagnostics behind auth", () => {
      const diagIdx = healthSrc.indexOf('"/api/health/diagnostics"');
      const diagSection = healthSrc.slice(diagIdx);
      expect(diagSection).toContain("memory:");
      expect(diagSection).toContain("push:");
      expect(diagSection).toContain("getLogStats");
      expect(diagSection).toContain("getRateLimitStats");
      expect(diagSection).toContain("getClientCount");
    });
  });

  describe("file health", () => {
    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});

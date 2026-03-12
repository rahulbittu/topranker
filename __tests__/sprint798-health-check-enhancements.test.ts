/**
 * Sprint 798: Health Check Endpoint Enhancements
 *
 * Adds DB latency to /_ready and push stats + environment to /api/health
 * for production observability.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 798: Health Check Enhancements", () => {
  const routesSrc = readFile("server/routes.ts");

  describe("/_ready enhancements", () => {
    it("measures DB latency", () => {
      expect(routesSrc).toContain("dbLatencyMs");
    });

    it("uses Date.now() for timing", () => {
      // Verify timing pattern exists near the readiness probe
      const readyIdx = routesSrc.indexOf("/_ready");
      const readyBlock = routesSrc.slice(readyIdx, readyIdx + 400);
      expect(readyBlock).toContain("Date.now()");
    });

    it("returns dbLatencyMs in response", () => {
      const readyIdx = routesSrc.indexOf("/_ready");
      const readyBlock = routesSrc.slice(readyIdx, readyIdx + 400);
      expect(readyBlock).toContain("dbLatencyMs");
    });
  });

  describe("/api/health enhancements", () => {
    it("includes environment in response", () => {
      const healthIdx = routesSrc.indexOf("/api/health");
      const healthBlock = routesSrc.slice(healthIdx, healthIdx + 1200);
      expect(healthBlock).toContain("environment:");
    });

    it("includes push stats in response", () => {
      const healthIdx = routesSrc.indexOf("/api/health");
      const healthBlock = routesSrc.slice(healthIdx, healthIdx + 1200);
      expect(healthBlock).toContain("push: pushStats");
    });

    it("imports getPushStats from push-notifications", () => {
      const healthIdx = routesSrc.indexOf("/api/health");
      const healthBlock = routesSrc.slice(healthIdx, healthIdx + 1200);
      expect(healthBlock).toContain("getPushStats");
    });

    it("handles push module unavailability gracefully", () => {
      const healthIdx = routesSrc.indexOf("/api/health");
      const healthBlock = routesSrc.slice(healthIdx, healthIdx + 1200);
      expect(healthBlock).toContain("catch");
    });

    it("uses config.nodeEnv for environment", () => {
      const healthIdx = routesSrc.indexOf("/api/health");
      const healthBlock = routesSrc.slice(healthIdx, healthIdx + 1200);
      expect(healthBlock).toContain("config.nodeEnv");
    });
  });

  describe("imports", () => {
    it("imports config", () => {
      expect(routesSrc).toContain('import { config } from "./config"');
    });
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("routes.ts within LOC threshold", () => {
      const lines = routesSrc.split("\n").length;
      const max = thresholds.files["server/routes.ts"].maxLOC;
      expect(lines).toBeLessThanOrEqual(max);
    });

    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});

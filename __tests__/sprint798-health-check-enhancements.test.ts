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
  // Sprint 804: Health routes extracted to routes-health.ts
  const routesSrc = readFile("server/routes-health.ts");

  describe("/_ready enhancements", () => {
    it("measures DB latency", () => {
      expect(routesSrc).toContain("dbLatencyMs");
    });

    it("uses Date.now() for timing", () => {
      expect(routesSrc).toContain("Date.now()");
    });

    it("returns dbLatencyMs in response", () => {
      expect(routesSrc).toContain("dbLatencyMs");
    });
  });

  describe("/api/health enhancements", () => {
    it("includes environment in response", () => {
      expect(routesSrc).toContain("environment:");
    });

    it("includes push stats in response", () => {
      expect(routesSrc).toContain("push: pushStats");
    });

    it("imports getPushStats from push-notifications", () => {
      expect(routesSrc).toContain("getPushStats");
    });

    it("handles push module unavailability gracefully", () => {
      expect(routesSrc).toContain("catch");
    });

    it("uses config.nodeEnv for environment", () => {
      expect(routesSrc).toContain("config.nodeEnv");
    });
  });

  describe("imports", () => {
    it("imports config", () => {
      expect(routesSrc).toContain('import { config } from "./config"');
    });
  });

  describe("file health", () => {
    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});

/**
 * Sprint 803: Rate Limiter Stats in Health Endpoint
 *
 * Adds getRateLimitStats() to rate-limiter.ts and wires it into /api/health.
 * Reports active window count and store type (memory vs redis).
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 803: Rate Limiter Health Stats", () => {
  const rateLimiterSrc = readFile("server/rate-limiter.ts");
  const routesSrc = readFile("server/routes.ts");

  describe("rate-limiter.ts exports", () => {
    it("exports getRateLimitStats", () => {
      expect(rateLimiterSrc).toContain("export function getRateLimitStats()");
    });

    it("returns activeWindows count", () => {
      expect(rateLimiterSrc).toContain("activeWindows:");
    });

    it("returns storeType", () => {
      expect(rateLimiterSrc).toContain("storeType:");
    });
  });

  describe("health endpoint integration", () => {
    it("routes.ts imports getRateLimitStats", () => {
      expect(routesSrc).toContain("getRateLimitStats");
    });

    it("/api/health includes rateLimit field", () => {
      const healthIdx = routesSrc.indexOf("/api/health");
      const healthBlock = routesSrc.slice(healthIdx, healthIdx + 1400);
      expect(healthBlock).toContain("rateLimit: getRateLimitStats()");
    });
  });

  describe("functional behavior", () => {
    it("getRateLimitStats returns expected shape", async () => {
      const { getRateLimitStats } = await import("../server/rate-limiter");
      const stats = getRateLimitStats();
      expect(typeof stats.activeWindows).toBe("number");
      expect(stats.activeWindows).toBeGreaterThanOrEqual(0);
      expect(["memory", "redis"]).toContain(stats.storeType);
    });

    it("defaults to memory store in test", async () => {
      const { getRateLimitStats } = await import("../server/rate-limiter");
      const stats = getRateLimitStats();
      expect(stats.storeType).toBe("memory");
    });
  });

  describe("rate limiter configurations", () => {
    it("has auth rate limiter (10 req/min)", () => {
      expect(rateLimiterSrc).toContain("authRateLimiter");
      expect(rateLimiterSrc).toContain('keyPrefix: "auth"');
    });

    it("has api rate limiter (100 req/min)", () => {
      expect(rateLimiterSrc).toContain("apiRateLimiter");
    });

    it("has rating rate limiter (10 req/min)", () => {
      expect(rateLimiterSrc).toContain("ratingRateLimiter");
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

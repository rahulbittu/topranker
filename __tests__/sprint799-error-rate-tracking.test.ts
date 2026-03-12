/**
 * Sprint 799: Error Rate Tracking in Structured Logger
 *
 * Adds error/warn counters to logger for production observability.
 * Exposed via getLogStats() and wired into /api/health.
 */
import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 799: Error Rate Tracking", () => {
  const loggerSrc = readFile("server/logger.ts");
  const routesSrc = readFile("server/routes.ts");

  describe("logger exports", () => {
    it("exports getLogStats", () => {
      expect(loggerSrc).toContain("export function getLogStats()");
    });

    it("exports resetLogStats", () => {
      expect(loggerSrc).toContain("export function resetLogStats()");
    });
  });

  describe("counter tracking", () => {
    it("tracks errorCount", () => {
      expect(loggerSrc).toContain("errorCount++");
    });

    it("tracks warnCount", () => {
      expect(loggerSrc).toContain("warnCount++");
    });

    it("records lastErrorAt timestamp", () => {
      expect(loggerSrc).toContain("lastErrorAt");
    });

    it("records lastWarnAt timestamp", () => {
      expect(loggerSrc).toContain("lastWarnAt");
    });
  });

  describe("getLogStats return shape", () => {
    it("returns errorCount, warnCount, lastErrorAt, lastWarnAt", () => {
      expect(loggerSrc).toContain("return { errorCount, warnCount, lastErrorAt, lastWarnAt }");
    });
  });

  describe("health endpoint integration", () => {
    it("routes.ts imports getLogStats", () => {
      expect(routesSrc).toContain("getLogStats");
    });

    it("/api/health includes logs field", () => {
      const healthIdx = routesSrc.indexOf("/api/health");
      const healthBlock = routesSrc.slice(healthIdx, healthIdx + 1200);
      expect(healthBlock).toContain("logs: getLogStats()");
    });
  });

  describe("functional behavior", () => {
    let getLogStats: any;
    let resetLogStats: any;
    let log: any;

    beforeEach(async () => {
      const mod = await import("../server/logger");
      getLogStats = mod.getLogStats;
      resetLogStats = mod.resetLogStats;
      log = mod.log;
      resetLogStats();
    });

    it("starts at zero", () => {
      const stats = getLogStats();
      expect(stats.errorCount).toBe(0);
      expect(stats.warnCount).toBe(0);
      expect(stats.lastErrorAt).toBeNull();
      expect(stats.lastWarnAt).toBeNull();
    });

    it("increments on error", () => {
      log.error("test error");
      const stats = getLogStats();
      expect(stats.errorCount).toBe(1);
      expect(stats.lastErrorAt).toBeTruthy();
    });

    it("increments on warn", () => {
      log.warn("test warn");
      const stats = getLogStats();
      expect(stats.warnCount).toBe(1);
      expect(stats.lastWarnAt).toBeTruthy();
    });

    it("increments on tagged logger error", () => {
      const tagged = log.tag("Test");
      tagged.error("tagged error");
      const stats = getLogStats();
      expect(stats.errorCount).toBe(1);
    });

    it("increments on tagged logger warn", () => {
      const tagged = log.tag("Test");
      tagged.warn("tagged warn");
      const stats = getLogStats();
      expect(stats.warnCount).toBe(1);
    });

    it("accumulates across multiple calls", () => {
      log.error("e1");
      log.error("e2");
      log.warn("w1");
      const stats = getLogStats();
      expect(stats.errorCount).toBe(2);
      expect(stats.warnCount).toBe(1);
    });

    it("resets correctly", () => {
      log.error("e1");
      log.warn("w1");
      resetLogStats();
      const stats = getLogStats();
      expect(stats.errorCount).toBe(0);
      expect(stats.warnCount).toBe(0);
      expect(stats.lastErrorAt).toBeNull();
      expect(stats.lastWarnAt).toBeNull();
    });
  });

  describe("file health", () => {
    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});

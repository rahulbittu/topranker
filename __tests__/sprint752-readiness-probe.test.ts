/**
 * Sprint 752: Readiness Probe + Enhanced Startup Logging
 *
 * Validates /_ready endpoint for database connectivity checks
 * and enhanced startup logging for Railway deployment debugging.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 752: Readiness Probe", () => {
  describe("/_ready endpoint", () => {
    // Sprint 804: Health routes extracted to routes-health.ts
    const routes = readFile("server/routes-health.ts");

    it("registers /_ready route", () => {
      expect(routes).toContain('app.get("/_ready"');
    });

    it("checks database connectivity", () => {
      expect(routes).toContain("SELECT 1");
    });

    it("returns ready status on success", () => {
      expect(routes).toContain('"ready"');
      expect(routes).toContain('"connected"');
    });

    it("returns 503 on database failure", () => {
      expect(routes).toContain("503");
      expect(routes).toContain('"not_ready"');
      expect(routes).toContain('"disconnected"');
    });

    it("does not require authentication", () => {
      const readyLine = routes.indexOf('app.get("/_ready"');
      expect(readyLine).toBeGreaterThan(-1);
      expect(routes.substring(readyLine, readyLine + 300)).not.toContain("requireAuth");
    });
  });

  describe("startup logging", () => {
    const index = readFile("server/index.ts");

    it("logs port and host", () => {
      expect(index).toContain("0.0.0.0");
    });

    it("logs Node version", () => {
      expect(index).toContain("process.version");
    });

    it("logs PID", () => {
      expect(index).toContain("process.pid");
    });

    it("logs environment", () => {
      expect(index).toContain("NODE_ENV");
    });
  });

  describe("graceful shutdown (existing)", () => {
    const index = readFile("server/index.ts");

    it("handles SIGTERM", () => {
      expect(index).toContain("SIGTERM");
    });

    it("handles SIGINT", () => {
      expect(index).toContain("SIGINT");
    });

    it("closes HTTP server", () => {
      expect(index).toContain("server.close");
    });

    it("has forced shutdown timeout", () => {
      expect(index).toContain("10_000");
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

    it("12,900+ tests", () => {
      expect(thresholds.tests.currentCount).toBeGreaterThan(12900);
    });
  });
});

/**
 * Sprint 751: Railway Health Check Endpoint
 *
 * Validates that the /_health endpoint exists for Railway load balancer probes
 * and that railway.toml is correctly configured.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 751: Railway Health Check", () => {
  describe("/_health endpoint", () => {
    const routes = readFile("server/routes.ts");

    it("registers /_health route", () => {
      expect(routes).toContain('app.get("/_health"');
    });

    it("returns 200 status", () => {
      expect(routes).toContain("res.status(200)");
    });

    it("returns JSON with status ok", () => {
      expect(routes).toContain('"ok"');
    });

    it("does not require authentication", () => {
      // /_health should be before auth middleware, no requireAuth
      const healthLine = routes.indexOf('app.get("/_health"');
      const authSetup = routes.indexOf("setupAuth(app)");
      // The health endpoint is registered after setupAuth but doesn't use requireAuth
      expect(healthLine).toBeGreaterThan(-1);
      expect(routes.substring(healthLine, healthLine + 200)).not.toContain("requireAuth");
    });
  });

  describe("/api/health endpoint (existing)", () => {
    // Sprint 804: Health routes extracted to routes-health.ts
    const healthRoutes = readFile("server/routes-health.ts");

    it("still exists", () => {
      expect(healthRoutes).toContain('app.get("/api/health"');
    });

    it("returns process vitals", () => {
      expect(healthRoutes).toContain("process.uptime()");
      expect(healthRoutes).toContain("process.memoryUsage()");
    });
  });

  describe("railway.toml configuration", () => {
    const railwayToml = readFile("railway.toml");

    it("exists", () => {
      expect(railwayToml).toBeTruthy();
    });

    it("uses Nixpacks builder", () => {
      expect(railwayToml).toContain("NIXPACKS");
    });

    it("sets internal port 8080", () => {
      expect(railwayToml).toContain("internalPort = 8080");
    });

    it("health check points to /_health", () => {
      expect(railwayToml).toContain('path = "/_health"');
    });

    it("health check uses GET method", () => {
      expect(railwayToml).toContain('method = "GET"');
    });

    it("health check interval is 30s", () => {
      expect(railwayToml).toContain("interval = 30000");
    });

    it("restart policy is ON_FAILURE", () => {
      expect(railwayToml).toContain("ON_FAILURE");
    });

    it("start command includes PORT=8080", () => {
      expect(railwayToml).toContain("PORT=8080");
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

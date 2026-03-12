/**
 * Sprint 764: Route Count Fix
 *
 * The startup banner logged "0 routes registered" because it only
 * counted direct route handlers (layer.route), missing Router instances.
 * Fixed to count both direct routes and routers, and moved count
 * after configureExpoAndLanding() so all routes are captured.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 764: Route Count Fix", () => {
  describe("server/index.ts route counting", () => {
    const index = readFile("server/index.ts");

    it("counts both direct routes and routers", () => {
      expect(index).toContain("directRoutes + routers");
    });

    it("filters for router layers", () => {
      expect(index).toContain('layer.name === "router"');
    });

    it("route count runs after configureExpoAndLanding", () => {
      const configPos = index.indexOf("configureExpoAndLanding(app)");
      const countPos = index.indexOf("route handlers registered");
      expect(countPos).toBeGreaterThan(configPos);
    });

    it("no longer uses old 0-count pattern", () => {
      expect(index).not.toContain("routeCount} routes registered");
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

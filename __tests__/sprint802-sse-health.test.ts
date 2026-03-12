/**
 * Sprint 802: SSE Connection Tracking in Health Endpoint
 *
 * Wires getClientCount() from sse.ts into /api/health as sseClients field.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 802: SSE Health Tracking", () => {
  const routesSrc = readFile("server/routes.ts");
  const sseSrc = readFile("server/sse.ts");

  describe("sse.ts exports", () => {
    it("exports getClientCount", () => {
      expect(sseSrc).toContain("export function getClientCount()");
    });

    it("returns clients.size", () => {
      expect(sseSrc).toContain("clients.size");
    });
  });

  describe("routes.ts integration", () => {
    it("imports getClientCount from sse", () => {
      expect(routesSrc).toContain("getClientCount");
      expect(routesSrc).toContain('./sse"');
    });

    it("includes sseClients in health response", () => {
      const healthIdx = routesSrc.indexOf("/api/health");
      const healthBlock = routesSrc.slice(healthIdx, healthIdx + 1200);
      expect(healthBlock).toContain("sseClients: getClientCount()");
    });
  });

  describe("functional behavior", () => {
    it("getClientCount returns a number", async () => {
      const { getClientCount } = await import("../server/sse");
      expect(typeof getClientCount()).toBe("number");
      expect(getClientCount()).toBeGreaterThanOrEqual(0);
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

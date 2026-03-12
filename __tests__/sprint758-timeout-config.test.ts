/**
 * Sprint 758: Server Timeout Configuration
 *
 * Validates keepAliveTimeout and headersTimeout are set
 * to avoid Railway 502 errors from premature connection drops.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 758: Timeout Configuration", () => {
  const index = readFile("server/index.ts");

  describe("keepAlive timeout", () => {
    it("sets keepAliveTimeout", () => {
      expect(index).toContain("server.keepAliveTimeout");
    });

    it("is 65 seconds (above Railway 60s LB idle)", () => {
      expect(index).toContain("65_000");
    });
  });

  describe("headers timeout", () => {
    it("sets headersTimeout", () => {
      expect(index).toContain("server.headersTimeout");
    });

    it("is greater than keepAliveTimeout", () => {
      expect(index).toContain("66_000");
    });
  });

  describe("graceful shutdown (existing)", () => {
    it("handles SIGTERM", () => {
      expect(index).toContain("SIGTERM");
    });

    it("handles SIGINT", () => {
      expect(index).toContain("SIGINT");
    });

    it("has 10s forced shutdown timeout", () => {
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
  });
});

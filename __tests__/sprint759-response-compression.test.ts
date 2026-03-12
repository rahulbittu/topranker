/**
 * Sprint 759: Response Compression
 *
 * Validates that the server uses compression middleware for API responses.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 759: Response Compression", () => {
  const index = readFile("server/index.ts");

  describe("compression middleware", () => {
    it("imports compression", () => {
      expect(index).toContain('import compression from "compression"');
    });

    it("applies compression middleware", () => {
      expect(index).toContain("app.use(compression");
    });

    it("sets 1kb threshold", () => {
      expect(index).toContain("threshold: 1024");
    });

    it("is applied before body parsing call", () => {
      const compIdx = index.indexOf("app.use(compression");
      const bodyCallIdx = index.indexOf("setupBodyParsing(app)");
      expect(compIdx).toBeLessThan(bodyCallIdx);
    });

    it("is applied after security headers", () => {
      const secIdx = index.indexOf("app.use(securityHeaders)");
      const compIdx = index.indexOf("app.use(compression");
      expect(compIdx).toBeGreaterThan(secIdx);
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

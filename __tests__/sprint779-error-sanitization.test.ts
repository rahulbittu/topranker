/**
 * Sprint 779: Production Error Sanitization
 *
 * Prevents leaking internal error messages to API clients in production.
 * Only generic "Internal Server Error" is returned for 5xx errors.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 779: Production Error Sanitization", () => {
  describe("server/wrap-async.ts — route error handler", () => {
    const src = readFile("server/wrap-async.ts");

    it("checks config.isProduction for production mode", () => {
      // Sprint 807: Centralized to config.ts
      expect(src).toContain("config.isProduction");
    });

    it("returns generic message in production", () => {
      expect(src).toContain('"Internal Server Error"');
    });

    it("still logs full error server-side", () => {
      expect(src).toContain("log.error");
    });

    it("checks headersSent before responding", () => {
      expect(src).toContain("res.headersSent");
    });
  });

  describe("server/index.ts — global error handler", () => {
    const src = readFile("server/index.ts");

    it("sanitizes 5xx errors in production", () => {
      expect(src).toContain("isProduction && status >= 500");
    });

    it("allows 4xx error messages through (e.g. validation errors)", () => {
      // 4xx errors like 401, 404, 422 should show their message
      expect(src).toContain("status >= 500");
      // Only >= 500 is masked — 4xx passes through
    });
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("tracks 34 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(34);
    });

    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});

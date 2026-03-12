/**
 * Sprint 762: Startup Order Fix + Callable Logger
 *
 * Fixes: 502 Bad Gateway on Railway — server.listen() was blocked by
 * background DB tasks. Also fixes "log2 is not a function" crash by
 * making the logger export callable (function with methods).
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 762: Startup Order Fix + Callable Logger", () => {
  describe("server/index.ts startup order", () => {
    const index = readFile("server/index.ts");

    it("server.listen() appears before background tasks", () => {
      const listenPos = index.indexOf("server.listen(");
      const seedPos = index.indexOf("seedDatabase()");
      const importPos = index.indexOf("autoImportGooglePlaces");
      expect(listenPos).toBeGreaterThan(0);
      expect(seedPos).toBeGreaterThan(listenPos);
      expect(importPos).toBeGreaterThan(listenPos);
    });

    it("server.listen() appears before dish leaderboard recalculation", () => {
      const listenPos = index.indexOf("server.listen(");
      const dishPos = index.indexOf("recalculateDishLeaderboard");
      expect(dishPos).toBeGreaterThan(listenPos);
    });

    it("server.listen() appears before hash preloading", () => {
      const listenPos = index.indexOf("server.listen(");
      const hashPos = index.indexOf("preloadHashIndex");
      expect(hashPos).toBeGreaterThan(listenPos);
    });
  });

  describe("server/logger.ts callable export", () => {
    const logger = readFile("server/logger.ts");

    it("exports a callable function (baseLog)", () => {
      expect(logger).toContain("function baseLog(message");
    });

    it("attaches tag method", () => {
      expect(logger).toContain("baseLog.tag = createTaggedLogger");
    });

    it("attaches info method", () => {
      expect(logger).toContain("baseLog.info = function");
    });

    it("attaches error method", () => {
      expect(logger).toContain("baseLog.error = function");
    });

    it("exports log as baseLog", () => {
      expect(logger).toContain("export const log = baseLog");
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

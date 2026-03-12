/**
 * Sprint 761: Production Crash Fix
 *
 * Fixes: "log is not defined" crash on Railway (Sprint 744 removed
 * `const log = console.log` but bare `log()` calls remained).
 * Also adds "type": "module" to package.json to eliminate Node.js
 * ESM warning that causes performance overhead.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 761: Production Crash Fix", () => {
  describe("server/index.ts log import", () => {
    const index = readFile("server/index.ts");

    it("imports log directly (not aliased)", () => {
      expect(index).toContain('import { log } from "./logger"');
    });

    it("does not use logger alias", () => {
      // logger should only appear in config objects, not as a function call
      const lines = index.split("\n");
      const loggerCalls = lines.filter(l =>
        l.includes("logger.") && !l.includes("logger: undefined") && !l.includes("import")
      );
      expect(loggerCalls.length).toBe(0);
    });

    it("uses log() for startup messages", () => {
      expect(index).toContain("log(`express server serving");
    });

    it("uses log.error for error logging", () => {
      expect(index).toContain("log.error");
    });

    it("uses log.info for info logging", () => {
      expect(index).toContain("log.info");
    });
  });

  describe("package.json module type", () => {
    const pkg = JSON.parse(readFile("package.json"));

    it("has type: module", () => {
      expect(pkg.type).toBe("module");
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

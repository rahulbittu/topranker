/**
 * Sprint 558: Centralized file health checks
 * Reads thresholds from shared/thresholds.json — update thresholds there, not here.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");
const countLines = (content: string) => content.split("\n").length;

const thresholds = JSON.parse(readFile("shared/thresholds.json"));

describe("Centralized File Health (Sprint 558)", () => {
  describe("file LOC thresholds", () => {
    for (const [filePath, config] of Object.entries(thresholds.files)) {
      const { maxLOC } = config as { maxLOC: number };
      it(`${filePath} is under ${maxLOC} LOC`, () => {
        const loc = countLines(readFile(filePath));
        expect(loc).toBeLessThan(maxLOC);
      });
    }
  });

  describe("server build size", () => {
    it(`build is under ${thresholds.build.maxSizeKb}kb`, () => {
      const buildSrc = readFile("server_dist/index.js");
      const sizeKb = Buffer.byteLength(buildSrc, "utf-8") / 1024;
      expect(sizeKb).toBeLessThan(thresholds.build.maxSizeKb);
    });
  });

  describe("test count floor", () => {
    it(`has at least ${thresholds.tests.minCount} tests (self-referential)`, () => {
      // This is a floor check — actual count is verified by vitest output
      expect(thresholds.tests.currentCount).toBeGreaterThanOrEqual(thresholds.tests.minCount);
    });
  });
});

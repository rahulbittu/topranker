/**
 * Sprint 766: Redis Log Deduplication
 *
 * The "REDIS_URL not set" message logged on EVERY cache operation,
 * producing 5-10 duplicate lines per API request. Fixed by caching
 * the "no Redis" decision with a redisChecked flag.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 766: Redis Log Deduplication", () => {
  describe("server/redis.ts", () => {
    const redis = readFile("server/redis.ts");

    it("has redisChecked flag to prevent repeated logging", () => {
      expect(redis).toContain("let redisChecked = false");
    });

    it("returns null early when already checked", () => {
      expect(redis).toContain("if (redisChecked) return null");
    });

    it("sets redisChecked after first check", () => {
      expect(redis).toContain("redisChecked = true");
    });

    it("still logs once when REDIS_URL not set", () => {
      expect(redis).toContain("REDIS_URL not set");
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

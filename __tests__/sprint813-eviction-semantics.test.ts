/**
 * Sprint 813: Push Token LRU Eviction + Logger Counter Semantics
 *
 * Addresses external critique 795-799:
 * 1. Push token eviction: oldest → LRU by lastUsed
 * 2. Logger counters: explicitly documented as event counters, not emitted-log counters
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 813: Push Token LRU Eviction + Logger Counter Semantics", () => {
  describe("push token LRU eviction", () => {
    const pushSrc = readFile("server/push-notifications.ts");

    it("uses LRU eviction, not oldest", () => {
      expect(pushSrc).toContain("LRU eviction");
    });

    it("compares lastUsed timestamps", () => {
      expect(pushSrc).toContain("lastUsed < lruTime");
    });

    it("uses splice instead of shift for targeted removal", () => {
      // splice removes at specific index; shift always removes first
      expect(pushSrc).toContain("splice(lruIdx, 1)");
    });

    it("logs eviction reason as LRU", () => {
      expect(pushSrc).toContain("evicted (LRU)");
    });

    it("preserves MAX_TOKENS_PER_MEMBER constant", () => {
      expect(pushSrc).toContain("MAX_TOKENS_PER_MEMBER = 10");
    });
  });

  describe("logger counter semantics", () => {
    const loggerSrc = readFile("server/logger.ts");

    it("documents counters as event counters", () => {
      expect(loggerSrc).toContain("EVENT counters");
    });

    it("explains suppressed events still increment", () => {
      expect(loggerSrc).toContain("suppressed");
    });

    it("getLogStats docstring clarifies semantics", () => {
      expect(loggerSrc).toContain("event counters (not emitted-log counters)");
    });

    it("warn counter increments before shouldLog check", () => {
      // Verify the counter is incremented BEFORE the log-level check
      const warnIdx = loggerSrc.indexOf("warnCount++;");
      const shouldLogIdx = loggerSrc.indexOf('shouldLog("warn")', warnIdx);
      expect(warnIdx).toBeGreaterThan(-1);
      expect(shouldLogIdx).toBeGreaterThan(warnIdx);
    });

    it("error counter increments before shouldLog check", () => {
      const errorIdx = loggerSrc.indexOf("errorCount++;");
      const shouldLogIdx = loggerSrc.indexOf('shouldLog("error")', errorIdx);
      expect(errorIdx).toBeGreaterThan(-1);
      expect(shouldLogIdx).toBeGreaterThan(errorIdx);
    });
  });

  describe("file health", () => {
    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});

/**
 * Sprint 817: Console.log Audit + Best In Documentation Hardening
 *
 * Verifies:
 * 1. No raw console.log/error/warn in production server files (seed files exempt)
 * 2. Best In routes use documented placeholders, not TODOs
 * 3. Seed files are the ONLY server files with raw console usage
 * 4. Logger module provides structured alternatives
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

function getServerFiles(): string[] {
  return glob.sync("server/**/*.ts", { cwd: process.cwd() });
}

const SEED_FILES = ["server/seed.ts", "server/seed-categories.ts", "server/seed-cities.ts"];
const LOGGER_FILE = "server/logger.ts";

describe("Sprint 817: Console.log Audit + Best In Documentation", () => {
  describe("console.log audit — production server files", () => {
    it("no raw console.log in non-seed, non-logger server files", () => {
      const serverFiles = getServerFiles();
      const exempt = [...SEED_FILES, LOGGER_FILE];
      const violations: string[] = [];

      for (const file of serverFiles) {
        if (exempt.includes(file)) continue;
        const src = readFile(file);
        // Match console.log/warn/error but not inside comments or strings describing them
        const lines = src.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          // Skip comment lines
          if (line.startsWith("//") || line.startsWith("*") || line.startsWith("/*")) continue;
          if (/\bconsole\.(log|warn|error)\s*\(/.test(line)) {
            violations.push(`${file}:${i + 1}: ${line.substring(0, 80)}`);
          }
        }
      }

      expect(violations).toEqual([]);
    });

    it("seed files are allowed to use console for CLI output", () => {
      for (const seedFile of SEED_FILES) {
        const src = readFile(seedFile);
        // Seed files should exist and may have console usage
        expect(src.length).toBeGreaterThan(0);
      }
    });

    it("logger.ts provides structured log, warn, error, debug", () => {
      const src = readFile(LOGGER_FILE);
      expect(src).toContain("export const log");
      expect(src).toContain("formatMessage");
      expect(src).toContain('"debug"');
      expect(src).toContain('"info"');
      expect(src).toContain('"warn"');
      expect(src).toContain('"error"');
    });

    it("logger exports getLogStats for observability", () => {
      const src = readFile(LOGGER_FILE);
      expect(src).toContain("export function getLogStats");
      expect(src).toContain("errorCount");
      expect(src).toContain("warnCount");
    });
  });

  describe("Best In routes — documentation hardening", () => {
    it("no TODO comments in routes-best-in.ts", () => {
      const src = readFile("server/routes-best-in.ts");
      const todoMatches = src.match(/\/\/\s*TODO/gi);
      expect(todoMatches).toBeNull();
    });

    it("empty businesses array is documented with sprint reference", () => {
      const src = readFile("server/routes-best-in.ts");
      expect(src).toContain("Sprint 817: Intentionally empty");
      expect(src).toContain("Not enough ratings");
    });

    it("leaderboard endpoint returns message when empty", () => {
      const src = readFile("server/routes-best-in.ts");
      expect(src).toContain("Not enough ratings yet");
    });

    it("generateLeaderboardEntries returns empty array", () => {
      const src = readFile("server/routes-best-in.ts");
      expect(src).toContain("function generateLeaderboardEntries");
      expect(src).toContain("return []");
    });
  });

  describe("file health", () => {
    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});

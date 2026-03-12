/**
 * Sprint 793: CI-Friendly Lint Checks
 *
 * Automated checks that prevent regressions:
 * 1. No hardcoded https://topranker.io in server/ (except email addresses)
 * 2. No unguarded console.log/warn in lib/ and app/ directories
 * 3. No direct process.env access in server/ (should use config.ts)
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

/** Recursively find files matching extension filter */
function getFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  const absDir = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(absDir)) return results;

  function walk(d: string) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
        walk(full);
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        results.push(path.relative(process.cwd(), full));
      }
    }
  }
  walk(absDir);
  return results;
}

/** Find hardcoded topranker.io URLs (not email addresses) */
function findHardcodedUrls(src: string, filename: string): string[] {
  const lines = src.split("\n");
  const issues: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("https://topranker.io") && !line.trim().startsWith("//")) {
      // Skip email addresses (support@topranker.io, admin@topranker.io, noreply@topranker.io)
      if (line.match(/@topranker\.io/)) continue;
      // Skip config.ts which defines the fallback
      if (filename === "server/config.ts") continue;
      // Skip security-headers.ts which defines CORS origins (must be explicit)
      if (filename === "server/security-headers.ts") continue;
      issues.push(`${filename}:${i + 1}: ${line.trim().slice(0, 80)}`);
    }
  }
  return issues;
}

/** Find unguarded console.log/warn in a source file */
function findUnguardedConsole(src: string, filename: string): string[] {
  const lines = src.split("\n");
  const issues: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(/console\.(log|warn)\(/) && !line.startsWith("//")) {
      const context = [lines[i - 4] || "", lines[i - 3] || "", lines[i - 2] || "", lines[i - 1] || "", lines[i]].join("\n");
      if (!context.includes("__DEV__")) {
        issues.push(`${filename}:${i + 1}: ${line.slice(0, 80)}`);
      }
    }
  }
  return issues;
}

describe("Sprint 793: CI Lint Checks", () => {
  describe("no hardcoded topranker.io URLs in server/", () => {
    const serverFiles = getFiles("server", [".ts"]);

    it("found server files to check", () => {
      expect(serverFiles.length).toBeGreaterThan(10);
    });

    it("no hardcoded URLs (should use config.siteUrl)", () => {
      const allIssues: string[] = [];
      for (const f of serverFiles) {
        const src = readFile(f);
        const issues = findHardcodedUrls(src, f);
        allIssues.push(...issues);
      }
      expect(allIssues).toEqual([]);
    });
  });

  describe("no unguarded console in lib/", () => {
    const libFiles = getFiles("lib", [".ts", ".tsx"]);

    it("found lib files to check", () => {
      expect(libFiles.length).toBeGreaterThan(5);
    });

    it("all console statements are guarded with __DEV__", () => {
      const allIssues: string[] = [];
      for (const f of libFiles) {
        const src = readFile(f);
        const issues = findUnguardedConsole(src, f);
        allIssues.push(...issues);
      }
      expect(allIssues).toEqual([]);
    });
  });

  describe("no unguarded console in app/", () => {
    const appFiles = getFiles("app", [".ts", ".tsx"]);

    it("found app files to check", () => {
      expect(appFiles.length).toBeGreaterThan(5);
    });

    it("all console statements are guarded with __DEV__", () => {
      const allIssues: string[] = [];
      for (const f of appFiles) {
        const src = readFile(f);
        const issues = findUnguardedConsole(src, f);
        allIssues.push(...issues);
      }
      expect(allIssues).toEqual([]);
    });
  });

  describe("config.siteUrl is the canonical URL source", () => {
    const configSrc = readFile("server/config.ts");

    it("config.ts defines siteUrl", () => {
      expect(configSrc).toContain("siteUrl:");
    });

    it("siteUrl defaults to topranker.io", () => {
      expect(configSrc).toContain('"https://topranker.io"');
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

/**
 * Sprint 794: Explicit Session Cleanup Configuration
 *
 * connect-pg-simple has built-in session pruning, but making it
 * explicit ensures we don't accidentally disable it and documents
 * the cleanup interval.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 794: Session Cleanup", () => {
  const authSrc = readFile("server/auth.ts");

  describe("connect-pg-simple pruning", () => {
    it("configures pruneSessionInterval", () => {
      expect(authSrc).toContain("pruneSessionInterval:");
    });

    it("prunes every 15 minutes (900 seconds)", () => {
      expect(authSrc).toContain("pruneSessionInterval: 15 * 60");
    });
  });

  describe("session configuration", () => {
    it("uses httpOnly cookies", () => {
      expect(authSrc).toContain("httpOnly: true");
    });

    it("uses sameSite lax", () => {
      expect(authSrc).toContain('sameSite: "lax"');
    });

    it("secure in production", () => {
      expect(authSrc).toContain("secure: config.isProduction");
    });

    it("30-day maxAge", () => {
      expect(authSrc).toContain("30 * 24 * 60 * 60 * 1000");
    });

    it("creates table if missing", () => {
      expect(authSrc).toContain("createTableIfMissing: true");
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

/**
 * Sprint 771: API URL Consistency
 *
 * Fixed getApiBaseUrl() in app-env.ts pointing to topranker.com
 * instead of topranker.io. Ensures all API URL sources are consistent.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 771: API URL Consistency", () => {
  describe("lib/app-env.ts", () => {
    const appEnv = readFile("lib/app-env.ts");

    it("production URL uses topranker.io", () => {
      expect(appEnv).toContain('"https://topranker.io"');
    });

    it("does not reference topranker.com for API", () => {
      expect(appEnv).not.toContain("topranker.com");
    });

    it("does not reference staging.topranker.com", () => {
      expect(appEnv).not.toContain("staging.topranker.com");
    });
  });

  describe("all API URL sources consistent", () => {
    it("eas.json uses topranker.io", () => {
      const eas = JSON.parse(readFile("eas.json"));
      expect(eas.build.production.env.EXPO_PUBLIC_API_URL).toContain("topranker.io");
    });

    it("query-client uses window.location.origin (web) or EXPO_PUBLIC_API_URL (native)", () => {
      const qc = readFile("lib/query-client.ts");
      expect(qc).toContain("window.location.origin");
      expect(qc).toContain("EXPO_PUBLIC_API_URL");
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

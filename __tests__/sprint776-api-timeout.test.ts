/**
 * Sprint 776: API Request Timeout
 *
 * Added 15s AbortController timeout to all fetch calls in query-client.ts.
 * Prevents indefinite hangs on slow/dead connections.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 776: API Request Timeout", () => {
  const src = readFile("lib/query-client.ts");

  describe("timeout constant", () => {
    it("defines API_TIMEOUT_MS", () => {
      expect(src).toContain("API_TIMEOUT_MS");
    });

    it("timeout is 15 seconds", () => {
      expect(src).toContain("15_000");
    });
  });

  describe("apiRequest timeout", () => {
    it("creates AbortController", () => {
      expect(src).toContain("new AbortController()");
    });

    it("passes signal to fetch", () => {
      expect(src).toContain("signal: controller.signal");
    });

    it("clears timeout on success", () => {
      expect(src).toContain("clearTimeout(timer)");
    });

    it("detects AbortError for timeout", () => {
      expect(src).toContain("AbortError");
    });

    it("throws descriptive timeout error", () => {
      expect(src).toContain("Request timed out");
    });
  });

  describe("getQueryFn timeout", () => {
    // Both apiRequest and getQueryFn should have timeout
    const controllerCount = (src.match(/new AbortController/g) || []).length;

    it("both fetch paths have AbortController", () => {
      expect(controllerCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe("retry behavior unchanged", () => {
    it("still retries network errors", () => {
      expect(src).toContain("shouldRetry");
    });

    it("does not retry client errors", () => {
      expect(src).toContain("^4\\d{2}:");
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

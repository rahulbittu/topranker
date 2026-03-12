/**
 * Sprint 781: Mock Auth Guard
 *
 * Demo user fallback in auth-context.tsx was not guarded by __DEV__.
 * In production, a network error would show fake "Alex Demo" user
 * instead of logged-out state.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 781: Mock Auth Guard", () => {
  describe("lib/auth-context.tsx — demo user guard", () => {
    const src = readFile("lib/auth-context.tsx");

    it("demo user is guarded by __DEV__", () => {
      expect(src).toContain("if (__DEV__)");
      // Find the demo user block and verify it's inside __DEV__
      const demoIdx = src.indexOf("demo-member");
      const devIdx = src.lastIndexOf("__DEV__", demoIdx);
      expect(devIdx).toBeGreaterThan(0);
      // __DEV__ should be close to (within 200 chars of) the demo user
      expect(demoIdx - devIdx).toBeLessThan(200);
    });

    it("production path sets user to null", () => {
      expect(src).toContain("setUser(null)");
    });

    it("handles successful auth response", () => {
      expect(src).toContain("setUser(json.data)");
    });

    it("handles failed auth response (non-ok)", () => {
      // When res.ok is false (401, 403, etc.), user should be null
      const resNotOk = src.includes("if (res.ok)") || src.includes("!res.ok");
      expect(resNotOk).toBe(true);
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

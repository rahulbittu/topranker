/**
 * Sprint 783: OAuth Fetch Timeouts & Logger Import
 *
 * Hardening: Added 10s timeouts to Google OAuth fetch calls in auth.ts
 * and fixed missing logger import for Apple auth logging.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 783: OAuth Fetch Timeouts", () => {
  const authSrc = readFile("server/auth.ts");

  describe("Google OAuth timeouts", () => {
    it("tokeninfo fetch has AbortSignal.timeout", () => {
      expect(authSrc).toContain("oauth2.googleapis.com/tokeninfo");
      // The tokeninfo fetch line should contain AbortSignal.timeout
      const tokenInfoLine = authSrc.split("\n").find((l) =>
        l.includes("oauth2.googleapis.com/tokeninfo")
      );
      expect(tokenInfoLine).toBeDefined();
      expect(tokenInfoLine).toContain("AbortSignal.timeout");
    });

    it("userinfo fetch has AbortSignal.timeout", () => {
      expect(authSrc).toContain("googleapis.com/oauth2/v3/userinfo");
      // Find the fetch block for userinfo — signal should be nearby
      const lines = authSrc.split("\n");
      const userInfoIdx = lines.findIndex((l) =>
        l.includes("googleapis.com/oauth2/v3/userinfo")
      );
      expect(userInfoIdx).toBeGreaterThan(-1);
      // Check within 3 lines for AbortSignal.timeout
      const context = lines.slice(userInfoIdx, userInfoIdx + 4).join("\n");
      expect(context).toContain("AbortSignal.timeout");
    });

    it("uses 10s timeout matching Apple JWKS pattern", () => {
      // Both Google calls should use 10000ms
      const googleTimeouts = authSrc
        .split("\n")
        .filter(
          (l) =>
            l.includes("AbortSignal.timeout(10000)") &&
            !l.includes("appleid.apple.com")
        );
      expect(googleTimeouts.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Apple JWKS timeout (existing)", () => {
    it("Apple JWKS fetch already has timeout", () => {
      const appleLines = authSrc.split("\n").filter((l) =>
        l.includes("appleid.apple.com/auth/keys")
      );
      expect(appleLines.length).toBe(1);
      expect(appleLines[0]).toContain("AbortSignal.timeout");
    });
  });

  describe("logger import", () => {
    it("imports log from ./logger", () => {
      expect(authSrc).toContain('import { log } from "./logger"');
    });

    it("uses log.tag for Apple auth", () => {
      expect(authSrc).toContain('log.tag("AppleAuth")');
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

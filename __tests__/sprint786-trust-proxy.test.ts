/**
 * Sprint 786: Trust Proxy for Railway
 *
 * Railway's reverse proxy means Express sees the proxy's IP, not the client's.
 * Without trust proxy:
 * - Rate limiting uses proxy IP (all users share one IP → breaks rate limits)
 * - req.protocol returns "http" even for HTTPS (secure cookies may not set)
 * - req.ip returns proxy internal IP (logs and analytics show wrong data)
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 786: Trust Proxy", () => {
  describe("server/index.ts", () => {
    const src = readFile("server/index.ts");

    it("sets trust proxy in production", () => {
      expect(src).toContain('app.set("trust proxy", 1)');
    });

    it("only enables trust proxy in production", () => {
      // Find the trust proxy line and verify it's inside a production guard
      const lines = src.split("\n");
      const trustProxyIdx = lines.findIndex((l) => l.includes('"trust proxy"'));
      expect(trustProxyIdx).toBeGreaterThan(-1);
      // Check previous 2 lines for isProduction guard
      const context = lines.slice(Math.max(0, trustProxyIdx - 2), trustProxyIdx + 1).join("\n");
      expect(context).toContain("isProduction");
    });

    it("imports config", () => {
      expect(src).toContain('import { config } from "./config"');
    });
  });

  describe("session proxy setting is consistent", () => {
    const authSrc = readFile("server/auth.ts");

    it("session has proxy: config.isProduction", () => {
      expect(authSrc).toContain("proxy: config.isProduction");
    });

    it("secure cookie in production", () => {
      expect(authSrc).toContain("secure: config.isProduction");
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

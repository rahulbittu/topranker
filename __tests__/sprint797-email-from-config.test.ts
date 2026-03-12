/**
 * Sprint 797: Email FROM Address Centralized to config.ts
 *
 * Closes Audit L1: FROM_ADDRESS was hardcoded in email.ts with
 * direct process.env access. Now uses config.emailFrom.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 797: Email FROM Config", () => {
  const emailSrc = readFile("server/email.ts");
  const configSrc = readFile("server/config.ts");

  describe("config.ts has emailFrom", () => {
    it("declares emailFrom field", () => {
      expect(configSrc).toContain("emailFrom:");
    });

    it("reads from EMAIL_FROM env var", () => {
      expect(configSrc).toContain('"EMAIL_FROM"');
    });

    it("falls back to TopRanker noreply", () => {
      expect(configSrc).toContain("TopRanker <noreply@topranker.com>");
    });
  });

  describe("email.ts uses config", () => {
    it("imports config", () => {
      expect(emailSrc).toContain('import { config } from "./config"');
    });

    it("FROM_ADDRESS uses config.emailFrom", () => {
      expect(emailSrc).toContain("config.emailFrom");
    });

    it("no direct process.env.EMAIL_FROM access", () => {
      expect(emailSrc).not.toContain("process.env.EMAIL_FROM");
    });

    it("no hardcoded noreply@topranker.com", () => {
      expect(emailSrc).not.toContain("noreply@topranker.com");
    });
  });

  describe("no other server files reference EMAIL_FROM directly", () => {
    const serverFiles = [
      "server/email-owner-outreach.ts",
      "server/email-drip.ts",
      "server/email-weekly.ts",
    ];

    for (const file of serverFiles) {
      it(`${file} does not hardcode EMAIL_FROM`, () => {
        const src = readFile(file);
        expect(src).not.toContain("process.env.EMAIL_FROM");
        expect(src).not.toContain("noreply@topranker.com");
      });
    }
  });

  describe("file health", () => {
    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});

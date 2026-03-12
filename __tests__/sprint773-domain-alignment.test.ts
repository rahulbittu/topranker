/**
 * Sprint 773: Domain Alignment — topranker.com → topranker.io
 *
 * All user-facing URLs now use topranker.io since topranker.com DNS
 * is not configured. Emails, sharing, QR codes, OG images all aligned.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 773: Domain Alignment", () => {
  describe("lib/sharing.ts — share URLs", () => {
    const src = readFile("lib/sharing.ts");

    it("SHARE_BASE_URL uses topranker.io", () => {
      expect(src).toContain('SHARE_BASE_URL = "https://topranker.io"');
    });

    it("SHARE_DOMAINS still includes topranker.com for backwards compat", () => {
      expect(src).toContain('"topranker.com"');
    });
  });

  describe("server/config.ts — siteUrl", () => {
    const src = readFile("server/config.ts");

    it("defaults to topranker.io", () => {
      expect(src).toContain('"https://topranker.io"');
    });
  });

  describe("server/email.ts — CTA links use config.siteUrl", () => {
    const src = readFile("server/email.ts");

    it("verify email link uses config.siteUrl", () => {
      expect(src).toContain("config.siteUrl}/verify-email");
    });

    it("reset password link uses config.siteUrl", () => {
      expect(src).toContain("config.siteUrl}/reset-password");
    });

    it("join referral link uses config.siteUrl", () => {
      expect(src).toContain("config.siteUrl}/join?ref=");
    });

    it("unsubscribe link uses config.siteUrl", () => {
      expect(src).toContain("config.siteUrl}/unsubscribe");
    });

    it("support email uses topranker.io", () => {
      expect(src).toContain("support@topranker.io");
    });

    it("imports config", () => {
      expect(src).toContain('import { config } from "./config"');
    });
  });

  describe("server/email-owner-outreach.ts — CTA links use config.siteUrl", () => {
    const src = readFile("server/email-owner-outreach.ts");

    it("claim link uses config.siteUrl", () => {
      expect(src).toContain("config.siteUrl}/claim");
    });

    it("unsubscribe link uses config.siteUrl", () => {
      expect(src).toContain("config.siteUrl}/unsubscribe");
    });

    it("imports config", () => {
      expect(src).toContain('import { config } from "./config"');
    });
  });

  describe("server/og-image.ts — footer", () => {
    const src = readFile("server/og-image.ts");

    it("displays topranker.io in OG images", () => {
      expect(src).toContain("topranker.io");
    });
  });

  describe("server/routes-qr.ts — QR code footer", () => {
    const src = readFile("server/routes-qr.ts");

    it("QR code footer shows topranker.io", () => {
      expect(src).toContain("topranker.io");
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

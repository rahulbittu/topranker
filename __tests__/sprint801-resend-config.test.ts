/**
 * Sprint 801: Consolidate Resend env vars to config.ts
 *
 * email.ts and routes-webhooks.ts both accessed process.env directly
 * for Resend API key and webhook secret. Now uses config.resendApiKey
 * and config.resendWebhookSecret.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 801: Resend Config Consolidation", () => {
  const emailSrc = readFile("server/email.ts");
  const webhooksSrc = readFile("server/routes-webhooks.ts");
  const configSrc = readFile("server/config.ts");

  describe("config.ts has Resend fields", () => {
    it("has resendApiKey", () => {
      expect(configSrc).toContain("resendApiKey:");
    });

    it("has resendWebhookSecret", () => {
      expect(configSrc).toContain("resendWebhookSecret:");
    });
  });

  describe("email.ts uses config", () => {
    it("uses config.resendApiKey", () => {
      expect(emailSrc).toContain("config.resendApiKey");
    });

    it("no direct process.env.RESEND_API_KEY", () => {
      expect(emailSrc).not.toContain("process.env.RESEND_API_KEY");
    });
  });

  describe("routes-webhooks.ts uses config", () => {
    it("imports config", () => {
      expect(webhooksSrc).toContain('import { config } from "./config"');
    });

    it("uses config.resendWebhookSecret", () => {
      expect(webhooksSrc).toContain("config.resendWebhookSecret");
    });

    it("no direct process.env.RESEND_WEBHOOK_SECRET", () => {
      expect(webhooksSrc).not.toContain("process.env.RESEND_WEBHOOK_SECRET");
    });
  });

  describe("file health", () => {
    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});

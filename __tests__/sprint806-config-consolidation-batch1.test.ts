/**
 * Sprint 806: Config Consolidation Batch 1
 *
 * Migrates payments.ts, stripe-webhook.ts, photos.ts, deploy.ts
 * from direct process.env to config.ts.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 806: Config Consolidation Batch 1", () => {
  const paymentsSrc = readFile("server/payments.ts");
  const stripeWebhookSrc = readFile("server/stripe-webhook.ts");
  const photosSrc = readFile("server/photos.ts");
  const deploySrc = readFile("server/deploy.ts");
  const configSrc = readFile("server/config.ts");

  describe("config.ts additions", () => {
    it("has stripeWebhookSecret", () => {
      expect(configSrc).toContain("stripeWebhookSecret:");
    });
  });

  describe("payments.ts", () => {
    it("imports config", () => {
      expect(paymentsSrc).toContain('import { config } from "./config"');
    });

    it("uses config.stripeSecretKey", () => {
      expect(paymentsSrc).toContain("config.stripeSecretKey");
    });

    it("no direct process.env.STRIPE_SECRET_KEY", () => {
      expect(paymentsSrc).not.toContain("process.env.STRIPE_SECRET_KEY");
    });
  });

  describe("stripe-webhook.ts", () => {
    it("imports config", () => {
      expect(stripeWebhookSrc).toContain('import { config } from "./config"');
    });

    it("uses config.stripeWebhookSecret", () => {
      expect(stripeWebhookSrc).toContain("config.stripeWebhookSecret");
    });

    it("uses config.stripeSecretKey", () => {
      expect(stripeWebhookSrc).toContain("config.stripeSecretKey");
    });

    it("no direct process.env", () => {
      expect(stripeWebhookSrc).not.toContain("process.env.STRIPE");
    });
  });

  describe("photos.ts", () => {
    it("imports config", () => {
      expect(photosSrc).toContain('import { config } from "./config"');
    });

    it("uses config.googleMapsApiKey", () => {
      expect(photosSrc).toContain("config.googleMapsApiKey");
    });

    it("no direct process.env for maps key", () => {
      expect(photosSrc).not.toContain("process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY");
      expect(photosSrc).not.toContain("process.env.GOOGLE_MAPS_API_KEY");
    });
  });

  describe("deploy.ts", () => {
    it("imports config", () => {
      expect(deploySrc).toContain('import { config } from "./config"');
    });

    it("uses config.githubWebhookSecret", () => {
      expect(deploySrc).toContain("config.githubWebhookSecret");
    });

    it("uses config.ntfyTopic", () => {
      expect(deploySrc).toContain("config.ntfyTopic");
    });

    it("no direct process.env for webhook secret or ntfy", () => {
      expect(deploySrc).not.toContain("process.env.GITHUB_WEBHOOK_SECRET");
      expect(deploySrc).not.toContain("process.env.NTFY_TOPIC");
    });
  });

  describe("file health", () => {
    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});

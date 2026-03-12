/**
 * Sprint 811: Config Guardrails & Bootstrap Boundaries
 *
 * Addresses external critique (805-809):
 * 1. Formalize bootstrap exemptions as permanent architecture
 * 2. Add config field count guardrails
 * 3. Add build size escalation triggers
 * 4. Create shared config assertion helpers to reduce test fragility
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  assertUsesConfig,
  assertBootstrapExempt,
  assertConfigGuardrails,
} from "./helpers/config-assertions";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 811: Config Guardrails & Bootstrap Boundaries", () => {
  describe("bootstrap boundaries (permanent architecture)", () => {
    it("db.ts is bootstrap-exempt", () => {
      assertBootstrapExempt("server/db.ts");
    });

    it("logger.ts is bootstrap-exempt", () => {
      assertBootstrapExempt("server/logger.ts");
    });

    it("index.ts is bootstrap-exempt", () => {
      assertBootstrapExempt("server/index.ts");
    });

    it("config.ts documents bootstrap boundaries", () => {
      const configSrc = readFile("server/config.ts");
      expect(configSrc).toContain("ARCHITECTURE BOUNDARY");
      expect(configSrc).toContain("PERMANENTLY exempt");
      expect(configSrc).toContain("db.ts");
      expect(configSrc).toContain("logger.ts");
      expect(configSrc).toContain("index.ts");
    });
  });

  describe("config field guardrails", () => {
    it("config.ts field count is within max", () => {
      assertConfigGuardrails();
    });

    it("thresholds.json tracks config fields", () => {
      const thresholds = JSON.parse(readFile("shared/thresholds.json"));
      expect(thresholds.config).toBeDefined();
      expect(thresholds.config.maxFields).toBe(35);
      expect(thresholds.config.currentFields).toBe(27);
      expect(thresholds.config.groupingRequiredAt).toBe(35);
    });

    it("thresholds.json lists bootstrap exemptions", () => {
      const thresholds = JSON.parse(readFile("shared/thresholds.json"));
      expect(thresholds.config.bootstrapExempt).toContain("server/db.ts");
      expect(thresholds.config.bootstrapExempt).toContain("server/logger.ts");
      expect(thresholds.config.bootstrapExempt).toContain("server/index.ts");
    });
  });

  describe("build size escalation", () => {
    it("thresholds.json has build escalation rules", () => {
      const thresholds = JSON.parse(readFile("shared/thresholds.json"));
      expect(thresholds.build.warnAtKb).toBe(720);
      expect(thresholds.build.escalation).toContain("720kb=warn");
      expect(thresholds.build.escalation).toContain("735kb=block-new-features");
      expect(thresholds.build.escalation).toContain("750kb=mandatory-optimization");
    });

    it("current build is below warn threshold", () => {
      const buildSrc = readFile("server_dist/index.js");
      const sizeKb = buildSrc.length / 1024;
      expect(sizeKb).toBeLessThan(720);
    });
  });

  describe("shared config assertion helpers", () => {
    it("helpers file exists", () => {
      expect(fs.existsSync(path.resolve(process.cwd(), "__tests__/helpers/config-assertions.ts"))).toBe(true);
    });

    it("assertUsesConfig works on a migrated file", () => {
      assertUsesConfig("server/payments.ts", {
        expectProperties: ["stripeSecretKey"],
      });
    });

    it("assertUsesConfig works on security-headers.ts", () => {
      assertUsesConfig("server/security-headers.ts", {
        expectProperties: ["corsOrigins", "railwayPublicDomain", "isProduction"],
      });
    });
  });

  describe("file health", () => {
    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});

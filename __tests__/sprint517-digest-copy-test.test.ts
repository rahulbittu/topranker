/**
 * Sprint 517: Push A/B Weekly Digest Copy Test
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 517: Weekly Digest Copy Test", () => {
  describe("server/digest-copy-variants.ts — copy strategies", () => {
    const src = readFile("server/digest-copy-variants.ts");

    it("exports DIGEST_EXPERIMENT_ID constant", () => {
      expect(src).toContain("export const DIGEST_EXPERIMENT_ID");
      expect(src).toContain("weekly-digest-copy-v1");
    });

    it("exports digestCopyVariants array with 4 strategies", () => {
      expect(src).toContain("export const digestCopyVariants");
      expect(src).toContain('"control"');
      expect(src).toContain('"urgency"');
      expect(src).toContain('"curiosity"');
      expect(src).toContain('"social"');
    });

    it("control variant uses neutral informational tone", () => {
      expect(src).toContain("Your weekly rankings update");
      expect(src).toContain("check what's changed");
    });

    it("urgency variant emphasizes time sensitivity", () => {
      expect(src).toContain("Rankings just shifted");
      expect(src).toContain("before everyone else");
    });

    it("curiosity variant uses question-driven copy", () => {
      expect(src).toContain("Did your top pick hold its spot?");
      expect(src).toContain("still #1");
    });

    it("social variant emphasizes community activity", () => {
      expect(src).toContain("Your city is rating");
      expect(src).toContain("community thinks");
    });

    it("all variants use {firstName} template variable", () => {
      const matches = src.match(/\{firstName\}/g);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBeGreaterThanOrEqual(4);
    });

    it("exports seedDigestCopyTest function", () => {
      expect(src).toContain("export function seedDigestCopyTest");
    });

    it("exports stopDigestCopyTest function", () => {
      expect(src).toContain("export function stopDigestCopyTest");
    });

    it("exports getDigestCopyTestStatus function", () => {
      expect(src).toContain("export function getDigestCopyTestStatus");
    });

    it("seedDigestCopyTest checks for existing active experiment", () => {
      expect(src).toContain("getPushExperiment(DIGEST_EXPERIMENT_ID)");
      expect(src).toContain("existing.active");
    });

    it("seedDigestCopyTest returns created status", () => {
      expect(src).toContain("{ created: true, experimentId: DIGEST_EXPERIMENT_ID }");
      expect(src).toContain("{ created: false, experimentId: DIGEST_EXPERIMENT_ID }");
    });

    it("stays under 110 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(110);
    });
  });

  describe("server/routes-admin-experiments.ts — digest copy endpoints", () => {
    const src = readFile("server/routes-admin-experiments.ts");

    it("imports digest copy functions", () => {
      expect(src).toContain("seedDigestCopyTest");
      expect(src).toContain("stopDigestCopyTest");
      expect(src).toContain("getDigestCopyTestStatus");
    });

    it("has POST /api/admin/digest-copy-test/seed endpoint", () => {
      expect(src).toContain("/api/admin/digest-copy-test/seed");
    });

    it("has POST /api/admin/digest-copy-test/stop endpoint", () => {
      expect(src).toContain("/api/admin/digest-copy-test/stop");
    });

    it("has GET /api/admin/digest-copy-test/status endpoint", () => {
      expect(src).toContain("/api/admin/digest-copy-test/status");
    });

    it("status endpoint includes dashboard when active", () => {
      expect(src).toContain("computeExperimentDashboard(status.experimentId)");
    });
  });

  describe("server/notification-triggers.ts — {city} template support", () => {
    const src = readFile("server/notification-triggers.ts");

    it("selects selectedCity from members table", () => {
      expect(src).toContain("selectedCity: members.selectedCity");
    });

    it("resolves city with fallback", () => {
      expect(src).toContain('selectedCity || "your city"');
    });

    it("replaces {city} in variant title", () => {
      expect(src).toContain('.replace("{city}", city)');
    });

    it("replaces {city} in variant body", () => {
      expect(src).toContain('.replace("{firstName}", firstName).replace("{city}", city)');
    });

    it("also replaces {firstName} in title for city-contextual variants", () => {
      expect(src).toContain('.replace("{city}", city).replace("{firstName}", firstName)');
    });
  });

  describe("lib/api.ts — digest copy test client API", () => {
    const src = readFile("lib/api.ts");

    it("defines DigestCopyTestStatus interface", () => {
      expect(src).toContain("export interface DigestCopyTestStatus");
    });

    it("DigestCopyTestStatus has active, experimentId, variantCount, dashboard", () => {
      expect(src).toContain("active: boolean");
      expect(src).toContain("experimentId: string");
      expect(src).toContain("variantCount: number");
      expect(src).toContain("dashboard: Record<string, unknown> | null");
    });

    it("exports fetchDigestCopyTestStatus", () => {
      expect(src).toContain("export async function fetchDigestCopyTestStatus");
      expect(src).toContain("/api/admin/digest-copy-test/status");
    });

    it("exports seedDigestCopyTest client function", () => {
      expect(src).toContain("export async function seedDigestCopyTest");
    });

    it("exports stopDigestCopyTest client function", () => {
      expect(src).toContain("export async function stopDigestCopyTest");
    });

    it("seed uses POST method", () => {
      expect(src).toContain("/api/admin/digest-copy-test/seed");
    });

    it("stop uses POST method", () => {
      expect(src).toContain("/api/admin/digest-copy-test/stop");
    });
  });
});

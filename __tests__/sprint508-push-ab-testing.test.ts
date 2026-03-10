/**
 * Sprint 508: Push Notification A/B Testing Framework
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 508: Push Notification A/B Testing", () => {
  describe("server/push-ab-testing.ts — core module", () => {
    const src = readFile("server/push-ab-testing.ts");

    it("exports createPushExperiment", () => {
      expect(src).toContain("export function createPushExperiment");
    });

    it("exports getNotificationVariant for variant assignment", () => {
      expect(src).toContain("export function getNotificationVariant");
    });

    it("exports recordPushExperimentOpen for outcome tracking", () => {
      expect(src).toContain("export function recordPushExperimentOpen");
    });

    it("exports deactivatePushExperiment", () => {
      expect(src).toContain("export function deactivatePushExperiment");
    });

    it("exports listPushExperiments", () => {
      expect(src).toContain("export function listPushExperiments");
    });

    it("exports getPushExperiment", () => {
      expect(src).toContain("export function getPushExperiment");
    });

    it("uses DJB2 hash for deterministic bucketing", () => {
      expect(src).toContain("djb2Hash");
      expect(src).toContain("5381");
    });

    it("defines PushNotificationVariant with title and body", () => {
      expect(src).toContain("PushNotificationVariant");
      expect(src).toContain("title: string");
      expect(src).toContain("body: string");
    });

    it("defines PushNotificationExperiment with category", () => {
      expect(src).toContain("PushNotificationExperiment");
      expect(src).toContain("category: string");
    });

    it("imports trackExposure from experiment-tracker", () => {
      expect(src).toContain("trackExposure");
      expect(src).toContain("./experiment-tracker");
    });

    it("imports trackOutcome from experiment-tracker", () => {
      expect(src).toContain("trackOutcome");
    });

    it("requires at least 2 variants", () => {
      expect(src).toContain("variants.length < 2");
    });

    it("stays under 200 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(200);
    });
  });

  describe("server/routes-notifications.ts — outcome wiring", () => {
    const src = readFile("server/routes-notifications.ts");

    it("imports recordPushExperimentOpen", () => {
      expect(src).toContain("recordPushExperimentOpen");
      expect(src).toContain("./push-ab-testing");
    });

    it("calls recordPushExperimentOpen on notification open", () => {
      expect(src).toContain("recordPushExperimentOpen(memberId, safeCategory)");
    });

    it("only records outcome for non-duplicate opens", () => {
      expect(src).toContain("if (recorded)");
    });
  });

  describe("server/routes-admin-experiments.ts — admin endpoints", () => {
    const src = readFile("server/routes-admin-experiments.ts");

    it("imports push-ab-testing functions", () => {
      expect(src).toContain("createPushExperiment");
      expect(src).toContain("listPushExperiments");
      expect(src).toContain("deactivatePushExperiment");
    });

    it("imports computeExperimentDashboard for Wilson CI", () => {
      expect(src).toContain("computeExperimentDashboard");
      expect(src).toContain("./experiment-tracker");
    });

    it("has GET /api/admin/push-experiments endpoint", () => {
      expect(src).toContain("/api/admin/push-experiments");
    });

    it("has POST /api/admin/push-experiments endpoint", () => {
      expect(src).toContain('app.post("/api/admin/push-experiments"');
    });

    it("has deactivate endpoint", () => {
      expect(src).toContain("/api/admin/push-experiments/:id/deactivate");
    });

    it("includes dashboard with experiment listing", () => {
      expect(src).toContain("computeExperimentDashboard(exp.id)");
    });
  });
});

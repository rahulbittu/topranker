/**
 * Sprint 504: notification-triggers.ts extraction
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 504: notification-triggers.ts Extraction", () => {
  describe("notification-triggers.ts LOC reduction", () => {
    it("notification-triggers.ts under 280 LOC (Sprint 648: +rating reminder)", () => {
      const loc = readFile("server/notification-triggers.ts").split("\n").length;
      expect(loc).toBeLessThan(280);
    });

    it("re-exports event triggers from events file", () => {
      const src = readFile("server/notification-triggers.ts");
      expect(src).toContain('from "./notification-triggers-events"');
      expect(src).toContain("onRankingChange");
      expect(src).toContain("onNewRatingForBusiness");
      expect(src).toContain("sendCityHighlightsPush");
      expect(src).toContain("startCityHighlightsScheduler");
    });

    it("retains core triggers in original file", () => {
      const src = readFile("server/notification-triggers.ts");
      expect(src).toContain("export async function onTierUpgrade");
      expect(src).toContain("export async function onClaimDecision");
      expect(src).toContain("export async function sendWeeklyDigestPush");
      expect(src).toContain("export function startWeeklyDigestScheduler");
    });
  });

  describe("notification-triggers-events.ts new module", () => {
    const src = readFile("server/notification-triggers-events.ts");

    it("exists with Sprint 504 header", () => {
      expect(src).toContain("Sprint 504");
      expect(src).toContain("Event-driven notification triggers");
    });

    it("exports onRankingChange", () => {
      expect(src).toContain("export async function onRankingChange");
    });

    it("exports onNewRatingForBusiness", () => {
      expect(src).toContain("export async function onNewRatingForBusiness");
    });

    it("exports sendCityHighlightsPush", () => {
      expect(src).toContain("export async function sendCityHighlightsPush");
    });

    it("exports startCityHighlightsScheduler", () => {
      expect(src).toContain("export function startCityHighlightsScheduler");
    });

    it("imports sendPushNotification from push module", () => {
      expect(src).toContain('import { sendPushNotification } from "./push"');
    });

    it("imports recordPushDelivery from push-analytics", () => {
      expect(src).toContain('import { recordPushDelivery } from "./push-analytics"');
    });
  });

  describe("file health", () => {
    it("notification-triggers-events.ts under 330 LOC (Sprint 533: added template resolution)", () => {
      const loc = readFile("server/notification-triggers-events.ts").split("\n").length;
      expect(loc).toBeLessThan(330);
    });
  });
});

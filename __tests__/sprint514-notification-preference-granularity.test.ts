/**
 * Sprint 514: Notification Preference Granularity (per-category)
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 514: Notification Preference Granularity", () => {
  describe("NotificationSettings — new preference toggles", () => {
    // Sprint 537: extracted to standalone component
    const src = readFile("components/settings/NotificationSettings.tsx");

    it("defines claimUpdates key", () => {
      expect(src).toContain("claimUpdates:");
      expect(src).toContain('"notif_claim_updates"');
    });

    it("defines newRatings key", () => {
      expect(src).toContain("newRatings:");
      expect(src).toContain('"notif_new_ratings"');
    });

    it("initializes claimUpdates to true", () => {
      expect(src).toContain("claimUpdates: true");
    });

    it("initializes newRatings to true", () => {
      expect(src).toContain("newRatings: true");
    });

    it("renders Claim Updates toggle", () => {
      expect(src).toContain('"Claim Updates"');
      expect(src).toContain("business claim is reviewed");
    });

    it("renders New Ratings toggle", () => {
      expect(src).toContain('"New Ratings"');
      expect(src).toContain("someone rates a place");
    });

    it("has 10 total notification preference toggles", () => {
      const toggleCount = (src.match(/onToggle={toggleNotif\(/g) || []).length;
      expect(toggleCount).toBe(10);
    });

    it("retains existing 8 toggles", () => {
      expect(src).toContain("tierUpgrades");
      expect(src).toContain("challengerResults");
      expect(src).toContain("newChallengers");
      expect(src).toContain("weeklyDigest");
      expect(src).toContain("rankingChanges");
      expect(src).toContain("savedBusinessAlerts");
      expect(src).toContain("cityAlerts");
      expect(src).toContain("marketingEmails");
    });
  });

  describe("notification-triggers.ts — claimUpdates preference check", () => {
    const src = readFile("server/notification-triggers.ts");

    it("checks claimUpdates preference in onClaimDecision", () => {
      expect(src).toContain("prefs.claimUpdates === false");
    });

    it("fetches member for claim decision preference check", () => {
      expect(src).toContain("getMemberById(memberId)");
    });

    it("includes type in push data for claim notifications", () => {
      expect(src).toContain('type: "claimDecision"');
    });

    it("includes type in push data for tier upgrade", () => {
      expect(src).toContain('type: "tierUpgrade"');
    });
  });

  describe("notification-triggers-events.ts — newRatings preference", () => {
    const src = readFile("server/notification-triggers-events.ts");

    it("checks newRatings preference for new rating notifications", () => {
      expect(src).toContain("prefs.newRatings === false");
    });

    it("falls back to savedBusinessAlerts for backward compatibility", () => {
      expect(src).toContain("prefs.newRatings === undefined && prefs.savedBusinessAlerts === false");
    });
  });
});

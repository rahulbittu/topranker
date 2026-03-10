/**
 * Sprint 521: Wire Frequency Checks into Notification Triggers
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 521: Frequency Trigger Wiring", () => {
  describe("notification-triggers-events.ts — frequency integration", () => {
    const src = readFile("server/notification-triggers-events.ts");

    it("imports shouldSendImmediately from notification-frequency", () => {
      expect(src).toContain("shouldSendImmediately");
      expect(src).toContain("./notification-frequency");
    });

    it("imports enqueueNotification from notification-frequency", () => {
      expect(src).toContain("enqueueNotification");
    });

    it("imports FrequencyPrefs type", () => {
      expect(src).toContain("FrequencyPrefs");
    });

    // onRankingChange frequency wiring
    it("onRankingChange selects notificationFrequencyPrefs", () => {
      expect(src).toContain("notificationFrequencyPrefs: members.notificationFrequencyPrefs");
    });

    it("onRankingChange checks shouldSendImmediately for rankingChanges", () => {
      expect(src).toContain('shouldSendImmediately(freqPrefs, "rankingChanges")');
    });

    it("onRankingChange enqueues when not realtime", () => {
      expect(src).toContain('category: "rankingChanges"');
      expect(src).toContain("enqueueNotification({");
    });

    // onNewRatingForBusiness frequency wiring
    it("onNewRatingForBusiness checks shouldSendImmediately for newRatings", () => {
      expect(src).toContain('shouldSendImmediately(freqPrefs, "newRatings")');
    });

    it("onNewRatingForBusiness enqueues when not realtime", () => {
      expect(src).toContain('category: "newRatings"');
    });

    // sendCityHighlightsPush frequency wiring
    it("sendCityHighlightsPush checks shouldSendImmediately for cityAlerts", () => {
      expect(src).toContain('shouldSendImmediately(freqPrefs, "cityAlerts")');
    });

    it("sendCityHighlightsPush enqueues when not realtime", () => {
      expect(src).toContain('category: "cityAlerts"');
    });

    // All 3 triggers follow the same pattern
    it("all frequency checks extract freqPrefs from member record", () => {
      const matches = src.match(/notificationFrequencyPrefs as Partial<FrequencyPrefs>/g);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBeGreaterThanOrEqual(3);
    });

    it("all enqueue calls include queuedAt timestamp", () => {
      const matches = src.match(/queuedAt: Date\.now\(\)/g);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBeGreaterThanOrEqual(3);
    });

    it("stays under 330 LOC (Sprint 533: added template resolution)", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(330);
    });
  });
});

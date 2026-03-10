/**
 * Sprint 518: Notification Frequency Settings
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 518: Notification Frequency Settings", () => {
  describe("server/notification-frequency.ts — batch queue system", () => {
    const src = readFile("server/notification-frequency.ts");

    it("exports NotificationFrequency type with realtime/daily/weekly", () => {
      expect(src).toContain("export type NotificationFrequency");
      expect(src).toContain('"realtime"');
      expect(src).toContain('"daily"');
      expect(src).toContain('"weekly"');
    });

    it("exports FrequencyPrefs interface", () => {
      expect(src).toContain("export interface FrequencyPrefs");
      expect(src).toContain("rankingChanges: NotificationFrequency");
      expect(src).toContain("newRatings: NotificationFrequency");
      expect(src).toContain("cityAlerts: NotificationFrequency");
    });

    it("exports DEFAULT_FREQUENCY_PREFS", () => {
      expect(src).toContain("export const DEFAULT_FREQUENCY_PREFS");
    });

    it("exports FREQUENCY_CATEGORIES constant", () => {
      expect(src).toContain("export const FREQUENCY_CATEGORIES");
      expect(src).toContain('"rankingChanges"');
      expect(src).toContain('"newRatings"');
      expect(src).toContain('"cityAlerts"');
    });

    it("exports QueuedNotification interface", () => {
      expect(src).toContain("export interface QueuedNotification");
      expect(src).toContain("memberId: string");
      expect(src).toContain("pushToken: string");
      expect(src).toContain("category: string");
      expect(src).toContain("queuedAt: number");
    });

    it("exports enqueueNotification function", () => {
      expect(src).toContain("export function enqueueNotification");
    });

    it("exports drainQueue function", () => {
      expect(src).toContain("export function drainQueue");
    });

    it("exports getQueueSize function", () => {
      expect(src).toContain("export function getQueueSize");
    });

    it("exports shouldSendImmediately function", () => {
      expect(src).toContain("export function shouldSendImmediately");
    });

    it("exports resolveFrequencyPrefs function", () => {
      expect(src).toContain("export function resolveFrequencyPrefs");
    });

    it("exports sendBatchedNotifications function", () => {
      expect(src).toContain("export async function sendBatchedNotifications");
    });

    it("batched notifications group by memberId", () => {
      expect(src).toContain("byMember.get(n.memberId)");
    });

    it("sends summary when multiple notifications queued", () => {
      expect(src).toContain("updates while you were away");
      expect(src).toContain("ranking updates");
    });

    it("exports startDailyBatchScheduler", () => {
      expect(src).toContain("export function startDailyBatchScheduler");
    });

    it("daily scheduler runs at 9am UTC", () => {
      expect(src).toContain("setUTCHours(9, 0, 0, 0)");
    });

    it("stays under 200 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(200);
    });
  });

  describe("NotificationSettings — frequency picker UI", () => {
    // Sprint 537: extracted to standalone component
    const src = readFile("components/settings/NotificationSettings.tsx");

    it("defines NotificationFrequency type", () => {
      expect(src).toContain("type NotificationFrequency");
    });

    it("defines FREQ_LABELS mapping", () => {
      expect(src).toContain("FREQ_LABELS");
      expect(src).toContain("Instant");
      expect(src).toContain("Daily digest");
      expect(src).toContain("Weekly digest");
    });

    it("has FrequencyPicker component", () => {
      expect(src).toContain("function FrequencyPicker");
    });

    it("FrequencyPicker shows Alert with frequency options", () => {
      expect(src).toContain("Frequency");
      expect(src).toContain('onChange("realtime")');
      expect(src).toContain('onChange("daily")');
      expect(src).toContain('onChange("weekly")');
    });

    it("has frequency state with default realtime", () => {
      expect(src).toContain("freqPrefs");
      expect(src).toContain('rankingChanges: "realtime"');
      expect(src).toContain('newRatings: "realtime"');
      expect(src).toContain('cityAlerts: "realtime"');
    });

    it("loads frequency prefs from AsyncStorage", () => {
      expect(src).toContain("FREQ_STORAGE_KEY");
      expect(src).toContain("notif_frequency_prefs");
    });

    it("renders FrequencyPicker for ranking changes", () => {
      expect(src).toContain('FrequencyPicker label="Ranking Changes"');
    });

    it("renders FrequencyPicker for new ratings", () => {
      expect(src).toContain('FrequencyPicker label="New Ratings"');
    });

    it("renders FrequencyPicker for city highlights", () => {
      expect(src).toContain('FrequencyPicker label="City Highlights"');
    });

    it("conditionally shows FrequencyPicker when category enabled", () => {
      expect(src).toContain("notifPrefs.rankingChanges &&");
      expect(src).toContain("notifPrefs.newRatings &&");
      expect(src).toContain("notifPrefs.cityAlerts &&");
    });

    it("syncs frequency to server", () => {
      expect(src).toContain("/api/members/me/notification-frequency");
    });

    it("has frequency change handler", () => {
      expect(src).toContain("changeFrequency");
    });
  });

  describe("server/routes-member-notifications.ts — frequency endpoints", () => {
    const src = readFile("server/routes-member-notifications.ts");

    it("has GET /api/members/me/notification-frequency", () => {
      expect(src).toContain("/api/members/me/notification-frequency");
      expect(src).toContain("notificationFrequencyPrefs");
    });

    it("has PUT /api/members/me/notification-frequency", () => {
      expect(src).toContain('app.put("/api/members/me/notification-frequency"');
    });

    it("validates frequency values", () => {
      expect(src).toContain('["realtime", "daily", "weekly"]');
    });

    it("imports updateNotificationFrequencyPrefs", () => {
      expect(src).toContain("updateNotificationFrequencyPrefs");
    });
  });

  describe("shared/schema.ts — frequency column", () => {
    const src = readFile("shared/schema.ts");

    it("has notificationFrequencyPrefs column", () => {
      expect(src).toContain("notificationFrequencyPrefs");
      expect(src).toContain("notification_frequency_prefs");
    });
  });

  describe("server/storage/members.ts — persistence", () => {
    const src = readFile("server/storage/members.ts");

    it("exports updateNotificationFrequencyPrefs", () => {
      expect(src).toContain("export async function updateNotificationFrequencyPrefs");
    });

    it("updates notificationFrequencyPrefs field", () => {
      expect(src).toContain(".set({ notificationFrequencyPrefs: prefs })");
    });
  });
});

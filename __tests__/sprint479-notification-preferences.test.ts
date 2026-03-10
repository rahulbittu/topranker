/**
 * Sprint 479: Notification Preferences UI
 *
 * Tests:
 * 1. NotificationPreferencesCard component structure
 * 2. Profile tab integration (replaces NotificationSettingsLink)
 * 3. Server endpoint: new push categories
 * 4. Settings page: new categories synced
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 479: Notification Preferences UI", () => {
  describe("NotificationPreferencesCard component", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../components/profile/NotificationPreferencesCard.tsx"),
      "utf-8"
    );

    it("exports NOTIFICATION_CATEGORIES with all 8 categories", () => {
      expect(src).toContain("export const NOTIFICATION_CATEGORIES");
      expect(src).toContain("tierUpgrades:");
      expect(src).toContain("challengerResults:");
      expect(src).toContain("newChallengers:");
      expect(src).toContain("weeklyDigest:");
      expect(src).toContain("rankingChanges:");
      expect(src).toContain("savedBusinessAlerts:");
      expect(src).toContain("cityAlerts:");
      expect(src).toContain("marketingEmails:");
    });

    it("defines three notification groups: activity, push, email", () => {
      expect(src).toContain('{ id: "activity", title: "Activity" }');
      expect(src).toContain('{ id: "push", title: "Push Alerts" }');
      expect(src).toContain('{ id: "email", title: "Email" }');
    });

    it("has expand/collapse toggle with chevron", () => {
      expect(src).toContain("expanded, setExpanded");
      expect(src).toContain("chevron-up");
      expect(src).toContain("chevron-down");
    });

    it("shows enabled count badge", () => {
      expect(src).toContain("enabledCount");
      expect(src).toContain("{enabledCount}/{totalCount}");
    });

    it("renders Switch toggles for each category", () => {
      expect(src).toContain("<Switch");
      expect(src).toContain("onValueChange={togglePref(key as NotificationCategoryKey)}");
    });

    it("syncs preferences with AsyncStorage", () => {
      expect(src).toContain("AsyncStorage.getItem(cat.key)");
      expect(src).toContain("AsyncStorage.setItem(cat.key, String(val))");
    });

    it("syncs preferences with server on load", () => {
      expect(src).toContain("/api/members/me/notification-preferences");
      expect(src).toContain('credentials: "include"');
    });

    it("fires server PUT on toggle change", () => {
      expect(src).toContain('method: "PUT"');
      expect(src).toContain("JSON.stringify({ ...prefs, [key]: val })");
    });

    it("has new push categories with correct icons", () => {
      expect(src).toContain('"swap-vertical-outline"');
      expect(src).toContain('"bookmark-outline"');
      expect(src).toContain('"location-outline"');
    });

    it("groups categories by group field", () => {
      expect(src).toContain('group: "activity"');
      expect(src).toContain('group: "push"');
      expect(src).toContain('group: "email"');
    });

    it("exports NotificationCategoryKey type", () => {
      expect(src).toContain("export type NotificationCategoryKey");
    });
  });

  describe("Profile tab integration", () => {
    // Sprint 584: NotificationPreferencesCard moved from profile.tsx into ProfileBottomSection
    const profileSrc = fs.readFileSync(
      path.resolve(__dirname, '../app/(tabs)/profile.tsx'),
      "utf-8"
    );
    const bottomSrc = fs.readFileSync(
      path.resolve(__dirname, '../components/profile/ProfileBottomSection.tsx'),
      "utf-8"
    );

    it("imports NotificationPreferencesCard instead of link", () => {
      expect(bottomSrc).toContain('import { NotificationPreferencesCard } from "@/components/profile/NotificationPreferencesCard"');
    });

    it("renders NotificationPreferencesCard component", () => {
      expect(bottomSrc).toContain("<NotificationPreferencesCard />");
    });

    it("no longer imports NotificationSettingsLink", () => {
      expect(profileSrc).not.toContain("NotificationSettingsLink");
    });

    it("profile.tsx renders ProfileBottomSection which contains NotificationPreferencesCard", () => {
      expect(profileSrc).toContain("ProfileBottomSection");
    });
  });

  describe("Server notification preferences endpoint", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../server/routes-members.ts"),
      "utf-8"
    );

    it("GET endpoint returns new push categories with defaults", () => {
      expect(src).toContain("rankingChanges: true");
      expect(src).toContain("savedBusinessAlerts: true");
      expect(src).toContain("cityAlerts: true");
    });

    it("PUT endpoint destructures new categories from body", () => {
      expect(src).toContain("rankingChanges, savedBusinessAlerts, cityAlerts");
    });

    it("PUT endpoint writes new categories to prefs object", () => {
      expect(src).toContain("rankingChanges: rankingChanges !== false");
      expect(src).toContain("savedBusinessAlerts: savedBusinessAlerts !== false");
      expect(src).toContain("cityAlerts: cityAlerts !== false");
    });
  });

  describe("Settings page sync", () => {
    // Sprint 537: notification settings extracted to standalone component
    const src = fs.readFileSync(
      path.resolve(__dirname, "../components/settings/NotificationSettings.tsx"),
      "utf-8"
    );

    it("includes new notification keys in NOTIFICATION_KEYS", () => {
      expect(src).toContain('"notif_ranking_changes"');
      expect(src).toContain('"notif_saved_biz_alerts"');
      expect(src).toContain('"notif_city_alerts"');
    });

    it("includes new categories in notifPrefs state", () => {
      expect(src).toContain("rankingChanges: true");
      expect(src).toContain("savedBusinessAlerts: true");
      expect(src).toContain("cityAlerts: true");
    });

    it("renders Ranking Changes toggle", () => {
      expect(src).toContain('label="Ranking Changes"');
      expect(src).toContain('toggleNotif("rankingChanges")');
    });

    it("renders Saved Place Updates toggle", () => {
      expect(src).toContain('label="Saved Place Updates"');
      expect(src).toContain('toggleNotif("savedBusinessAlerts")');
    });

    it("renders City Highlights toggle", () => {
      expect(src).toContain('label="City Highlights"');
      expect(src).toContain('toggleNotif("cityAlerts")');
    });
  });
});

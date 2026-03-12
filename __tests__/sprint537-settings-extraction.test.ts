/**
 * Sprint 537: Settings page extraction — notification settings to standalone component
 *
 * 1. NotificationSettings component exists with correct exports
 * 2. settings.tsx uses the extracted component
 * 3. settings.tsx LOC reduced below 350 (was 557)
 * 4. Sprint & retro docs
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. NotificationSettings component
// ---------------------------------------------------------------------------
describe("NotificationSettings component", () => {
  const src = readFile("components/settings/NotificationSettings.tsx");

  it("exports NotificationSettings", () => {
    expect(src).toContain("export function NotificationSettings");
  });

  it("has Sprint 537 attribution", () => {
    expect(src).toContain("Sprint 537");
  });

  it("defines all 10 NOTIFICATION_KEYS", () => {
    expect(src).toContain("notif_tier_upgrades");
    expect(src).toContain("notif_challenger_results");
    expect(src).toContain("notif_new_challengers");
    expect(src).toContain("notif_weekly_digest");
    expect(src).toContain("notif_ranking_changes");
    expect(src).toContain("notif_saved_biz_alerts");
    expect(src).toContain("notif_city_alerts");
    expect(src).toContain("notif_marketing_emails");
    expect(src).toContain("notif_claim_updates");
    expect(src).toContain("notif_new_ratings");
  });

  it("renders 10 SettingRow toggles", () => {
    const toggleCount = (src.match(/onToggle={toggleNotif\(/g) || []).length;
    expect(toggleCount).toBe(10);
  });

  it("renders 3 FrequencyPicker components", () => {
    const pickerCount = (src.match(/<FrequencyPicker/g) || []).length;
    expect(pickerCount).toBe(3);
  });

  it("has notification frequency type", () => {
    expect(src).toContain("NotificationFrequency");
    expect(src).toContain("realtime");
    expect(src).toContain("daily");
    expect(src).toContain("weekly");
  });

  it("syncs to server on toggle", () => {
    expect(src).toContain("/api/members/me/notification-preferences");
    expect(src).toContain("PUT");
  });

  it("syncs frequency to server", () => {
    expect(src).toContain("/api/members/me/notification-frequency");
  });

  it("uses AsyncStorage for local cache", () => {
    expect(src).toContain("AsyncStorage");
    expect(src).toContain("FREQ_STORAGE_KEY");
  });

  it("has self-contained SettingRow component", () => {
    expect(src).toContain("function SettingRow");
    expect(src).toContain("Switch");
  });

  it("has self-contained FrequencyPicker component", () => {
    expect(src).toContain("function FrequencyPicker");
    expect(src).toContain("Frequency");
  });
});

// ---------------------------------------------------------------------------
// 2. settings.tsx integration
// ---------------------------------------------------------------------------
describe("settings.tsx uses NotificationSettings", () => {
  const src = readFile("app/settings.tsx");

  it("imports NotificationSettings", () => {
    expect(src).toContain("import { NotificationSettings }");
    expect(src).toContain("components/settings/NotificationSettings");
  });

  it("renders NotificationSettings component", () => {
    expect(src).toContain("<NotificationSettings");
  });

  it("no longer has inline SettingRow component", () => {
    expect(src).not.toContain("function SettingRow");
  });

  it("no longer has inline FrequencyPicker component", () => {
    expect(src).not.toContain("function FrequencyPicker");
  });

  it("no longer has NOTIFICATION_KEYS constant", () => {
    expect(src).not.toContain("NOTIFICATION_KEYS");
  });

  it("no longer imports AsyncStorage or Switch", () => {
    expect(src).not.toContain("AsyncStorage");
    expect(src).not.toContain("Switch");
  });

  it("still has city selection", () => {
    expect(src).toContain("CITY_LABELS");
    expect(src).toContain("handleCityChange");
  });

  it("still has theme selection", () => {
    expect(src).toContain("handleThemeChange");
    expect(src).toContain("Appearance");
  });

  it("still has sign out", () => {
    expect(src).toContain("Sign Out");
    expect(src).toContain("handleLogout");
  });
});

// ---------------------------------------------------------------------------
// 3. LOC reduction
// ---------------------------------------------------------------------------
describe("settings.tsx LOC reduction", () => {
  const src = readFile("app/settings.tsx");

  it("settings.tsx is under 385 LOC (was 557, +analytics Sprint 714)", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(385);
  });

  it("settings.tsx reduced by at least 180 LOC", () => {
    const lines = src.split("\n").length;
    expect(557 - lines).toBeGreaterThanOrEqual(180);
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 537 docs", () => {
  const sprint = readFile("docs/sprints/SPRINT-537-SETTINGS-EXTRACTION.md");
  const retro = readFile("docs/retros/RETRO-537-SETTINGS-EXTRACTION.md");

  it("sprint doc has correct header", () => {
    expect(sprint).toContain("Sprint 537");
    expect(sprint).toContain("Settings");
  });

  it("sprint doc has team discussion", () => {
    expect(sprint).toContain("Team Discussion");
    expect(sprint).toContain("Marcus Chen");
    expect(sprint).toContain("Sarah Nakamura");
  });

  it("sprint doc mentions LOC reduction", () => {
    expect(sprint).toContain("557");
    expect(sprint).toContain("301");
  });

  it("sprint doc mentions NotificationSettings", () => {
    expect(sprint).toContain("NotificationSettings");
  });

  it("retro has correct header", () => {
    expect(retro).toContain("Retro 537");
  });

  it("retro has all required sections", () => {
    expect(retro).toContain("What Went Well");
    expect(retro).toContain("What Could Improve");
    expect(retro).toContain("Action Items");
    expect(retro).toContain("Team Morale");
  });
});

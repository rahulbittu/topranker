/**
 * Edit Profile & Notification Unification Tests — Sprint 149
 * Owner: Sarah Nakamura (Lead Engineer)
 *
 * Validates:
 *   1. Edit profile screen exists with proper fields
 *   2. PUT /api/members/me endpoint exists with validation
 *   3. Settings navigates to edit-profile (not profile tab)
 *   4. Profile notification prefs unified (link to settings, not inline toggles)
 *   5. Route registration for edit-profile
 *
 * Total: 20 tests
 */

import { vi, describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

// ── 1. Edit Profile Screen ──────────────────────────────────────────

describe("Edit profile screen", () => {
  const editProfilePath = path.resolve(__dirname, "..", "app", "edit-profile.tsx");

  it("should have an edit-profile.tsx screen file", () => {
    expect(fs.existsSync(editProfilePath)).toBe(true);
  });

  it("should have display name input", () => {
    const source = fs.readFileSync(editProfilePath, "utf-8");
    expect(source.toLowerCase()).toContain("display");
    expect(source).toContain("TextInput");
  });

  it("should have username input", () => {
    const source = fs.readFileSync(editProfilePath, "utf-8");
    expect(source.toLowerCase()).toContain("username");
  });

  it("should have save button", () => {
    const source = fs.readFileSync(editProfilePath, "utf-8");
    expect(source).toMatch(/save|submit|update/i);
  });

  it("should call PUT /api/members/me on save", () => {
    const source = fs.readFileSync(editProfilePath, "utf-8");
    expect(source).toContain("PUT");
    expect(source).toContain("/api/members/me");
  });

  it("should use brand colors and fonts", () => {
    const source = fs.readFileSync(editProfilePath, "utf-8");
    expect(source).toContain("Colors");
    expect(source).toContain("BRAND");
  });

  it("should have back navigation", () => {
    const source = fs.readFileSync(editProfilePath, "utf-8");
    expect(source).toContain("router.back");
  });
});

// ── 2. PUT /api/members/me Endpoint ─────────────────────────────────

describe("PUT /api/members/me endpoint", () => {
  const routesPath = path.resolve(__dirname, "..", "server", "routes-members.ts");
  let routesSource: string;

  beforeEach(() => {
    routesSource = fs.readFileSync(routesPath, "utf-8");
  });

  it("should have PUT endpoint for member profile", () => {
    expect(routesSource).toMatch(/app\.put\(["']\/api\/members\/me["']/);
  });

  it("should require authentication", () => {
    const putMatch = routesSource.match(/app\.put\(["']\/api\/members\/me["'],\s*(\w+)/);
    expect(putMatch?.[1]).toBe("requireAuth");
  });

  it("should accept displayName in body", () => {
    expect(routesSource).toContain("displayName");
  });

  it("should accept username in body", () => {
    expect(routesSource).toContain("username");
  });
});

// ── 3. Storage layer ────────────────────────────────────────────────

describe("Member profile update storage", () => {
  it("should have updateMemberProfile function in storage", () => {
    const storagePath = path.resolve(__dirname, "..", "server", "storage", "members.ts");
    const source = fs.readFileSync(storagePath, "utf-8");
    expect(source).toContain("updateMemberProfile");
  });

  it("should be exported from storage index", () => {
    const indexPath = path.resolve(__dirname, "..", "server", "storage", "index.ts");
    const source = fs.readFileSync(indexPath, "utf-8");
    expect(source).toContain("updateMemberProfile");
  });
});

// ── 4. Settings navigation to edit profile ──────────────────────────

describe("Settings edit profile navigation", () => {
  it("should navigate to /edit-profile instead of /(tabs)/profile", () => {
    const settingsPath = path.resolve(__dirname, "..", "app", "settings.tsx");
    const source = fs.readFileSync(settingsPath, "utf-8");
    expect(source).toContain("/edit-profile");
  });
});

// ── 5. Notification unification ─────────────────────────────────────

describe("Profile notification preferences unified", () => {
  const profileSubPath = path.resolve(__dirname, "..", "components", "profile", "SubComponents.tsx");
  const notifLinkPath = path.resolve(__dirname, "..", "components", "profile", "NotificationSettingsLink.tsx");

  it("should not have inline notification toggles on profile", () => {
    const source = fs.readFileSync(notifLinkPath, "utf-8");
    // The old NotificationPreferences had Switch components for each toggle
    // After unification, it should be a link to settings, not inline switches
    const switchCount = (source.match(/notifRatingUpdates|notifChallengeResults|notifWeeklyDigest/g) || []).length;
    expect(switchCount).toBe(0);
  });

  it("should have a notification settings link component", () => {
    const source = fs.readFileSync(profileSubPath, "utf-8");
    expect(source).toMatch(/NotificationSettingsLink|Manage.*Notification|Notification.*Settings/i);
  });

  it("should link to settings from profile", () => {
    const source = fs.readFileSync(notifLinkPath, "utf-8");
    expect(source).toContain("/settings");
  });
});

// ── 6. Route registration ───────────────────────────────────────────

describe("Edit profile route registration", () => {
  it("should register edit-profile in app layout", () => {
    const layoutPath = path.resolve(__dirname, "..", "app", "_layout.tsx");
    const source = fs.readFileSync(layoutPath, "utf-8");
    expect(source).toContain("edit-profile");
  });
});

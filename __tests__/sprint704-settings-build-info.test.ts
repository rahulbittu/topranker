/**
 * Sprint 704: Settings build info enhancement for beta testers.
 * Adds build number and environment indicator to About section.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

// ─── Build Info in Settings ─────────────────────────────────────────────

describe("Sprint 704: Settings build info", () => {
  const src = readFile("app/settings.tsx");

  it("imports expo-constants for build info", () => {
    expect(src).toContain('import Constants from "expo-constants"');
  });

  it("shows version from package.json", () => {
    expect(src).toContain("packageJson.version");
  });

  it("shows build number from Constants", () => {
    expect(src).toContain("Constants.expoConfig");
    expect(src).toContain("buildNumber");
  });

  it("shows environment indicator", () => {
    expect(src).toContain("Environment");
    expect(src).toContain("Local");
    expect(src).toContain("Production");
  });

  it("detects localhost as Local environment", () => {
    expect(src).toContain('getApiUrl().includes("localhost")');
  });

  it("has sprint 704 comment", () => {
    expect(src).toContain("Sprint 704: Enhanced build info for beta testers");
  });
});

// ─── Existing Settings Features ─────────────────────────────────────────

describe("Sprint 704: Settings sections preserved", () => {
  const src = readFile("app/settings.tsx");

  it("has Account section with city and theme", () => {
    expect(src).toContain('"ACCOUNT"');
    expect(src).toContain('"City"');
    expect(src).toContain('"Appearance"');
  });

  it("has Notifications section", () => {
    expect(src).toContain('"NOTIFICATIONS"');
    expect(src).toContain("NotificationSettings");
  });

  it("has Legal section with terms and privacy", () => {
    expect(src).toContain('"LEGAL"');
    expect(src).toContain('"Terms of Service"');
    expect(src).toContain('"Privacy Policy"');
  });

  it("has Help & Feedback section", () => {
    expect(src).toContain('"HELP & FEEDBACK"');
    expect(src).toContain('"Send Feedback"');
  });

  it("has sign out with confirmation dialog", () => {
    expect(src).toContain('"Sign Out"');
    expect(src).toContain("handleLogout");
  });

  it("has delete account (Apple requirement)", () => {
    expect(src).toContain('"Delete Account"');
    expect(src).toContain("handleDeleteAccount");
  });

  it("has edit profile row", () => {
    expect(src).toContain('"Edit Profile"');
  });
});

// ─── Settings Accessibility ─────────────────────────────────────────────

describe("Sprint 704: Settings accessibility", () => {
  const src = readFile("app/settings.tsx");

  it("back button has accessibilityLabel", () => {
    expect(src).toContain('accessibilityLabel="Go back"');
  });

  it("sign out has accessibilityLabel", () => {
    expect(src).toContain('accessibilityLabel="Sign out"');
  });

  it("delete account has accessibilityLabel", () => {
    expect(src).toContain('accessibilityLabel="Delete account permanently"');
  });

  it("navigation rows have accessibilityRole", () => {
    expect(src).toContain('accessibilityRole="button"');
  });
});

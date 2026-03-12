/**
 * Sprint 683: Android build readiness tests.
 * Validates adaptive icon, permissions, intent filters, and Play Store metadata.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

function readJson(filePath: string): any {
  return JSON.parse(readFile(filePath));
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(path.resolve(filePath));
}

// ─── Android Configuration ──────────────────────────────────────────────

describe("Sprint 683: Android app.json configuration", () => {
  const config = readJson("app.json").expo;

  it("has Android package name", () => {
    expect(config.android.package).toBe("com.topranker.app");
  });

  it("has version code", () => {
    expect(config.android.versionCode).toBeGreaterThanOrEqual(1);
  });

  it("has location permissions", () => {
    const perms = config.android.permissions;
    expect(perms.some((p: string) => p.includes("ACCESS_FINE_LOCATION"))).toBe(true);
    expect(perms.some((p: string) => p.includes("ACCESS_COARSE_LOCATION"))).toBe(true);
  });

  it("has camera permission", () => {
    const perms = config.android.permissions;
    expect(perms.some((p: string) => p.includes("CAMERA"))).toBe(true);
  });

  it("has vibrate permission for notifications", () => {
    const perms = config.android.permissions;
    expect(perms.some((p: string) => p.includes("VIBRATE"))).toBe(true);
  });

  it("has boot completed for scheduled notifications", () => {
    const perms = config.android.permissions;
    expect(perms.some((p: string) => p.includes("RECEIVE_BOOT_COMPLETED"))).toBe(true);
  });

  it("has intent filters for deep links", () => {
    const filters = config.android.intentFilters;
    expect(filters).toBeDefined();
    expect(filters.length).toBeGreaterThan(0);
    expect(filters[0].action).toBe("VIEW");
    expect(filters[0].autoVerify).toBe(true);
  });

  it("deep links use topranker.com host", () => {
    const data = config.android.intentFilters[0].data;
    expect(data.some((d: any) => d.host === "topranker.com")).toBe(true);
  });

  it("deep links include business path", () => {
    const data = config.android.intentFilters[0].data;
    expect(data.some((d: any) => d.pathPrefix === "/business/")).toBe(true);
  });
});

// ─── Adaptive Icon ──────────────────────────────────────────────────────

describe("Sprint 683: Android adaptive icon", () => {
  const config = readJson("app.json").expo;

  it("has adaptive icon config", () => {
    expect(config.android.adaptiveIcon).toBeDefined();
  });

  it("has navy background color", () => {
    expect(config.android.adaptiveIcon.backgroundColor).toBe("#0D1B2A");
  });

  it("foreground image exists", () => {
    expect(fileExists("assets/images/android-icon-foreground.png")).toBe(true);
  });

  it("background image exists", () => {
    expect(fileExists("assets/images/android-icon-background.png")).toBe(true);
  });

  it("monochrome image exists", () => {
    expect(fileExists("assets/images/android-icon-monochrome.png")).toBe(true);
  });

  it("monochrome image referenced in config", () => {
    expect(config.android.adaptiveIcon.monochromeImage).toBe("./assets/images/android-icon-monochrome.png");
  });
});

// ─── Notification Channels (Android) ────────────────────────────────────

describe("Sprint 683: Android notification channels", () => {
  const sharedSrc = readFile("shared/notification-channels.ts");
  const clientSrc = readFile("lib/notifications.ts");

  it("5 channels defined in shared config", () => {
    const channelIds = sharedSrc.match(/id: "/g);
    expect(channelIds?.length).toBe(5);
  });

  it("client creates channels on Android", () => {
    expect(clientSrc).toContain("Platform.OS === \"android\"");
    expect(clientSrc).toContain("NOTIFICATION_CHANNELS.map");
  });

  it("channels have correct importance mapping", () => {
    expect(clientSrc).toContain("AndroidImportance.HIGH");
    expect(clientSrc).toContain("AndroidImportance.DEFAULT");
    expect(clientSrc).toContain("AndroidImportance.LOW");
  });
});

// ─── Play Store Metadata ────────────────────────────────────────────────

describe("Sprint 683: Play Store metadata", () => {
  it("metadata file exists", () => {
    expect(fileExists("docs/app-store/PLAY-STORE-METADATA.md")).toBe(true);
  });

  const meta = readFile("docs/app-store/PLAY-STORE-METADATA.md");

  it("has app name", () => {
    expect(meta).toContain("TopRanker");
  });

  it("has short description (80 chars)", () => {
    expect(meta).toContain("Short Description");
  });

  it("has full description", () => {
    expect(meta).toContain("Full Description");
  });

  it("has Food & Drink category", () => {
    expect(meta).toContain("Food & Drink");
  });

  it("has content rating section", () => {
    expect(meta).toContain("Content Rating");
    expect(meta).toContain("Everyone");
  });

  it("has data safety section", () => {
    expect(meta).toContain("Data Safety");
    expect(meta).toContain("data deletion");
  });

  it("has privacy policy URL", () => {
    expect(meta).toContain("topranker.com/privacy");
  });

  it("has build commands", () => {
    expect(meta).toContain("eas-cli");
    expect(meta).toContain("--platform android");
  });

  it("has feature graphic design brief", () => {
    expect(meta).toContain("Feature Graphic");
    expect(meta).toContain("1024");
    expect(meta).toContain("500");
  });

  it("has release track strategy", () => {
    expect(meta).toContain("Internal testing");
    expect(meta).toContain("Production");
  });
});

// ─── EAS Android Build Config ───────────────────────────────────────────

describe("Sprint 683: EAS Android build config", () => {
  const eas = readJson("eas.json");

  it("submit config has Android section", () => {
    expect(eas.submit.production.android).toBeDefined();
  });

  it("uses internal track for initial release", () => {
    expect(eas.submit.production.android.track).toBe("internal");
  });

  it("references service account key", () => {
    expect(eas.submit.production.android.serviceAccountKeyPath).toBeTruthy();
  });
});

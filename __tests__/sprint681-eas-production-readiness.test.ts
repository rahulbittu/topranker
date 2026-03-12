/**
 * Sprint 681: EAS production build readiness tests.
 * Validates app.json, eas.json, and App Store metadata are complete.
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

// ─── app.json Production Readiness ──────────────────────────────────────

describe("Sprint 681: app.json configuration", () => {
  const config = readJson("app.json").expo;

  it("has correct app name", () => {
    expect(config.name).toBe("TopRanker");
  });

  it("has version 1.0.0", () => {
    expect(config.version).toBe("1.0.0");
  });

  it("has portrait orientation", () => {
    expect(config.orientation).toBe("portrait");
  });

  it("has app icon configured", () => {
    expect(config.icon).toBe("./assets/images/icon.png");
  });

  it("has splash screen with navy background", () => {
    expect(config.splash.backgroundColor).toBe("#0D1B2A");
  });

  it("has iOS bundle identifier", () => {
    expect(config.ios.bundleIdentifier).toBe("com.topranker.app");
  });

  it("has Android package name", () => {
    expect(config.android.package).toBe("com.topranker.app");
  });

  it("has real EAS project ID (not placeholder)", () => {
    expect(config.extra.eas.projectId).toBe("30a52864-563f-440f-baf2-842c37fb757c");
    expect(config.extra.eas.projectId).not.toBe("topranker");
  });

  it("has OTA updates URL configured", () => {
    expect(config.updates.url).toContain("u.expo.dev");
    expect(config.updates.url).toContain("30a52864-563f-440f-baf2-842c37fb757c");
  });

  it("has runtime version policy", () => {
    expect(config.runtimeVersion.policy).toBe("appVersion");
  });

  it("has owner set", () => {
    expect(config.owner).toBe("rpitta4");
  });

  it("has encryption disclosure (false for App Store)", () => {
    expect(config.ios.config.usesNonExemptEncryption).toBe(false);
  });

  it("has location permission description", () => {
    expect(config.ios.infoPlist.NSLocationWhenInUseUsageDescription).toBeTruthy();
  });

  it("has camera permission description", () => {
    expect(config.ios.infoPlist.NSCameraUsageDescription).toBeTruthy();
  });

  it("has photo library permission description", () => {
    expect(config.ios.infoPlist.NSPhotoLibraryUsageDescription).toBeTruthy();
  });

  it("has Android adaptive icon", () => {
    expect(config.android.adaptiveIcon.foregroundImage).toBeTruthy();
    expect(config.android.adaptiveIcon.backgroundImage).toBeTruthy();
  });

  it("has notification plugin configured", () => {
    const notifPlugin = config.plugins.find((p: any) =>
      Array.isArray(p) ? p[0] === "expo-notifications" : p === "expo-notifications"
    );
    expect(notifPlugin).toBeTruthy();
  });

  it("has deep link scheme", () => {
    expect(config.scheme).toBe("topranker");
  });

  it("has associated domains for iOS universal links", () => {
    expect(config.ios.associatedDomains).toContain("applinks:topranker.com");
  });
});

// ─── eas.json Build Profiles ────────────────────────────────────────────

describe("Sprint 681: eas.json build profiles", () => {
  const eas = readJson("eas.json");

  it("has development profile", () => {
    expect(eas.build.development).toBeDefined();
    expect(eas.build.development.developmentClient).toBe(true);
  });

  it("has preview profile with internal distribution", () => {
    expect(eas.build.preview).toBeDefined();
    expect(eas.build.preview.distribution).toBe("internal");
  });

  it("has production profile with auto-increment", () => {
    expect(eas.build.production).toBeDefined();
    expect(eas.build.production.autoIncrement).toBe(true);
  });

  it("preview connects to production API", () => {
    expect(eas.build.preview.env.EXPO_PUBLIC_API_URL).toContain("topranker.io");
  });

  it("production connects to production API", () => {
    expect(eas.build.production.env.EXPO_PUBLIC_API_URL).toContain("topranker.io");
  });

  it("has OTA update channels configured", () => {
    expect(eas.build.preview.channel).toBe("preview");
    expect(eas.build.production.channel).toBe("production");
  });

  it("has submit config for iOS", () => {
    expect(eas.submit.production.ios).toBeDefined();
  });

  it("has submit config for Android", () => {
    expect(eas.submit.production.android).toBeDefined();
  });

  it("CLI version is 14+", () => {
    expect(eas.cli.version).toContain(">= 14");
  });
});

// ─── App Store Metadata ─────────────────────────────────────────────────

describe("Sprint 681: App Store metadata", () => {
  it("metadata file exists", () => {
    expect(fileExists("docs/app-store/APP-STORE-METADATA.md")).toBe(true);
  });

  const meta = readFile("docs/app-store/APP-STORE-METADATA.md");

  it("has app name", () => {
    expect(meta).toContain("TopRanker");
  });

  it("has bundle ID", () => {
    expect(meta).toContain("com.topranker.app");
  });

  it("has primary category Food & Drink", () => {
    expect(meta).toContain("Food & Drink");
  });

  it("has description", () => {
    expect(meta).toContain("best specific thing in your city");
  });

  it("has keywords", () => {
    expect(meta).toContain("Keywords");
    expect(meta).toContain("restaurant");
    expect(meta).toContain("Dallas");
  });

  it("has privacy policy URL", () => {
    expect(meta).toContain("topranker.com/privacy");
  });

  it("has terms URL", () => {
    expect(meta).toContain("topranker.com/terms");
  });

  it("has screenshot plan with 5 screens", () => {
    expect(meta).toContain("Rankings tab");
    expect(meta).toContain("Business detail");
    expect(meta).toContain("Rating flow");
    expect(meta).toContain("Discover tab");
    expect(meta).toContain("Challenger matchup");
  });

  it("has review notes for Apple", () => {
    expect(meta).toContain("Review Notes");
    expect(meta).toContain("test@topranker.com");
  });

  it("has Google Play metadata too", () => {
    expect(meta).toContain("Google Play Store");
  });
});

// ─── Asset Files Existence ──────────────────────────────────────────────

describe("Sprint 681: required asset files", () => {
  it("app icon exists", () => {
    expect(fileExists("assets/images/icon.png")).toBe(true);
  });

  it("splash icon exists", () => {
    expect(fileExists("assets/images/splash-icon.png")).toBe(true);
  });

  it("web favicon exists", () => {
    expect(fileExists("assets/images/favicon.png")).toBe(true);
  });

  it("notification icon referenced in app.json", () => {
    // Icon may not exist yet — test that app.json references it for when it's created
    const appJson = readJson("app.json").expo;
    const notifPlugin = appJson.plugins.find((p: any) => Array.isArray(p) && p[0] === "expo-notifications");
    expect(notifPlugin).toBeTruthy();
    expect(notifPlugin[1].icon).toBeTruthy();
  });

  it("Android adaptive icon foreground exists", () => {
    expect(fileExists("assets/images/android-icon-foreground.png")).toBe(true);
  });

  it("Android adaptive icon background exists", () => {
    expect(fileExists("assets/images/android-icon-background.png")).toBe(true);
  });
});

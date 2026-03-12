/**
 * Sprint 716 — TestFlight Submission Support
 *
 * Owner: Sarah Nakamura (Lead Eng)
 *
 * Verifies:
 * - iOS privacy manifest is configured
 * - ASC App ID placeholder is set (reminder to replace)
 * - app.json has all required submission fields
 * - eas.json build profiles are complete
 * - Pre-submission script exists
 * - All App Store docs present
 */
import { describe, it, expect } from "vitest";

describe("Sprint 716 — TestFlight Submission Support", () => {
  let appJson: any;
  let easJson: any;

  it("loads app.json", async () => {
    const fs = await import("node:fs");
    appJson = JSON.parse(
      fs.readFileSync(new URL("../app.json", import.meta.url), "utf-8"),
    );
    expect(appJson).toBeTruthy();
  });

  it("loads eas.json", async () => {
    const fs = await import("node:fs");
    easJson = JSON.parse(
      fs.readFileSync(new URL("../eas.json", import.meta.url), "utf-8"),
    );
    expect(easJson).toBeTruthy();
  });

  // ── iOS Privacy Manifest ──
  describe("iOS Privacy Manifest", () => {
    it("has privacyManifests configured", () => {
      expect(appJson.expo.ios.privacyManifests).toBeTruthy();
    });

    it("declares NSPrivacyAccessedAPITypes", () => {
      const types = appJson.expo.ios.privacyManifests.NSPrivacyAccessedAPITypes;
      expect(types).toBeDefined();
      expect(types.length).toBeGreaterThan(0);
    });

    it("declares UserDefaults API usage (AsyncStorage)", () => {
      const types = appJson.expo.ios.privacyManifests.NSPrivacyAccessedAPITypes;
      const userDefaults = types.find(
        (t: any) => t.NSPrivacyAccessedAPIType === "NSPrivacyAccessedAPICategoryUserDefaults",
      );
      expect(userDefaults).toBeTruthy();
      expect(userDefaults.NSPrivacyAccessedAPITypeReasons).toContain("CA92.1");
    });
  });

  // ── app.json Required Fields ──
  describe("app.json submission fields", () => {
    it("has version", () => {
      expect(appJson.expo.version).toBe("1.0.0");
    });

    it("has iOS bundle identifier", () => {
      expect(appJson.expo.ios.bundleIdentifier).toBe("com.topranker.app");
    });

    it("has Android package", () => {
      expect(appJson.expo.android.package).toBe("com.topranker.app");
    });

    it("has encryption exemption", () => {
      expect(appJson.expo.ios.config.usesNonExemptEncryption).toBe(false);
    });

    it("has icon path", () => {
      expect(appJson.expo.icon).toBeTruthy();
    });

    it("has splash screen", () => {
      expect(appJson.expo.splash.image).toBeTruthy();
    });

    it("has location permission string", () => {
      expect(appJson.expo.ios.infoPlist.NSLocationWhenInUseUsageDescription).toBeTruthy();
    });

    it("has camera permission string", () => {
      expect(appJson.expo.ios.infoPlist.NSCameraUsageDescription).toBeTruthy();
    });

    it("has photo library permission string", () => {
      expect(appJson.expo.ios.infoPlist.NSPhotoLibraryUsageDescription).toBeTruthy();
    });
  });

  // ── eas.json Build Profiles ──
  describe("eas.json build profiles", () => {
    it("has development profile", () => {
      expect(easJson.build.development).toBeTruthy();
      expect(easJson.build.development.developmentClient).toBe(true);
    });

    it("has preview profile with API URL", () => {
      expect(easJson.build.preview).toBeTruthy();
      expect(easJson.build.preview.env.EXPO_PUBLIC_API_URL).toContain("railway.app");
    });

    it("has production profile with auto-increment", () => {
      expect(easJson.build.production).toBeTruthy();
      expect(easJson.build.production.autoIncrement).toBe(true);
    });

    it("production has API URL pointing to Railway", () => {
      expect(easJson.build.production.env.EXPO_PUBLIC_API_URL).toContain("topranker-production");
    });
  });

  // ── eas.json Submit Config ──
  describe("eas.json submit config", () => {
    it("has Apple ID", () => {
      expect(easJson.submit.production.ios.appleId).toBeTruthy();
    });

    it("has Apple Team ID", () => {
      expect(easJson.submit.production.ios.appleTeamId).toBe("RKGRR7XGWD");
    });

    it("ASC App ID is set (placeholder reminds to replace)", () => {
      // Should be either a real numeric ID or our placeholder
      expect(easJson.submit.production.ios.ascAppId).toBeTruthy();
    });

    it("Android track is internal", () => {
      expect(easJson.submit.production.android.track).toBe("internal");
    });
  });

  // ── Pre-submission Script ──
  describe("Pre-submission script", () => {
    it("script exists", async () => {
      const fs = await import("node:fs");
      const exists = fs.existsSync(
        new URL("../scripts/pre-submit-check.sh", import.meta.url),
      );
      expect(exists).toBe(true);
    });

    it("script is executable", async () => {
      const fs = await import("node:fs");
      const stats = fs.statSync(
        new URL("../scripts/pre-submit-check.sh", import.meta.url),
      );
      const isExecutable = (stats.mode & 0o111) !== 0;
      expect(isExecutable).toBe(true);
    });
  });

  // ── App Store Documentation ──
  describe("App Store documentation", () => {
    it("TestFlight setup doc exists", async () => {
      const fs = await import("node:fs");
      expect(fs.existsSync(new URL("../docs/app-store/TESTFLIGHT-SETUP.md", import.meta.url))).toBe(true);
    });

    it("App Store metadata doc exists", async () => {
      const fs = await import("node:fs");
      expect(fs.existsSync(new URL("../docs/app-store/APP-STORE-METADATA.md", import.meta.url))).toBe(true);
    });

    it("App Store Connect checklist exists", async () => {
      const fs = await import("node:fs");
      expect(fs.existsSync(new URL("../docs/app-store/APP-STORE-CONNECT-CHECKLIST.md", import.meta.url))).toBe(true);
    });
  });

  // ── OTA Updates Config ──
  describe("OTA updates", () => {
    it("runtime version uses appVersion policy", () => {
      expect(appJson.expo.runtimeVersion.policy).toBe("appVersion");
    });

    it("updates URL points to Expo", () => {
      expect(appJson.expo.updates.url).toContain("u.expo.dev");
    });

    it("preview channel configured", () => {
      expect(easJson.build.preview.channel).toBe("preview");
    });

    it("production channel configured", () => {
      expect(easJson.build.production.channel).toBe("production");
    });
  });
});

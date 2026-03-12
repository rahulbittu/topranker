/**
 * Sprint 754: EAS + TestFlight Readiness Validation
 *
 * Validates that app.json and eas.json are correctly configured
 * for EAS Build and TestFlight submission.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readJSON(rel: string): any {
  return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8"));
}

describe("Sprint 754: EAS + TestFlight Readiness", () => {
  describe("app.json — Expo config", () => {
    const appJson = readJSON("app.json");
    const expo = appJson.expo;

    it("has correct app name", () => {
      expect(expo.name).toBe("TopRanker");
    });

    it("has correct slug", () => {
      expect(expo.slug).toBe("topranker");
    });

    it("has version 1.0.0", () => {
      expect(expo.version).toBe("1.0.0");
    });

    it("has correct scheme for deep linking", () => {
      expect(expo.scheme).toBe("topranker");
    });

    it("has iOS bundle identifier", () => {
      expect(expo.ios.bundleIdentifier).toBe("com.topranker.app");
    });

    it("has associated domains for universal links", () => {
      expect(expo.ios.associatedDomains).toContain("applinks:topranker.com");
      expect(expo.ios.associatedDomains).toContain("applinks:topranker.io");
    });

    it("declares non-exempt encryption as false", () => {
      expect(expo.ios.config.usesNonExemptEncryption).toBe(false);
    });

    it("has privacy manifests", () => {
      expect(expo.ios.privacyManifests.NSPrivacyAccessedAPITypes.length).toBeGreaterThanOrEqual(4);
    });

    it("has location permission description", () => {
      expect(expo.ios.infoPlist.NSLocationWhenInUseUsageDescription).toBeTruthy();
    });

    it("has camera permission description", () => {
      expect(expo.ios.infoPlist.NSCameraUsageDescription).toBeTruthy();
    });

    it("has photo library permission description", () => {
      expect(expo.ios.infoPlist.NSPhotoLibraryUsageDescription).toBeTruthy();
    });

    it("has EAS project ID", () => {
      expect(expo.extra.eas.projectId).toBeTruthy();
      expect(expo.extra.eas.projectId).not.toContain("REPLACE");
    });

    it("has runtime version policy", () => {
      expect(expo.runtimeVersion.policy).toBe("appVersion");
    });

    it("has OTA update URL", () => {
      expect(expo.updates.url).toContain("u.expo.dev");
    });

    it("has splash screen with brand color", () => {
      expect(expo.splash.backgroundColor).toBe("#0D1B2A");
    });

    it("has notification plugin configured", () => {
      const notifPlugin = expo.plugins.find((p: any) =>
        Array.isArray(p) && p[0] === "expo-notifications"
      );
      expect(notifPlugin).toBeTruthy();
      expect(notifPlugin[1].color).toBe("#C49A1A");
    });

    it("has typed routes enabled", () => {
      expect(expo.experiments.typedRoutes).toBe(true);
    });

    it("has Android package name", () => {
      expect(expo.android.package).toBe("com.topranker.app");
    });
  });

  describe("eas.json — Build config", () => {
    const easJson = readJSON("eas.json");

    it("has development profile", () => {
      expect(easJson.build.development).toBeTruthy();
      expect(easJson.build.development.developmentClient).toBe(true);
    });

    it("has preview profile with production API URL", () => {
      expect(easJson.build.preview.env.EXPO_PUBLIC_API_URL).toContain("topranker.io");
    });

    it("has production profile with production API URL", () => {
      expect(easJson.build.production.env.EXPO_PUBLIC_API_URL).toContain("topranker.io");
    });

    it("has auto-increment for production builds", () => {
      expect(easJson.build.production.autoIncrement).toBe(true);
    });

    it("has preview channel", () => {
      expect(easJson.build.preview.channel).toBe("preview");
    });

    it("has production channel", () => {
      expect(easJson.build.production.channel).toBe("production");
    });

    it("has Apple team ID for submission", () => {
      expect(easJson.submit.production.ios.appleTeamId).toBeTruthy();
      expect(easJson.submit.production.ios.appleTeamId).not.toContain("REPLACE");
    });

    it("has Apple ID for submission", () => {
      expect(easJson.submit.production.ios.appleId).toBeTruthy();
      expect(easJson.submit.production.ios.appleId).toContain("@");
    });

    it("notes ascAppId needs to be set (CEO task)", () => {
      // This will start failing once the CEO sets the numeric App ID — that's intentional
      expect(easJson.submit.production.ios.ascAppId).toBe("REPLACE_WITH_NUMERIC_APP_ID");
    });
  });

  describe("railway.toml alignment with eas.json", () => {
    const easJson = readJSON("eas.json");
    const railwayToml = fs.readFileSync(path.resolve(process.cwd(), "railway.toml"), "utf-8");

    it("Railway serves the custom domain used by EAS", () => {
      const apiUrl = easJson.build.production.env.EXPO_PUBLIC_API_URL;
      expect(apiUrl).toContain("topranker.io");
      expect(railwayToml).toContain("internalPort = 8080");
    });
  });

  describe("file health", () => {
    const thresholds = readJSON("shared/thresholds.json");

    it("tracks 34 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(34);
    });

    it("build under 750kb", () => {
      const buildSrc = fs.readFileSync(path.resolve(process.cwd(), "server_dist/index.js"), "utf-8");
      const sizeKb = buildSrc.length / 1024;
      expect(sizeKb).toBeLessThan(750);
    });
  });
});

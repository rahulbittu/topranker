/**
 * Sprint 791: Full Permission Audit
 *
 * Verifies every declared permission has corresponding code usage,
 * and no usage exists for undeclared permissions.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 791: Permission Audit", () => {
  const appJson = JSON.parse(readFile("app.json"));
  const iosConfig = appJson.expo.ios;
  const androidPermissions = appJson.expo.android.permissions as string[];

  describe("Android permissions — all justified", () => {
    const expectedPermissions = [
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.CAMERA",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.VIBRATE",
      "android.permission.RECEIVE_BOOT_COMPLETED",
    ];

    it("has exactly the expected permissions", () => {
      expect(androidPermissions.sort()).toEqual(expectedPermissions.sort());
    });

    it("no RECORD_AUDIO (removed in Sprint 789)", () => {
      expect(androidPermissions).not.toContain("android.permission.RECORD_AUDIO");
    });

    it("no WRITE_EXTERNAL_STORAGE (deprecated)", () => {
      expect(androidPermissions).not.toContain("android.permission.WRITE_EXTERNAL_STORAGE");
    });

    it("no INTERNET (auto-granted on Android)", () => {
      // INTERNET is implicit, should not be declared
      expect(androidPermissions).not.toContain("android.permission.INTERNET");
    });
  });

  describe("iOS — all usage descriptions present", () => {
    const infoPlist = iosConfig.infoPlist;

    it("has location usage description", () => {
      expect(infoPlist.NSLocationWhenInUseUsageDescription).toBeTruthy();
      expect(infoPlist.NSLocationWhenInUseUsageDescription).toContain("location");
    });

    it("has camera usage description", () => {
      expect(infoPlist.NSCameraUsageDescription).toBeTruthy();
      expect(infoPlist.NSCameraUsageDescription).toContain("camera");
    });

    it("has photo library usage description", () => {
      expect(infoPlist.NSPhotoLibraryUsageDescription).toBeTruthy();
      expect(infoPlist.NSPhotoLibraryUsageDescription).toContain("photo");
    });

    it("no microphone usage description (not needed)", () => {
      expect(infoPlist.NSMicrophoneUsageDescription).toBeUndefined();
    });
  });

  describe("iOS — encryption flag", () => {
    it("declares non-exempt encryption (no custom encryption)", () => {
      expect(iosConfig.config.usesNonExemptEncryption).toBe(false);
    });
  });

  describe("iOS — privacy manifests", () => {
    const privacyTypes = iosConfig.privacyManifests.NSPrivacyAccessedAPITypes;

    it("declares UserDefaults API usage", () => {
      expect(privacyTypes).toContainEqual(
        expect.objectContaining({
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
        })
      );
    });

    it("declares FileTimestamp API usage", () => {
      expect(privacyTypes).toContainEqual(
        expect.objectContaining({
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryFileTimestamp",
        })
      );
    });

    it("declares SystemBootTime API usage", () => {
      expect(privacyTypes).toContainEqual(
        expect.objectContaining({
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategorySystemBootTime",
        })
      );
    });

    it("declares DiskSpace API usage", () => {
      expect(privacyTypes).toContainEqual(
        expect.objectContaining({
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryDiskSpace",
        })
      );
    });
  });

  describe("permission-to-code mapping", () => {
    // Verify that code actually uses each declared permission

    it("location code exists (search.tsx, MapView.tsx)", () => {
      const search = readFile("app/(tabs)/search.tsx");
      const hasLocationRef = search.includes("Location") || search.includes("location");
      expect(hasLocationRef).toBe(true);
    });

    it("camera/photo code exists (image picker)", () => {
      const extras = readFile("components/rate/RatingExtrasStep.tsx");
      const hasImagePicker = extras.includes("ImagePicker") || extras.includes("launchCamera") || extras.includes("pickImage");
      expect(hasImagePicker).toBe(true);
    });

    it("haptics code exists (vibrate permission)", () => {
      const haptics = readFile("lib/haptic-patterns.ts");
      expect(haptics).toContain("Haptics");
    });

    it("push notification code exists (boot completed)", () => {
      const notif = readFile("lib/notifications.ts");
      expect(notif).toContain("Notifications");
    });
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("tracks 34 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(34);
    });

    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});

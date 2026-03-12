/**
 * Sprint 198 — Mobile Native Expo Build
 *
 * Validates:
 * 1. EAS Build configuration (eas.json)
 * 2. App.json production-ready settings
 * 3. Deep linking for join page
 * 4. Build scripts in package.json
 * 5. App environment module
 * 6. Notification plugin config
 * 7. Platform permission declarations
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const readJson = (relPath: string) =>
  JSON.parse(readFile(relPath));

// ---------------------------------------------------------------------------
// 1. EAS Build configuration
// ---------------------------------------------------------------------------
describe("EAS Build — eas.json", () => {
  const eas = readJson("eas.json");

  it("exists with CLI version requirement", () => {
    expect(eas.cli.version).toBeDefined();
  });

  it("has development build profile", () => {
    expect(eas.build.development).toBeDefined();
    expect(eas.build.development.developmentClient).toBe(true);
  });

  it("development profile supports iOS simulator", () => {
    expect(eas.build.development.ios.simulator).toBe(true);
  });

  it("has preview build profile for internal testing", () => {
    expect(eas.build.preview).toBeDefined();
    expect(eas.build.preview.distribution).toBe("internal");
  });

  it("has production build profile", () => {
    expect(eas.build.production).toBeDefined();
    expect(eas.build.production.autoIncrement).toBe(true);
  });

  it("sets APP_ENV per build profile", () => {
    expect(eas.build.development.env.APP_ENV).toBe("development");
    expect(eas.build.preview.env.APP_ENV).toBe("preview");
    expect(eas.build.production.env.APP_ENV).toBe("production");
  });

  it("has update channels for preview and production", () => {
    expect(eas.build.preview.channel).toBe("preview");
    expect(eas.build.production.channel).toBe("production");
  });

  it("has submit configuration for app stores", () => {
    expect(eas.submit).toBeDefined();
    expect(eas.submit.production.ios).toBeDefined();
    expect(eas.submit.production.android).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 2. App.json production-ready settings
// ---------------------------------------------------------------------------
describe("App.json — production settings", () => {
  const config = readJson("app.json");
  const expo = config.expo;

  it("has correct app name", () => {
    expect(expo.name).toBe("TopRanker");
  });

  it("has runtime version policy for OTA updates", () => {
    expect(expo.runtimeVersion).toBeDefined();
    expect(expo.runtimeVersion.policy).toBe("appVersion");
  });

  it("has EAS update URL", () => {
    expect(expo.updates).toBeDefined();
    expect(expo.updates.url).toContain("expo.dev");
  });

  it("has EAS project ID in extra", () => {
    expect(expo.extra.eas).toBeDefined();
    expect(expo.extra.eas.projectId).toBe("30a52864-563f-440f-baf2-842c37fb757c");
  });

  it("origin points to production domain (not Replit)", () => {
    const routerPlugin = expo.plugins.find(
      (p: any) => Array.isArray(p) && p[0] === "expo-router"
    );
    expect(routerPlugin[1].origin).toBe("https://topranker.com");
  });

  it("uses non-exempt encryption declaration for iOS", () => {
    expect(expo.ios.config.usesNonExemptEncryption).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. Deep linking for join page
// ---------------------------------------------------------------------------
describe("Deep linking — join page support", () => {
  const config = readJson("app.json");
  const filters = config.expo.android.intentFilters[0];

  it("Android handles /join deep links", () => {
    const joinPath = filters.data.find((d: any) => d.pathPrefix === "/join");
    expect(joinPath).toBeDefined();
    expect(joinPath.scheme).toBe("https");
    expect(joinPath.host).toBe("topranker.com");
  });

  it("Android handles /business/ deep links", () => {
    const bizPath = filters.data.find((d: any) => d.pathPrefix === "/business/");
    expect(bizPath).toBeDefined();
  });

  it("iOS has associated domains for universal links", () => {
    expect(config.expo.ios.associatedDomains).toContain("applinks:topranker.com");
  });
});

// ---------------------------------------------------------------------------
// 4. Build scripts
// ---------------------------------------------------------------------------
describe("Build scripts — package.json", () => {
  const pkg = readJson("package.json");

  it("has build:dev script", () => {
    expect(pkg.scripts["build:dev"]).toContain("eas build");
    expect(pkg.scripts["build:dev"]).toContain("development");
  });

  it("has build:preview script", () => {
    expect(pkg.scripts["build:preview"]).toContain("eas build");
    expect(pkg.scripts["build:preview"]).toContain("preview");
  });

  it("has build:ios script for production", () => {
    expect(pkg.scripts["build:ios"]).toContain("eas build");
    expect(pkg.scripts["build:ios"]).toContain("ios");
  });

  it("has build:android script for production", () => {
    expect(pkg.scripts["build:android"]).toContain("eas build");
    expect(pkg.scripts["build:android"]).toContain("android");
  });

  it("has build:all script", () => {
    expect(pkg.scripts["build:all"]).toContain("eas build");
    expect(pkg.scripts["build:all"]).toContain("all");
  });

  it("has submit scripts for app stores", () => {
    expect(pkg.scripts["submit:ios"]).toContain("eas submit");
    expect(pkg.scripts["submit:android"]).toContain("eas submit");
  });

  it("has OTA update script", () => {
    expect(pkg.scripts["update"]).toContain("eas update");
  });
});

// ---------------------------------------------------------------------------
// 5. App environment module
// ---------------------------------------------------------------------------
describe("App environment — lib/app-env.ts", () => {
  const src = readFile("lib/app-env.ts");

  it("exists with Sprint 198 header", () => {
    expect(src).toContain("Sprint 198");
  });

  it("exports getAppEnvironment function", () => {
    expect(src).toContain("export function getAppEnvironment");
  });

  it("supports development, preview, production environments", () => {
    expect(src).toContain('"development"');
    expect(src).toContain('"preview"');
    expect(src).toContain('"production"');
  });

  it("exports API base URL function", () => {
    expect(src).toContain("export function getApiBaseUrl");
  });

  it("uses different API URLs per environment", () => {
    expect(src).toContain("topranker.io");
    expect(src).toContain("localhost");
  });

  it("exports convenience constants", () => {
    expect(src).toContain("export const APP_ENV");
    expect(src).toContain("export const IS_PRODUCTION");
    expect(src).toContain("export const IS_PREVIEW");
    expect(src).toContain("export const IS_DEVELOPMENT");
  });

  it("reads app version from Constants", () => {
    expect(src).toContain("APP_VERSION");
    expect(src).toContain("Constants.expoConfig");
  });

  it("reads build number from platform config", () => {
    expect(src).toContain("BUILD_NUMBER");
    expect(src).toContain("buildNumber");
    expect(src).toContain("versionCode");
  });
});

// ---------------------------------------------------------------------------
// 6. Notification plugin config
// ---------------------------------------------------------------------------
describe("Notification plugin — app.json", () => {
  const config = readJson("app.json");
  const plugins = config.expo.plugins;

  it("includes expo-notifications plugin", () => {
    const notifPlugin = plugins.find(
      (p: any) => Array.isArray(p) && p[0] === "expo-notifications"
    );
    expect(notifPlugin).toBeDefined();
  });

  it("notification icon uses amber brand color", () => {
    const notifPlugin = plugins.find(
      (p: any) => Array.isArray(p) && p[0] === "expo-notifications"
    );
    expect(notifPlugin[1].color).toBe("#C49A1A");
  });
});

// ---------------------------------------------------------------------------
// 7. Platform permissions
// ---------------------------------------------------------------------------
describe("Platform permissions — app.json", () => {
  const config = readJson("app.json");

  it("iOS declares location usage description", () => {
    expect(config.expo.ios.infoPlist.NSLocationWhenInUseUsageDescription).toContain("location");
  });

  it("iOS declares camera usage description", () => {
    expect(config.expo.ios.infoPlist.NSCameraUsageDescription).toContain("camera");
  });

  it("iOS declares photo library usage description", () => {
    expect(config.expo.ios.infoPlist.NSPhotoLibraryUsageDescription).toContain("photo");
  });

  it("Android declares location permissions", () => {
    const perms = config.expo.android.permissions;
    expect(perms.some((p: string) => p.includes("ACCESS_FINE_LOCATION"))).toBe(true);
    expect(perms.some((p: string) => p.includes("ACCESS_COARSE_LOCATION"))).toBe(true);
  });

  it("Android declares camera permission", () => {
    expect(config.expo.android.permissions.some((p: string) => p.includes("CAMERA"))).toBe(true);
  });

  it("Android declares vibrate permission for haptics", () => {
    expect(config.expo.android.permissions.some((p: string) => p.includes("VIBRATE"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 8. Location plugin
// ---------------------------------------------------------------------------
describe("Location plugin — app.json", () => {
  const config = readJson("app.json");
  const plugins = config.expo.plugins;

  it("includes expo-location plugin", () => {
    const locPlugin = plugins.find(
      (p: any) => Array.isArray(p) && p[0] === "expo-location"
    );
    expect(locPlugin).toBeDefined();
  });

  it("has location permission description", () => {
    const locPlugin = plugins.find(
      (p: any) => Array.isArray(p) && p[0] === "expo-location"
    );
    expect(locPlugin[1].locationWhenInUsePermission).toContain("location");
  });
});

// ---------------------------------------------------------------------------
// 9. Image picker plugin
// ---------------------------------------------------------------------------
describe("Image picker plugin — app.json", () => {
  const config = readJson("app.json");
  const plugins = config.expo.plugins;

  it("includes expo-image-picker plugin", () => {
    const imgPlugin = plugins.find(
      (p: any) => Array.isArray(p) && p[0] === "expo-image-picker"
    );
    expect(imgPlugin).toBeDefined();
  });

  it("has photo and camera permission descriptions", () => {
    const imgPlugin = plugins.find(
      (p: any) => Array.isArray(p) && p[0] === "expo-image-picker"
    );
    expect(imgPlugin[1].photosPermission).toBeDefined();
    expect(imgPlugin[1].cameraPermission).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 10. Gitignore for native build artifacts
// ---------------------------------------------------------------------------
describe("Gitignore — native build artifacts", () => {
  const gitignore = readFile(".gitignore");

  it("ignores iOS build directory", () => {
    expect(gitignore).toContain("ios/");
  });

  it("ignores Android build directory", () => {
    expect(gitignore).toContain("android/");
  });

  it("ignores credential files", () => {
    expect(gitignore).toContain("*.p8");
    expect(gitignore).toContain("*.p12");
    expect(gitignore).toContain("*.mobileprovision");
  });

  it("ignores Google service files", () => {
    expect(gitignore).toContain("google-services.json");
    expect(gitignore).toContain("GoogleService-Info.plist");
  });
});

/**
 * Sprint 684: TestFlight + OTA update readiness tests.
 * Validates update configuration, build channels, and beta distribution setup.
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

// ─── OTA Updates Configuration ──────────────────────────────────────────

describe("Sprint 684: OTA updates configuration", () => {
  const config = readJson("app.json").expo;

  it("has updates URL pointing to Expo", () => {
    expect(config.updates.url).toContain("u.expo.dev");
  });

  it("updates URL uses real project ID", () => {
    expect(config.updates.url).toContain("30a52864-563f-440f-baf2-842c37fb757c");
  });

  it("has runtime version policy", () => {
    expect(config.runtimeVersion).toBeDefined();
    expect(config.runtimeVersion.policy).toBe("appVersion");
  });

  it("expo-updates package is installed", () => {
    const pkg = readJson("package.json");
    expect(pkg.dependencies["expo-updates"]).toBeTruthy();
  });
});

// ─── Build Channels for Distribution ────────────────────────────────────

describe("Sprint 684: EAS build channels", () => {
  const eas = readJson("eas.json");

  it("preview channel for TestFlight internal testing", () => {
    expect(eas.build.preview.channel).toBe("preview");
  });

  it("production channel for App Store release", () => {
    expect(eas.build.production.channel).toBe("production");
  });

  it("preview uses internal distribution", () => {
    expect(eas.build.preview.distribution).toBe("internal");
  });

  it("production has auto-increment versioning", () => {
    expect(eas.build.production.autoIncrement).toBe(true);
  });

  it("both channels have API URL configured", () => {
    expect(eas.build.preview.env.EXPO_PUBLIC_API_URL).toBeTruthy();
    expect(eas.build.production.env.EXPO_PUBLIC_API_URL).toBeTruthy();
  });
});

// ─── Submit Configuration ───────────────────────────────────────────────

describe("Sprint 684: EAS submit configuration", () => {
  const eas = readJson("eas.json");

  it("iOS submit has real Apple ID", () => {
    expect(eas.submit.production.ios.appleId).toBe("rahulpitta4@gmail.com");
  });

  it("iOS submit has real Team ID", () => {
    expect(eas.submit.production.ios.appleTeamId).toBe("RKGRR7XGWD");
    expect(eas.submit.production.ios.appleTeamId).not.toBe("TOPRANKER_TEAM");
  });

  it("Android submit targets internal track", () => {
    expect(eas.submit.production.android.track).toBe("internal");
  });
});

// ─── TestFlight Documentation ───────────────────────────────────────────

describe("Sprint 684: TestFlight documentation", () => {
  it("TestFlight setup guide exists", () => {
    expect(fileExists("docs/app-store/TESTFLIGHT-SETUP.md")).toBe(true);
  });

  const doc = readFile("docs/app-store/TESTFLIGHT-SETUP.md");

  it("covers internal testers", () => {
    expect(doc).toContain("Internal Testers");
  });

  it("covers external testers", () => {
    expect(doc).toContain("External Testers");
  });

  it("covers beta app review", () => {
    expect(doc).toContain("Beta App Review");
  });

  it("has test account credentials", () => {
    expect(doc).toContain("test@topranker.com");
  });

  it("covers OTA updates", () => {
    expect(doc).toContain("OTA");
    expect(doc).toContain("eas-cli");
    expect(doc).toContain("update");
  });

  it("mentions 90-day TestFlight expiry", () => {
    expect(doc).toContain("90 days");
  });

  it("has Dallas Beta Testers group name", () => {
    expect(doc).toContain("Dallas Beta Testers");
  });

  it("covers WhatsApp distribution", () => {
    expect(doc).toContain("WhatsApp");
  });
});

// ─── App Store Docs Completeness ────────────────────────────────────────

describe("Sprint 684: App Store documentation suite", () => {
  it("App Store metadata exists", () => {
    expect(fileExists("docs/app-store/APP-STORE-METADATA.md")).toBe(true);
  });

  it("App Store Connect checklist exists", () => {
    expect(fileExists("docs/app-store/APP-STORE-CONNECT-CHECKLIST.md")).toBe(true);
  });

  it("Screenshot mapping exists", () => {
    expect(fileExists("docs/app-store/SCREENSHOT-MAPPING.md")).toBe(true);
  });

  it("Play Store metadata exists", () => {
    expect(fileExists("docs/app-store/PLAY-STORE-METADATA.md")).toBe(true);
  });

  it("TestFlight setup exists", () => {
    expect(fileExists("docs/app-store/TESTFLIGHT-SETUP.md")).toBe(true);
  });
});

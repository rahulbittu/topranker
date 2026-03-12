/**
 * Sprint 721 — Release Hardening (Privacy Manifest + ErrorUtils + Device Model)
 *
 * Owner: Nadia Kaur (Security)
 *
 * Verifies:
 * - Complete privacy manifest with all 4 required API types
 * - ErrorUtils mount guard prevents handler chain corruption
 * - Device model included in feedback device context
 * - Pre-submit script validates privacy manifest count
 */
import { describe, it, expect } from "vitest";

describe("Sprint 721 — Release Hardening", () => {
  let appJson: any;
  let feedbackSource: string;
  let layoutSource: string;
  let preSubmitSource: string;

  it("loads required files", async () => {
    const fs = await import("node:fs");
    appJson = JSON.parse(
      fs.readFileSync(new URL("../app.json", import.meta.url), "utf-8"),
    );
    feedbackSource = fs.readFileSync(
      new URL("../app/feedback.tsx", import.meta.url),
      "utf-8",
    );
    layoutSource = fs.readFileSync(
      new URL("../app/_layout.tsx", import.meta.url),
      "utf-8",
    );
    preSubmitSource = fs.readFileSync(
      new URL("../scripts/pre-submit-check.sh", import.meta.url),
      "utf-8",
    );
    expect(appJson).toBeTruthy();
    expect(feedbackSource).toBeTruthy();
    expect(layoutSource).toBeTruthy();
    expect(preSubmitSource).toBeTruthy();
  });

  // ── Privacy Manifest Completion ──
  describe("Privacy manifest", () => {
    it("declares exactly 4 API types", () => {
      const types = appJson.expo.ios.privacyManifests.NSPrivacyAccessedAPITypes;
      expect(types).toHaveLength(4);
    });

    it("declares UserDefaults (CA92.1)", () => {
      const types = appJson.expo.ios.privacyManifests.NSPrivacyAccessedAPITypes;
      const ud = types.find(
        (t: any) => t.NSPrivacyAccessedAPIType === "NSPrivacyAccessedAPICategoryUserDefaults",
      );
      expect(ud).toBeTruthy();
      expect(ud.NSPrivacyAccessedAPITypeReasons).toContain("CA92.1");
    });

    it("declares FileTimestamp (DDA9.1)", () => {
      const types = appJson.expo.ios.privacyManifests.NSPrivacyAccessedAPITypes;
      const ft = types.find(
        (t: any) => t.NSPrivacyAccessedAPIType === "NSPrivacyAccessedAPICategoryFileTimestamp",
      );
      expect(ft).toBeTruthy();
      expect(ft.NSPrivacyAccessedAPITypeReasons).toContain("DDA9.1");
    });

    it("declares SystemBootTime (35F9.1)", () => {
      const types = appJson.expo.ios.privacyManifests.NSPrivacyAccessedAPITypes;
      const sbt = types.find(
        (t: any) => t.NSPrivacyAccessedAPIType === "NSPrivacyAccessedAPICategorySystemBootTime",
      );
      expect(sbt).toBeTruthy();
      expect(sbt.NSPrivacyAccessedAPITypeReasons).toContain("35F9.1");
    });

    it("declares DiskSpace (E174.1)", () => {
      const types = appJson.expo.ios.privacyManifests.NSPrivacyAccessedAPITypes;
      const ds = types.find(
        (t: any) => t.NSPrivacyAccessedAPIType === "NSPrivacyAccessedAPICategoryDiskSpace",
      );
      expect(ds).toBeTruthy();
      expect(ds.NSPrivacyAccessedAPITypeReasons).toContain("E174.1");
    });

    it("each API type has exactly one reason", () => {
      const types = appJson.expo.ios.privacyManifests.NSPrivacyAccessedAPITypes;
      for (const t of types) {
        expect(t.NSPrivacyAccessedAPITypeReasons).toHaveLength(1);
      }
    });
  });

  // ── ErrorUtils Mount Guard ──
  describe("ErrorUtils mount guard", () => {
    it("uses ref to track handler installation", () => {
      expect(layoutSource).toContain("errorHandlerInstalled");
      expect(layoutSource).toContain("useRef(false)");
    });

    it("checks ref before installing handler", () => {
      expect(layoutSource).toContain("if (errorHandlerInstalled.current) return");
    });

    it("sets ref true on install", () => {
      expect(layoutSource).toContain("errorHandlerInstalled.current = true");
    });

    it("resets ref on cleanup", () => {
      expect(layoutSource).toContain("errorHandlerInstalled.current = false");
    });

    it("still captures original handler", () => {
      expect(layoutSource).toContain("ErrorUtils.getGlobalHandler()");
    });

    it("still restores original handler on cleanup", () => {
      expect(layoutSource).toContain("ErrorUtils.setGlobalHandler(originalHandler)");
    });
  });

  // ── Device Model in Feedback ──
  describe("Device model in feedback", () => {
    it("imports expo-device", () => {
      expect(feedbackSource).toContain("expo-device");
    });

    it("includes deviceModel in context", () => {
      expect(feedbackSource).toContain("deviceModel");
      expect(feedbackSource).toContain("Device.modelName");
    });

    it("includes deviceBrand in context", () => {
      expect(feedbackSource).toContain("deviceBrand");
      expect(feedbackSource).toContain("Device.brand");
    });

    it("preserves existing device context fields", () => {
      expect(feedbackSource).toContain("Platform.OS");
      expect(feedbackSource).toContain("Platform.Version");
      expect(feedbackSource).toContain("appVersion");
      expect(feedbackSource).toContain("buildNumber");
    });
  });

  // ── Pre-Submit Script ──
  describe("Pre-submit script", () => {
    it("validates privacy manifest API type count", () => {
      expect(preSubmitSource).toContain("Privacy API types declared");
      expect(preSubmitSource).toContain("expected 4");
    });
  });
});

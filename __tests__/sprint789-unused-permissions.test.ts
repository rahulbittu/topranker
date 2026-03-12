/**
 * Sprint 789: Remove Unused Android Permissions
 *
 * RECORD_AUDIO was declared but never used — would cause unnecessary
 * permission prompts and potential store rejection.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 789: Unused Permissions", () => {
  const appJson = JSON.parse(readFile("app.json"));
  const permissions = appJson.expo.android.permissions;

  describe("app.json Android permissions", () => {
    it("does NOT include RECORD_AUDIO", () => {
      expect(permissions).not.toContain("android.permission.RECORD_AUDIO");
    });

    it("still includes required permissions", () => {
      expect(permissions).toContain("android.permission.ACCESS_FINE_LOCATION");
      expect(permissions).toContain("android.permission.ACCESS_COARSE_LOCATION");
      expect(permissions).toContain("android.permission.CAMERA");
      expect(permissions).toContain("android.permission.VIBRATE");
    });

    it("has no duplicate permissions", () => {
      const unique = new Set(permissions);
      expect(unique.size).toBe(permissions.length);
    });
  });

  describe("no audio recording code exists", () => {
    // Verify that no code in the app actually uses audio recording
    const filesToCheck = [
      "lib/audio.ts",
      "lib/audio-engine.ts",
    ];

    for (const f of filesToCheck) {
      it(`${f} has no recording functionality`, () => {
        const src = readFile(f);
        expect(src).not.toContain("MediaRecorder");
        expect(src).not.toContain("startRecording");
        expect(src).not.toContain("Audio.Recording");
      });
    }
  });

  describe("security headers block microphone", () => {
    const secHeaders = readFile("server/security-headers.ts");

    it("Permissions-Policy blocks microphone", () => {
      expect(secHeaders).toContain("microphone=()");
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

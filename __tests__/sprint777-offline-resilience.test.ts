/**
 * Sprint 777: Offline Resilience
 *
 * Wired React Query's onlineManager to NetInfo so queries pause
 * when offline instead of firing and failing.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 777: Offline Resilience", () => {
  describe("lib/query-client.ts — onlineManager wiring", () => {
    const src = readFile("lib/query-client.ts");

    it("imports onlineManager from React Query", () => {
      expect(src).toContain("onlineManager");
    });

    it("imports NetInfo", () => {
      expect(src).toContain("@react-native-community/netinfo");
    });

    it("wires NetInfo to onlineManager for native", () => {
      expect(src).toContain("onlineManager.setEventListener");
      expect(src).toContain("NetInfo.addEventListener");
    });

    it("handles web platform with navigator events", () => {
      expect(src).toContain('addEventListener("online"');
      expect(src).toContain('addEventListener("offline"');
    });

    it("refetches on app focus for native", () => {
      expect(src).toContain("AppState.addEventListener");
      expect(src).toContain('"active"');
    });
  });

  describe("components/NetworkBanner.tsx — offline UI", () => {
    const src = readFile("components/NetworkBanner.tsx");

    it("shows offline message", () => {
      expect(src).toContain("No internet connection");
    });

    it("shows back online message", () => {
      expect(src).toContain("Back online");
    });

    it("has retry button for mock mode", () => {
      expect(src).toContain("invalidateQueries");
    });

    it("uses NetInfo for native connectivity", () => {
      expect(src).toContain("NetInfo.addEventListener");
    });
  });

  describe("lib/offline-sync-service.ts — queue processing", () => {
    const src = readFile("lib/offline-sync-service.ts");

    it("processes sync queue on app foreground", () => {
      expect(src).toContain('AppState.addEventListener("change"');
    });

    it("handles network errors gracefully", () => {
      expect(src).toContain("Failed to fetch");
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

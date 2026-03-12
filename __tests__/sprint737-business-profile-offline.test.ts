/**
 * Sprint 737 — Business Detail + Profile Offline-Aware
 *
 * Owner: Leo Hernandez (Frontend)
 *
 * Verifies:
 * - Business detail screen uses useOfflineAware pattern
 * - Profile screen uses useOfflineAware pattern
 * - All 4 major screens now have offline graceful degradation
 */
import { describe, it, expect } from "vitest";

describe("Sprint 737 — Business + Profile Offline-Aware", () => {
  let businessSource: string;
  let profileSource: string;

  it("loads source files", async () => {
    const fs = await import("node:fs");
    businessSource = fs.readFileSync(
      new URL("../app/business/[id].tsx", import.meta.url),
      "utf-8",
    );
    profileSource = fs.readFileSync(
      new URL("../app/(tabs)/profile.tsx", import.meta.url),
      "utf-8",
    );
    expect(businessSource).toBeTruthy();
    expect(profileSource).toBeTruthy();
  });

  // ── Business Detail ──
  describe("Business detail offline-aware", () => {
    it("imports useOfflineAware", () => {
      expect(businessSource).toContain("useOfflineAware");
      expect(businessSource).toContain("@/lib/hooks/useOfflineAware");
    });

    it("imports StaleBanner", () => {
      expect(businessSource).toContain("StaleBanner");
      expect(businessSource).toContain("@/components/StaleBanner");
    });

    it("destructures dataUpdatedAt from useQuery", () => {
      expect(businessSource).toContain("dataUpdatedAt");
    });

    it("uses showError instead of isError for error state", () => {
      expect(businessSource).toContain("if (showError)");
    });

    it("renders StaleBanner when stale", () => {
      expect(businessSource).toContain("isStale && staleLabel");
      expect(businessSource).toContain("<StaleBanner");
    });

    it("passes business existence to useOfflineAware", () => {
      expect(businessSource).toContain("!!business");
    });
  });

  // ── Profile ──
  describe("Profile offline-aware", () => {
    it("imports useOfflineAware", () => {
      expect(profileSource).toContain("useOfflineAware");
      expect(profileSource).toContain("@/lib/hooks/useOfflineAware");
    });

    it("imports StaleBanner", () => {
      expect(profileSource).toContain("StaleBanner");
      expect(profileSource).toContain("@/components/StaleBanner");
    });

    it("destructures dataUpdatedAt from useQuery", () => {
      expect(profileSource).toContain("dataUpdatedAt");
    });

    it("uses showError instead of isError for error state", () => {
      expect(profileSource).toContain("if (showError)");
    });

    it("renders StaleBanner when stale", () => {
      expect(profileSource).toContain("isStale && staleLabel");
      expect(profileSource).toContain("<StaleBanner");
    });

    it("passes profile existence to useOfflineAware", () => {
      expect(profileSource).toContain("!!profile");
    });
  });

  // ── Coverage Verification ──
  describe("All 4 screens offline-aware", () => {
    it("Rankings (index.tsx) has useOfflineAware", async () => {
      const fs = await import("node:fs");
      const src = fs.readFileSync(
        new URL("../app/(tabs)/index.tsx", import.meta.url),
        "utf-8",
      );
      expect(src).toContain("useOfflineAware");
    });

    it("Discover (search.tsx) has useOfflineAware", async () => {
      const fs = await import("node:fs");
      const src = fs.readFileSync(
        new URL("../app/(tabs)/search.tsx", import.meta.url),
        "utf-8",
      );
      expect(src).toContain("useOfflineAware");
    });

    it("Business Detail has useOfflineAware", () => {
      expect(businessSource).toContain("useOfflineAware");
    });

    it("Profile has useOfflineAware", () => {
      expect(profileSource).toContain("useOfflineAware");
    });
  });
});

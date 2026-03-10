import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 374: Admin dashboard quick links", () => {
  const dashSrc = readFile("app/admin/dashboard.tsx");

  // ── Quick Links section ─────────────────────────────────

  describe("Quick Links UI", () => {
    it("should have Quick Links section title", () => {
      expect(dashSrc).toContain("Quick Links");
    });

    it("should render quick links grid", () => {
      expect(dashSrc).toContain("quickLinksGrid");
    });

    it("should link to moderation page", () => {
      expect(dashSrc).toContain('router.push("/admin/moderation")');
    });

    it("should display Moderation Queue label", () => {
      expect(dashSrc).toContain("Moderation Queue");
    });

    it("should display description text for moderation link", () => {
      expect(dashSrc).toContain("Review flagged content");
    });

    it("should link to admin home", () => {
      expect(dashSrc).toContain('router.push("/admin")');
    });

    it("should display Admin Home label", () => {
      expect(dashSrc).toContain("Admin Home");
    });

    it("should use shield-outline icon for moderation", () => {
      expect(dashSrc).toContain('"shield-outline"');
    });

    it("should use settings-outline icon for admin home", () => {
      expect(dashSrc).toContain('"settings-outline"');
    });
  });

  // ── Accessibility ───────────────────────────────────────

  describe("Quick Links accessibility", () => {
    it("should have button role on link cards", () => {
      expect(dashSrc).toContain('accessibilityRole="button"');
    });

    it("should label moderation link", () => {
      expect(dashSrc).toContain("Go to Moderation Queue");
    });

    it("should label admin home link", () => {
      expect(dashSrc).toContain("Go to Admin Home");
    });
  });

  // ── Styles ──────────────────────────────────────────────

  describe("Quick Links styles", () => {
    it("should define quickLinksSection style", () => {
      expect(dashSrc).toContain("quickLinksSection:");
    });

    it("should define quickLinksGrid as row layout", () => {
      expect(dashSrc).toContain("quickLinksGrid:");
    });

    it("should define quickLinkCard style", () => {
      expect(dashSrc).toContain("quickLinkCard:");
    });

    it("should define quickLinkLabel style", () => {
      expect(dashSrc).toContain("quickLinkLabel:");
    });

    it("should define quickLinkDesc style", () => {
      expect(dashSrc).toContain("quickLinkDesc:");
    });
  });

  // ── Imports ─────────────────────────────────────────────

  describe("Required imports", () => {
    it("should import router from expo-router", () => {
      expect(dashSrc).toContain("router");
      expect(dashSrc).toContain("expo-router");
    });

    it("should import Ionicons", () => {
      expect(dashSrc).toContain("Ionicons");
    });
  });
});

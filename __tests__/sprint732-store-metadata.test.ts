/**
 * Sprint 732 — App Store Metadata Preparation
 *
 * Owner: Jasmine Taylor (Marketing)
 *
 * Verifies:
 * - All required App Store fields are populated
 * - Keywords are within 100-character limit
 * - Description is within 4000-character limit
 * - Screenshot specs are correct
 * - AASA config has required structure
 */
import { describe, it, expect } from "vitest";
import { APP_STORE_METADATA, AASA_CONFIG } from "../config/store-metadata";

describe("Sprint 732 — App Store Metadata", () => {
  // ── Required Fields ──
  describe("Required App Store fields", () => {
    it("has app name (max 30 chars)", () => {
      expect(APP_STORE_METADATA.name).toBeTruthy();
      expect(APP_STORE_METADATA.name.length).toBeLessThanOrEqual(30);
    });

    it("has subtitle (max 30 chars)", () => {
      expect(APP_STORE_METADATA.subtitle).toBeTruthy();
      expect(APP_STORE_METADATA.subtitle.length).toBeLessThanOrEqual(30);
    });

    it("has promotional text (max 170 chars)", () => {
      expect(APP_STORE_METADATA.promotionalText).toBeTruthy();
      expect(APP_STORE_METADATA.promotionalText.length).toBeLessThanOrEqual(170);
    });

    it("has description (max 4000 chars)", () => {
      expect(APP_STORE_METADATA.description).toBeTruthy();
      expect(APP_STORE_METADATA.description.length).toBeLessThanOrEqual(4000);
    });

    it("has keywords (max 100 chars)", () => {
      expect(APP_STORE_METADATA.keywords).toBeTruthy();
      expect(APP_STORE_METADATA.keywords.length).toBeLessThanOrEqual(100);
    });

    it("has primary category", () => {
      expect(APP_STORE_METADATA.primaryCategory).toBe("Food & Drink");
    });

    it("has privacy policy URL", () => {
      expect(APP_STORE_METADATA.privacyPolicyUrl).toContain("https://");
    });

    it("has support URL", () => {
      expect(APP_STORE_METADATA.supportUrl).toContain("https://");
    });

    it("has content rating 4+", () => {
      expect(APP_STORE_METADATA.contentRating).toBe("4+");
    });

    it("has version 1.0.0", () => {
      expect(APP_STORE_METADATA.version).toBe("1.0.0");
    });
  });

  // ── Keywords ──
  describe("Keywords", () => {
    it("contains restaurant-related terms", () => {
      const kw = APP_STORE_METADATA.keywords;
      expect(kw).toContain("restaurants");
      expect(kw).toContain("food");
      expect(kw).toContain("rankings");
    });

    it("contains Dallas-area terms", () => {
      const kw = APP_STORE_METADATA.keywords;
      expect(kw).toContain("dallas");
      expect(kw).toContain("irving");
    });

    it("uses comma-separated format", () => {
      const keywords = APP_STORE_METADATA.keywords.split(",");
      expect(keywords.length).toBeGreaterThanOrEqual(8);
    });
  });

  // ── Description ──
  describe("Description content", () => {
    it("mentions structured ratings", () => {
      expect(APP_STORE_METADATA.description).toContain("structured");
    });

    it("mentions credibility-weighted", () => {
      expect(APP_STORE_METADATA.description).toContain("credibility");
    });

    it("mentions no paid placements", () => {
      expect(APP_STORE_METADATA.description).toContain("No paid placements");
    });

    it("mentions Dallas launch market", () => {
      expect(APP_STORE_METADATA.description).toContain("Dallas");
    });
  });

  // ── Screenshots ──
  describe("Screenshot specifications", () => {
    it("has iPhone 6.7\" specs", () => {
      expect(APP_STORE_METADATA.screenshots.iphone67.resolution).toBe("1290 x 2796");
    });

    it("requires 6 screenshots for 6.7\"", () => {
      expect(APP_STORE_METADATA.screenshots.iphone67.count).toBe(6);
    });

    it("has 6 scene descriptions", () => {
      expect(APP_STORE_METADATA.screenshots.iphone67.scenes.length).toBe(6);
    });

    it("has iPhone 5.5\" specs", () => {
      expect(APP_STORE_METADATA.screenshots.iphone55.resolution).toBe("1242 x 2208");
    });

    it("iPad is not required (supportsTablet false)", () => {
      expect(APP_STORE_METADATA.screenshots.ipad.required).toBe(false);
    });
  });

  // ── AASA Config ──
  describe("Apple App Site Association", () => {
    it("has applinks structure", () => {
      expect(AASA_CONFIG.applinks).toBeTruthy();
      expect(AASA_CONFIG.applinks.details).toBeTruthy();
    });

    it("has app ID entry", () => {
      expect(AASA_CONFIG.applinks.details[0].appIDs).toBeTruthy();
      expect(AASA_CONFIG.applinks.details[0].appIDs[0]).toContain("com.topranker.app");
    });

    it("has business deep link component", () => {
      const components = AASA_CONFIG.applinks.details[0].components;
      const businessLink = components.find((c: any) => c["/"] === "/business/*");
      expect(businessLink).toBeTruthy();
    });

    it("has dish deep link component", () => {
      const components = AASA_CONFIG.applinks.details[0].components;
      const dishLink = components.find((c: any) => c["/"] === "/dish/*");
      expect(dishLink).toBeTruthy();
    });
  });
});

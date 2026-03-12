/**
 * Sprint 712 — Deep Link Testing Across All Routes
 *
 * Owner: Derek Liu (Mobile)
 *
 * Verifies:
 * - Native intent handler resolves all route types correctly
 * - Android intent filters cover shareable routes
 * - Dish deep links added to native intent handler
 * - URL scheme, universal links, and notification deep links
 */
import { describe, it, expect } from "vitest";
import { redirectSystemPath } from "../app/+native-intent";

describe("Sprint 712 — Deep Link Testing", () => {
  // ── Native Intent Handler — Business Routes ──
  describe("redirectSystemPath — business routes", () => {
    it("handles https://topranker.com/business/pecan-lodge", () => {
      expect(
        redirectSystemPath({ path: "https://topranker.com/business/pecan-lodge", initial: true }),
      ).toBe("/business/pecan-lodge");
    });

    it("handles topranker:// scheme", () => {
      expect(
        redirectSystemPath({ path: "topranker://business/halal-guys", initial: false }),
      ).toBe("/business/halal-guys");
    });

    it("handles relative /business/ path", () => {
      expect(
        redirectSystemPath({ path: "/business/biryani-pot", initial: true }),
      ).toBe("/business/biryani-pot");
    });

    it("strips query params from business slug", () => {
      expect(
        redirectSystemPath({ path: "/business/pecan-lodge?ref=share", initial: true }),
      ).toBe("/business/pecan-lodge");
    });

    it("does not redirect /business/claim as a business slug", () => {
      expect(
        redirectSystemPath({ path: "/business/claim", initial: true }),
      ).toBe("/");
    });

    it("does not redirect /business/qr as a business slug", () => {
      expect(
        redirectSystemPath({ path: "/business/qr", initial: true }),
      ).toBe("/");
    });
  });

  // ── Native Intent Handler — Share Routes ──
  describe("redirectSystemPath — share routes", () => {
    it("handles /share/best-biryani-irving", () => {
      expect(
        redirectSystemPath({ path: "/share/best-biryani-irving", initial: true }),
      ).toBe("/share/best-biryani-irving");
    });

    it("handles https domain share links", () => {
      expect(
        redirectSystemPath({ path: "https://topranker.com/share/best-chai-plano", initial: true }),
      ).toBe("/share/best-chai-plano");
    });

    it("strips query params from share slug", () => {
      expect(
        redirectSystemPath({ path: "/share/test-slug?utm=whatsapp", initial: true }),
      ).toBe("/share/test-slug");
    });
  });

  // ── Native Intent Handler — Dish Routes (Sprint 712 NEW) ──
  describe("redirectSystemPath — dish routes", () => {
    it("handles /dish/biryani-irving", () => {
      expect(
        redirectSystemPath({ path: "/dish/biryani-irving", initial: true }),
      ).toBe("/dish/biryani-irving");
    });

    it("handles https domain dish links", () => {
      expect(
        redirectSystemPath({ path: "https://topranker.com/dish/chicken-tikka-dallas", initial: true }),
      ).toBe("/dish/chicken-tikka-dallas");
    });

    it("handles topranker:// scheme dish links", () => {
      expect(
        redirectSystemPath({ path: "topranker://dish/butter-chicken-plano", initial: false }),
      ).toBe("/dish/butter-chicken-plano");
    });

    it("strips query params from dish slug", () => {
      expect(
        redirectSystemPath({ path: "/dish/chai-frisco?ref=notification", initial: true }),
      ).toBe("/dish/chai-frisco");
    });
  });

  // ── Native Intent Handler — Tab Routes ──
  describe("redirectSystemPath — tab routes", () => {
    it("handles /challenger → /(tabs)/challenger", () => {
      expect(
        redirectSystemPath({ path: "/challenger", initial: true }),
      ).toBe("/(tabs)/challenger");
    });

    it("handles /(tabs)/challenger → /(tabs)/challenger", () => {
      expect(
        redirectSystemPath({ path: "/(tabs)/challenger", initial: true }),
      ).toBe("/(tabs)/challenger");
    });

    it("handles /profile → /(tabs)/profile", () => {
      expect(
        redirectSystemPath({ path: "/profile", initial: true }),
      ).toBe("/(tabs)/profile");
    });

    it("handles /discover → /(tabs)/search", () => {
      expect(
        redirectSystemPath({ path: "/discover", initial: true }),
      ).toBe("/(tabs)/search");
    });

    it("handles /search → /(tabs)/search", () => {
      expect(
        redirectSystemPath({ path: "/search", initial: true }),
      ).toBe("/(tabs)/search");
    });

    it("handles /(tabs)/search → /(tabs)/search", () => {
      expect(
        redirectSystemPath({ path: "/(tabs)/search", initial: true }),
      ).toBe("/(tabs)/search");
    });
  });

  // ── Native Intent Handler — Fallback ──
  describe("redirectSystemPath — fallback", () => {
    it("unknown paths fall back to /", () => {
      expect(redirectSystemPath({ path: "/unknown/route", initial: true })).toBe("/");
    });

    it("empty path falls back to /", () => {
      expect(redirectSystemPath({ path: "", initial: true })).toBe("/");
    });

    it("root path returns /", () => {
      expect(redirectSystemPath({ path: "/", initial: true })).toBe("/");
    });
  });

  // ── Android Intent Filters ──
  describe("Android intent filters", () => {
    let appJson: any;

    it("loads app.json", async () => {
      const fs = await import("node:fs");
      appJson = JSON.parse(
        fs.readFileSync(
          new URL("../app.json", import.meta.url),
          "utf-8",
        ),
      );
      expect(appJson).toBeTruthy();
    });

    it("has intent filters configured", () => {
      const filters = appJson.expo.android.intentFilters;
      expect(filters).toBeDefined();
      expect(filters.length).toBeGreaterThan(0);
    });

    it("intent filter has VIEW action and autoVerify", () => {
      const filter = appJson.expo.android.intentFilters[0];
      expect(filter.action).toBe("VIEW");
      expect(filter.autoVerify).toBe(true);
    });

    it("has /business/ path prefix", () => {
      const data = appJson.expo.android.intentFilters[0].data;
      const business = data.find((d: any) => d.pathPrefix === "/business/");
      expect(business).toBeTruthy();
      expect(business.scheme).toBe("https");
      expect(business.host).toBe("topranker.com");
    });

    it("has /share/ path prefix (Sprint 712)", () => {
      const data = appJson.expo.android.intentFilters[0].data;
      const share = data.find((d: any) => d.pathPrefix === "/share/");
      expect(share).toBeTruthy();
      expect(share.scheme).toBe("https");
      expect(share.host).toBe("topranker.com");
    });

    it("has /dish/ path prefix (Sprint 712)", () => {
      const data = appJson.expo.android.intentFilters[0].data;
      const dish = data.find((d: any) => d.pathPrefix === "/dish/");
      expect(dish).toBeTruthy();
      expect(dish.scheme).toBe("https");
      expect(dish.host).toBe("topranker.com");
    });

    it("has /join path prefix", () => {
      const data = appJson.expo.android.intentFilters[0].data;
      const join = data.find((d: any) => d.pathPrefix === "/join");
      expect(join).toBeTruthy();
    });

    it("has BROWSABLE and DEFAULT categories", () => {
      const filter = appJson.expo.android.intentFilters[0];
      expect(filter.category).toContain("BROWSABLE");
      expect(filter.category).toContain("DEFAULT");
    });
  });

  // ── iOS Universal Links ──
  describe("iOS universal links", () => {
    it("has associatedDomains configured", async () => {
      const fs = await import("node:fs");
      const appJson = JSON.parse(
        fs.readFileSync(new URL("../app.json", import.meta.url), "utf-8"),
      );
      const domains = appJson.expo.ios.associatedDomains;
      expect(domains).toContain("applinks:topranker.com");
    });
  });

  // ── URL Scheme ──
  describe("URL scheme", () => {
    it("topranker:// scheme configured", async () => {
      const fs = await import("node:fs");
      const appJson = JSON.parse(
        fs.readFileSync(new URL("../app.json", import.meta.url), "utf-8"),
      );
      expect(appJson.expo.scheme).toBe("topranker");
    });
  });

  // ── Expo Router Origin ──
  describe("Expo Router origin", () => {
    it("origin is topranker.io", async () => {
      const fs = await import("node:fs");
      const appJson = JSON.parse(
        fs.readFileSync(new URL("../app.json", import.meta.url), "utf-8"),
      );
      const routerPlugin = appJson.expo.plugins.find(
        (p: any) => Array.isArray(p) && p[0] === "expo-router",
      );
      expect(routerPlugin).toBeTruthy();
      expect(routerPlugin[1].origin).toBe("https://topranker.io");
    });
  });
});

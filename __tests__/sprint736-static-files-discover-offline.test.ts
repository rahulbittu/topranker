/**
 * Sprint 736 — Static Files + Discover Offline + Android Deep Links
 *
 * Owner: Derek Liu (Mobile)
 *
 * Verifies:
 * - AASA file exists with correct structure
 * - robots.txt exists
 * - Server serves AASA with application/json content type
 * - Discover screen uses useOfflineAware pattern
 * - Android intentFilters include topranker.io
 */
import { describe, it, expect } from "vitest";

describe("Sprint 736 — Static Files + Discover Offline", () => {
  let aasaContent: any;
  let robotsContent: string;
  let serverSource: string;
  let searchSource: string;
  let appJson: any;

  it("loads source files", async () => {
    const fs = await import("node:fs");
    aasaContent = JSON.parse(
      fs.readFileSync(
        new URL("../public/.well-known/apple-app-site-association", import.meta.url),
        "utf-8",
      ),
    );
    robotsContent = fs.readFileSync(
      new URL("../public/robots.txt", import.meta.url),
      "utf-8",
    );
    serverSource = fs.readFileSync(
      new URL("../server/index.ts", import.meta.url),
      "utf-8",
    );
    searchSource = fs.readFileSync(
      new URL("../app/(tabs)/search.tsx", import.meta.url),
      "utf-8",
    );
    appJson = JSON.parse(
      fs.readFileSync(
        new URL("../app.json", import.meta.url),
        "utf-8",
      ),
    );
    expect(aasaContent).toBeTruthy();
    expect(robotsContent).toBeTruthy();
  });

  // ── AASA File ──
  describe("Apple App Site Association", () => {
    it("has applinks.details structure", () => {
      expect(aasaContent.applinks).toBeTruthy();
      expect(aasaContent.applinks.details).toBeTruthy();
      expect(aasaContent.applinks.details.length).toBeGreaterThan(0);
    });

    it("has app ID with correct bundle identifier", () => {
      expect(aasaContent.applinks.details[0].appIDs[0]).toContain("com.topranker.app");
    });

    it("has business deep link component", () => {
      const components = aasaContent.applinks.details[0].components;
      expect(components.some((c: any) => c["/"] === "/business/*")).toBe(true);
    });

    it("has dish deep link component", () => {
      const components = aasaContent.applinks.details[0].components;
      expect(components.some((c: any) => c["/"] === "/dish/*")).toBe(true);
    });

    it("has join deep link component", () => {
      const components = aasaContent.applinks.details[0].components;
      expect(components.some((c: any) => c["/"] === "/join")).toBe(true);
    });
  });

  // ── robots.txt ──
  describe("robots.txt", () => {
    it("allows root crawling", () => {
      expect(robotsContent).toContain("Allow: /");
    });

    it("disallows API crawling", () => {
      expect(robotsContent).toContain("Disallow: /api/");
    });

    it("disallows admin crawling", () => {
      expect(robotsContent).toContain("Disallow: /admin/");
    });

    it("has sitemap reference", () => {
      expect(robotsContent).toContain("Sitemap:");
      expect(robotsContent).toContain("topranker.io");
    });
  });

  // ── Server AASA Route ──
  describe("Server AASA serving", () => {
    it("has explicit AASA route", () => {
      expect(serverSource).toContain("/.well-known/apple-app-site-association");
    });

    it("sets application/json content type", () => {
      expect(serverSource).toContain("application/json");
    });

    it("serves public directory", () => {
      expect(serverSource).toContain('express.static(path.resolve(process.cwd(), "public")');
    });
  });

  // ── Discover Offline-Aware ──
  describe("Discover screen offline-aware", () => {
    it("imports useOfflineAware", () => {
      expect(searchSource).toContain("useOfflineAware");
      expect(searchSource).toContain("@/lib/hooks/useOfflineAware");
    });

    it("imports StaleBanner", () => {
      expect(searchSource).toContain("StaleBanner");
      expect(searchSource).toContain("@/components/StaleBanner");
    });

    it("uses showError instead of isError", () => {
      expect(searchSource).toContain("showError ?");
    });

    it("renders StaleBanner when stale", () => {
      expect(searchSource).toContain("isStale && staleLabel");
    });
  });

  // ── Android Intent Filters ──
  describe("Android deep links", () => {
    it("has intent filters", () => {
      expect(appJson.expo.android.intentFilters).toBeTruthy();
      expect(appJson.expo.android.intentFilters.length).toBeGreaterThan(0);
    });

    it("includes topranker.io in intent filter data", () => {
      const data = appJson.expo.android.intentFilters[0].data;
      const ioEntries = data.filter((d: any) => d.host === "topranker.io");
      expect(ioEntries.length).toBeGreaterThanOrEqual(4);
    });

    it("has business path prefix for topranker.io", () => {
      const data = appJson.expo.android.intentFilters[0].data;
      const ioBusiness = data.find((d: any) => d.host === "topranker.io" && d.pathPrefix === "/business/");
      expect(ioBusiness).toBeTruthy();
    });

    it("has dish path prefix for topranker.io", () => {
      const data = appJson.expo.android.intentFilters[0].data;
      const ioDish = data.find((d: any) => d.host === "topranker.io" && d.pathPrefix === "/dish/");
      expect(ioDish).toBeTruthy();
    });
  });
});

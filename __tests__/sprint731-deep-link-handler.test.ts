/**
 * Sprint 731 — Deep Link Handler + URL Scheme
 *
 * Owner: Derek Liu (Mobile)
 *
 * Verifies:
 * - Layout registers Linking URL listener for universal links
 * - Deep link handler navigates to correct screens
 * - associatedDomains includes topranker.io
 * - getDeepLinkParams accepts topranker.io
 * - Analytics tracks deep link opens
 */
import { describe, it, expect } from "vitest";
import { getDeepLinkParams, SHARE_DOMAINS } from "../lib/sharing";

describe("Sprint 731 — Deep Link Handler", () => {
  let layoutSource: string;
  let appJson: any;
  let sharingSource: string;

  it("loads source files", async () => {
    const fs = await import("node:fs");
    layoutSource = fs.readFileSync(
      new URL("../app/_layout.tsx", import.meta.url),
      "utf-8",
    );
    appJson = JSON.parse(
      fs.readFileSync(
        new URL("../app.json", import.meta.url),
        "utf-8",
      ),
    );
    sharingSource = fs.readFileSync(
      new URL("../lib/sharing.ts", import.meta.url),
      "utf-8",
    );
    expect(layoutSource).toBeTruthy();
    expect(appJson).toBeTruthy();
    expect(sharingSource).toBeTruthy();
  });

  // ── Layout Deep Link Wiring ──
  describe("Layout deep link listener", () => {
    it("imports getDeepLinkParams from sharing", () => {
      expect(layoutSource).toContain("getDeepLinkParams");
      expect(layoutSource).toContain("@/lib/sharing");
    });

    it("imports expo-linking", () => {
      expect(layoutSource).toContain("expo-linking");
    });

    it("registers Linking URL event listener", () => {
      expect(layoutSource).toContain('Linking.addEventListener("url"');
    });

    it("handles cold-start deep links", () => {
      expect(layoutSource).toContain("Linking.getInitialURL()");
    });

    it("adds breadcrumb on deep link", () => {
      expect(layoutSource).toContain('addBreadcrumb("deeplink"');
    });

    it("tracks deep_link_opened analytics", () => {
      expect(layoutSource).toContain("deep_link_opened");
    });

    it("navigates to business screen on business deep link", () => {
      const deepLinkSection = layoutSource.slice(
        layoutSource.indexOf("handleDeepLink"),
        layoutSource.indexOf("// Connect to SSE"),
      );
      expect(deepLinkSection).toContain('params.type === "business"');
      expect(deepLinkSection).toContain("/business/[id]");
    });

    it("navigates to dish screen on dish deep link", () => {
      const deepLinkSection = layoutSource.slice(
        layoutSource.indexOf("handleDeepLink"),
        layoutSource.indexOf("// Connect to SSE"),
      );
      expect(deepLinkSection).toContain('params.type === "dish"');
      expect(deepLinkSection).toContain("/dish/[slug]");
    });

    it("cleans up listener on unmount", () => {
      expect(layoutSource).toContain("sub.remove()");
    });
  });

  // ── Associated Domains ──
  describe("Associated domains", () => {
    it("includes topranker.com", () => {
      expect(appJson.expo.ios.associatedDomains).toContain("applinks:topranker.com");
    });

    it("includes topranker.io", () => {
      expect(appJson.expo.ios.associatedDomains).toContain("applinks:topranker.io");
    });
  });

  // ── Deep Link Parsing ──
  describe("getDeepLinkParams", () => {
    it("parses topranker.com business URL", () => {
      const result = getDeepLinkParams("https://topranker.com/business/biryani-palace");
      expect(result).toEqual({ type: "business", slug: "biryani-palace" });
    });

    it("parses topranker.io business URL", () => {
      const result = getDeepLinkParams("https://topranker.io/business/biryani-palace");
      expect(result).toEqual({ type: "business", slug: "biryani-palace" });
    });

    it("parses www.topranker.com URL", () => {
      const result = getDeepLinkParams("https://www.topranker.com/dish/chicken-biryani");
      expect(result).toEqual({ type: "dish", slug: "chicken-biryani" });
    });

    it("rejects unknown domains", () => {
      const result = getDeepLinkParams("https://evil.com/business/hack");
      expect(result).toBeNull();
    });

    it("rejects URLs with insufficient path segments", () => {
      const result = getDeepLinkParams("https://topranker.com/");
      expect(result).toBeNull();
    });
  });

  // ── Share Domains ──
  describe("SHARE_DOMAINS", () => {
    it("includes topranker.io", () => {
      expect(SHARE_DOMAINS).toContain("topranker.io");
    });

    it("includes www.topranker.io", () => {
      expect(SHARE_DOMAINS).toContain("www.topranker.io");
    });

    it("has 4 domains", () => {
      expect(SHARE_DOMAINS.length).toBe(4);
    });
  });
});

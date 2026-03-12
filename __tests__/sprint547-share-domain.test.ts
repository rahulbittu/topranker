/**
 * Sprint 547: Share domain alignment — topranker.app → topranker.com
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 547: Share Domain Alignment", () => {
  describe("lib/sharing.ts — domain migration", () => {
    const src = readFile("lib/sharing.ts");

    it("SHARE_DOMAINS uses topranker.com", () => {
      expect(src).toContain('"topranker.com"');
    });

    it("SHARE_DOMAINS uses www.topranker.com", () => {
      expect(src).toContain('"www.topranker.com"');
    });

    it("SHARE_DOMAINS does NOT use topranker.app as primary", () => {
      // topranker.app may still appear in deeplink parser for legacy support
      const domainsLine = src.split("\n").find((l) => l.includes("SHARE_DOMAINS"));
      expect(domainsLine).toContain("topranker.com");
      expect(domainsLine).not.toContain("topranker.app");
    });

    it("getShareUrl uses SHARE_BASE_URL constant", () => {
      expect(src).toContain("${SHARE_BASE_URL}/${type}/${slug}");
    });

    it("exports SHARE_BASE_URL pointing to topranker.com", () => {
      expect(src).toContain('SHARE_BASE_URL = "https://topranker.com"');
    });

    it("getDeepLinkParams accepts topranker.com", () => {
      expect(src).toContain('"topranker.com"');
    });

    it("getDeepLinkParams also accepts legacy topranker.app", () => {
      expect(src).toContain('"topranker.app"');
    });

    it("documents Sprint 547 domain alignment", () => {
      expect(src).toContain("Sprint 547");
    });
  });

  describe("SharePreviewCard — domain display", () => {
    const src = readFile("components/business/SharePreviewCard.tsx");

    it("displays topranker.com domain", () => {
      expect(src).toContain("topranker.com");
    });

    it("does not display topranker.app", () => {
      expect(src).not.toContain("topranker.app");
    });
  });

  describe("RatingConfirmation — share fallback URL", () => {
    const src = readFile("components/rate/RatingConfirmation.tsx");

    it("uses topranker.com as fallback URL", () => {
      expect(src).toContain("https://topranker.com");
    });

    it("does not use topranker.app", () => {
      expect(src).not.toContain("topranker.app");
    });
  });

  describe("app.json deeplink consistency", () => {
    const appJson = JSON.parse(readFile("app.json"));

    it("iOS associatedDomains uses topranker.com", () => {
      expect(appJson.expo.ios.associatedDomains).toContain("applinks:topranker.com");
    });

    it("Android intentFilters use topranker.com host", () => {
      const filters = appJson.expo.android.intentFilters;
      const hosts = filters.flatMap((f: any) => f.data.map((d: any) => d.host));
      expect(hosts).toContain("topranker.com");
    });

    it("iOS config has no topranker.app references", () => {
      const jsonStr = JSON.stringify(appJson.expo.ios.associatedDomains);
      expect(jsonStr).not.toContain("topranker.app");
      expect(jsonStr).toContain("topranker.com");
    });
  });

  describe("no remaining topranker.app in production code", () => {
    it("lib/sharing.ts only uses topranker.app in comments or deeplink parser", () => {
      const src = readFile("lib/sharing.ts");
      const lines = src.split("\n");
      const appLines = lines.filter((l) => l.includes("topranker.app"));
      // Only allowed in comments (Sprint 547 migration note) or deeplink backwards compatibility
      appLines.forEach((line) => {
        const isComment = line.trim().startsWith("//");
        const isDeeplinkParser = line.includes("host !==");
        expect(isComment || isDeeplinkParser).toBe(true);
      });
    });

    it("SharePreviewCard has no topranker.app references", () => {
      const src = readFile("components/business/SharePreviewCard.tsx");
      expect(src).not.toContain("topranker.app");
    });

    it("RatingConfirmation has no topranker.app references", () => {
      const src = readFile("components/rate/RatingConfirmation.tsx");
      expect(src).not.toContain("topranker.app");
    });
  });
});

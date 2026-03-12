/**
 * Sprint 742: URL Centralization
 *
 * Validates:
 * 1. Client-side share URLs use SHARE_BASE_URL constant from lib/sharing.ts
 * 2. Server-side URLs use config.siteUrl from server/config.ts
 * 3. No raw hardcoded topranker.com in client share functions
 * 4. Server config exports siteUrl
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readSource(filePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), filePath), "utf-8");
}

describe("Sprint 742: Client URL Centralization", () => {
  describe("lib/sharing.ts — SHARE_BASE_URL constant", () => {
    const src = readSource("lib/sharing.ts");

    it("exports SHARE_BASE_URL constant", () => {
      expect(src).toContain('export const SHARE_BASE_URL = "https://topranker.com"');
    });

    it("getShareUrl uses SHARE_BASE_URL", () => {
      expect(src).toContain("${SHARE_BASE_URL}/${type}/${slug}");
    });

    it("getShareText uses SHARE_BASE_URL", () => {
      expect(src).toContain("${SHARE_BASE_URL}`");
    });

    it("getProfileShareText uses SHARE_BASE_URL", () => {
      expect(src).toContain("${SHARE_BASE_URL}`");
    });

    it("does not hardcode topranker.com in share functions", () => {
      // SHARE_BASE_URL declaration and SHARE_DOMAINS are allowed
      const lines = src.split("\n");
      const functionLines = lines.filter(l =>
        !l.includes("SHARE_BASE_URL =") &&
        !l.includes("SHARE_DOMAINS") &&
        !l.includes("topranker.app") &&
        !l.includes("// Sprint") &&
        !l.includes("host !==")
      );
      const hasHardcoded = functionLines.some(l => l.includes("topranker.com"));
      expect(hasHardcoded).toBe(false);
    });
  });

  describe("app/business/qr.tsx — uses SHARE_BASE_URL", () => {
    const src = readSource("app/business/qr.tsx");

    it("imports SHARE_BASE_URL", () => {
      expect(src).toContain("SHARE_BASE_URL");
      expect(src).toContain("@/lib/sharing");
    });

    it("builds QR URL from SHARE_BASE_URL", () => {
      expect(src).toContain("${SHARE_BASE_URL}/business/${slug}");
    });

    it("does not hardcode topranker.com", () => {
      expect(src).not.toContain("https://topranker.com");
    });
  });

  describe("lib/hooks/useSearchActions.ts — uses SHARE_BASE_URL", () => {
    const src = readSource("lib/hooks/useSearchActions.ts");

    it("imports SHARE_BASE_URL", () => {
      expect(src).toContain("SHARE_BASE_URL");
    });

    it("builds search URL from SHARE_BASE_URL", () => {
      expect(src).toContain("${SHARE_BASE_URL}/search");
    });

    it("does not hardcode topranker.com", () => {
      expect(src).not.toContain("https://topranker.com");
    });
  });
});

describe("Sprint 742: Server URL Centralization", () => {
  describe("server/config.ts — siteUrl export", () => {
    const src = readSource("server/config.ts");

    it("exports siteUrl in config", () => {
      expect(src).toContain("siteUrl:");
    });

    it("defaults to topranker.com", () => {
      expect(src).toMatch(/optional\("SITE_URL",\s*"https:\/\/topranker\.com"\)/);
    });
  });

  describe("server/routes-seo.ts — uses config.siteUrl", () => {
    const src = readSource("server/routes-seo.ts");

    it("imports config", () => {
      expect(src).toContain('import { config } from "./config"');
    });

    it("uses config.siteUrl", () => {
      expect(src).toContain("config.siteUrl");
    });

    it("does not read process.env.SITE_URL directly", () => {
      expect(src).not.toContain("process.env.SITE_URL");
    });
  });

  describe("server/prerender.ts — uses config.siteUrl", () => {
    const src = readSource("server/prerender.ts");

    it("imports config", () => {
      expect(src).toContain('import { config } from "./config"');
    });

    it("uses config.siteUrl", () => {
      expect(src).toContain("config.siteUrl");
    });
  });

  describe("server/routes-qr.ts — uses config.siteUrl", () => {
    const src = readSource("server/routes-qr.ts");

    it("imports config", () => {
      expect(src).toContain('import { config } from "./config"');
    });

    it("uses config.siteUrl", () => {
      expect(src).toContain("config.siteUrl");
    });
  });

  describe("server/routes-payments.ts — uses config.siteUrl", () => {
    const src = readSource("server/routes-payments.ts");

    it("imports config", () => {
      expect(src).toContain('import { config } from "./config"');
    });

    it("uses config.siteUrl", () => {
      expect(src).toContain("config.siteUrl");
    });

    it("does not read process.env.SITE_URL directly", () => {
      expect(src).not.toContain("process.env.SITE_URL");
    });
  });

  describe("server/unsubscribe-tokens.ts — uses config.siteUrl", () => {
    const src = readSource("server/unsubscribe-tokens.ts");

    it("imports config", () => {
      expect(src).toContain('import { config } from "./config"');
    });

    it("uses config.siteUrl for unsubscribe URL", () => {
      expect(src).toContain("config.siteUrl");
    });
  });

  describe("server/routes-referrals.ts — uses config.siteUrl", () => {
    const src = readSource("server/routes-referrals.ts");

    it("imports config", () => {
      expect(src).toContain('import { config } from "./config"');
    });

    it("uses config.siteUrl for share URL", () => {
      expect(src).toContain("config.siteUrl");
    });
  });
});

/**
 * Sprint 753: CORS + CSP Production Configuration
 *
 * Validates that CORS headers, CSP connect-src, and production domains
 * are correctly configured for Railway deployment.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 753: CORS + CSP Production Configuration", () => {
  const secHeaders = readFile("server/security-headers.ts");

  describe("production CORS origins", () => {
    it("includes topranker.com", () => {
      expect(secHeaders).toContain("https://topranker.com");
    });

    it("includes www.topranker.com", () => {
      expect(secHeaders).toContain("https://www.topranker.com");
    });

    it("includes topranker.io", () => {
      expect(secHeaders).toContain("https://topranker.io");
    });

    it("includes www.topranker.io", () => {
      expect(secHeaders).toContain("https://www.topranker.io");
    });

    it("includes Railway domain from config", () => {
      // Sprint 807: Centralized to config.ts — uses config.railwayPublicDomain
      expect(secHeaders).toContain("config.railwayPublicDomain");
    });

    it("supports CORS_ORIGINS env var", () => {
      expect(secHeaders).toContain("CORS_ORIGINS");
    });
  });

  describe("production CORS headers", () => {
    it("allows expo-platform header in production", () => {
      // Both dev and production should allow expo-platform
      const prodSection = secHeaders.substring(secHeaders.indexOf("Production-only"));
      expect(prodSection).toContain("expo-platform");
    });

    it("allows credentials", () => {
      expect(secHeaders).toContain("Access-Control-Allow-Credentials");
    });

    it("preflight max-age is 86400", () => {
      expect(secHeaders).toContain("86400");
    });
  });

  describe("CSP connect-src", () => {
    it("allows topranker.com", () => {
      expect(secHeaders).toContain("https://topranker.com");
    });

    it("allows *.topranker.com subdomains", () => {
      expect(secHeaders).toContain("https://*.topranker.com");
    });

    it("allows topranker.io", () => {
      expect(secHeaders).toContain("https://topranker.io");
    });

    it("allows *.topranker.io subdomains", () => {
      expect(secHeaders).toContain("https://*.topranker.io");
    });

    it("allows Railway app domains", () => {
      expect(secHeaders).toContain("https://*.up.railway.app");
    });

    it("allows Google Maps API", () => {
      expect(secHeaders).toContain("https://maps.googleapis.com");
    });

    it("allows Stripe API", () => {
      expect(secHeaders).toContain("https://api.stripe.com");
    });

    it("allows Google OAuth", () => {
      expect(secHeaders).toContain("https://accounts.google.com");
    });
  });

  describe("security headers", () => {
    it("sets X-Frame-Options DENY", () => {
      expect(secHeaders).toContain('X-Frame-Options", "DENY"');
    });

    it("sets HSTS with preload", () => {
      expect(secHeaders).toContain("includeSubDomains; preload");
    });

    it("uses crypto.randomUUID for request IDs", () => {
      expect(secHeaders).toContain("crypto.randomUUID()");
    });

    it("sets Referrer-Policy", () => {
      expect(secHeaders).toContain("strict-origin-when-cross-origin");
    });
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("tracks 34 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(34);
    });

    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      const sizeKb = buildSrc.length / 1024;
      expect(sizeKb).toBeLessThan(750);
    });
  });
});

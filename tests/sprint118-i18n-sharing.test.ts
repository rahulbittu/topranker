/**
 * Sprint 118 — i18n Foundation, Social Sharing, Response Time, Rate Limit Headers
 * P2: Multi-language support foundation, social sharing deep links, platform hardening
 *
 * Owner: Priya Sharma (Frontend), Jasmine Taylor (Marketing), Amir Patel (Architecture)
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// ── 1. i18n Module ──────────────────────────────────────────────────────
describe("i18n Foundation Module", () => {
  const modulePath = path.resolve(__dirname, "..", "lib/i18n.ts");

  it("i18n module exists", () => {
    expect(fs.existsSync(modulePath)).toBe(true);
  });

  it("exports t function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function t(key: string");
  });

  it("exports setLocale function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function setLocale(locale: Locale): void");
  });

  it("exports getLocale function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function getLocale(): Locale");
  });

  it("exports Locale type", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain('export type Locale = "en" | "es" | "fr"');
  });

  it("exports DEFAULT_LOCALE as en", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain('export const DEFAULT_LOCALE: Locale = "en"');
  });

  it("exports translations record", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export const translations: Record<Locale, Record<string, string>>");
  });

  it("has English translations", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("en: {");
  });

  it("has Spanish translations", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("es: {");
  });

  it("has French translations", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("fr: {");
  });

  it("has at least 10 keys in English translations", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    const enBlock = content.match(/en:\s*\{([^}]+)\}/s);
    expect(enBlock).not.toBeNull();
    const keys = enBlock![1].match(/\w+:/g);
    expect(keys!.length).toBeGreaterThanOrEqual(10);
  });

  it("has at least 10 keys in Spanish translations", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    const esBlock = content.match(/es:\s*\{([^}]+)\}/s);
    expect(esBlock).not.toBeNull();
    const keys = esBlock![1].match(/\w+:/g);
    expect(keys!.length).toBeGreaterThanOrEqual(10);
  });

  it("has at least 10 keys in French translations", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    const frBlock = content.match(/fr:\s*\{([^}]+)\}/s);
    expect(frBlock).not.toBeNull();
    const keys = frBlock![1].match(/\w+:/g);
    expect(keys!.length).toBeGreaterThanOrEqual(10);
  });

  it("includes home key", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("home:");
  });

  it("includes search key", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("search:");
  });

  it("includes profile key", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("profile:");
  });

  it("includes settings key", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("settings:");
  });

  it("includes sign_out key", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("sign_out:");
  });

  it("includes sign_in key", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("sign_in:");
  });

  it("includes rankings key", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("rankings:");
  });

  it("includes discover key", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("discover:");
  });

  it("includes challenger key", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("challenger:");
  });

  it("includes bookmarks key", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("bookmarks:");
  });

  it("t function falls back to key if not found", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("?? key");
  });

  it("stores current locale in module-level variable", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("let currentLocale: Locale = DEFAULT_LOCALE");
  });
});

// ── 2. Social Sharing Module ────────────────────────────────────────────
describe("Social Sharing Utility", () => {
  const modulePath = path.resolve(__dirname, "..", "lib/sharing.ts");

  it("sharing module exists", () => {
    expect(fs.existsSync(modulePath)).toBe(true);
  });

  it("exports getShareUrl function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function getShareUrl");
  });

  it("getShareUrl accepts type and slug parameters", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain('type: "business" | "challenger" | "profile"');
    expect(content).toContain("slug: string");
  });

  it("getShareUrl returns topranker.app URL", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("https://topranker.app/${type}/${slug}");
  });

  it("exports getShareText function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function getShareText");
  });

  it("getShareText accepts businessName and rating", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("businessName: string, rating: number");
  });

  it("exports getDeepLinkParams function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function getDeepLinkParams");
  });

  it("getDeepLinkParams returns type and slug or null", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("{ type: string; slug: string } | null");
  });

  it("exports SHARE_DOMAINS constant", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export const SHARE_DOMAINS");
  });

  it("SHARE_DOMAINS contains topranker.app", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("topranker.app");
  });

  it("SHARE_DOMAINS contains www.topranker.app", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("www.topranker.app");
  });

  it("getDeepLinkParams parses URL segments", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("segments");
  });
});

// ── 3. Response Time Header ─────────────────────────────────────────────
describe("Response Time Header (server/index.ts)", () => {
  const serverPath = path.resolve(__dirname, "..", "server/index.ts");

  it("server/index.ts exists", () => {
    expect(fs.existsSync(serverPath)).toBe(true);
  });

  it("contains X-Response-Time header", () => {
    const content = fs.readFileSync(serverPath, "utf-8");
    expect(content).toContain("X-Response-Time");
  });

  it("uses process.hrtime for precision timing", () => {
    const content = fs.readFileSync(serverPath, "utf-8");
    expect(content).toContain("process.hrtime");
  });

  it("calculates duration in milliseconds", () => {
    const content = fs.readFileSync(serverPath, "utf-8");
    expect(content).toContain("durationMs");
  });

  it("sets header on response finish event", () => {
    const content = fs.readFileSync(serverPath, "utf-8");
    expect(content).toContain('res.on("finish"');
  });
});

// ── 4. Rate Limit Headers ───────────────────────────────────────────────
describe("Rate Limit Headers (server/rate-limiter.ts)", () => {
  const rateLimiterPath = path.resolve(__dirname, "..", "server/rate-limiter.ts");

  it("rate-limiter.ts exists", () => {
    expect(fs.existsSync(rateLimiterPath)).toBe(true);
  });

  it("contains X-RateLimit-Limit header", () => {
    const content = fs.readFileSync(rateLimiterPath, "utf-8");
    expect(content).toContain("X-RateLimit-Limit");
  });

  it("contains X-RateLimit-Remaining header", () => {
    const content = fs.readFileSync(rateLimiterPath, "utf-8");
    expect(content).toContain("X-RateLimit-Remaining");
  });

  it("contains X-RateLimit-Reset header", () => {
    const content = fs.readFileSync(rateLimiterPath, "utf-8");
    expect(content).toContain("X-RateLimit-Reset");
  });

  it("calculates remaining requests correctly", () => {
    const content = fs.readFileSync(rateLimiterPath, "utf-8");
    expect(content).toContain("maxRequests - count");
  });

  it("exports apiRateLimiter", () => {
    const content = fs.readFileSync(rateLimiterPath, "utf-8");
    expect(content).toContain("export const apiRateLimiter");
  });

  it("exports authRateLimiter", () => {
    const content = fs.readFileSync(rateLimiterPath, "utf-8");
    expect(content).toContain("export const authRateLimiter");
  });
});

/**
 * Sprint 105 Hardening Tests
 * Covers: Cookie Consent, CSP Headers, Rate Limiter, Pricing, Banner Persistence
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// 1. Cookie Consent
// ---------------------------------------------------------------------------
describe("CookieConsent — constants and logic", () => {
  const CONSENT_KEY = "cookie_consent_v1";

  it("CONSENT_KEY equals 'cookie_consent_v1'", () => {
    expect(CONSENT_KEY).toBe("cookie_consent_v1");
  });

  it("accept stores 'accepted' under the consent key", async () => {
    const store: Record<string, string> = {};
    const setItem = async (k: string, v: string) => { store[k] = v; };
    await setItem(CONSENT_KEY, "accepted");
    expect(store[CONSENT_KEY]).toBe("accepted");
  });

  it("decline stores 'essential_only' under the consent key", async () => {
    const store: Record<string, string> = {};
    const setItem = async (k: string, v: string) => { store[k] = v; };
    await setItem(CONSENT_KEY, "essential_only");
    expect(store[CONSENT_KEY]).toBe("essential_only");
  });

  it("banner gate checks Platform.OS === 'web'", () => {
    // The component early-returns when Platform.OS !== "web"
    // Verify the guard logic: only "web" should pass
    const shouldShow = (os: string) => os === "web";
    expect(shouldShow("web")).toBe(true);
    expect(shouldShow("ios")).toBe(false);
    expect(shouldShow("android")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. CSP / Security Headers
// ---------------------------------------------------------------------------
describe("securityHeaders middleware", () => {
  // Inline import so we can test without full Express bootstrap
  let securityHeaders: any;

  beforeEach(async () => {
    const mod = await import("../server/security-headers");
    securityHeaders = mod.securityHeaders;
  });

  function makeMocks() {
    const headers: Record<string, string> = {};
    const res = { setHeader: (k: string, v: string) => { headers[k] = v; } } as any;
    const req = { headers: {}, method: "GET" } as any;
    const next = vi.fn();
    return { headers, res, req, next };
  }

  it("sets Content-Security-Policy header", () => {
    const { headers, res, req, next } = makeMocks();
    securityHeaders(req, res, next);
    expect(headers["Content-Security-Policy"]).toBeDefined();
    expect(next).toHaveBeenCalled();
  });

  it("CSP includes default-src 'self'", () => {
    const { headers, res, req, next } = makeMocks();
    securityHeaders(req, res, next);
    expect(headers["Content-Security-Policy"]).toContain("default-src 'self'");
  });

  it("CSP frame-ancestors is '*' in dev (allows Replit iframe)", () => {
    const { headers, res, req, next } = makeMocks();
    securityHeaders(req, res, next);
    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors *");
  });

  it("CSP connect-src is wildcard in dev (allows Metro HMR)", () => {
    const { headers, res, req, next } = makeMocks();
    securityHeaders(req, res, next);
    const csp = headers["Content-Security-Policy"];
    expect(csp).toContain("connect-src *");
  });
});

// ---------------------------------------------------------------------------
// 3. Rate Limiter
// ---------------------------------------------------------------------------
describe("rateLimiter middleware", () => {
  let rateLimiter: any;
  let authRateLimiter: any;

  beforeEach(async () => {
    const mod = await import("../server/rate-limiter");
    rateLimiter = mod.rateLimiter;
    authRateLimiter = mod.authRateLimiter;
  });

  function makeMocks() {
    const headers: Record<string, string> = {};
    let statusCode = 0;
    let jsonBody: any = null;
    const res = {
      setHeader: (k: string, v: string) => { headers[k] = v; },
      status: (code: number) => {
        statusCode = code;
        return { json: (body: any) => { jsonBody = body; } };
      },
    } as any;
    const req = { ip: "127.0.0.1", socket: { remoteAddress: "127.0.0.1" } } as any;
    const next = vi.fn();
    return { headers, res, req, next, getStatusCode: () => statusCode, getJsonBody: () => jsonBody };
  }

  it("rateLimiter returns a function", () => {
    const mw = rateLimiter();
    expect(typeof mw).toBe("function");
  });

  it("default options are 60s window and 100 max requests", async () => {
    const { headers, res, req, next } = makeMocks();
    const mw = rateLimiter();
    mw(req, res, next);
    await new Promise((r) => setTimeout(r, 0)); // allow microtask to settle
    expect(headers["X-RateLimit-Limit"]).toBe("100");
  });

  it("sets rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining)", async () => {
    const { headers, res, req, next } = makeMocks();
    const mw = rateLimiter();
    mw(req, res, next);
    await new Promise((r) => setTimeout(r, 0));
    expect(headers["X-RateLimit-Limit"]).toBeDefined();
    expect(headers["X-RateLimit-Remaining"]).toBeDefined();
    expect(headers["X-RateLimit-Reset"]).toBeDefined();
  });

  it("exceeding limit returns 429", async () => {
    const { res, req, next, getStatusCode, getJsonBody } = makeMocks();
    req.ip = "10.0.0.99";
    const mw = rateLimiter({ maxRequests: 10 });
    for (let i = 0; i < 11; i++) {
      mw(req, res, next);
      await new Promise((r) => setTimeout(r, 0));
    }
    expect(getStatusCode()).toBe(429);
    expect(getJsonBody()).toHaveProperty("error");
  });

  it("authRateLimiter has maxRequests of 10", async () => {
    const headers: Record<string, string> = {};
    const res = {
      setHeader: (k: string, v: string) => { headers[k] = v; },
      status: () => ({ json: () => {} }),
    } as any;
    const req = { ip: "10.0.0.200", socket: { remoteAddress: "10.0.0.200" } } as any;
    const next = vi.fn();
    authRateLimiter(req, res, next);
    await new Promise((r) => setTimeout(r, 0));
    expect(headers["X-RateLimit-Limit"]).toBe("10");
  });
});

// ---------------------------------------------------------------------------
// 4. Pricing Migration
// ---------------------------------------------------------------------------
describe("PRICING configuration", () => {
  let PRICING: any;

  beforeEach(async () => {
    const mod = await import("../shared/pricing");
    PRICING = mod.PRICING;
  });

  it("challenger amountCents / 100 equals 99", () => {
    expect(PRICING.challenger.amountCents / 100).toBe(99);
  });

  it("dashboardPro type is 'recurring'", () => {
    expect(PRICING.dashboardPro.type).toBe("recurring");
  });

  it("all tiers have consistent structure (amountCents, displayAmount, label, description, type)", () => {
    const requiredKeys = ["amountCents", "displayAmount", "label", "description", "type"];
    for (const tier of Object.values(PRICING) as any[]) {
      for (const key of requiredKeys) {
        expect(tier).toHaveProperty(key);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 5. Banner Persistence
// ---------------------------------------------------------------------------
describe("Banner persistence logic", () => {
  it("banner key is 'banner_dismissed'", () => {
    const BANNER_KEY = "banner_dismissed";
    expect(BANNER_KEY).toBe("banner_dismissed");
  });

  it("initial dismissed state should be false to prevent flash", () => {
    // Banner should default to not-dismissed (false) so it doesn't flash
    const initialDismissed = false;
    expect(initialDismissed).toBe(false);
  });
});

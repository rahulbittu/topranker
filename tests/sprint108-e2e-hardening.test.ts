/**
 * Sprint 108 — Non-E2E Hardening Tests
 * Covers: CORS configuration, API versioning, PricingBadge constants,
 * accessibility page structure, body size limits, color cleanup.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ── 1. CORS Configuration (security-headers.ts) ─────────────────────────

describe("CORS Configuration", () => {
  // We test the securityHeaders middleware by importing it directly.
  // Need to set CORS_ORIGINS so localhost is not the only allowed origin path.
  let securityHeaders: (req: any, res: any, next: () => void) => any;

  beforeAll(async () => {
    // Ensure localhost origins are matched via the isLocalhostOrigin helper
    const mod = await import("../server/security-headers");
    securityHeaders = mod.securityHeaders;
  });

  function buildMocks(method: string, origin?: string) {
    const headers: Record<string, string> = {};
    let statusCode: number | undefined;
    const req = {
      method,
      headers: origin ? { origin } : {},
    } as any;
    const res = {
      setHeader: (k: string, v: string) => {
        headers[k] = v;
      },
      status: (code: number) => {
        statusCode = code;
        return { end: () => {} };
      },
    } as any;
    const next = () => {};
    return { req, res, next, headers, getStatus: () => statusCode };
  }

  it("returns 204 for OPTIONS preflight request", () => {
    const { req, res, next, getStatus } = buildMocks("OPTIONS", "http://localhost:3000");
    securityHeaders(req, res, next);
    expect(getStatus()).toBe(204);
  });

  it("sets CORS headers when origin matches localhost", () => {
    const { req, res, next, headers } = buildMocks("GET", "http://localhost:3000");
    securityHeaders(req, res, next);
    expect(headers["Access-Control-Allow-Origin"]).toBe("http://localhost:3000");
    expect(headers["Access-Control-Allow-Credentials"]).toBe("true");
  });

  it("does NOT set CORS Allow-Origin when no origin header is present", () => {
    const { req, res, next, headers } = buildMocks("GET");
    securityHeaders(req, res, next);
    expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
  });

  it("Access-Control-Allow-Methods includes PATCH", () => {
    const { req, res, next, headers } = buildMocks("GET", "http://localhost:5000");
    securityHeaders(req, res, next);
    expect(headers["Access-Control-Allow-Methods"]).toContain("PATCH");
  });
});

// ── 2. API Versioning Headers ────────────────────────────────────────────

describe("API Versioning Headers", () => {
  let securityHeaders: (req: any, res: any, next: () => void) => any;

  beforeAll(async () => {
    const mod = await import("../server/security-headers");
    securityHeaders = mod.securityHeaders;
  });

  function buildMocks() {
    const headers: Record<string, string> = {};
    const req = { method: "GET", headers: {} } as any;
    const res = {
      setHeader: (k: string, v: string) => {
        headers[k] = v;
      },
    } as any;
    const next = () => {};
    return { req, res, next, headers };
  }

  it("sets X-API-Version header to 1.0.0", () => {
    const { req, res, next, headers } = buildMocks();
    securityHeaders(req, res, next);
    expect(headers["X-API-Version"]).toBe("1.0.0");
  });

  it("sets a non-empty X-Request-Id header", () => {
    const { req, res, next, headers } = buildMocks();
    securityHeaders(req, res, next);
    expect(headers["X-Request-Id"]).toBeDefined();
    expect(headers["X-Request-Id"].length).toBeGreaterThan(0);
  });
});

// ── 3. PricingBadge — PRICING constants ──────────────────────────────────

describe("PricingBadge / PRICING constants", () => {
  let PRICING: any;

  beforeAll(async () => {
    const mod = await import("../shared/pricing");
    PRICING = mod.PRICING;
  });

  it("challenger displayAmount is $99", () => {
    expect(PRICING.challenger.displayAmount).toBe("$99");
  });

  it("dashboardPro has type recurring with month interval", () => {
    expect(PRICING.dashboardPro.type).toBe("recurring");
    expect(PRICING.dashboardPro.interval).toBe("month");
  });

  it("featuredPlacement is refundable", () => {
    expect(PRICING.featuredPlacement.refundable).toBe(true);
  });
});

// ── 4. Accessibility Page Structure ──────────────────────────────────────

describe("Accessibility Page", () => {
  const filePath = path.resolve(__dirname, "../app/legal/accessibility.tsx");
  const source = fs.readFileSync(filePath, "utf-8");

  it("defines exactly 6 sections", () => {
    // Count objects in the SECTIONS array by matching { title: patterns
    const titleMatches = source.match(/title:\s*"/g);
    expect(titleMatches).not.toBeNull();
    expect(titleMatches!.length).toBe(6);
  });

  it('includes "Our Commitment" and "Known Limitations" sections', () => {
    expect(source).toContain('"Our Commitment"');
    expect(source).toContain('"Known Limitations"');
  });
});

// ── 5. Body Size Limits (server/index.ts) ────────────────────────────────

describe("Body Size Limits", () => {
  const filePath = path.resolve(__dirname, "../server/index.ts");
  const source = fs.readFileSync(filePath, "utf-8");

  it('JSON body parser has 1mb limit', () => {
    // express.json({ limit: "1mb" ... })
    const jsonSection = source.match(/express\.json\(\{[\s\S]*?\}\)/);
    expect(jsonSection).not.toBeNull();
    expect(jsonSection![0]).toContain('"1mb"');
  });

  it('webhook raw parser has 5mb limit', () => {
    // express.raw({ type: "application/json", limit: "5mb" })
    const rawSection = source.match(/express\.raw\(\{[\s\S]*?\}\)/);
    expect(rawSection).not.toBeNull();
    expect(rawSection![0]).toContain('"5mb"');
  });
});

// ── 6. Color Cleanup ─────────────────────────────────────────────────────

describe("Color Cleanup", () => {
  it('_layout.tsx still uses rgba(196,154,26 for splash decorative elements (known tech debt)', () => {
    const filePath = path.resolve(__dirname, "../app/_layout.tsx");
    const source = fs.readFileSync(filePath, "utf-8");
    // These rgba strings exist in the splash screen styles — verify they are present
    // so future cleanup sprints can track and remove them
    const matches = source.match(/rgba\(196,154,26/g);
    // Currently 3 occurrences in splash styles (ring border, crown glow, decor line)
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(3);
  });

  it("SubComponents files do not contain hardcoded #FFD700 gold", () => {
    const subComponentPaths = [
      "components/search/SubComponents.tsx",
      "components/rate/SubComponents.tsx",
      "components/profile/SubComponents.tsx",
      "components/business/SubComponents.tsx",
      "components/leaderboard/SubComponents.tsx",
    ];

    for (const rel of subComponentPaths) {
      const fullPath = path.resolve(__dirname, "..", rel);
      if (fs.existsSync(fullPath)) {
        const source = fs.readFileSync(fullPath, "utf-8");
        expect(source).not.toContain("#FFD700");
      }
    }
  });
});

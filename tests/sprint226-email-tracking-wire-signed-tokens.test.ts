/**
 * Sprint 226 — Email Tracking Wire, Signed Unsubscribe Tokens, Beta Badge Helpers
 *
 * Validates:
 * 1. Email tracking wired into sendEmail (server/email.ts)
 * 2. Signed unsubscribe tokens (server/unsubscribe-tokens.ts)
 * 3. Beta badge helpers (shared/city-config.ts)
 * 4. Integration — routes-unsubscribe.ts
 */

import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { getBetaCities, getCityBadge } from "../shared/city-config";

// Sprint 742: Dynamic import for modules that depend on config.ts (needs DATABASE_URL)
let generateUnsubscribeToken: (memberId: string, type: string) => string;
let verifyUnsubscribeToken: (token: string) => { memberId: string; type: string } | null;
let buildUnsubscribeUrl: (memberId: string, type: string) => string;

beforeAll(async () => {
  process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test";
  process.env.SESSION_SECRET = process.env.SESSION_SECRET || "test-session-secret";
  const mod = await import("../server/unsubscribe-tokens");
  generateUnsubscribeToken = mod.generateUnsubscribeToken;
  verifyUnsubscribeToken = mod.verifyUnsubscribeToken;
  buildUnsubscribeUrl = mod.buildUnsubscribeUrl;
});

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Email tracking wire — server/email.ts
// ---------------------------------------------------------------------------
describe("Email tracking wire — server/email.ts", () => {
  const src = readFile("server/email.ts");

  it("imports trackEmailSent from email-tracking", () => {
    expect(src).toContain("trackEmailSent");
  });

  it("imports trackEmailFailed from email-tracking", () => {
    expect(src).toContain("trackEmailFailed");
  });

  it("calls trackEmailSent in sendEmail function", () => {
    expect(src).toContain("trackEmailSent(");
  });

  it("calls trackEmailFailed on failure", () => {
    expect(src).toContain("trackEmailFailed(");
  });

  it("contains Sprint 226 comment", () => {
    expect(src).toContain("Sprint 226");
  });

  it("still uses sendWithRetry", () => {
    expect(src).toContain("sendWithRetry");
  });

  it("still exports sendEmail", () => {
    expect(src).toContain("export");
    expect(src).toContain("sendEmail");
  });
});

// ---------------------------------------------------------------------------
// 2. Signed unsubscribe tokens — server/unsubscribe-tokens.ts
// ---------------------------------------------------------------------------
describe("Signed unsubscribe tokens — server/unsubscribe-tokens.ts (static)", () => {
  it("module exists", () => {
    expect(fileExists("server/unsubscribe-tokens.ts")).toBe(true);
  });

  const src = readFile("server/unsubscribe-tokens.ts");

  it("imports crypto", () => {
    expect(src).toContain("crypto");
  });

  it("exports generateUnsubscribeToken", () => {
    expect(src).toContain("generateUnsubscribeToken");
  });

  it("exports verifyUnsubscribeToken", () => {
    expect(src).toContain("verifyUnsubscribeToken");
  });

  it("exports buildUnsubscribeUrl", () => {
    expect(src).toContain("buildUnsubscribeUrl");
  });

  it("uses HMAC-SHA256", () => {
    expect(src.includes("sha256") || src.includes("hmac")).toBe(true);
  });

  it("uses timingSafeEqual for timing-safe comparison", () => {
    expect(src).toContain("timingSafeEqual");
  });

  it("uses unsubscribeSecret from config", () => {
    // Sprint 807: Centralized to config.ts
    expect(src).toContain("config.unsubscribeSecret");
  });
});

describe("Signed unsubscribe tokens — runtime", () => {
  it("generateUnsubscribeToken returns a string with dots (3 parts)", () => {
    const token = generateUnsubscribeToken("user123", "marketing");
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);
  });

  it("verifyUnsubscribeToken verifies a valid token", () => {
    const token = generateUnsubscribeToken("user456", "weekly");
    const result = verifyUnsubscribeToken(token);
    expect(result).not.toBeNull();
    expect(result!.memberId).toBe("user456");
  });

  it("verifyUnsubscribeToken rejects a tampered token", () => {
    const token = generateUnsubscribeToken("user789", "alerts");
    const tampered = token.slice(0, -4) + "XXXX";
    const result = verifyUnsubscribeToken(tampered);
    expect(result).toBeNull();
  });

  it("buildUnsubscribeUrl contains /api/unsubscribe", () => {
    const url = buildUnsubscribeUrl("user123", "marketing");
    expect(url).toContain("/api/unsubscribe");
  });
});

// ---------------------------------------------------------------------------
// 3. Beta badge helpers — shared/city-config.ts
// ---------------------------------------------------------------------------
describe("Beta badge helpers — shared/city-config.ts (static)", () => {
  const src = readFile("shared/city-config.ts");

  it("contains getBetaCities function", () => {
    expect(src).toContain("getBetaCities");
  });

  it("contains getCityBadge function", () => {
    expect(src).toContain("getCityBadge");
  });
});

describe("Beta badge helpers — runtime", () => {
  it("getBetaCities() includes Oklahoma City", () => {
    const betaCities = getBetaCities();
    expect(betaCities).toContain("Oklahoma City");
  });

  it('getCityBadge("Dallas") returns "active"', () => {
    expect(getCityBadge("Dallas")).toBe("active");
  });

  it('getCityBadge("Oklahoma City") returns "beta"', () => {
    expect(getCityBadge("Oklahoma City")).toBe("beta");
  });

  it('getCityBadge("Unknown") returns "unknown"', () => {
    expect(getCityBadge("Unknown")).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// 4. Integration — routes-unsubscribe.ts
// ---------------------------------------------------------------------------
describe("Integration — routes-unsubscribe.ts", () => {
  const src = readFile("server/routes-unsubscribe.ts");

  it("imports verifyUnsubscribeToken", () => {
    expect(src).toContain("verifyUnsubscribeToken");
  });

  it("contains Sprint 226 comment", () => {
    expect(src).toContain("Sprint 226");
  });

  it("supports signed tokens", () => {
    expect(src).toContain("signed");
  });
});

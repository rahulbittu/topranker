/**
 * Sprint 163 — Rate Gate Analytics + Rating Sanitization E2E
 *
 * Validates:
 * 1. Rate gate rejection events are tracked in analytics
 * 2. getRateGateStats() computes correct rejection rates
 * 3. Rating sanitization clamps q1/q2/q3 scores to [1, 5]
 * 4. Admin endpoint /api/admin/rate-gate-stats returns structured data
 * 5. Routes.ts error handler tracks the correct rejection reason
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  trackEvent,
  clearAnalytics,
  getRateGateStats,
  getFunnelStats,
  type FunnelEvent,
} from "@/server/analytics";
import { sanitizeNumber } from "@/server/sanitize";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// 1. Rate gate analytics event tracking
// ---------------------------------------------------------------------------
describe("Rate gate analytics — event tracking", () => {
  beforeEach(() => clearAnalytics());

  it("tracks rating_submitted events", () => {
    trackEvent("rating_submitted", "user-1", { businessId: "biz-1" });
    trackEvent("rating_submitted", "user-2", { businessId: "biz-2" });
    const stats = getFunnelStats();
    expect(stats.rating_submitted).toBe(2);
  });

  it("tracks rating_rejected_account_age events", () => {
    trackEvent("rating_rejected_account_age", "user-1", { businessId: "biz-1" });
    const stats = getFunnelStats();
    expect(stats.rating_rejected_account_age).toBe(1);
  });

  it("tracks rating_rejected_duplicate events", () => {
    trackEvent("rating_rejected_duplicate", "user-1", { businessId: "biz-1" });
    const stats = getFunnelStats();
    expect(stats.rating_rejected_duplicate).toBe(1);
  });

  it("tracks rating_rejected_suspended events", () => {
    trackEvent("rating_rejected_suspended", "user-1", { businessId: "biz-1" });
    const stats = getFunnelStats();
    expect(stats.rating_rejected_suspended).toBe(1);
  });

  it("tracks rating_rejected_unknown events", () => {
    trackEvent("rating_rejected_unknown", "user-1", { businessId: "biz-1", error: "some error" });
    const stats = getFunnelStats();
    expect(stats.rating_rejected_unknown).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 2. getRateGateStats() computation
// ---------------------------------------------------------------------------
describe("getRateGateStats — rejection rate computation", () => {
  beforeEach(() => clearAnalytics());

  it("returns zeros when no events tracked", () => {
    const stats = getRateGateStats();
    expect(stats.totalSubmissions).toBe(0);
    expect(stats.totalRejections).toBe(0);
    expect(stats.rejectionRate).toBe("0%");
    expect(Object.keys(stats.byReason)).toHaveLength(0);
  });

  it("computes rejection rate with mixed events", () => {
    // 8 submissions, 2 rejections = 20% rejection rate
    for (let i = 0; i < 8; i++) {
      trackEvent("rating_submitted", `user-${i}`, { businessId: "biz-1" });
    }
    trackEvent("rating_rejected_account_age", "user-new", { businessId: "biz-1" });
    trackEvent("rating_rejected_duplicate", "user-dup", { businessId: "biz-2" });

    const stats = getRateGateStats();
    expect(stats.totalSubmissions).toBe(8);
    expect(stats.totalRejections).toBe(2);
    expect(stats.rejectionRate).toBe("20.0%");
    expect(stats.byReason.rating_rejected_account_age).toBe(1);
    expect(stats.byReason.rating_rejected_duplicate).toBe(1);
  });

  it("returns recentRejections limited to 20", () => {
    for (let i = 0; i < 25; i++) {
      trackEvent("rating_rejected_duplicate", `user-${i}`, { businessId: `biz-${i}` });
    }
    const stats = getRateGateStats();
    expect(stats.totalRejections).toBe(25);
    expect(stats.recentRejections).toHaveLength(20);
  });

  it("ignores non-rejection events in rejection count", () => {
    trackEvent("page_view");
    trackEvent("signup_completed", "user-1");
    trackEvent("first_rating", "user-1");
    trackEvent("rating_submitted", "user-1");

    const stats = getRateGateStats();
    expect(stats.totalSubmissions).toBe(1);
    expect(stats.totalRejections).toBe(0);
    expect(stats.rejectionRate).toBe("0.0%");
  });

  it("handles 100% rejection rate", () => {
    trackEvent("rating_rejected_suspended", "user-1");
    trackEvent("rating_rejected_suspended", "user-2");

    const stats = getRateGateStats();
    expect(stats.totalSubmissions).toBe(0);
    expect(stats.totalRejections).toBe(2);
    expect(stats.rejectionRate).toBe("100.0%");
  });
});

// ---------------------------------------------------------------------------
// 3. End-to-end rating sanitization (RETRO-162 action item)
// ---------------------------------------------------------------------------
describe("Rating sanitization — q1/q2/q3 score clamping", () => {
  it("clamps scores below minimum to 1", () => {
    expect(sanitizeNumber(0, 1, 5, 3)).toBe(1);
    expect(sanitizeNumber(-5, 1, 5, 3)).toBe(1);
    expect(sanitizeNumber(-100, 1, 5, 3)).toBe(1);
  });

  it("clamps scores above maximum to 5", () => {
    expect(sanitizeNumber(6, 1, 5, 3)).toBe(5);
    expect(sanitizeNumber(100, 1, 5, 3)).toBe(5);
    expect(sanitizeNumber(999, 1, 5, 3)).toBe(5);
  });

  it("returns fallback for NaN input", () => {
    expect(sanitizeNumber("abc", 1, 5, 3)).toBe(3);
    expect(sanitizeNumber(undefined, 1, 5, 3)).toBe(3);
    expect(sanitizeNumber(null, 1, 5, 3)).toBe(1); // null → Number(null) = 0, clamped to min
    expect(sanitizeNumber({}, 1, 5, 3)).toBe(3);
  });

  it("passes through valid scores unchanged", () => {
    expect(sanitizeNumber(1, 1, 5, 3)).toBe(1);
    expect(sanitizeNumber(2.5, 1, 5, 3)).toBe(2.5);
    expect(sanitizeNumber(3, 1, 5, 3)).toBe(3);
    expect(sanitizeNumber(4.7, 1, 5, 3)).toBe(4.7);
    expect(sanitizeNumber(5, 1, 5, 3)).toBe(5);
  });

  it("handles string numbers correctly", () => {
    expect(sanitizeNumber("3", 1, 5, 3)).toBe(3);
    expect(sanitizeNumber("0", 1, 5, 3)).toBe(1);
    expect(sanitizeNumber("10", 1, 5, 3)).toBe(5);
  });

  it("handles edge case: exactly at boundaries", () => {
    expect(sanitizeNumber(1, 1, 5, 3)).toBe(1);
    expect(sanitizeNumber(5, 1, 5, 3)).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// 4. Structural: routes.ts tracks rejection events
// ---------------------------------------------------------------------------
describe("Structural — rate gate tracking in routes.ts", () => {
  const routesSrc = fs.readFileSync(
    path.resolve(__dirname, "../server/routes.ts"),
    "utf-8",
  );

  it("tracks rating_submitted on successful rating", () => {
    expect(routesSrc).toContain('trackEvent("rating_submitted"');
  });

  it("tracks rating_rejected_account_age on 3+ days error", () => {
    expect(routesSrc).toContain('trackEvent("rating_rejected_account_age"');
  });

  it("tracks rating_rejected_duplicate on already-rated error", () => {
    expect(routesSrc).toContain('trackEvent("rating_rejected_duplicate"');
  });

  it("tracks rating_rejected_suspended on banned account", () => {
    expect(routesSrc).toContain('trackEvent("rating_rejected_suspended"');
  });

  it("tracks rating_rejected_unknown as catch-all", () => {
    expect(routesSrc).toContain('trackEvent("rating_rejected_unknown"');
  });
});

// ---------------------------------------------------------------------------
// 5. Structural: admin endpoint exists
// ---------------------------------------------------------------------------
describe("Structural — admin rate-gate-stats endpoint", () => {
  const adminSrc = fs.readFileSync(
    path.resolve(__dirname, "../server/routes-admin.ts"),
    "utf-8",
  );

  it("registers GET /api/admin/rate-gate-stats", () => {
    expect(adminSrc).toContain("/api/admin/rate-gate-stats");
  });

  it("calls getRateGateStats", () => {
    expect(adminSrc).toContain("getRateGateStats");
  });

  it("imports getRateGateStats from analytics", () => {
    expect(adminSrc).toContain('getRateGateStats');
    const importMatch = adminSrc.match(/import\s*\{[^}]*getRateGateStats[^}]*\}\s*from\s*"\.\/analytics"/);
    expect(importMatch).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 6. Structural: sanitization uses q1Score/q2Score/q3Score (not .score)
// ---------------------------------------------------------------------------
describe("Structural — rating sanitization uses correct field names", () => {
  const routesSrc = fs.readFileSync(
    path.resolve(__dirname, "../server/routes.ts"),
    "utf-8",
  );

  it("sanitizes q1Score individually", () => {
    expect(routesSrc).toContain("parsed.data.q1Score = sanitizeNumber(parsed.data.q1Score, 1, 5, 3)");
  });

  it("sanitizes q2Score individually", () => {
    expect(routesSrc).toContain("parsed.data.q2Score = sanitizeNumber(parsed.data.q2Score, 1, 5, 3)");
  });

  it("sanitizes q3Score individually", () => {
    expect(routesSrc).toContain("parsed.data.q3Score = sanitizeNumber(parsed.data.q3Score, 1, 5, 3)");
  });

  it("does NOT use the old parsed.data.score property", () => {
    // The old code used parsed.data.score which didn't exist on the schema
    // Find the rating handler section by looking for the sanitize block
    const sanitizeBlock = routesSrc.match(/Sanitize rating scores[\s\S]{0,300}/);
    expect(sanitizeBlock).not.toBeNull();
    // Ensure we don't have parsed.data.score = sanitize... (the old bug)
    expect(sanitizeBlock![0]).not.toMatch(/parsed\.data\.score\s*=\s*sanitizeNumber/);
  });
});

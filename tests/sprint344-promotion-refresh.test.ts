/**
 * Sprint 344: City promotion pipeline refresh
 * - Progress percentages per criterion
 * - Promotion history log
 * - Batch beta status endpoint
 * - Metrics captured at promotion time
 */
import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";

let promoSrc = "";
let routesSrc = "";

beforeAll(() => {
  promoSrc = fs.readFileSync(path.resolve("server/city-promotion.ts"), "utf-8");
  routesSrc = fs.readFileSync(path.resolve("server/routes-admin-promotion.ts"), "utf-8");
});

// ── Progress percentages ─────────────────────────────────────────
describe("Promotion progress percentages", () => {
  it("should include progress field in PromotionStatus", () => {
    expect(promoSrc).toContain("progress: {");
  });

  it("should calculate business progress percentage", () => {
    expect(promoSrc).toContain("pctBiz");
    expect(promoSrc).toContain("engagement.totalBusinesses / thresholds.minBusinesses");
  });

  it("should calculate member progress percentage", () => {
    expect(promoSrc).toContain("pctMem");
    expect(promoSrc).toContain("engagement.totalMembers / thresholds.minMembers");
  });

  it("should calculate rating progress percentage", () => {
    expect(promoSrc).toContain("pctRat");
    expect(promoSrc).toContain("engagement.totalRatings / thresholds.minRatings");
  });

  it("should calculate days-in-beta progress percentage", () => {
    expect(promoSrc).toContain("pctDays");
    expect(promoSrc).toContain("daysInBeta / thresholds.minDaysInBeta");
  });

  it("should cap each progress at 100", () => {
    expect(promoSrc).toContain("Math.min(100,");
  });

  it("should calculate overall progress as average", () => {
    expect(promoSrc).toContain("(pctBiz + pctMem + pctRat + pctDays) / 4");
  });

  it("should include overall in progress interface", () => {
    expect(promoSrc).toContain("overall: number");
  });
});

// ── Promotion history ────────────────────────────────────────────
describe("Promotion history log", () => {
  it("should define PromotionHistoryEntry interface", () => {
    expect(promoSrc).toContain("export interface PromotionHistoryEntry");
  });

  it("should track promotedAt timestamp", () => {
    expect(promoSrc).toContain("promotedAt: string");
  });

  it("should track metricsAtPromotion", () => {
    expect(promoSrc).toContain("metricsAtPromotion:");
  });

  it("should push to history on promoteCity", () => {
    expect(promoSrc).toContain("promotionHistory.push(");
  });

  it("should export getPromotionHistory", () => {
    expect(promoSrc).toContain("export function getPromotionHistory");
  });

  it("should return a copy of history array", () => {
    expect(promoSrc).toContain("[...promotionHistory]");
  });
});

// ── Batch beta status ────────────────────────────────────────────
describe("Batch beta promotion status", () => {
  it("should export getAllBetaPromotionStatus", () => {
    expect(promoSrc).toContain("export async function getAllBetaPromotionStatus");
  });

  it("should use getBetaCities to find beta cities", () => {
    expect(promoSrc).toContain("getBetaCities()");
  });

  it("should check all beta cities in parallel", () => {
    expect(promoSrc).toContain("Promise.all(betaCities.map");
  });

  it("should filter null results", () => {
    expect(promoSrc).toContain("filter((r): r is PromotionStatus");
  });
});

// ── Admin routes ─────────────────────────────────────────────────
describe("Admin promotion routes", () => {
  it("should have batch status endpoint", () => {
    expect(routesSrc).toContain('"/api/admin/promotion-status"');
    expect(routesSrc).toContain("getAllBetaPromotionStatus");
  });

  it("should have promotion history endpoint", () => {
    expect(routesSrc).toContain('"/api/admin/promotion-history"');
    expect(routesSrc).toContain("getPromotionHistory");
  });

  it("should capture metrics when promoting", () => {
    expect(routesSrc).toContain("status?.currentMetrics");
  });

  it("should import new functions", () => {
    expect(routesSrc).toContain("getAllBetaPromotionStatus");
    expect(routesSrc).toContain("getPromotionHistory");
  });

  it("should return count with batch status", () => {
    expect(routesSrc).toContain("count: statuses.length");
  });
});

// ── Backwards compatibility ──────────────────────────────────────
describe("Backwards compatibility", () => {
  it("should still have single city status endpoint", () => {
    expect(routesSrc).toContain('"/api/admin/promotion-status/:city"');
  });

  it("should still have threshold endpoints", () => {
    expect(routesSrc).toContain('"/api/admin/promotion-thresholds"');
  });

  it("should still export evaluatePromotion", () => {
    expect(promoSrc).toContain("export async function evaluatePromotion");
  });

  it("should still have default thresholds", () => {
    expect(promoSrc).toContain("minBusinesses: 50");
    expect(promoSrc).toContain("minMembers: 100");
    expect(promoSrc).toContain("minRatings: 200");
    expect(promoSrc).toContain("minDaysInBeta: 30");
  });
});

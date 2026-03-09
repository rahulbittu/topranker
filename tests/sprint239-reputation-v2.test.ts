/**
 * Sprint 239 — Member Reputation Scoring v2
 *
 * Validates:
 * 1. Reputation v2 static (12 tests) — file exists, exports, 7 signals, weights sum to 1.0, logger, MAX_CACHE
 * 2. Reputation v2 runtime (14 tests) — calculate, cache, leaderboard, stats, tiers, clear
 * 3. Admin reputation routes static (6 tests) — file exists, endpoints, export
 * 4. Integration (4 tests) — routes.ts wiring, reputation-v2 imports logger
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  REPUTATION_SIGNALS,
  MAX_CACHE,
  calculateReputation,
  getReputation,
  getTierThresholds,
  getReputationLeaderboard,
  getReputationStats,
  clearReputationCache,
} from "../server/reputation-v2";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Reputation v2 — static checks
// ---------------------------------------------------------------------------
describe("Reputation v2 — static checks", () => {
  const src = readFile("server/reputation-v2.ts");

  it("reputation-v2.ts exists", () => {
    expect(fileExists("server/reputation-v2.ts")).toBe(true);
  });

  it("exports calculateReputation", () => {
    expect(src).toContain("export function calculateReputation");
  });

  it("exports getReputation", () => {
    expect(src).toContain("export function getReputation");
  });

  it("exports getTierThresholds", () => {
    expect(src).toContain("export function getTierThresholds");
  });

  it("exports getReputationLeaderboard", () => {
    expect(src).toContain("export function getReputationLeaderboard");
  });

  it("exports getReputationStats", () => {
    expect(src).toContain("export function getReputationStats");
  });

  it("exports clearReputationCache", () => {
    expect(src).toContain("export function clearReputationCache");
  });

  it("has exactly 7 reputation signals", () => {
    expect(REPUTATION_SIGNALS).toHaveLength(7);
  });

  it("signal weights sum to 1.0", () => {
    const totalWeight = REPUTATION_SIGNALS.reduce((sum, s) => sum + s.weight, 0);
    expect(Math.round(totalWeight * 100) / 100).toBe(1.0);
  });

  it("each signal has name, weight, and description", () => {
    for (const signal of REPUTATION_SIGNALS) {
      expect(signal.name).toBeTruthy();
      expect(typeof signal.weight).toBe("number");
      expect(signal.description).toBeTruthy();
    }
  });

  it("uses logger with ReputationV2 tag", () => {
    expect(src).toContain('log.tag("ReputationV2")');
  });

  it("MAX_CACHE is 5000", () => {
    expect(MAX_CACHE).toBe(5000);
  });
});

// ---------------------------------------------------------------------------
// 2. Reputation v2 — runtime
// ---------------------------------------------------------------------------
describe("Reputation v2 — runtime", () => {
  beforeEach(() => {
    clearReputationCache();
  });

  it("calculateReputation with zero signals returns newcomer tier", () => {
    const rep = calculateReputation("member-zero", {});
    expect(rep.memberId).toBe("member-zero");
    expect(rep.score).toBe(0);
    expect(rep.tier).toBe("newcomer");
    expect(rep.calculatedAt).toBeTruthy();
  });

  it("calculateReputation with high signals returns authority tier", () => {
    const rep = calculateReputation("member-high", {
      rating_count: 100,
      rating_consistency: 0.95,
      account_age_days: 730,
      email_verified: 1,
      profile_complete: 1.0,
      helpful_votes: 200,
      report_penalty: 0,
    });
    expect(rep.score).toBeGreaterThanOrEqual(80);
    expect(rep.tier).toBe("authority");
  });

  it("calculateReputation with medium signals returns trusted or expert tier", () => {
    const rep = calculateReputation("member-mid", {
      rating_count: 25,
      rating_consistency: 0.5,
      account_age_days: 180,
      email_verified: 1,
      profile_complete: 0.5,
      helpful_votes: 50,
      report_penalty: 0,
    });
    expect(rep.score).toBeGreaterThanOrEqual(40);
    expect(rep.score).toBeLessThan(80);
    expect(["trusted", "expert"]).toContain(rep.tier);
  });

  it("calculateReputation with low signals returns contributor tier", () => {
    const rep = calculateReputation("member-low", {
      rating_count: 5,
      rating_consistency: 0.2,
      account_age_days: 30,
      email_verified: 1,
      profile_complete: 0.1,
      helpful_votes: 5,
      report_penalty: 0,
    });
    expect(rep.score).toBeGreaterThanOrEqual(20);
    expect(rep.score).toBeLessThan(40);
    expect(rep.tier).toBe("contributor");
  });

  it("report_penalty reduces score", () => {
    const withoutPenalty = calculateReputation("member-clean", {
      rating_count: 30,
      rating_consistency: 0.7,
      account_age_days: 200,
      email_verified: 1,
      profile_complete: 0.8,
      helpful_votes: 60,
      report_penalty: 0,
    });
    clearReputationCache();
    const withPenalty = calculateReputation("member-flagged", {
      rating_count: 30,
      rating_consistency: 0.7,
      account_age_days: 200,
      email_verified: 1,
      profile_complete: 0.8,
      helpful_votes: 60,
      report_penalty: 5,
    });
    expect(withPenalty.score).toBeLessThan(withoutPenalty.score);
  });

  it("getReputation returns cached result after calculation", () => {
    calculateReputation("member-cached", { rating_count: 10 });
    const cached = getReputation("member-cached");
    expect(cached).not.toBeNull();
    expect(cached!.memberId).toBe("member-cached");
  });

  it("getReputation returns null for unknown member", () => {
    expect(getReputation("non-existent")).toBeNull();
  });

  it("getTierThresholds has all 5 tiers", () => {
    const thresholds = getTierThresholds();
    expect(Object.keys(thresholds)).toHaveLength(5);
    expect(thresholds).toHaveProperty("newcomer");
    expect(thresholds).toHaveProperty("contributor");
    expect(thresholds).toHaveProperty("trusted");
    expect(thresholds).toHaveProperty("expert");
    expect(thresholds).toHaveProperty("authority");
  });

  it("getTierThresholds ranges are contiguous", () => {
    const thresholds = getTierThresholds();
    expect(thresholds.newcomer.min).toBe(0);
    expect(thresholds.authority.max).toBe(100);
    expect(thresholds.newcomer.max + 1).toBe(thresholds.contributor.min);
    expect(thresholds.contributor.max + 1).toBe(thresholds.trusted.min);
    expect(thresholds.trusted.max + 1).toBe(thresholds.expert.min);
    expect(thresholds.expert.max + 1).toBe(thresholds.authority.min);
  });

  it("getReputationLeaderboard returns sorted by score descending", () => {
    calculateReputation("low", { rating_count: 5 });
    calculateReputation("high", { rating_count: 50, email_verified: 1, account_age_days: 365 });
    calculateReputation("mid", { rating_count: 25, email_verified: 1 });

    const board = getReputationLeaderboard(10);
    expect(board.length).toBe(3);
    for (let i = 1; i < board.length; i++) {
      expect(board[i - 1].score).toBeGreaterThanOrEqual(board[i].score);
    }
  });

  it("getReputationLeaderboard respects limit", () => {
    calculateReputation("a", { rating_count: 10 });
    calculateReputation("b", { rating_count: 20 });
    calculateReputation("c", { rating_count: 30 });

    const board = getReputationLeaderboard(2);
    expect(board).toHaveLength(2);
  });

  it("getReputationStats returns correct structure", () => {
    calculateReputation("member-1", { rating_count: 0 });
    calculateReputation("member-2", { rating_count: 50, email_verified: 1, account_age_days: 365, rating_consistency: 0.9, profile_complete: 1, helpful_votes: 100 });

    const stats = getReputationStats();
    expect(stats.totalScored).toBe(2);
    expect(typeof stats.averageScore).toBe("number");
    expect(stats.byTier).toHaveProperty("newcomer");
    expect(stats.byTier).toHaveProperty("authority");
    const tierSum = Object.values(stats.byTier).reduce((a, b) => a + b, 0);
    expect(tierSum).toBe(2);
  });

  it("clearReputationCache empties store", () => {
    calculateReputation("member-1", { rating_count: 10 });
    calculateReputation("member-2", { rating_count: 20 });
    clearReputationCache();
    expect(getReputationStats().totalScored).toBe(0);
    expect(getReputation("member-1")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 3. Admin reputation routes — static checks
// ---------------------------------------------------------------------------
describe("Admin reputation routes — static checks", () => {
  const src = readFile("server/routes-admin-reputation.ts");

  it("routes-admin-reputation.ts exists", () => {
    expect(fileExists("server/routes-admin-reputation.ts")).toBe(true);
  });

  it("exports registerAdminReputationRoutes", () => {
    expect(src).toContain("export function registerAdminReputationRoutes");
  });

  it("defines GET /api/admin/reputation/stats", () => {
    expect(src).toContain("/api/admin/reputation/stats");
  });

  it("defines GET /api/admin/reputation/leaderboard", () => {
    expect(src).toContain("/api/admin/reputation/leaderboard");
  });

  it("defines GET /api/admin/reputation/:memberId", () => {
    expect(src).toContain("/api/admin/reputation/:memberId");
  });

  it("uses logger with AdminReputation tag", () => {
    expect(src).toContain('log.tag("AdminReputation")');
  });
});

// ---------------------------------------------------------------------------
// 4. Integration
// ---------------------------------------------------------------------------
describe("Integration — reputation v2 wiring", () => {
  const routesSrc = readFile("server/routes.ts");
  const repSrc = readFile("server/reputation-v2.ts");
  const adminSrc = readFile("server/routes-admin-reputation.ts");

  it("routes.ts imports routes-admin-reputation", () => {
    expect(routesSrc).toContain('from "./routes-admin-reputation"');
  });

  it("routes.ts calls registerAdminReputationRoutes", () => {
    expect(routesSrc).toContain("registerAdminReputationRoutes(app)");
  });

  it("reputation-v2.ts imports logger", () => {
    expect(repSrc).toContain('from "./logger"');
  });

  it("admin routes import from reputation-v2", () => {
    expect(adminSrc).toContain('from "./reputation-v2"');
  });
});

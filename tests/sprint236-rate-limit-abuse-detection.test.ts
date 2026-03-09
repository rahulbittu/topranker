/**
 * Sprint 236 — Rate Limit Dashboard + Abuse Detection Alerts
 *
 * Validates:
 * 1. Rate limit dashboard module (server/rate-limit-dashboard.ts) — static + runtime
 * 2. Abuse detection module (server/abuse-detection.ts) — static + runtime
 * 3. Admin rate limit routes (server/routes-admin-ratelimit.ts) — static
 * 4. Integration wiring in routes.ts
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  recordRateLimitHit,
  getRateLimitStats,
  getBlockedIPs,
  clearRateLimitEvents,
} from "../server/rate-limit-dashboard";
import {
  detectAbuse,
  getActiveIncidents,
  resolveIncident,
  getAbuseStats,
  clearIncidents,
  ABUSE_PATTERNS,
} from "../server/abuse-detection";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Rate limit dashboard — static analysis
// ---------------------------------------------------------------------------
describe("Rate limit dashboard — static (server/rate-limit-dashboard.ts)", () => {
  const src = readFile("server/rate-limit-dashboard.ts");

  it("file exists", () => {
    expect(fileExists("server/rate-limit-dashboard.ts")).toBe(true);
  });

  it("exports recordRateLimitHit", () => {
    expect(src).toContain("export function recordRateLimitHit");
  });

  it("exports getRateLimitStats", () => {
    expect(src).toContain("export function getRateLimitStats");
  });

  it("exports getBlockedIPs", () => {
    expect(src).toContain("export function getBlockedIPs");
  });

  it("exports clearRateLimitEvents", () => {
    expect(src).toContain("export function clearRateLimitEvents");
  });

  it("imports from logger", () => {
    expect(src).toContain('from "./logger"');
  });

  it("uses RateLimitDash log tag", () => {
    expect(src).toContain('log.tag("RateLimitDash")');
  });

  it("has MAX_EVENTS = 5000", () => {
    expect(src).toContain("MAX_EVENTS = 5000");
  });

  it("exports RateLimitEvent interface", () => {
    expect(src).toContain("export interface RateLimitEvent");
  });

  it("exports RateLimitStats interface", () => {
    expect(src).toContain("export interface RateLimitStats");
  });
});

// ---------------------------------------------------------------------------
// 2. Rate limit dashboard — runtime tests
// ---------------------------------------------------------------------------
describe("Rate limit dashboard — runtime", () => {
  beforeEach(() => {
    clearRateLimitEvents();
  });

  it("starts with empty stats", () => {
    const stats = getRateLimitStats();
    expect(stats.totalRequests).toBe(0);
    expect(stats.blockedRequests).toBe(0);
    expect(stats.blockRate).toBe(0);
    expect(stats.topOffenders).toEqual([]);
    expect(stats.topPaths).toEqual([]);
    expect(stats.recentEvents).toEqual([]);
  });

  it("records a hit and reflects in stats", () => {
    recordRateLimitHit("1.2.3.4", "/api/leaderboard", false);
    const stats = getRateLimitStats();
    expect(stats.totalRequests).toBe(1);
    expect(stats.blockedRequests).toBe(0);
    expect(stats.blockRate).toBe(0);
  });

  it("records a blocked hit and calculates blockRate", () => {
    recordRateLimitHit("1.2.3.4", "/api/leaderboard", false);
    recordRateLimitHit("1.2.3.4", "/api/leaderboard", true);
    const stats = getRateLimitStats();
    expect(stats.totalRequests).toBe(2);
    expect(stats.blockedRequests).toBe(1);
    expect(stats.blockRate).toBe(0.5);
  });

  it("aggregates topOffenders correctly", () => {
    for (let i = 0; i < 5; i++) recordRateLimitHit("10.0.0.1", "/api/test", true);
    for (let i = 0; i < 3; i++) recordRateLimitHit("10.0.0.2", "/api/test", true);
    const stats = getRateLimitStats();
    expect(stats.topOffenders[0].ip).toBe("10.0.0.1");
    expect(stats.topOffenders[0].count).toBe(5);
    expect(stats.topOffenders[1].ip).toBe("10.0.0.2");
    expect(stats.topOffenders[1].count).toBe(3);
  });

  it("aggregates topPaths correctly", () => {
    for (let i = 0; i < 7; i++) recordRateLimitHit("10.0.0.1", "/api/ratings", false);
    for (let i = 0; i < 2; i++) recordRateLimitHit("10.0.0.1", "/api/health", false);
    const stats = getRateLimitStats();
    expect(stats.topPaths[0].path).toBe("/api/ratings");
    expect(stats.topPaths[0].count).toBe(7);
  });

  it("respects limit param for recentEvents", () => {
    for (let i = 0; i < 10; i++) recordRateLimitHit("10.0.0.1", "/api/test", false);
    const stats = getRateLimitStats(3);
    expect(stats.recentEvents.length).toBe(3);
  });

  it("getBlockedIPs returns IPs above threshold", () => {
    for (let i = 0; i < 6; i++) recordRateLimitHit("10.0.0.1", "/api/test", true);
    for (let i = 0; i < 3; i++) recordRateLimitHit("10.0.0.2", "/api/test", true);
    const blocked = getBlockedIPs(5);
    expect(blocked.length).toBe(1);
    expect(blocked[0].ip).toBe("10.0.0.1");
    expect(blocked[0].count).toBe(6);
    expect(blocked[0].lastSeen).toBeTruthy();
  });

  it("clearRateLimitEvents resets state", () => {
    recordRateLimitHit("1.2.3.4", "/api/test", true);
    clearRateLimitEvents();
    const stats = getRateLimitStats();
    expect(stats.totalRequests).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 3. Abuse detection — static analysis
// ---------------------------------------------------------------------------
describe("Abuse detection — static (server/abuse-detection.ts)", () => {
  const src = readFile("server/abuse-detection.ts");

  it("file exists", () => {
    expect(fileExists("server/abuse-detection.ts")).toBe(true);
  });

  it("exports detectAbuse", () => {
    expect(src).toContain("export function detectAbuse");
  });

  it("exports getActiveIncidents", () => {
    expect(src).toContain("export function getActiveIncidents");
  });

  it("exports resolveIncident", () => {
    expect(src).toContain("export function resolveIncident");
  });

  it("exports getAbuseStats", () => {
    expect(src).toContain("export function getAbuseStats");
  });

  it("exports ABUSE_PATTERNS with 4 patterns", () => {
    expect(src).toContain("export const ABUSE_PATTERNS");
    expect(src).toContain("brute_force");
    expect(src).toContain("scraping");
    expect(src).toContain("spam_ratings");
    expect(src).toContain("fake_accounts");
  });

  it("imports fireAlert from alerting", () => {
    expect(src).toContain('import { fireAlert } from "./alerting"');
  });

  it("uses AbuseDetection log tag", () => {
    expect(src).toContain('log.tag("AbuseDetection")');
  });
});

// ---------------------------------------------------------------------------
// 4. Abuse detection — runtime tests
// ---------------------------------------------------------------------------
describe("Abuse detection — runtime", () => {
  beforeEach(() => {
    clearIncidents();
  });

  it("ABUSE_PATTERNS has 4 entries", () => {
    expect(ABUSE_PATTERNS.length).toBe(4);
  });

  it("detectAbuse returns false when below threshold", () => {
    const result = detectAbuse("brute_force", "10.0.0.1", 5);
    expect(result).toBe(false);
    expect(getActiveIncidents().length).toBe(0);
  });

  it("detectAbuse returns true when at or above threshold", () => {
    const result = detectAbuse("brute_force", "10.0.0.1", 10);
    expect(result).toBe(true);
    expect(getActiveIncidents().length).toBe(1);
  });

  it("detectAbuse returns false for unknown pattern", () => {
    const result = detectAbuse("unknown_pattern", "10.0.0.1", 999);
    expect(result).toBe(false);
  });

  it("getActiveIncidents returns only unresolved", () => {
    detectAbuse("scraping", "10.0.0.1", 500);
    detectAbuse("brute_force", "10.0.0.2", 10);
    const incidents = getActiveIncidents();
    expect(incidents.length).toBe(2);
    expect(incidents.every((i) => !i.resolved)).toBe(true);
  });

  it("resolveIncident marks incident as resolved", () => {
    detectAbuse("scraping", "10.0.0.1", 500);
    const incidents = getActiveIncidents();
    const resolved = resolveIncident(incidents[0].id);
    expect(resolved).toBe(true);
    expect(getActiveIncidents().length).toBe(0);
  });

  it("resolveIncident returns false for unknown id", () => {
    expect(resolveIncident("nonexistent_id")).toBe(false);
  });

  it("getAbuseStats aggregates correctly", () => {
    detectAbuse("scraping", "10.0.0.1", 500);
    detectAbuse("brute_force", "10.0.0.2", 10);
    detectAbuse("scraping", "10.0.0.3", 600);
    const stats = getAbuseStats();
    expect(stats.total).toBe(3);
    expect(stats.active).toBe(3);
    expect(stats.byType["scraping"]).toBe(2);
    expect(stats.byType["brute_force"]).toBe(1);
  });

  it("clearIncidents resets state", () => {
    detectAbuse("scraping", "10.0.0.1", 500);
    clearIncidents();
    expect(getActiveIncidents().length).toBe(0);
    expect(getAbuseStats().total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 5. Admin rate limit routes — static analysis
// ---------------------------------------------------------------------------
describe("Admin rate limit routes — static (server/routes-admin-ratelimit.ts)", () => {
  const src = readFile("server/routes-admin-ratelimit.ts");

  it("file exists", () => {
    expect(fileExists("server/routes-admin-ratelimit.ts")).toBe(true);
  });

  it("exports registerAdminRateLimitRoutes", () => {
    expect(src).toContain("export function registerAdminRateLimitRoutes");
  });

  it("registers GET /api/admin/rate-limits", () => {
    expect(src).toContain("/api/admin/rate-limits");
  });

  it("registers GET /api/admin/rate-limits/blocked", () => {
    expect(src).toContain("/api/admin/rate-limits/blocked");
  });

  it("registers GET /api/admin/abuse/incidents", () => {
    expect(src).toContain("/api/admin/abuse/incidents");
  });

  it("registers GET /api/admin/abuse/stats", () => {
    expect(src).toContain("/api/admin/abuse/stats");
  });

  it("registers POST /api/admin/abuse/resolve/:id", () => {
    expect(src).toContain("/api/admin/abuse/resolve/:id");
  });

  it("imports from both rate-limit-dashboard and abuse-detection", () => {
    expect(src).toContain('from "./rate-limit-dashboard"');
    expect(src).toContain('from "./abuse-detection"');
  });
});

// ---------------------------------------------------------------------------
// 6. Integration — routes.ts wiring
// ---------------------------------------------------------------------------
describe("Integration — routes.ts wiring", () => {
  const src = readFile("server/routes.ts");

  it("imports registerAdminRateLimitRoutes", () => {
    expect(src).toContain('import { registerAdminRateLimitRoutes } from "./routes-admin-ratelimit"');
  });

  it("calls registerAdminRateLimitRoutes(app)", () => {
    expect(src).toContain("registerAdminRateLimitRoutes(app)");
  });

  it("registerAdminRateLimitRoutes is called after registerAdminPromotionRoutes", () => {
    const promoIdx = src.indexOf("registerAdminPromotionRoutes(app)");
    const rlIdx = src.indexOf("registerAdminRateLimitRoutes(app)");
    expect(promoIdx).toBeGreaterThan(-1);
    expect(rlIdx).toBeGreaterThan(promoIdx);
  });

  it("routes-admin-ratelimit.ts module exists", () => {
    expect(fileExists("server/routes-admin-ratelimit.ts")).toBe(true);
  });
});

/**
 * Sprint 338: Production Seed Refresh (Railway Enrichment)
 *
 * Verifies that the seed data includes opening hours, leaderboard
 * eligibility, and enriched fields for production-quality Railway data.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const seedSrc = fs.readFileSync(
  path.resolve(__dirname, "..", "server", "seed.ts"),
  "utf-8",
);

// ── 1. Opening hours templates ─────────────────────────────────────────

describe("Sprint 338 — opening hours templates", () => {
  it("has HOURS_RESTAURANT template", () => {
    expect(seedSrc).toContain("HOURS_RESTAURANT");
  });

  it("has HOURS_CAFE template", () => {
    expect(seedSrc).toContain("HOURS_CAFE");
  });

  it("has HOURS_BAR template", () => {
    expect(seedSrc).toContain("HOURS_BAR");
  });

  it("has HOURS_BAKERY template", () => {
    expect(seedSrc).toContain("HOURS_BAKERY");
  });

  it("has HOURS_FAST_FOOD template", () => {
    expect(seedSrc).toContain("HOURS_FAST_FOOD");
  });

  it("has HOURS_STREET_FOOD template", () => {
    expect(seedSrc).toContain("HOURS_STREET_FOOD");
  });

  it("has getHoursForCategory function", () => {
    expect(seedSrc).toContain("function getHoursForCategory");
  });

  it("includes all 7 days in restaurant hours", () => {
    expect(seedSrc).toContain("mon:");
    expect(seedSrc).toContain("tue:");
    expect(seedSrc).toContain("wed:");
    expect(seedSrc).toContain("thu:");
    expect(seedSrc).toContain("fri:");
    expect(seedSrc).toContain("sat:");
    expect(seedSrc).toContain("sun:");
  });
});

// ── 2. Seed insert enrichment ──────────────────────────────────────────

describe("Sprint 338 — seed insert enrichment", () => {
  it("sets openingHours from category hours", () => {
    expect(seedSrc).toContain("openingHours: getHoursForCategory(biz.category)");
  });

  it("sets hoursLastUpdated timestamp", () => {
    expect(seedSrc).toContain("hoursLastUpdated: new Date()");
  });

  it("calculates dineInCount from totalRatings", () => {
    expect(seedSrc).toContain("dineInCount");
    expect(seedSrc).toContain("Math.floor(biz.totalRatings * 0.6)");
  });

  it("calculates credibilityWeightedSum", () => {
    expect(seedSrc).toContain("credibilityWeightedSum");
    expect(seedSrc).toContain("credWeightedSum");
  });

  it("sets leaderboardEligible based on data", () => {
    expect(seedSrc).toContain("leaderboardEligible: eligible");
  });

  it("eligibility requires minimum ratings and dine-in", () => {
    expect(seedSrc).toContain("totalRatings >= 10");
    expect(seedSrc).toContain("dineInCount >= 1");
  });
});

// ── 3. Hours by category mapping ───────────────────────────────────────

describe("Sprint 338 — hours category mapping", () => {
  it("maps cafe category to HOURS_CAFE", () => {
    expect(seedSrc).toContain('case "cafe": return HOURS_CAFE');
  });

  it("maps bar category to HOURS_BAR", () => {
    expect(seedSrc).toContain('case "bar": return HOURS_BAR');
  });

  it("maps bakery category to HOURS_BAKERY", () => {
    expect(seedSrc).toContain('case "bakery": return HOURS_BAKERY');
  });

  it("defaults to HOURS_RESTAURANT", () => {
    expect(seedSrc).toContain("default: return HOURS_RESTAURANT");
  });
});

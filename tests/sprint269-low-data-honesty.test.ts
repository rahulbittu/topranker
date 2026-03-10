/**
 * Sprint 269 — Low-Data Honesty Tests (Constitution #8)
 *
 * Validates:
 * 1. ScoreBreakdown shows confidence badge for non-strong data
 * 2. ScoreBreakdown shows "Not enough ratings yet" for zero ratings
 * 3. Leaderboard cards use getRankConfidence
 * 4. Search cards use getRankConfidence
 * 5. Business page passes category to ScoreBreakdown
 * 6. Confidence system has 4 tiers
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { getRankConfidence, RANK_CONFIDENCE_LABELS, CATEGORY_CONFIDENCE_THRESHOLDS, DEFAULT_THRESHOLDS } from "@/lib/data";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 269: Low-Data Honesty", () => {
  const breakdownSrc = readFile("components/business/ScoreBreakdown.tsx");
  const leaderboardSrc = readFile("components/leaderboard/RankedCard.tsx");
  const searchSrc = readFile("components/search/SubComponents.tsx");
  const bizPageSrc = readFile("app/business/[id].tsx");

  // ── ScoreBreakdown Confidence Badge ──────────────────────────

  it("ScoreBreakdown imports getRankConfidence", () => {
    expect(breakdownSrc).toContain("getRankConfidence");
    expect(breakdownSrc).toContain("RANK_CONFIDENCE_LABELS");
  });

  it("ScoreBreakdown shows confidence badge for non-strong data", () => {
    expect(breakdownSrc).toContain("confBadge");
    expect(breakdownSrc).toContain('confidence !== "strong"');
  });

  it("ScoreBreakdown shows provisional badge state", () => {
    expect(breakdownSrc).toContain("confBadgeProvisional");
    expect(breakdownSrc).toContain("hourglass-outline");
  });

  it("ScoreBreakdown shows early badge state", () => {
    expect(breakdownSrc).toContain("confBadgeEarly");
    expect(breakdownSrc).toContain("trending-up");
  });

  it("ScoreBreakdown shows 'Not enough ratings yet' for zero ratings", () => {
    expect(breakdownSrc).toContain("Not enough ratings yet");
    expect(breakdownSrc).toContain("Be one of the first to rate this restaurant");
  });

  it("business page passes category to ScoreBreakdown", () => {
    expect(bizPageSrc).toContain("category={business.category}");
  });

  // ── Leaderboard Cards ──────────────────────────────────────────

  it("leaderboard cards use getRankConfidence", () => {
    expect(leaderboardSrc).toContain("getRankConfidence");
  });

  it("leaderboard cards show provisional/early with hourglass", () => {
    expect(leaderboardSrc).toContain("hourglass-outline");
    expect(leaderboardSrc).toContain("RANK_CONFIDENCE_LABELS");
  });

  it("leaderboard cards show verified pill for established/strong", () => {
    expect(leaderboardSrc).toContain("shield-checkmark");
    expect(leaderboardSrc).toContain("VERIFIED");
  });

  // ── Search Cards ──────────────────────────────────────────────

  it("search cards use getRankConfidence", () => {
    expect(searchSrc).toContain("getRankConfidence");
  });

  it("search cards show confidence indicators", () => {
    expect(searchSrc).toContain("confIndicatorWrap");
  });
});

// ── getRankConfidence Unit Tests ──────────────────────────────────

describe("getRankConfidence — boundary tests", () => {
  it("returns provisional for 0 ratings", () => {
    expect(getRankConfidence(0)).toBe("provisional");
  });

  it("returns provisional for 2 ratings (below default threshold)", () => {
    expect(getRankConfidence(2)).toBe("provisional");
  });

  it("returns early for 3 ratings (at default provisional threshold)", () => {
    expect(getRankConfidence(3)).toBe("early");
  });

  it("returns established for 10 ratings (at default early threshold)", () => {
    expect(getRankConfidence(10)).toBe("established");
  });

  it("returns strong for 25 ratings (at default established threshold)", () => {
    expect(getRankConfidence(25)).toBe("strong");
  });

  it("uses category-specific thresholds when provided", () => {
    // fine_dining has higher thresholds: provisional=5, early=15, established=35
    expect(getRankConfidence(4, "fine_dining")).toBe("provisional");
    expect(getRankConfidence(5, "fine_dining")).toBe("early");
    expect(getRankConfidence(14, "fine_dining")).toBe("early");
    expect(getRankConfidence(15, "fine_dining")).toBe("established");
    expect(getRankConfidence(35, "fine_dining")).toBe("strong");
  });

  it("falls back to default for unknown categories", () => {
    expect(getRankConfidence(3, "nonexistent_category")).toBe("early");
  });

  it("RANK_CONFIDENCE_LABELS has all 4 tiers", () => {
    expect(RANK_CONFIDENCE_LABELS.provisional).toBeDefined();
    expect(RANK_CONFIDENCE_LABELS.early).toBeDefined();
    expect(RANK_CONFIDENCE_LABELS.established).toBeDefined();
    expect(RANK_CONFIDENCE_LABELS.strong).toBeDefined();
  });

  it("each label has both label and description", () => {
    for (const tier of ["provisional", "early", "established", "strong"] as const) {
      expect(RANK_CONFIDENCE_LABELS[tier].label).toBeTruthy();
      expect(RANK_CONFIDENCE_LABELS[tier].description).toBeTruthy();
    }
  });
});

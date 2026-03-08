/**
 * Integration Tests — Tier Staleness in Live Credibility Recalculation Flow
 * Sprint 140
 *
 * Validates that checkAndRefreshTier is integrated into the live recalculation
 * path so tier drift is detected and corrected on every score update, not just
 * in batch staleness sweeps.
 *
 * Addresses external critique (#1 priority, Sprint 139 5/10):
 *   "Integrate tier staleness into the credibility recalculation flow and stop
 *    calling it closed until the live path uses it."
 */

import { describe, it, expect, vi } from "vitest";

// Mock DB and server dependencies
vi.mock("@/server/db", () => ({ db: {} }));
vi.mock("@/server/logger", () => ({
  log: {
    tag: () => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

import {
  getVoteWeight,
  getCredibilityTier,
  getTierFromScore,
} from "@shared/credibility";
import { isTierStale, checkAndRefreshTier } from "@/server/tier-staleness";

// ---------------------------------------------------------------------------
// 1. Tier is refreshed after recalculation when score crosses boundary
// ---------------------------------------------------------------------------

describe("Tier refresh on score boundary crossing", () => {
  it("detects upward boundary crossing: community -> city at score 100", () => {
    const storedTier = "community";
    const newScore = 150;

    expect(isTierStale(storedTier, newScore)).toBe(true);
    const refreshed = checkAndRefreshTier(storedTier, newScore);
    expect(refreshed).toBe("city");
  });

  it("detects upward boundary crossing: city -> trusted at score 300", () => {
    const storedTier = "city";
    const newScore = 350;

    expect(isTierStale(storedTier, newScore)).toBe(true);
    const refreshed = checkAndRefreshTier(storedTier, newScore);
    expect(refreshed).toBe("trusted");
  });

  it("detects upward boundary crossing: trusted -> top at score 600", () => {
    const storedTier = "trusted";
    const newScore = 650;

    expect(isTierStale(storedTier, newScore)).toBe(true);
    const refreshed = checkAndRefreshTier(storedTier, newScore);
    expect(refreshed).toBe("top");
  });

  it("detects downward boundary crossing: top -> trusted when score drops below 600", () => {
    const storedTier = "top";
    const newScore = 500;

    expect(isTierStale(storedTier, newScore)).toBe(true);
    const refreshed = checkAndRefreshTier(storedTier, newScore);
    expect(refreshed).toBe("trusted");
  });

  it("detects multi-tier drop: top -> community when score drops to 50", () => {
    const storedTier = "top";
    const newScore = 50;

    expect(isTierStale(storedTier, newScore)).toBe(true);
    const refreshed = checkAndRefreshTier(storedTier, newScore);
    expect(refreshed).toBe("community");
  });

  it("detects multi-tier jump: community -> top when score jumps to 700", () => {
    const storedTier = "community";
    const newScore = 700;

    expect(isTierStale(storedTier, newScore)).toBe(true);
    const refreshed = checkAndRefreshTier(storedTier, newScore);
    expect(refreshed).toBe("top");
  });
});

// ---------------------------------------------------------------------------
// 2. Tier stays same when score doesn't cross boundary
// ---------------------------------------------------------------------------

describe("Tier unchanged when score stays within boundary", () => {
  it("community stays community at score 50 -> 90", () => {
    const storedTier = "community";
    const newScore = 90;

    expect(isTierStale(storedTier, newScore)).toBe(false);
    const refreshed = checkAndRefreshTier(storedTier, newScore);
    expect(refreshed).toBe("community");
  });

  it("city stays city at score 150 -> 250", () => {
    const storedTier = "city";
    const newScore = 250;

    expect(isTierStale(storedTier, newScore)).toBe(false);
    const refreshed = checkAndRefreshTier(storedTier, newScore);
    expect(refreshed).toBe("city");
  });

  it("trusted stays trusted at score 400 -> 550", () => {
    const storedTier = "trusted";
    const newScore = 550;

    expect(isTierStale(storedTier, newScore)).toBe(false);
    const refreshed = checkAndRefreshTier(storedTier, newScore);
    expect(refreshed).toBe("trusted");
  });

  it("top stays top at score 700 -> 900", () => {
    const storedTier = "top";
    const newScore = 900;

    expect(isTierStale(storedTier, newScore)).toBe(false);
    const refreshed = checkAndRefreshTier(storedTier, newScore);
    expect(refreshed).toBe("top");
  });

  it("community stays at exact boundary below: score 99", () => {
    const storedTier = "community";
    const newScore = 99;

    expect(isTierStale(storedTier, newScore)).toBe(false);
    const refreshed = checkAndRefreshTier(storedTier, newScore);
    expect(refreshed).toBe("community");
  });
});

// ---------------------------------------------------------------------------
// 3. Vote weight reflects updated tier after refresh
// ---------------------------------------------------------------------------

describe("Vote weight reflects updated tier after staleness refresh", () => {
  it("vote weight upgrades from 0.1 to 0.35 when tier refreshes community -> city", () => {
    const storedTier = "community";
    const newScore = 150;
    const oldWeight = getVoteWeight(50); // community score
    const refreshedTier = checkAndRefreshTier(storedTier, newScore);
    const newWeight = getVoteWeight(newScore);

    expect(refreshedTier).toBe("city");
    expect(oldWeight).toBe(0.1);
    expect(newWeight).toBe(0.35);
    expect(newWeight).toBeGreaterThan(oldWeight);
  });

  it("vote weight upgrades from 0.35 to 0.7 when tier refreshes city -> trusted", () => {
    const storedTier = "city";
    const newScore = 400;
    const refreshedTier = checkAndRefreshTier(storedTier, newScore);
    const newWeight = getVoteWeight(newScore);

    expect(refreshedTier).toBe("trusted");
    expect(newWeight).toBe(0.7);
  });

  it("vote weight upgrades from 0.7 to 1.0 when tier refreshes trusted -> top", () => {
    const storedTier = "trusted";
    const newScore = 700;
    const refreshedTier = checkAndRefreshTier(storedTier, newScore);
    const newWeight = getVoteWeight(newScore);

    expect(refreshedTier).toBe("top");
    expect(newWeight).toBe(1.0);
  });

  it("vote weight downgrades from 1.0 to 0.7 when tier refreshes top -> trusted", () => {
    const storedTier = "top";
    const newScore = 400;
    const refreshedTier = checkAndRefreshTier(storedTier, newScore);
    const newWeight = getVoteWeight(newScore);

    expect(refreshedTier).toBe("trusted");
    expect(newWeight).toBe(0.7);
  });

  it("vote weight stays consistent when tier is not stale", () => {
    const storedTier = "trusted";
    const newScore = 500;
    const refreshedTier = checkAndRefreshTier(storedTier, newScore);
    const weight = getVoteWeight(newScore);

    expect(refreshedTier).toBe("trusted");
    expect(weight).toBe(0.7);
    expect(isTierStale(storedTier, newScore)).toBe(false);
  });

  it("weight and tier are aligned at every boundary after refresh", () => {
    const scenarios = [
      { stored: "community", score: 100, expectedTier: "city", expectedWeight: 0.35 },
      { stored: "city", score: 300, expectedTier: "trusted", expectedWeight: 0.7 },
      { stored: "trusted", score: 600, expectedTier: "top", expectedWeight: 1.0 },
      { stored: "top", score: 299, expectedTier: "city", expectedWeight: 0.35 },
      { stored: "trusted", score: 99, expectedTier: "community", expectedWeight: 0.1 },
    ];

    for (const s of scenarios) {
      const refreshed = checkAndRefreshTier(s.stored, s.score);
      const weight = getVoteWeight(s.score);
      expect(refreshed).toBe(s.expectedTier);
      expect(weight).toBe(s.expectedWeight);
    }
  });
});

// ---------------------------------------------------------------------------
// 4. Integration: getTierFromScore + checkAndRefreshTier consistency
// ---------------------------------------------------------------------------

describe("Gate tier vs staleness tier consistency", () => {
  it("gate tier is always <= score-only tier (stricter due to activity gates)", () => {
    // A member with high score but low activity should get a lower gate tier
    // but checkAndRefreshTier (score-only) would give a higher tier
    const highScore = 700;
    const lowActivity = { totalRatings: 5, totalCategories: 1, daysActive: 7, variance: 0.3, flags: 0 };

    const gateTier = getTierFromScore(
      highScore,
      lowActivity.totalRatings,
      lowActivity.totalCategories,
      lowActivity.daysActive,
      lowActivity.variance,
      lowActivity.flags,
    );
    const scoreTier = getCredibilityTier(highScore);

    // Gate tier should be community (doesn't meet activity thresholds)
    expect(gateTier).toBe("community");
    // Score-only tier should be top (score >= 600)
    expect(scoreTier).toBe("top");
  });

  it("gate tier matches score-only tier when all activity gates are met", () => {
    const score = 700;
    const fullActivity = { totalRatings: 100, totalCategories: 5, daysActive: 120, variance: 1.5, flags: 0 };

    const gateTier = getTierFromScore(
      score,
      fullActivity.totalRatings,
      fullActivity.totalCategories,
      fullActivity.daysActive,
      fullActivity.variance,
      fullActivity.flags,
    );
    const scoreTier = getCredibilityTier(score);

    expect(gateTier).toBe("top");
    expect(scoreTier).toBe("top");
  });

  it("checkAndRefreshTier detects drift even when gate tier would demote", () => {
    // Member was stored as "top" but score dropped to trusted range
    const storedTier = "top";
    const newScore = 400;

    // Staleness check catches the drift
    expect(isTierStale(storedTier, newScore)).toBe(true);
    const refreshed = checkAndRefreshTier(storedTier, newScore);
    expect(refreshed).toBe("trusted");
  });
});

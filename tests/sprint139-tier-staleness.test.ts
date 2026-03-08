/**
 * Unit Tests — Tier Data Staleness Detection
 * Sprint 139
 *
 * Tests the pure-logic functions from tier-staleness.ts (isTierStale,
 * checkAndRefreshTier) without requiring a database connection.
 * Also regression-tests vote weight alignment with tier boundaries.
 *
 * Closes action item from Retro 135 + external critique on stale vote weights.
 */

import { describe, it, expect, vi } from "vitest";

// Mock DB and server dependencies so the module can be imported without DATABASE_URL
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

// Import shared credibility (real implementation — no mock needed)
import { getVoteWeight, getCredibilityTier } from "@shared/credibility";
import { isTierStale, checkAndRefreshTier } from "@/server/tier-staleness";

// ---------------------------------------------------------------------------
// isTierStale — pure comparison of stored tier vs score-derived tier
// ---------------------------------------------------------------------------

describe("isTierStale", () => {
  it("returns false when tier matches score", () => {
    expect(isTierStale("community", 50)).toBe(false);
    expect(isTierStale("city", 150)).toBe(false);
    expect(isTierStale("trusted", 400)).toBe(false);
    expect(isTierStale("top", 700)).toBe(false);
  });

  it("returns true when score has crossed tier boundary upward", () => {
    expect(isTierStale("community", 100)).toBe(true); // should be city
    expect(isTierStale("city", 300)).toBe(true); // should be trusted
    expect(isTierStale("trusted", 600)).toBe(true); // should be top
  });

  it("returns true when score has crossed tier boundary downward", () => {
    expect(isTierStale("top", 500)).toBe(true); // should be trusted
    expect(isTierStale("trusted", 200)).toBe(true); // should be city
    expect(isTierStale("city", 50)).toBe(true); // should be community
  });

  it("handles exact boundary scores", () => {
    expect(isTierStale("city", 100)).toBe(false); // 100 = city
    expect(isTierStale("trusted", 300)).toBe(false); // 300 = trusted
    expect(isTierStale("top", 600)).toBe(false); // 600 = top
  });
});

// ---------------------------------------------------------------------------
// checkAndRefreshTier — returns the correct tier for any stored/score combo
// ---------------------------------------------------------------------------

describe("checkAndRefreshTier", () => {
  it("returns expected tier when stale", () => {
    expect(checkAndRefreshTier("community", 150)).toBe("city");
    expect(checkAndRefreshTier("city", 400)).toBe("trusted");
    expect(checkAndRefreshTier("trusted", 700)).toBe("top");
  });

  it("returns same tier when fresh", () => {
    expect(checkAndRefreshTier("community", 50)).toBe("community");
    expect(checkAndRefreshTier("city", 150)).toBe("city");
    expect(checkAndRefreshTier("trusted", 400)).toBe("trusted");
    expect(checkAndRefreshTier("top", 700)).toBe("top");
  });

  it("handles demotion scenarios", () => {
    expect(checkAndRefreshTier("top", 200)).toBe("city");
    expect(checkAndRefreshTier("trusted", 50)).toBe("community");
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe("Edge cases", () => {
  it("handles zero score", () => {
    expect(isTierStale("community", 0)).toBe(false);
    expect(checkAndRefreshTier("city", 0)).toBe("community");
  });

  it("handles very high score", () => {
    expect(isTierStale("top", 1000)).toBe(false);
    expect(checkAndRefreshTier("trusted", 1000)).toBe("top");
  });

  it("handles negative score edge case", () => {
    expect(checkAndRefreshTier("community", -10)).toBe("community");
  });
});

// ---------------------------------------------------------------------------
// Vote Weight Consistency — regression test ensuring weights match tiers
// ---------------------------------------------------------------------------

describe("Vote Weight Consistency", () => {
  it("community tier gets 0.1 weight", () => {
    expect(getVoteWeight(50)).toBe(0.1);
  });

  it("city tier gets 0.35 weight", () => {
    expect(getVoteWeight(150)).toBe(0.35);
  });

  it("trusted tier gets 0.7 weight", () => {
    expect(getVoteWeight(400)).toBe(0.7);
  });

  it("top tier gets 1.0 weight", () => {
    expect(getVoteWeight(700)).toBe(1.0);
  });

  it("boundary scores produce correct weights", () => {
    expect(getVoteWeight(100)).toBe(0.35); // 100 = city boundary
    expect(getVoteWeight(300)).toBe(0.7); // 300 = trusted boundary
    expect(getVoteWeight(600)).toBe(1.0); // 600 = top boundary
    expect(getVoteWeight(99)).toBe(0.1); // just below city
  });

  it("tier and weight functions agree on boundaries", () => {
    // For every boundary, the tier and weight should be consistent
    const boundaries = [
      { score: 99, tier: "community", weight: 0.1 },
      { score: 100, tier: "city", weight: 0.35 },
      { score: 299, tier: "city", weight: 0.35 },
      { score: 300, tier: "trusted", weight: 0.7 },
      { score: 599, tier: "trusted", weight: 0.7 },
      { score: 600, tier: "top", weight: 1.0 },
    ];

    for (const b of boundaries) {
      expect(getCredibilityTier(b.score)).toBe(b.tier);
      expect(getVoteWeight(b.score)).toBe(b.weight);
    }
  });
});

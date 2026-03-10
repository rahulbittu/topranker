/**
 * Sprint 141 — Tier Path Audit Coverage Tests
 *
 * Validates that every code path returning tier data to clients invokes
 * checkAndRefreshTier or recalculateCredibilityScore for freshness.
 *
 * These are unit tests on the pure functions and structural assertions
 * that verify the audit findings without requiring a database connection.
 */

import { describe, it, expect, vi } from "vitest";

// Mock the db module to avoid DATABASE_URL requirement
vi.mock("@/server/db", () => ({ db: {}, pool: {} }));

import {
  getVoteWeight,
  getCredibilityTier,
  getTierFromScore,
} from "@shared/credibility";
import { isTierStale, checkAndRefreshTier } from "@/server/tier-staleness";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// 1. checkAndRefreshTier correctness across all tier boundaries
// ---------------------------------------------------------------------------
describe("checkAndRefreshTier — Sprint 141 audit: all boundary cases", () => {
  const cases: { storedTier: string; score: number; expected: string }[] = [
    // Score matches stored tier — no drift
    { storedTier: "community", score: 10, expected: "community" },
    { storedTier: "community", score: 99, expected: "community" },
    { storedTier: "city", score: 100, expected: "city" },
    { storedTier: "city", score: 299, expected: "city" },
    { storedTier: "trusted", score: 300, expected: "trusted" },
    { storedTier: "trusted", score: 599, expected: "trusted" },
    { storedTier: "top", score: 600, expected: "top" },
    { storedTier: "top", score: 1000, expected: "top" },

    // Score drifted up — stored tier is stale (under-ranked)
    { storedTier: "community", score: 150, expected: "city" },
    { storedTier: "community", score: 400, expected: "trusted" },
    { storedTier: "community", score: 700, expected: "top" },
    { storedTier: "city", score: 400, expected: "trusted" },
    { storedTier: "city", score: 700, expected: "top" },
    { storedTier: "trusted", score: 700, expected: "top" },

    // Score drifted down — stored tier is stale (over-ranked)
    { storedTier: "top", score: 400, expected: "trusted" },
    { storedTier: "top", score: 150, expected: "city" },
    { storedTier: "top", score: 50, expected: "community" },
    { storedTier: "trusted", score: 150, expected: "city" },
    { storedTier: "trusted", score: 50, expected: "community" },
    { storedTier: "city", score: 50, expected: "community" },
  ];

  for (const { storedTier, score, expected } of cases) {
    it(`stored=${storedTier}, score=${score} → ${expected}`, () => {
      expect(checkAndRefreshTier(storedTier, score)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. isTierStale detects every type of drift
// ---------------------------------------------------------------------------
describe("isTierStale — detects all drift directions", () => {
  it("returns false when tier matches score", () => {
    expect(isTierStale("community", 50)).toBe(false);
    expect(isTierStale("city", 200)).toBe(false);
    expect(isTierStale("trusted", 400)).toBe(false);
    expect(isTierStale("top", 800)).toBe(false);
  });

  it("returns true when tier is below score", () => {
    expect(isTierStale("community", 200)).toBe(true);
    expect(isTierStale("city", 400)).toBe(true);
    expect(isTierStale("trusted", 700)).toBe(true);
  });

  it("returns true when tier is above score", () => {
    expect(isTierStale("top", 200)).toBe(true);
    expect(isTierStale("trusted", 50)).toBe(true);
    expect(isTierStale("city", 50)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. getVoteWeight is consistent with getCredibilityTier at boundaries
// ---------------------------------------------------------------------------
describe("getVoteWeight + getCredibilityTier consistency at tier boundaries", () => {
  const boundaries = [
    { score: 99, tier: "community", weight: 0.1 },
    { score: 100, tier: "city", weight: 0.35 },
    { score: 299, tier: "city", weight: 0.35 },
    { score: 300, tier: "trusted", weight: 0.7 },
    { score: 599, tier: "trusted", weight: 0.7 },
    { score: 600, tier: "top", weight: 1.0 },
  ];

  for (const b of boundaries) {
    it(`score=${b.score} → tier=${b.tier}, weight=${b.weight}`, () => {
      expect(getCredibilityTier(b.score)).toBe(b.tier);
      expect(getVoteWeight(b.score)).toBe(b.weight);
    });
  }
});

// ---------------------------------------------------------------------------
// 4. Structural audit: verify checkAndRefreshTier is called in key files
// ---------------------------------------------------------------------------
describe("Structural audit — checkAndRefreshTier integration points", () => {
  const readFile = (relPath: string) =>
    fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

  it("server/routes.ts imports checkAndRefreshTier", () => {
    const src = readFile("server/routes.ts");
    expect(src).toContain('import { checkAndRefreshTier }');
  });

  it("GET /api/members/:username calls checkAndRefreshTier (Sprint 141 fix)", () => {
    const src = readFile("server/routes-members.ts");
    // Find the username route handler and verify it contains the freshness call
    const usernameRouteMatch = src.match(
      /api\/members\/:username[\s\S]{0,500}checkAndRefreshTier/
    );
    expect(usernameRouteMatch).not.toBeNull();
  });

  it("GET /api/account/export calls checkAndRefreshTier (Sprint 141 fix)", () => {
    const src = readFile("server/routes-auth.ts");
    const exportMatch = src.match(
      /api\/account\/export[\s\S]{0,800}checkAndRefreshTier/
    );
    expect(exportMatch).not.toBeNull();
  });

  it("GET /api/members/me calls recalculateCredibilityScore + checkAndRefreshTier", () => {
    const src = readFile("server/routes-members.ts");
    const meMatch = src.match(
      /api\/members\/me[\s\S]{0,500}recalculateCredibilityScore[\s\S]{0,300}checkAndRefreshTier/
    );
    expect(meMatch).not.toBeNull();
  });

  it("POST /api/ratings calls checkAndRefreshTier on response", () => {
    const src = readFile("server/routes.ts");
    const ratingsMatch = src.match(
      /api\/ratings[\s\S]{0,2000}checkAndRefreshTier/
    );
    expect(ratingsMatch).not.toBeNull();
  });

  it("server/routes-admin.ts calls checkAndRefreshTier for admin member list (Sprint 141 fix)", () => {
    const src = readFile("server/routes-admin.ts");
    expect(src).toContain('import { checkAndRefreshTier }');
    const memberListMatch = src.match(
      /api\/admin\/members[\s\S]{0,500}checkAndRefreshTier/
    );
    expect(memberListMatch).not.toBeNull();
  });

  it("server/auth.ts deserializeUser calls checkAndRefreshTier (Sprint 141 fix)", () => {
    const src = readFile("server/auth.ts");
    expect(src).toContain('import { checkAndRefreshTier }');
    const deserializeMatch = src.match(
      /deserializeUser[\s\S]{0,500}checkAndRefreshTier/
    );
    expect(deserializeMatch).not.toBeNull();
  });

  it("server/storage/members.ts imports checkAndRefreshTier and uses it in recalculation", () => {
    const src = readFile("server/storage/members.ts");
    expect(src).toContain('import { checkAndRefreshTier }');
    // The function body contains checkAndRefreshTier call
    expect(src).toContain("checkAndRefreshTier(member.credibilityTier, score)");
  });
});

// ---------------------------------------------------------------------------
// 5. checkAndRefreshTier returns same value as getCredibilityTier for any input
// ---------------------------------------------------------------------------
describe("checkAndRefreshTier always returns getCredibilityTier(score) regardless of storedTier", () => {
  const scores = [0, 10, 50, 99, 100, 150, 200, 299, 300, 400, 500, 599, 600, 800, 1000];
  const tiers = ["community", "city", "trusted", "top"];

  for (const score of scores) {
    for (const storedTier of tiers) {
      it(`checkAndRefreshTier("${storedTier}", ${score}) === getCredibilityTier(${score})`, () => {
        expect(checkAndRefreshTier(storedTier, score)).toBe(getCredibilityTier(score));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 6. Edge cases
// ---------------------------------------------------------------------------
describe("Edge cases — negative and extreme scores", () => {
  it("negative score defaults to community", () => {
    expect(checkAndRefreshTier("top", -10)).toBe("community");
    expect(getCredibilityTier(-10)).toBe("community");
  });

  it("very high score maps to top", () => {
    expect(checkAndRefreshTier("community", 9999)).toBe("top");
    expect(getCredibilityTier(9999)).toBe("top");
  });

  it("zero score maps to community", () => {
    expect(checkAndRefreshTier("trusted", 0)).toBe("community");
    expect(getCredibilityTier(0)).toBe("community");
  });
});

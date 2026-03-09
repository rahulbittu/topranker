/**
 * Sprint 142 — Tier Semantics Enforcement Tests
 *
 * Structural assertion tests that verify the tier freshness contract:
 * - Every FRESH path imports and calls checkAndRefreshTier
 * - Every SNAPSHOT path is documented with rationale
 * - No route file defines its own tier computation
 * - shared/credibility.ts exports are used consistently
 *
 * These tests read actual source files (golden file / structural assertion approach)
 * to enforce the tier semantics contract documented in docs/TIER-SEMANTICS.md.
 */

import { describe, it, expect, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";

// Mock the db module to avoid DATABASE_URL requirement
vi.mock("@/server/db", () => ({ db: {}, pool: {} }));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROOT = path.resolve(__dirname, "..");

function readSource(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf-8");
}

// ---------------------------------------------------------------------------
// 1. FRESH Path Enforcement — checkAndRefreshTier must be called
// ---------------------------------------------------------------------------
describe("FRESH path enforcement — checkAndRefreshTier is called on every user-facing tier response", () => {
  const routesSrc = readSource("server/routes.ts");
  const routesMembersSrc = readSource("server/routes-members.ts");
  const routesAuthSrc = readSource("server/routes-auth.ts");
  const routesAdminSrc = readSource("server/routes-admin.ts");
  const authSrc = readSource("server/auth.ts");
  const memberStorageSrc = readSource("server/storage/members.ts");

  describe("server/routes.ts", () => {
    it("imports checkAndRefreshTier from tier-staleness", () => {
      expect(routesSrc).toContain('import { checkAndRefreshTier }');
      expect(routesSrc).toContain('from "./tier-staleness"');
    });

    it("POST /api/ratings calls checkAndRefreshTier after submitRating", () => {
      // The ratings route must call checkAndRefreshTier on the result
      const match = routesSrc.match(
        /app\.post\(["']\/api\/ratings["'][\s\S]{0,1200}checkAndRefreshTier\(/
      );
      expect(match).not.toBeNull();
    });

    it("GET /api/members/me calls recalculateCredibilityScore then checkAndRefreshTier", () => {
      // Must call recalculate first, then checkAndRefreshTier
      const match = routesMembersSrc.match(
        /app\.get\(["']\/api\/members\/me["'][\s\S]{0,800}recalculateCredibilityScore[\s\S]{0,400}checkAndRefreshTier\(/
      );
      expect(match).not.toBeNull();
    });

    it("GET /api/members/:username calls checkAndRefreshTier", () => {
      const match = routesMembersSrc.match(
        /api\/members\/:username[\s\S]{0,500}checkAndRefreshTier\(/
      );
      expect(match).not.toBeNull();
    });

    it("GET /api/account/export calls checkAndRefreshTier", () => {
      const match = routesAuthSrc.match(
        /api\/account\/export[\s\S]{0,800}checkAndRefreshTier\(/
      );
      expect(match).not.toBeNull();
    });
  });

  describe("server/routes-admin.ts", () => {
    it("imports checkAndRefreshTier from tier-staleness", () => {
      expect(routesAdminSrc).toContain('import { checkAndRefreshTier }');
      expect(routesAdminSrc).toContain('from "./tier-staleness"');
    });

    it("GET /api/admin/members applies checkAndRefreshTier to each member", () => {
      const match = routesAdminSrc.match(
        /api\/admin\/members[\s\S]{0,500}checkAndRefreshTier\(/
      );
      expect(match).not.toBeNull();
    });
  });

  describe("server/auth.ts", () => {
    it("imports checkAndRefreshTier from tier-staleness", () => {
      expect(authSrc).toContain('import { checkAndRefreshTier }');
      expect(authSrc).toContain('from "./tier-staleness"');
    });

    it("passport.deserializeUser calls checkAndRefreshTier", () => {
      const match = authSrc.match(
        /deserializeUser[\s\S]{0,500}checkAndRefreshTier\(/
      );
      expect(match).not.toBeNull();
    });
  });

  describe("server/storage/members.ts", () => {
    it("imports checkAndRefreshTier from tier-staleness", () => {
      expect(memberStorageSrc).toContain('import { checkAndRefreshTier }');
    });

    it("recalculateCredibilityScore calls checkAndRefreshTier for staleness detection", () => {
      expect(memberStorageSrc).toContain(
        "checkAndRefreshTier(member.credibilityTier, score)"
      );
    });
  });
});

// ---------------------------------------------------------------------------
// 2. SNAPSHOT Path Documentation — verify snapshotting is intentional
// ---------------------------------------------------------------------------
describe("SNAPSHOT path documentation — verify snapshotting rationale", () => {
  it("getBusinessRatings does NOT call checkAndRefreshTier (intentional — historical tier)", () => {
    const src = readSource("server/storage/businesses.ts");
    // getBusinessRatings should NOT import or call checkAndRefreshTier
    // because it returns the tier that was valid at the time of the rating
    const fnBody = src.match(
      /export async function getBusinessRatings[\s\S]*?^}/m
    );
    expect(fnBody).not.toBeNull();
    // The function body should not contain checkAndRefreshTier
    expect(fnBody![0]).not.toContain("checkAndRefreshTier");
  });

  it("getBadgeLeaderboard does NOT call checkAndRefreshTier (display-only, batch-corrected)", () => {
    const src = readSource("server/storage/badges.ts");
    const fnBody = src.match(
      /export async function getBadgeLeaderboard[\s\S]*?^}/m
    );
    expect(fnBody).not.toBeNull();
    expect(fnBody![0]).not.toContain("checkAndRefreshTier");
  });

  it("getVoteWeight uses score directly, not stored tier", () => {
    const src = readSource("shared/credibility.ts");
    // getVoteWeight takes credibilityScore as parameter, not tier
    const fnSignature = src.match(
      /export function getVoteWeight\(credibilityScore: number\)/
    );
    expect(fnSignature).not.toBeNull();
    // It should not reference credibilityTier
    const fnBody = src.match(
      /export function getVoteWeight[\s\S]*?^}/m
    );
    expect(fnBody).not.toBeNull();
    expect(fnBody![0]).not.toContain("credibilityTier");
  });
});

// ---------------------------------------------------------------------------
// 3. No route file defines its own tier computation
// ---------------------------------------------------------------------------
describe("No route file defines inline tier computation", () => {
  const routeFiles = [
    "server/routes.ts",
    "server/routes-admin.ts",
    "server/routes-badges.ts",
    "server/routes-payments.ts",
    "server/routes-experiments.ts",
  ];

  for (const file of routeFiles) {
    it(`${file} does not define getCredibilityTier or getTierFromScore locally`, () => {
      const src = readSource(file);
      // Should not contain function definitions for tier computation
      expect(src).not.toMatch(/function\s+getCredibilityTier\s*\(/);
      expect(src).not.toMatch(/function\s+getTierFromScore\s*\(/);
    });

    it(`${file} does not contain hardcoded tier threshold values`, () => {
      const src = readSource(file);
      // Should not contain inline tier boundary checks like score >= 600 -> "top"
      // (These patterns indicate someone bypassed shared/credibility.ts)
      const inlineTierComputation = src.match(
        /score\s*>=?\s*600\s*.*["']top["']|score\s*>=?\s*300\s*.*["']trusted["']|score\s*>=?\s*100\s*.*["']city["']/
      );
      expect(inlineTierComputation).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// 4. shared/credibility.ts is the single source of truth
// ---------------------------------------------------------------------------
describe("shared/credibility.ts is the single source of truth for tier logic", () => {
  const credibilitySrc = readSource("shared/credibility.ts");

  it("exports CredibilityTier type", () => {
    expect(credibilitySrc).toContain("export type CredibilityTier");
  });

  it("exports getVoteWeight function", () => {
    expect(credibilitySrc).toContain("export function getVoteWeight");
  });

  it("exports getCredibilityTier function", () => {
    expect(credibilitySrc).toContain("export function getCredibilityTier");
  });

  it("exports getTierFromScore function", () => {
    expect(credibilitySrc).toContain("export function getTierFromScore");
  });

  it("exports getTemporalMultiplier function", () => {
    expect(credibilitySrc).toContain("export function getTemporalMultiplier");
  });

  it("tier-staleness.ts imports from shared/credibility, not defining its own", () => {
    const staleness = readSource("server/tier-staleness.ts");
    expect(staleness).toContain('from "@shared/credibility"');
    expect(staleness).not.toMatch(/function\s+getCredibilityTier\s*\(/);
    expect(staleness).not.toMatch(/function\s+getTierFromScore\s*\(/);
  });

  it("server/storage/members.ts imports getTierFromScore from helpers (which re-exports from shared)", () => {
    const memberSrc = readSource("server/storage/members.ts");
    expect(memberSrc).toContain('import { getTierFromScore } from "./helpers"');
  });
});

// ---------------------------------------------------------------------------
// 5. TIER_SEMANTICS contract object exists and is accurate
// ---------------------------------------------------------------------------
describe("TIER_SEMANTICS contract object in tier-staleness.ts", () => {
  const staleness = readSource("server/tier-staleness.ts");

  it("exports TIER_SEMANTICS constant", () => {
    expect(staleness).toContain("export const TIER_SEMANTICS");
  });

  it("TIER_SEMANTICS documents all FRESH paths", () => {
    const freshPaths = [
      "POST /api/ratings",
      "GET /api/members/me",
      "GET /api/members/:username",
      "GET /api/account/export",
      "GET /api/admin/members",
      "passport.deserializeUser",
    ];
    for (const p of freshPaths) {
      expect(staleness).toContain(p);
    }
  });

  it("TIER_SEMANTICS documents all SNAPSHOT paths", () => {
    const snapshotPaths = [
      "getBusinessRatings",
      "getBadgeLeaderboard",
    ];
    for (const p of snapshotPaths) {
      expect(staleness).toContain(p);
    }
  });
});

// ---------------------------------------------------------------------------
// 6. Cross-file consistency: every file that reads credibilityTier for
//    user-facing responses either calls checkAndRefreshTier or is documented
//    as a SNAPSHOT path
// ---------------------------------------------------------------------------
describe("Cross-file tier consistency audit", () => {
  it("auth.ts deserializeUser sets credibilityTier from checkAndRefreshTier, not raw DB value", () => {
    const src = readSource("server/auth.ts");
    // The deserializeUser should assign freshTier (from checkAndRefreshTier), not member.credibilityTier
    const deserializeBlock = src.match(
      /deserializeUser[\s\S]*?done\(null,\s*\{[\s\S]*?\}\)/
    );
    expect(deserializeBlock).not.toBeNull();
    expect(deserializeBlock![0]).toContain("freshTier");
    expect(deserializeBlock![0]).toContain("credibilityTier: freshTier");
  });

  it("routes-members.ts /api/members/me returns tier from checkAndRefreshTier, not raw recalculate result", () => {
    const src = readSource("server/routes-members.ts");
    // Should assign checkAndRefreshTier result to a variable and use that in the response
    const meHandler = src.match(
      /api\/members\/me[\s\S]{0,1500}credibilityTier:\s*tier/
    );
    expect(meHandler).not.toBeNull();
  });

  it("routes-members.ts /api/members/:username returns freshTier, not member.credibilityTier", () => {
    const src = readSource("server/routes-members.ts");
    const usernameHandler = src.match(
      /api\/members\/:username[\s\S]{0,800}credibilityTier:\s*freshTier/
    );
    expect(usernameHandler).not.toBeNull();
  });

  it("routes-auth.ts /api/account/export returns freshExportTier, not profile.credibilityTier", () => {
    const src = readSource("server/routes-auth.ts");
    const exportHandler = src.match(
      /api\/account\/export[\s\S]{0,1200}credibilityTier:\s*freshExportTier/
    );
    expect(exportHandler).not.toBeNull();
  });

  it("routes-admin.ts /api/admin/members maps through checkAndRefreshTier", () => {
    const src = readSource("server/routes-admin.ts");
    // Should use .map() to apply checkAndRefreshTier to each member
    expect(src).toContain("checkAndRefreshTier(m.credibilityTier, m.credibilityScore)");
  });
});

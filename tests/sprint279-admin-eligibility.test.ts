/**
 * Sprint 279 — Admin Eligibility Dashboard + Unranked Labels
 *
 * Validates:
 * 1. Admin eligibility endpoint exists with proper fields
 * 2. Near-eligible filtering logic (2+ ratings OR credibility >= 0.3)
 * 3. Missing requirements computation
 * 4. getRankDisplay handles rank 0 → "Unranked"
 * 5. Unranked badge styles exist in search cards
 * 6. Search page uses actual rank (not index) for unranked businesses
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { getRankDisplay } from "@/constants/brand";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 279: getRankDisplay — Unranked handling", () => {
  it("returns 'Unranked' for rank 0", () => {
    expect(getRankDisplay(0)).toBe("Unranked");
  });

  it("returns 'Unranked' for negative rank", () => {
    expect(getRankDisplay(-1)).toBe("Unranked");
  });

  it("returns gold medal for rank 1", () => {
    expect(getRankDisplay(1)).toBe("🥇");
  });

  it("returns silver medal for rank 2", () => {
    expect(getRankDisplay(2)).toBe("🥈");
  });

  it("returns bronze medal for rank 3", () => {
    expect(getRankDisplay(3)).toBe("🥉");
  });

  it("returns #N for ranks 4+", () => {
    expect(getRankDisplay(4)).toBe("#4");
    expect(getRankDisplay(50)).toBe("#50");
  });
});

describe("Sprint 279: Admin Eligibility Endpoint", () => {
  const adminRoutesSrc = readFile("server/routes-admin.ts");

  it("has GET /api/admin/eligibility endpoint", () => {
    expect(adminRoutesSrc).toContain('"/api/admin/eligibility"');
  });

  it("requires auth and admin check", () => {
    const eligSection = adminRoutesSrc.slice(
      adminRoutesSrc.indexOf("/api/admin/eligibility"),
    );
    expect(eligSection).toContain("requireAuth");
    expect(eligSection).toContain("isAdminEmail");
  });

  it("queries leaderboardEligible field", () => {
    expect(adminRoutesSrc).toContain("businesses.leaderboardEligible");
  });

  it("returns totalActive, eligible, ineligible, nearEligible counts", () => {
    expect(adminRoutesSrc).toContain("totalActive:");
    expect(adminRoutesSrc).toContain("eligible:");
    expect(adminRoutesSrc).toContain("ineligible:");
    expect(adminRoutesSrc).toContain("nearEligible:");
  });

  it("computes near-eligible with 2+ ratings or credibility >= 0.3", () => {
    expect(adminRoutesSrc).toContain("b.totalRatings >= 2");
    expect(adminRoutesSrc).toContain("credibilityWeightedSum");
    expect(adminRoutesSrc).toContain(">= 0.3");
  });

  it("returns missingRequirements per near-eligible business", () => {
    expect(adminRoutesSrc).toContain("missingRequirements");
    expect(adminRoutesSrc).toContain("Need 1+ dine-in rating");
  });

  it("includes rater count requirement in missing requirements", () => {
    expect(adminRoutesSrc).toContain("more raters");
  });

  it("includes credibility threshold in missing requirements", () => {
    expect(adminRoutesSrc).toContain("Credibility sum");
    expect(adminRoutesSrc).toContain("< 0.50");
  });
});

describe("Sprint 279: Unranked Labels in Search Cards", () => {
  const searchCardsSrc = readFile("components/search/SubComponents.tsx");
  const searchPageSrc = readFile("app/(tabs)/search.tsx");

  it("BusinessCard computes isUnranked from displayRank", () => {
    expect(searchCardsSrc).toContain("const isUnranked = !displayRank || displayRank <= 0");
  });

  it("MapBusinessCard computes isUnranked from item.rank", () => {
    expect(searchCardsSrc).toContain("const isUnranked = !item.rank || item.rank <= 0");
  });

  it("unrankedBadge style exists", () => {
    expect(searchCardsSrc).toContain("unrankedBadge:");
  });

  it("unrankedBadgeText style exists", () => {
    expect(searchCardsSrc).toContain("unrankedBadgeText:");
  });

  it("unrankedMapRank style exists", () => {
    expect(searchCardsSrc).toContain("unrankedMapRank:");
  });

  it("applies unrankedBadge style conditionally", () => {
    expect(searchCardsSrc).toContain("isUnranked && s.unrankedBadge");
  });

  it("search page passes item.rank for displayRank (not index)", () => {
    expect(searchPageSrc).toContain("displayRank={item.rank > 0 ? item.rank : 0}");
  });

  it("accessibility label reflects unranked state", () => {
    expect(searchCardsSrc).toContain('isUnranked ? "unranked"');
  });
});

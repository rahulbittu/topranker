/**
 * Sprint 157 — Core loop consequence visibility tests
 *
 * Verifies:
 * 1. SSE invalidation map uses correct query keys (matching actual React Query keys)
 * 2. Rating impact module tracks and expires rank changes
 * 3. No stale "/api/" prefix in query keys
 */
import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ── SSE Query Key Tests ──────────────────────────────────────────

describe("SSE invalidation map uses correct query keys", () => {
  const realtimeSrc = fs.readFileSync(
    path.resolve(__dirname, "../lib/use-realtime.ts"),
    "utf-8"
  );

  it("does not use /api/ prefixed query keys", () => {
    // Extract the INVALIDATION_MAP block
    const mapMatch = realtimeSrc.match(/INVALIDATION_MAP[\s\S]*?};/);
    expect(mapMatch).toBeTruthy();
    const mapBlock = mapMatch![0];
    // Should NOT contain "/api/" in query keys
    expect(mapBlock).not.toContain('"/api/');
  });

  it("rating_submitted invalidates leaderboard, business, trending, and challengers", () => {
    const mapBlock = realtimeSrc.match(/INVALIDATION_MAP[\s\S]*?};/)![0];
    expect(mapBlock).toContain('rating_submitted:');
    const ratingLine = mapBlock.split("\n").find(l => l.includes("rating_submitted"));
    expect(ratingLine).toContain('"leaderboard"');
    expect(ratingLine).toContain('"business"');
    expect(ratingLine).toContain('"trending"');
    expect(ratingLine).toContain('"challengers"');
  });

  it("ranking_updated invalidates leaderboard and trending", () => {
    const mapBlock = realtimeSrc.match(/INVALIDATION_MAP[\s\S]*?};/)![0];
    const line = mapBlock.split("\n").find(l => l.includes("ranking_updated"));
    expect(line).toContain('"leaderboard"');
    expect(line).toContain('"trending"');
  });

  it("challenger_updated invalidates challengers", () => {
    const mapBlock = realtimeSrc.match(/INVALIDATION_MAP[\s\S]*?};/)![0];
    const line = mapBlock.split("\n").find(l => l.includes("challenger_updated"));
    expect(line).toContain('"challengers"');
  });

  it("native fallback polling uses correct query keys (no /api/ prefix)", () => {
    const pollingSection = realtimeSrc.match(/setInterval[\s\S]*?15000/);
    expect(pollingSection).toBeTruthy();
    const block = pollingSection![0];
    expect(block).not.toContain('"/api/');
    expect(block).toContain('"leaderboard"');
    expect(block).toContain('"challengers"');
  });

  it("query keys match what index.tsx, search.tsx, and challenger.tsx use", () => {
    // Verify actual component query keys
    const indexSrc = fs.readFileSync(
      path.resolve(__dirname, "../app/(tabs)/index.tsx"),
      "utf-8"
    );
    const searchSrc = fs.readFileSync(
      path.resolve(__dirname, "../app/(tabs)/search.tsx"),
      "utf-8"
    );
    const challengerSrc = fs.readFileSync(
      path.resolve(__dirname, "../app/(tabs)/challenger.tsx"),
      "utf-8"
    );

    // index.tsx uses ["leaderboard", city, category]
    expect(indexSrc).toMatch(/queryKey:\s*\["leaderboard"/);
    // search.tsx uses ["trending", city]
    expect(searchSrc).toMatch(/queryKey:\s*\["trending"/);
    // challenger.tsx uses ["challengers", city]
    expect(challengerSrc).toMatch(/queryKey:\s*\["challengers"/);
  });
});

// ── Rating Impact Module Tests ───────────────────────────────────

describe("Rating impact tracking (60s TTL)", () => {
  // Dynamic import to reset module state
  let setRatingImpact: (slug: string, prevRank: number, newRank: number) => void;
  let getRatingImpact: (slug: string) => { businessSlug: string; prevRank: number; newRank: number; timestamp: number } | null;
  let clearRatingImpact: (slug: string) => void;

  beforeEach(async () => {
    const mod = await import("../lib/rating-impact");
    setRatingImpact = mod.setRatingImpact;
    getRatingImpact = mod.getRatingImpact;
    clearRatingImpact = mod.clearRatingImpact;
  });

  it("stores and retrieves rating impact for a business", () => {
    setRatingImpact("joes-tacos", 5, 4);
    const impact = getRatingImpact("joes-tacos");
    expect(impact).toBeTruthy();
    expect(impact!.prevRank).toBe(5);
    expect(impact!.newRank).toBe(4);
    expect(impact!.businessSlug).toBe("joes-tacos");
  });

  it("returns null for unknown slug", () => {
    expect(getRatingImpact("unknown-biz")).toBeNull();
  });

  it("clearRatingImpact removes the entry", () => {
    setRatingImpact("pizza-palace", 3, 2);
    clearRatingImpact("pizza-palace");
    expect(getRatingImpact("pizza-palace")).toBeNull();
  });

  it("overwrites previous impact for same slug", () => {
    setRatingImpact("thai-spot", 8, 7);
    setRatingImpact("thai-spot", 7, 5);
    const impact = getRatingImpact("thai-spot");
    expect(impact!.prevRank).toBe(7);
    expect(impact!.newRank).toBe(5);
  });

  it("tracks multiple businesses independently", () => {
    setRatingImpact("biz-a", 10, 9);
    setRatingImpact("biz-b", 3, 2);
    expect(getRatingImpact("biz-a")!.newRank).toBe(9);
    expect(getRatingImpact("biz-b")!.newRank).toBe(2);
  });
});

// ── Business Detail Impact Banner Tests ──────────────────────────

describe("Business detail page has impact banner support", () => {
  const bizDetailSrc = fs.readFileSync(
    path.resolve(__dirname, "../app/business/[id].tsx"),
    "utf-8"
  );
  const heroSrc = fs.readFileSync(
    path.resolve(__dirname, "../components/business/BusinessHeroSection.tsx"),
    "utf-8"
  );

  it("imports getRatingImpact", () => {
    expect(bizDetailSrc).toContain("getRatingImpact");
  });

  it("renders impact banner when rank changed", () => {
    expect(heroSrc).toContain("impactBanner");
    expect(heroSrc).toContain("Your rating moved this");
  });

  it("shows rank numbers in banner", () => {
    expect(heroSrc).toContain("prevRank");
    expect(heroSrc).toContain("newRank");
  });
});

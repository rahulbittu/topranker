/**
 * Unit Tests — Tier Perks Engine
 * Owner: Sage (Backend Engineer #2) + Jordan (CVO)
 *
 * Tests the reward system that incentivizes users to climb tiers.
 */

import { describe, it, expect } from "vitest";
import {
  TIER_PERKS,
  getPerksForTier,
  getUnlockedPerks,
  getLockedPerks,
  getNextTierPerks,
} from "@/lib/tier-perks";

describe("Tier Perks Data Integrity", () => {
  it("has perks for all 4 tiers", () => {
    const tiers = new Set(TIER_PERKS.map(p => p.tier));
    expect(tiers.has("community")).toBe(true);
    expect(tiers.has("city")).toBe(true);
    expect(tiers.has("trusted")).toBe(true);
    expect(tiers.has("top")).toBe(true);
  });

  it("has unique IDs for all perks", () => {
    const ids = TIER_PERKS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every perk has title and description", () => {
    for (const perk of TIER_PERKS) {
      expect(perk.title.length).toBeGreaterThan(0);
      expect(perk.description.length).toBeGreaterThan(0);
      expect(perk.icon.length).toBeGreaterThan(0);
    }
  });
});

describe("getPerksForTier", () => {
  it("returns only perks for the specified tier", () => {
    const communityPerks = getPerksForTier("community");
    expect(communityPerks.every(p => p.tier === "community")).toBe(true);

    const topPerks = getPerksForTier("top");
    expect(topPerks.every(p => p.tier === "top")).toBe(true);
  });

  it("Top Judge has the most exclusive perks", () => {
    const topPerks = getPerksForTier("top");
    expect(topPerks.length).toBeGreaterThanOrEqual(4);
  });
});

describe("getUnlockedPerks", () => {
  it("community users only get community perks", () => {
    const unlocked = getUnlockedPerks("community");
    expect(unlocked.every(p => p.tier === "community")).toBe(true);
  });

  it("city users get community + city perks", () => {
    const unlocked = getUnlockedPerks("city");
    const tiers = new Set(unlocked.map(p => p.tier));
    expect(tiers.has("community")).toBe(true);
    expect(tiers.has("city")).toBe(true);
    expect(tiers.has("trusted")).toBe(false);
  });

  it("top judge gets all perks", () => {
    const unlocked = getUnlockedPerks("top");
    expect(unlocked.length).toBe(TIER_PERKS.length);
  });

  it("higher tiers always have more perks", () => {
    const c = getUnlockedPerks("community").length;
    const ci = getUnlockedPerks("city").length;
    const t = getUnlockedPerks("trusted").length;
    const top = getUnlockedPerks("top").length;
    expect(ci).toBeGreaterThan(c);
    expect(t).toBeGreaterThan(ci);
    expect(top).toBeGreaterThan(t);
  });
});

describe("getLockedPerks", () => {
  it("community users have many locked perks", () => {
    const locked = getLockedPerks("community");
    expect(locked.length).toBeGreaterThan(0);
    expect(locked.every(p => p.tier !== "community")).toBe(true);
  });

  it("top judge has no locked perks", () => {
    const locked = getLockedPerks("top");
    expect(locked.length).toBe(0);
  });

  it("locked + unlocked = total perks", () => {
    for (const tier of ["community", "city", "trusted", "top"] as const) {
      const locked = getLockedPerks(tier).length;
      const unlocked = getUnlockedPerks(tier).length;
      expect(locked + unlocked).toBe(TIER_PERKS.length);
    }
  });
});

describe("getNextTierPerks", () => {
  it("returns next tier perks for non-top tiers", () => {
    const result = getNextTierPerks("community");
    expect(result).not.toBeNull();
    expect(result!.nextTier).toBe("city");
    expect(result!.perks.every(p => p.tier === "city")).toBe(true);
  });

  it("returns null for top judge (no next tier)", () => {
    const result = getNextTierPerks("top");
    expect(result).toBeNull();
  });

  it("progression is community → city → trusted → top", () => {
    expect(getNextTierPerks("community")!.nextTier).toBe("city");
    expect(getNextTierPerks("city")!.nextTier).toBe("trusted");
    expect(getNextTierPerks("trusted")!.nextTier).toBe("top");
  });
});

/**
 * Sprint 414 — Profile Tier Progress Improvements
 *
 * Validates:
 * 1. CredibilityJourney enhanced props
 * 2. Progress bar toward next tier
 * 3. Milestones section
 * 4. Next tier perks preview
 * 5. profile.tsx passes new props
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. CredibilityJourney enhanced interface
// ---------------------------------------------------------------------------
describe("CredibilityJourney — enhanced props", () => {
  const src = readFile("components/profile/CredibilityJourney.tsx");

  it("defines CredibilityJourneyProps interface", () => {
    expect(src).toContain("interface CredibilityJourneyProps");
  });

  it("accepts credibilityScore optional prop", () => {
    expect(src).toContain("credibilityScore?: number");
  });

  it("accepts totalRatings optional prop", () => {
    expect(src).toContain("totalRatings?: number");
  });

  it("uses pct helper for progress bar width", () => {
    expect(src).toContain("pct(progressPct)");
    expect(src).not.toContain("as any");
  });
});

// ---------------------------------------------------------------------------
// 2. Progress bar
// ---------------------------------------------------------------------------
describe("CredibilityJourney — progress bar", () => {
  const src = readFile("components/profile/CredibilityJourney.tsx");

  it("has progressSection container", () => {
    expect(src).toContain("progressSection");
  });

  it("shows progress percentage", () => {
    expect(src).toContain("progressPct");
    expect(src).toContain("Math.round(progressPct)");
  });

  it("has progress bar background and fill", () => {
    expect(src).toContain("progressBarBg");
    expect(src).toContain("progressBarFill");
  });

  it("shows progress label with next tier name", () => {
    expect(src).toContain("Progress to");
    expect(src).toContain("TIER_DISPLAY_NAMES[nextTier]");
  });
});

// ---------------------------------------------------------------------------
// 3. Milestones
// ---------------------------------------------------------------------------
describe("CredibilityJourney — milestones", () => {
  const src = readFile("components/profile/CredibilityJourney.tsx");

  it("has getMilestones function", () => {
    expect(src).toContain("function getMilestones");
  });

  it("shows milestone rows with flag icons", () => {
    expect(src).toContain("milestonesSection");
    expect(src).toContain("flag-outline");
  });

  it("includes points-to-next-tier milestone", () => {
    expect(src).toContain("points to next tier");
  });

  it("includes rating count milestones", () => {
    expect(src).toContain("Rate 5 businesses");
    expect(src).toContain("consistency builds trust");
  });

  it("has milestones title", () => {
    expect(src).toContain("Milestones");
    expect(src).toContain("milestonesTitle");
  });
});

// ---------------------------------------------------------------------------
// 4. Next tier perks preview
// ---------------------------------------------------------------------------
describe("CredibilityJourney — next tier perks", () => {
  const src = readFile("components/profile/CredibilityJourney.tsx");

  it("has getNextTierPerks function", () => {
    expect(src).toContain("function getNextTierPerks");
  });

  it("shows perks section with title", () => {
    expect(src).toContain("perksSection");
    expect(src).toContain("perksTitle");
    expect(src).toContain("Unlock at");
  });

  it("lists perks with star icons", () => {
    expect(src).toContain("perkRow");
    expect(src).toContain('name="star"');
  });

  it("includes weight-related perks", () => {
    expect(src).toContain("carry more weight");
    expect(src).toContain("rating influence");
  });

  it("includes badge-related perks", () => {
    expect(src).toContain("city-level badge");
    expect(src).toContain("trusted badge");
    expect(src).toContain("Top Judge");
  });
});

// ---------------------------------------------------------------------------
// 5. profile.tsx integration
// ---------------------------------------------------------------------------
describe("profile.tsx — passes new CredibilityJourney props", () => {
  const src = readFile("app/(tabs)/profile.tsx");

  it("passes credibilityScore to CredibilityJourney", () => {
    expect(src).toContain("credibilityScore={profile.credibilityScore}");
  });

  it("passes totalRatings to CredibilityJourney", () => {
    expect(src).toContain("totalRatings={profile.totalRatings}");
  });

  it("is under 800 LOC threshold", () => {
    expect(countLines(src)).toBeLessThan(800);
  });
});

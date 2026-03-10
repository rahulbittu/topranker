/**
 * Sprint 536: Profile page extraction — credibility section to standalone component
 *
 * 1. ProfileCredibilitySection component exists with correct exports
 * 2. profile.tsx uses the extracted component
 * 3. profile.tsx LOC reduced below 500 (was 628)
 * 4. Sprint & retro docs
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. ProfileCredibilitySection component
// ---------------------------------------------------------------------------
describe("ProfileCredibilitySection component", () => {
  const src = readFile("components/profile/ProfileCredibilitySection.tsx");

  it("exports ProfileCredibilitySection", () => {
    expect(src).toContain("export function ProfileCredibilitySection");
  });

  it("has Sprint 536 attribution", () => {
    expect(src).toContain("Sprint 536");
  });

  it("renders credibility card", () => {
    expect(src).toContain("credibilityCard");
    expect(src).toContain("Credibility");
  });

  it("renders ScoreCountUp for credibility score", () => {
    expect(src).toContain("ScoreCountUp");
    expect(src).toContain("targetValue={credibilityScore}");
  });

  it("renders tier progress bar", () => {
    expect(src).toContain("progressToNext");
    expect(src).toContain("Progress to");
  });

  it("renders getting started card for zero ratings", () => {
    expect(src).toContain("totalRatings === 0");
    expect(src).toContain("Rate Your First Place");
  });

  it("renders growth prompt", () => {
    expect(src).toContain("Keep rating to unlock your next tier");
  });

  it("renders stats row with 5 stat boxes", () => {
    expect(src).toContain("Ratings");
    expect(src).toContain("Places");
    expect(src).toContain("Categories");
    expect(src).toContain("Days");
    expect(src).toContain("Badges");
  });

  it("renders enhanced stats row", () => {
    expect(src).toContain("Weight");
    expect(src).toContain("Streak");
    expect(src).toContain("Avg Given");
    expect(src).toContain("Joined");
  });

  it("accepts tier prop and uses TIER_COLORS", () => {
    expect(src).toContain("tier: CredibilityTier");
    expect(src).toContain("TIER_COLORS[tier]");
  });

  it("computes next tier progression", () => {
    expect(src).toContain("nextTierMap");
    expect(src).toContain("TIER_SCORE_RANGES");
  });

  it("is under 260 LOC", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(260);
  });
});

// ---------------------------------------------------------------------------
// 2. profile.tsx integration
// ---------------------------------------------------------------------------
describe("profile.tsx uses ProfileCredibilitySection", () => {
  const src = readFile("app/(tabs)/profile.tsx");

  it("imports ProfileCredibilitySection", () => {
    expect(src).toContain("import { ProfileCredibilitySection }");
    expect(src).toContain("components/profile/ProfileCredibilitySection");
  });

  it("renders ProfileCredibilitySection with props", () => {
    expect(src).toContain("<ProfileCredibilitySection");
    expect(src).toContain("tier={tier}");
    expect(src).toContain("credibilityScore={profile.credibilityScore}");
    expect(src).toContain("totalRatings={profile.totalRatings}");
    expect(src).toContain("earnedBadgeCount={0}");
  });

  it("no longer has inline credibility card styles", () => {
    expect(src).not.toContain("credScoreRow:");
    expect(src).not.toContain("credWeightBox:");
    expect(src).not.toContain("credProgressPct:");
  });

  it("no longer has inline stats row styles", () => {
    expect(src).not.toContain("statBoxMiddle:");
    expect(src).not.toContain("enhancedStatBox:");
    expect(src).not.toContain("enhancedStatNum:");
  });

  it("no longer has getting started styles", () => {
    expect(src).not.toContain("gettingStartedCard:");
    expect(src).not.toContain("growthPromptText:");
  });

  it("removed unused imports (ScoreCountUp, TIER_WEIGHTS, pct, TYPOGRAPHY)", () => {
    expect(src).not.toContain("import ScoreCountUp");
    expect(src).not.toContain("TIER_WEIGHTS");
    expect(src).not.toContain("import { pct }");
    expect(src).not.toContain("TYPOGRAPHY");
  });
});

// ---------------------------------------------------------------------------
// 3. LOC reduction
// ---------------------------------------------------------------------------
describe("profile.tsx LOC reduction", () => {
  const src = readFile("app/(tabs)/profile.tsx");

  it("profile.tsx is under 500 LOC (was 628, target ~450)", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(500);
  });

  it("profile.tsx reduced by at least 150 LOC", () => {
    const lines = src.split("\n").length;
    expect(628 - lines).toBeGreaterThanOrEqual(150);
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 536 docs", () => {
  const sprint = readFile("docs/sprints/SPRINT-536-PROFILE-EXTRACTION.md");
  const retro = readFile("docs/retros/RETRO-536-PROFILE-EXTRACTION.md");

  it("sprint doc has correct header", () => {
    expect(sprint).toContain("Sprint 536");
    expect(sprint).toContain("Profile");
  });

  it("sprint doc has team discussion", () => {
    expect(sprint).toContain("Team Discussion");
    expect(sprint).toContain("Marcus Chen");
    expect(sprint).toContain("Sarah Nakamura");
  });

  it("sprint doc mentions LOC reduction", () => {
    expect(sprint).toContain("628");
    expect(sprint).toContain("446");
  });

  it("sprint doc mentions ProfileCredibilitySection", () => {
    expect(sprint).toContain("ProfileCredibilitySection");
  });

  it("retro has correct header", () => {
    expect(retro).toContain("Retro 536");
  });

  it("retro has What Went Well", () => {
    expect(retro).toContain("What Went Well");
  });

  it("retro has What Could Improve", () => {
    expect(retro).toContain("What Could Improve");
  });

  it("retro has Action Items", () => {
    expect(retro).toContain("Action Items");
  });

  it("retro has Team Morale", () => {
    expect(retro).toContain("Team Morale");
  });
});

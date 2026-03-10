/**
 * Sprint 429 — Profile Achievements Gallery
 *
 * Validates:
 * 1. AchievementGallery component structure
 * 2. Category grouping (rating, exploration, credibility, engagement)
 * 3. Progress tracking for unearned achievements
 * 4. AchievementTile + CategorySection components
 * 5. AchievementsSection wrapper delegation
 * 6. File health
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. AchievementGallery exports & structure
// ---------------------------------------------------------------------------
describe("AchievementGallery — exports", () => {
  const src = readFile("components/profile/AchievementGallery.tsx");

  it("exports AchievementGallery component", () => {
    expect(src).toContain("export function AchievementGallery");
  });

  it("exports AchievementGalleryProps interface", () => {
    expect(src).toContain("export interface AchievementGalleryProps");
  });

  it("exports AchievementDef interface", () => {
    expect(src).toContain("export interface AchievementDef");
  });

  it("exports AchievementCategory type", () => {
    expect(src).toContain("export type AchievementCategory");
  });

  it("accepts all profile stat props", () => {
    expect(src).toContain("totalRatings: number");
    expect(src).toContain("distinctBusinesses: number");
    expect(src).toContain("tier: CredibilityTier");
    expect(src).toContain("currentStreak: number");
    expect(src).toContain("earnedBadgeCount: number");
    expect(src).toContain("daysActive: number");
  });
});

// ---------------------------------------------------------------------------
// 2. Category grouping
// ---------------------------------------------------------------------------
describe("AchievementGallery — categories", () => {
  const src = readFile("components/profile/AchievementGallery.tsx");

  it("defines four categories", () => {
    expect(src).toContain('"rating"');
    expect(src).toContain('"exploration"');
    expect(src).toContain('"credibility"');
    expect(src).toContain('"engagement"');
  });

  it("has CATEGORY_META with labels", () => {
    expect(src).toContain("Rating Milestones");
    expect(src).toContain("Exploration");
    expect(src).toContain("Credibility");
    expect(src).toContain("Engagement");
  });

  it("renders CategorySection for each group", () => {
    expect(src).toContain("function CategorySection");
    expect(src).toContain("categoryHeader");
    expect(src).toContain("categoryGrid");
  });

  it("has category order array", () => {
    expect(src).toContain("CATEGORY_ORDER");
  });
});

// ---------------------------------------------------------------------------
// 3. Progress tracking
// ---------------------------------------------------------------------------
describe("AchievementGallery — progress", () => {
  const src = readFile("components/profile/AchievementGallery.tsx");

  it("computes progress 0-1 for each achievement", () => {
    expect(src).toContain("progress: Math.min(");
  });

  it("shows progress bar for unearned", () => {
    expect(src).toContain("progressBg");
    expect(src).toContain("progressFill");
    expect(src).toContain("progressPct");
  });

  it("shows earned badge for completed", () => {
    expect(src).toContain("earnedBadge");
    expect(src).toContain("Earned");
  });

  it("renders progress percentage text", () => {
    expect(src).toContain("Math.round(progress * 100)");
  });
});

// ---------------------------------------------------------------------------
// 4. AchievementTile component
// ---------------------------------------------------------------------------
describe("AchievementGallery — AchievementTile", () => {
  const src = readFile("components/profile/AchievementGallery.tsx");

  it("has AchievementTile component", () => {
    expect(src).toContain("function AchievementTile");
  });

  it("uses IoniconsName type (no as any)", () => {
    expect(src).toContain("type IoniconsName");
    expect(src).not.toContain("as any");
  });

  it("dims unearned tiles", () => {
    expect(src).toContain("tileUnearned");
    expect(src).toContain("tileTitleDim");
  });
});

// ---------------------------------------------------------------------------
// 5. Show all / collapse
// ---------------------------------------------------------------------------
describe("AchievementGallery — expand/collapse", () => {
  const src = readFile("components/profile/AchievementGallery.tsx");

  it("has show all toggle state", () => {
    expect(src).toContain("showAll");
    expect(src).toContain("setShowAll");
  });

  it("has Show All Categories button", () => {
    expect(src).toContain("Show All Categories");
  });

  it("has Show Less button", () => {
    expect(src).toContain("Show Less");
  });
});

// ---------------------------------------------------------------------------
// 6. AchievementsSection wrapper
// ---------------------------------------------------------------------------
describe("AchievementsSection — wrapper", () => {
  const src = readFile("components/profile/AchievementsSection.tsx");

  it("imports AchievementGallery", () => {
    expect(src).toContain('import { AchievementGallery } from "./AchievementGallery"');
  });

  it("exports AchievementsSection function", () => {
    expect(src).toContain("export function AchievementsSection");
  });

  it("exports AchievementsSectionProps", () => {
    expect(src).toContain("export interface AchievementsSectionProps");
  });

  it("delegates to AchievementGallery", () => {
    expect(src).toContain("<AchievementGallery");
  });
});

// ---------------------------------------------------------------------------
// 7. File health
// ---------------------------------------------------------------------------
describe("file health", () => {
  it("AchievementGallery is under 300 LOC", () => {
    const src = readFile("components/profile/AchievementGallery.tsx");
    expect(countLines(src)).toBeLessThan(300);
  });

  it("AchievementsSection wrapper is under 30 LOC", () => {
    const src = readFile("components/profile/AchievementsSection.tsx");
    expect(countLines(src)).toBeLessThan(30);
  });

  it("profile.tsx is under 800 LOC threshold", () => {
    const src = readFile("app/(tabs)/profile.tsx");
    expect(countLines(src)).toBeLessThan(800);
  });
});

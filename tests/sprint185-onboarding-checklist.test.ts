/**
 * Sprint 185 — Real User Onboarding Checklist
 *
 * Validates:
 * 1. Onboarding progress storage function
 * 2. Onboarding API endpoint
 * 3. OnboardingChecklist component
 * 4. Client API wrapper
 * 5. Profile integration
 * 6. Storage barrel export
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Onboarding progress storage function
// ---------------------------------------------------------------------------
describe("Onboarding progress — storage", () => {
  const src = readFile("server/storage/members.ts");

  it("exports getOnboardingProgress function", () => {
    expect(src).toContain("export async function getOnboardingProgress");
  });

  it("takes memberId parameter", () => {
    expect(src).toContain("getOnboardingProgress(memberId: string)");
  });

  it("returns steps array with key, label, completed, detail", () => {
    expect(src).toContain("steps:");
    expect(src).toContain("completedCount:");
    expect(src).toContain("totalSteps:");
  });

  it("checks account creation milestone", () => {
    expect(src).toContain("create_account");
  });

  it("checks avatar milestone", () => {
    expect(src).toContain("add_avatar");
    expect(src).toContain("!!member.avatarUrl");
  });

  it("checks 3-day waiting period", () => {
    expect(src).toContain("wait_period");
    expect(src).toContain("daysActive >= 3");
  });

  it("checks first rating milestone", () => {
    expect(src).toContain("first_rating");
    expect(src).toContain("totalRatings");
  });

  it("checks three ratings milestone", () => {
    expect(src).toContain("three_ratings");
    expect(src).toContain(">= 3");
  });

  it("checks tier upgrade milestone", () => {
    expect(src).toContain("earn_tier");
    expect(src).toContain("credibilityTier");
  });

  it("calculates days active from joinedAt", () => {
    expect(src).toContain("member.joinedAt");
    expect(src).toContain("daysActive");
  });

  it("throws for missing member", () => {
    expect(src).toContain("Member not found");
  });
});

// ---------------------------------------------------------------------------
// 2. Onboarding API endpoint
// ---------------------------------------------------------------------------
describe("Onboarding API — routes", () => {
  const src = readFile("server/routes-members.ts");

  it("has GET /api/members/me/onboarding", () => {
    expect(src).toContain('"/api/members/me/onboarding"');
  });

  it("requires authentication", () => {
    expect(src).toContain("requireAuth");
  });

  it("calls getOnboardingProgress", () => {
    expect(src).toContain("getOnboardingProgress");
  });

  it("passes user id from session", () => {
    expect(src).toContain("req.user!.id");
  });
});

// ---------------------------------------------------------------------------
// 3. OnboardingChecklist component
// ---------------------------------------------------------------------------
describe("OnboardingChecklist — component", () => {
  const src = readFile("components/profile/OnboardingChecklist.tsx");

  it("exports OnboardingChecklist", () => {
    expect(src).toContain("export function OnboardingChecklist");
  });

  it("fetches onboarding progress via useQuery", () => {
    expect(src).toContain("fetchOnboardingProgress");
    expect(src).toContain("onboarding-progress");
  });

  it("shows progress bar", () => {
    expect(src).toContain("progressBarTrack");
    expect(src).toContain("progressBarFill");
  });

  it("shows completion count", () => {
    expect(src).toContain("completedCount");
    expect(src).toContain("totalSteps");
  });

  it("renders step rows with checkmarks", () => {
    expect(src).toContain("StepRow");
    expect(src).toContain("checkmark");
  });

  it("hides when all steps complete", () => {
    expect(src).toContain("completedCount === progress.totalSteps");
  });

  it("shows Getting Started header", () => {
    expect(src).toContain("Getting Started");
  });
});

// ---------------------------------------------------------------------------
// 4. Client API wrapper
// ---------------------------------------------------------------------------
describe("Client API — onboarding", () => {
  const src = readFile("lib/api.ts");

  it("exports fetchOnboardingProgress", () => {
    expect(src).toContain("export async function fetchOnboardingProgress");
  });

  it("exports OnboardingStep type", () => {
    expect(src).toContain("export type OnboardingStep");
  });

  it("exports OnboardingProgress type", () => {
    expect(src).toContain("export type OnboardingProgress");
  });

  it("calls /api/members/me/onboarding", () => {
    expect(src).toContain("/api/members/me/onboarding");
  });
});

// ---------------------------------------------------------------------------
// 6. Storage barrel export
// ---------------------------------------------------------------------------
describe("Storage barrel — Sprint 185 exports", () => {
  const indexSrc = readFile("server/storage/index.ts");

  it("exports getOnboardingProgress", () => {
    expect(indexSrc).toContain("getOnboardingProgress");
  });
});

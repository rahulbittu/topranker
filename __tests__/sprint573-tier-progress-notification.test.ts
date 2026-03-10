/**
 * Sprint 573: Tier Progress Notification
 *
 * Tests:
 * 1. Component exists and exports correctly
 * 2. Interface shape
 * 3. Tier logic (proximity threshold, next tier mapping)
 * 4. Profile integration
 * 5. LOC thresholds
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 573: TierProgressNotification Component", () => {
  const src = readFile("components/profile/TierProgressNotification.tsx");

  it("exports TierProgressNotification function", () => {
    expect(src).toContain("export function TierProgressNotification");
  });

  it("exports TierProgressNotificationProps interface", () => {
    expect(src).toContain("export interface TierProgressNotificationProps");
  });

  it("props include tier, credibilityScore, totalRatings", () => {
    expect(src).toContain("tier: CredibilityTier");
    expect(src).toContain("credibilityScore: number");
    expect(src).toContain("totalRatings: number");
  });

  it("props include optional delay and onDismiss", () => {
    expect(src).toContain("delay?: number");
    expect(src).toContain("onDismiss?: () => void");
  });

  it("imports from lib/data for tier constants", () => {
    expect(src).toContain("from \"@/lib/data\"");
    expect(src).toContain("TIER_DISPLAY_NAMES");
    expect(src).toContain("TIER_SCORE_RANGES");
    expect(src).toContain("TIER_WEIGHTS");
    expect(src).toContain("TIER_COLORS");
  });

  it("imports pct helper for progress bar width", () => {
    expect(src).toContain("import { pct }");
    expect(src).toContain("pct(");
  });

  it("defines PROXIMITY_THRESHOLD constant", () => {
    expect(src).toContain("PROXIMITY_THRESHOLD");
    expect(src).toMatch(/PROXIMITY_THRESHOLD\s*=\s*0\.\d+/);
  });

  it("defines TIER_TIPS for actionable guidance", () => {
    expect(src).toContain("TIER_TIPS");
    expect(src).toContain("community:");
    expect(src).toContain("city:");
    expect(src).toContain("trusted:");
  });

  it("defines TIER_ICONS for visual identity", () => {
    expect(src).toContain("TIER_ICONS");
    expect(src).toContain("trophy");
    expect(src).toContain("shield-checkmark");
  });

  it("returns null for top tier (no next tier)", () => {
    expect(src).toContain("if (!nextTier) return null");
  });

  it("returns null when below proximity threshold", () => {
    expect(src).toContain("if (progress < PROXIMITY_THRESHOLD) return null");
  });

  it("calculates points needed to next tier", () => {
    expect(src).toContain("pointsNeeded");
    expect(src).toContain("nextRange.min - credibilityScore");
  });

  it("uses FadeInDown animation", () => {
    expect(src).toContain("FadeInDown");
    expect(src).toContain("entering={");
  });

  it("shows next tier name in title", () => {
    expect(src).toContain("TIER_DISPLAY_NAMES[nextTier]");
  });

  it("shows next tier weight in subtitle", () => {
    expect(src).toContain("nextWeight");
    expect(src).toContain("influence");
  });

  it("renders progress bar with tier-colored fill", () => {
    expect(src).toContain("progressBarFill");
    expect(src).toContain("backgroundColor: nextTierColor");
  });

  it("renders tip with bulb icon", () => {
    expect(src).toContain("bulb-outline");
    expect(src).toContain("tipText");
  });

  it("supports dismissible notification via onDismiss", () => {
    expect(src).toContain("onDismiss");
    expect(src).toContain("Dismiss notification");
  });

  it("uses card shadow and amber border styling", () => {
    expect(src).toContain("cardShadow");
    expect(src).toContain("rgba(196,154,26,");
  });

  it("component LOC under 210", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(210);
  });
});


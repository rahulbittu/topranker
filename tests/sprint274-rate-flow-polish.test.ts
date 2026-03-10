/**
 * Sprint 274 — Rate Flow UX Polish Tests
 *
 * Validates:
 * 1. Live composite score preview using score engine
 * 2. Error retry button
 * 3. Success haptic feedback
 * 4. computeComposite import for visit-type weighted preview
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { computeComposite } from "@/shared/score-engine";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 274: Rate Flow UX Polish", () => {
  const rateSrc = readFile("app/rate/[id].tsx");

  // ── Live Score Preview ──────────────────────────────────────

  it("rate screen imports computeComposite from score engine", () => {
    expect(rateSrc).toContain("computeComposite");
    expect(rateSrc).toContain("@/shared/score-engine");
  });

  it("rate screen shows live score preview", () => {
    expect(rateSrc).toContain("liveScorePreview");
    expect(rateSrc).toContain("YOUR SCORE");
    expect(rateSrc).toContain("rawScore.toFixed(1)");
  });

  it("live score uses visit-type weighted computation", () => {
    expect(rateSrc).toContain("computeComposite(");
    expect(rateSrc).toContain("foodScore: q1Score");
  });

  it("live score shows weight multiplier", () => {
    expect(rateSrc).toContain("weightedScore.toFixed(1)");
    expect(rateSrc).toContain("voteWeight");
  });

  // ── Error Recovery ──────────────────────────────────────────

  it("error banner has retry button", () => {
    expect(rateSrc).toContain("Retry");
    expect(rateSrc).toContain("errorRetryText");
    expect(rateSrc).toContain("Retry submission");
  });

  it("retry button resubmits rating", () => {
    expect(rateSrc).toContain('setSubmitError(""); submitMutation.mutate()');
  });

  // ── Success Haptic ──────────────────────────────────────────

  it("submit success triggers haptic feedback", () => {
    expect(rateSrc).toContain("notificationAsync");
    expect(rateSrc).toContain("NotificationFeedbackType.Success");
  });

  // ── Style Definitions ──────────────────────────────────────

  it("has liveScorePreview style", () => {
    expect(rateSrc).toContain("liveScorePreview:");
    expect(rateSrc).toContain("liveScoreLabel:");
    expect(rateSrc).toContain("liveScoreValue:");
    expect(rateSrc).toContain("liveScoreWeight:");
  });

  it("has errorRetryText style", () => {
    expect(rateSrc).toContain("errorRetryText:");
  });
});

// ── computeComposite validation for live preview ────────────────

describe("computeComposite — live preview accuracy", () => {
  it("dine-in: food 0.50 + service 0.25 + vibe 0.25", () => {
    const result = computeComposite("dine_in", {
      foodScore: 8, serviceScore: 6, vibeScore: 4,
    });
    // 8*0.50 + 6*0.25 + 4*0.25 = 4.0 + 1.5 + 1.0 = 6.5
    expect(result).toBeCloseTo(6.5, 2);
  });

  it("delivery: food 0.60 + packaging 0.25 + value 0.15", () => {
    const result = computeComposite("delivery", {
      foodScore: 8, packagingScore: 6, valueScore: 10,
    });
    // 8*0.60 + 6*0.25 + 10*0.15 = 4.8 + 1.5 + 1.5 = 7.8
    expect(result).toBeCloseTo(7.8, 2);
  });

  it("takeaway: food 0.65 + waitTime 0.20 + value 0.15", () => {
    const result = computeComposite("takeaway", {
      foodScore: 8, waitTimeScore: 6, valueScore: 10,
    });
    // 8*0.65 + 6*0.20 + 10*0.15 = 5.2 + 1.2 + 1.5 = 7.9
    expect(result).toBeCloseTo(7.9, 2);
  });

  it("perfect 10 across all dimensions returns 10", () => {
    expect(computeComposite("dine_in", { foodScore: 10, serviceScore: 10, vibeScore: 10 })).toBe(10);
    expect(computeComposite("delivery", { foodScore: 10, packagingScore: 10, valueScore: 10 })).toBe(10);
    expect(computeComposite("takeaway", { foodScore: 10, waitTimeScore: 10, valueScore: 10 })).toBe(10);
  });
});

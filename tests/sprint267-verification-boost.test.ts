/**
 * Sprint 267 — Verification Boost Computation + Schema Migration Tests
 *
 * Validates:
 * 1. Ratings table has dimensional score columns
 * 2. Ratings table has verification signal columns
 * 3. Ratings table has effective weight + gaming columns
 * 4. Verification boost computed from signals in submitRating
 * 5. Time-on-page tracking wired end-to-end
 * 6. Photo upload route updates hasPhoto + verificationBoost
 * 7. Score engine used for composite score persistence
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 267: Verification Boost + Schema Migration", () => {
  const schemaSrc = readFile("shared/schema.ts");
  const storageSrc = readFile("server/storage/ratings.ts");
  const hookSrc = readFile("lib/hooks/useRatingSubmit.ts");
  const rateSrc = readFile("app/rate/[id].tsx");
  const photoRoutesSrc = readFile("server/routes-rating-photos.ts");

  // ── Schema: Dimensional Scores ──────────────────────────────────

  it("ratings table has visitType column", () => {
    expect(schemaSrc).toContain('visitType: text("visit_type")');
  });

  it("ratings table has food_score column", () => {
    expect(schemaSrc).toContain('foodScore: numeric("food_score"');
  });

  it("ratings table has service_score column", () => {
    expect(schemaSrc).toContain('serviceScore: numeric("service_score"');
  });

  it("ratings table has vibe_score column", () => {
    expect(schemaSrc).toContain('vibeScore: numeric("vibe_score"');
  });

  it("ratings table has packaging_score column", () => {
    expect(schemaSrc).toContain('packagingScore: numeric("packaging_score"');
  });

  it("ratings table has wait_time_score column", () => {
    expect(schemaSrc).toContain('waitTimeScore: numeric("wait_time_score"');
  });

  it("ratings table has value_score column", () => {
    expect(schemaSrc).toContain('valueScore: numeric("value_score"');
  });

  it("ratings table has composite_score column", () => {
    expect(schemaSrc).toContain('compositeScore: numeric("composite_score"');
  });

  // ── Schema: Verification Signals ──────────────────────────────

  it("ratings table has has_photo column", () => {
    expect(schemaSrc).toContain('hasPhoto: boolean("has_photo")');
  });

  it("ratings table has has_receipt column", () => {
    expect(schemaSrc).toContain('hasReceipt: boolean("has_receipt")');
  });

  it("ratings table has dish_field_completed column", () => {
    expect(schemaSrc).toContain('dishFieldCompleted: boolean("dish_field_completed")');
  });

  it("ratings table has verification_boost column", () => {
    expect(schemaSrc).toContain('verificationBoost: numeric("verification_boost"');
  });

  // ── Schema: Effective Weight + Gaming ──────────────────────────

  it("ratings table has effective_weight column", () => {
    expect(schemaSrc).toContain('effectiveWeight: numeric("effective_weight"');
  });

  it("ratings table has gaming_multiplier column", () => {
    expect(schemaSrc).toContain('gamingMultiplier: numeric("gaming_multiplier"');
  });

  it("ratings table has gaming_reason column", () => {
    expect(schemaSrc).toContain('gamingReason: text("gaming_reason")');
  });

  it("ratings table has time_on_page_ms column", () => {
    expect(schemaSrc).toContain('timeOnPageMs: integer("time_on_page_ms")');
  });

  // ── Schema: Validation ──────────────────────────────────────────

  it("insertRatingSchema accepts timeOnPageMs", () => {
    expect(schemaSrc).toContain("timeOnPageMs: z.number()");
  });

  // ── Storage: Dimensional Score Persistence ──────────────────────

  it("submitRating persists visitType", () => {
    const match = storageSrc.match(/\.values\(\{[\s\S]{0,500}visitType/);
    expect(match).not.toBeNull();
  });

  it("submitRating persists foodScore", () => {
    const match = storageSrc.match(/\.values\(\{[\s\S]{0,500}foodScore/);
    expect(match).not.toBeNull();
  });

  it("submitRating persists compositeScore", () => {
    const match = storageSrc.match(/\.values\(\{[\s\S]{0,800}compositeScore/);
    expect(match).not.toBeNull();
  });

  // ── Storage: Verification Boost Computation ──────────────────

  it("computes dish detail boost (+5%)", () => {
    expect(storageSrc).toContain("dishCompleted");
    expect(storageSrc).toContain("vBoost += 0.05");
  });

  it("computes time plausibility boost (+5%)", () => {
    expect(storageSrc).toContain("timePlausible");
    expect(storageSrc).toContain("timeOnPage >= 10000");
  });

  it("caps verification boost at 50%", () => {
    expect(storageSrc).toContain("Math.min(vBoost, 0.50)");
  });

  it("persists verificationBoost in rating insert", () => {
    const match = storageSrc.match(/\.values\(\{[\s\S]{0,1000}verificationBoost/);
    expect(match).not.toBeNull();
  });

  it("persists effectiveWeight in rating insert", () => {
    const match = storageSrc.match(/\.values\(\{[\s\S]{0,1000}effectiveWeight/);
    expect(match).not.toBeNull();
  });

  it("persists gamingMultiplier in rating insert", () => {
    const match = storageSrc.match(/\.values\(\{[\s\S]{0,1000}gamingMultiplier/);
    expect(match).not.toBeNull();
  });

  it("persists timeOnPageMs in rating insert", () => {
    const match = storageSrc.match(/\.values\(\{[\s\S]{0,1500}timeOnPageMs/);
    expect(match).not.toBeNull();
  });

  // ── Photo Route: Verification Boost Update ──────────────────

  it("photo upload sets hasPhoto = true on rating", () => {
    expect(photoRoutesSrc).toContain("hasPhoto: true");
  });

  it("photo upload updates verificationBoost on rating", () => {
    expect(photoRoutesSrc).toContain("verificationBoost: newBoost");
  });

  // ── Client: Time-on-page Tracking ──────────────────────────────

  it("rate screen tracks page entry time", () => {
    expect(rateSrc).toContain("pageEnteredAt");
    expect(rateSrc).toContain("Date.now()");
  });

  it("hook accepts timeOnPageMs parameter", () => {
    expect(hookSrc).toContain("timeOnPageMs: number");
  });

  it("hook sends timeOnPageMs in request", () => {
    expect(hookSrc).toContain("timeOnPageMs:");
  });

  it("rate screen computes timeOnPageMs on submit", () => {
    expect(rateSrc).toContain("Date.now() - pageEnteredAt");
  });
});

// ── Verification Boost Computation Unit Tests ──────────────────
import { computeEffectiveWeight } from "@shared/score-engine";

describe("Verification Boost — effective weight computation", () => {
  it("dish detail +5% increases effective weight by 5%", () => {
    const base = computeEffectiveWeight(0.70, 0, 1.0);    // 0.70
    const boosted = computeEffectiveWeight(0.70, 0.05, 1.0); // 0.70 * 1.05
    expect(boosted).toBeCloseTo(base * 1.05, 5);
  });

  it("photo +15% increases effective weight by 15%", () => {
    const base = computeEffectiveWeight(0.70, 0, 1.0);
    const boosted = computeEffectiveWeight(0.70, 0.15, 1.0);
    expect(boosted).toBeCloseTo(base * 1.15, 5);
  });

  it("photo +15% + dish +5% = 20% boost", () => {
    const base = computeEffectiveWeight(0.70, 0, 1.0);
    const boosted = computeEffectiveWeight(0.70, 0.20, 1.0);
    expect(boosted).toBeCloseTo(base * 1.20, 5);
  });

  it("boost capped at 50%", () => {
    const capped = computeEffectiveWeight(0.70, 0.60, 1.0); // would be 60% but capped
    const expected = computeEffectiveWeight(0.70, 0.50, 1.0); // capped at 50%
    expect(capped).toBeCloseTo(expected, 5);
  });

  it("velocity-flagged rating gets 0.05x gaming multiplier", () => {
    const normal = computeEffectiveWeight(0.70, 0.15, 1.0);
    const flagged = computeEffectiveWeight(0.70, 0.15, 0.05);
    expect(flagged).toBeLessThan(normal * 0.10);
  });
});

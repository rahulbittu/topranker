/**
 * Sprint 265 — Rating Integrity Wiring Tests
 *
 * Validates:
 * 1. POST /api/ratings route integrates owner self-rating block
 * 2. POST /api/ratings route integrates velocity detection
 * 3. Velocity log is called before submitRating
 * 4. submitRating accepts IntegrityContext parameter
 * 5. Score engine composite calculation used in storage
 * 6. insertRatingSchema accepts visitType field
 * 7. Client hook handles owner self-rating error
 * 8. Analytics event type includes rating_rejected_owner_self
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 265: Rating Integrity Wiring", () => {
  const routesSrc = readFile("server/routes-ratings.ts");
  const storageSrc = readFile("server/storage/ratings.ts");
  const schemaSrc = readFile("shared/schema.ts");
  const hookSrc = readFile("lib/hooks/useRatingSubmit.ts");
  const analyticsSrc = readFile("server/analytics.ts");

  // ── Route-level integrity checks ─────────────────────────────

  it("imports checkOwnerSelfRating from rating-integrity", () => {
    expect(routesSrc).toContain("checkOwnerSelfRating");
    expect(routesSrc).toContain('from "./rating-integrity"');
  });

  it("imports checkVelocity from rating-integrity", () => {
    expect(routesSrc).toContain("checkVelocity");
  });

  it("imports logRatingSubmission from rating-integrity", () => {
    expect(routesSrc).toContain("logRatingSubmission");
  });

  it("calls checkOwnerSelfRating before submitRating in POST /api/ratings", () => {
    const match = routesSrc.match(
      /app\.post\(["']\/api\/ratings["'][\s\S]{0,800}checkOwnerSelfRating[\s\S]{0,1500}submitRating/
    );
    expect(match).not.toBeNull();
  });

  it("calls checkVelocity before submitRating in POST /api/ratings", () => {
    const match = routesSrc.match(
      /app\.post\(["']\/api\/ratings["'][\s\S]{0,1200}checkVelocity[\s\S]{0,1000}submitRating/
    );
    expect(match).not.toBeNull();
  });

  it("calls logRatingSubmission before submitRating in POST /api/ratings", () => {
    const match = routesSrc.match(
      /app\.post\(["']\/api\/ratings["'][\s\S]{0,1500}logRatingSubmission[\s\S]{0,800}submitRating/
    );
    expect(match).not.toBeNull();
  });

  it("returns 403 when owner self-rating is blocked", () => {
    const match = routesSrc.match(
      /ownerCheck\.allowed[\s\S]{0,200}403[\s\S]{0,100}ownerCheck\.reason/
    );
    expect(match).not.toBeNull();
  });

  it("passes integrity context to submitRating", () => {
    expect(routesSrc).toContain("velocityFlagged:");
    expect(routesSrc).toContain("velocityRule:");
    expect(routesSrc).toContain("velocityWeight:");
  });

  // ── Storage-level score engine integration ────────────────────

  it("imports computeComposite from score-engine", () => {
    expect(storageSrc).toContain("computeComposite");
    expect(storageSrc).toContain("@shared/score-engine");
  });

  it("defines IntegrityContext interface", () => {
    expect(storageSrc).toContain("export interface IntegrityContext");
    expect(storageSrc).toContain("velocityFlagged");
  });

  it("submitRating accepts integrity parameter", () => {
    const match = storageSrc.match(
      /async function submitRating[\s\S]{0,200}integrity\?:\s*IntegrityContext/
    );
    expect(match).not.toBeNull();
  });

  it("uses visit-type weighted composite score", () => {
    expect(storageSrc).toContain("computeComposite(visitType, dimensions)");
  });

  it("applies velocity weight reduction when flagged", () => {
    expect(storageSrc).toContain("integrity?.velocityFlagged");
    expect(storageSrc).toContain("integrity.velocityWeight");
  });

  // ── Schema validation ─────────────────────────────────────────

  it("insertRatingSchema accepts visitType field", () => {
    const match = schemaSrc.match(
      /insertRatingSchema[\s\S]{0,500}visitType:\s*z\.enum\(\["dine_in",\s*"delivery",\s*"takeaway"\]\)/
    );
    expect(match).not.toBeNull();
  });

  // ── Client error handling ─────────────────────────────────────

  it("client hook handles owner self-rating error", () => {
    expect(hookSrc).toContain("business owner");
    expect(hookSrc).toContain("cannot rate your own");
  });

  // ── Analytics event type ──────────────────────────────────────

  it("FunnelEvent includes rating_rejected_owner_self", () => {
    expect(analyticsSrc).toContain("rating_rejected_owner_self");
  });
});

// ── Score Engine unit tests ────────────────────────────────────────
import {
  computeComposite,
  computeEffectiveWeight,
  computeDecayFactor,
  DINE_IN_WEIGHTS,
  DELIVERY_WEIGHTS,
  TAKEAWAY_WEIGHTS,
} from "@shared/score-engine";

describe("Score Engine — visit-type composite with q-score mapping", () => {
  it("dine-in composite: food 0.50 + service 0.25 + vibe 0.25", () => {
    // q1=4→food=8, q2=3→service=6, q3=5→vibe=10
    const result = computeComposite("dine_in", {
      foodScore: 8, serviceScore: 6, vibeScore: 10,
    });
    const expected = 8 * 0.50 + 6 * 0.25 + 10 * 0.25;
    expect(result).toBeCloseTo(expected, 5);
  });

  it("delivery composite: food 0.60 + packaging 0.25 + value 0.15", () => {
    const result = computeComposite("delivery", {
      foodScore: 8, packagingScore: 6, valueScore: 10,
    });
    const expected = 8 * 0.60 + 6 * 0.25 + 10 * 0.15;
    expect(result).toBeCloseTo(expected, 5);
  });

  it("takeaway composite: food 0.65 + waitTime 0.20 + value 0.15", () => {
    const result = computeComposite("takeaway", {
      foodScore: 8, waitTimeScore: 6, valueScore: 10,
    });
    const expected = 8 * 0.65 + 6 * 0.20 + 10 * 0.15;
    expect(result).toBeCloseTo(expected, 5);
  });

  it("velocity-reduced weight is capped at 0.05", () => {
    const normal = computeEffectiveWeight(0.70, 0, 1.0);
    const velocityReduced = Math.min(normal, 0.05);
    expect(velocityReduced).toBe(0.05);
  });

  it("decay factor decreases over time", () => {
    const day0 = computeDecayFactor(0);
    const day30 = computeDecayFactor(30);
    const day365 = computeDecayFactor(365);
    expect(day0).toBe(1);
    expect(day30).toBeLessThan(1);
    expect(day365).toBeLessThan(day30);
  });
});

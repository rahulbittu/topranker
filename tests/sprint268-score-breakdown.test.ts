/**
 * Sprint 268 — Score Breakdown API + Visit-Type Display Tests
 *
 * Validates:
 * 1. Score breakdown API endpoint exists
 * 2. Route registered in routes.ts
 * 3. Returns visit-type breakdown (dine-in, delivery, takeaway)
 * 4. Returns food-only score, verified %, would-return %
 * 5. ScoreBreakdown component exists and renders visit type rows
 * 6. Business detail page includes ScoreBreakdown component
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 268: Score Breakdown API + Visit-Type Display", () => {
  const routesSrc = readFile("server/routes.ts");
  const breakdownSrc = readFile("server/routes-score-breakdown.ts");
  const componentSrc = readFile("components/business/ScoreBreakdown.tsx");
  const bizPageSrc = readFile("app/business/[id].tsx");

  // ── API Endpoint ──────────────────────────────────────────────

  it("score breakdown route file exists with GET endpoint", () => {
    expect(breakdownSrc).toContain('app.get("/api/businesses/:id/score-breakdown"');
  });

  it("route registered in routes.ts", () => {
    expect(routesSrc).toContain("registerScoreBreakdownRoutes");
    expect(routesSrc).toContain('from "./routes-score-breakdown"');
  });

  it("queries ratings by businessId", () => {
    expect(breakdownSrc).toContain("eq(ratings.businessId, businessId)");
  });

  it("excludes flagged ratings", () => {
    expect(breakdownSrc).toContain("eq(ratings.isFlagged, false)");
  });

  it("groups by visit type", () => {
    expect(breakdownSrc).toContain('r.visitType === "dine_in"');
    expect(breakdownSrc).toContain('r.visitType === "delivery"');
    expect(breakdownSrc).toContain('r.visitType === "takeaway"');
  });

  it("returns food-only score", () => {
    expect(breakdownSrc).toContain("foodScoreOnly");
  });

  it("returns verified percentage", () => {
    expect(breakdownSrc).toContain("verifiedPercentage");
    expect(breakdownSrc).toContain("hasPhoto");
  });

  it("returns would-return percentage", () => {
    expect(breakdownSrc).toContain("wouldReturnPercentage");
    expect(breakdownSrc).toContain("wouldReturn");
  });

  it("returns rater distribution", () => {
    expect(breakdownSrc).toContain("raterDistribution");
  });

  it("handles zero ratings gracefully", () => {
    expect(breakdownSrc).toContain("totalRatings: 0");
  });

  // ── Component ─────────────────────────────────────────────────

  it("ScoreBreakdown component fetches from score-breakdown API", () => {
    expect(componentSrc).toContain("/api/businesses/${businessId}/score-breakdown");
  });

  it("component displays visit type rows", () => {
    expect(componentSrc).toContain("Dine-in");
    expect(componentSrc).toContain("Delivery");
    expect(componentSrc).toContain("Takeaway");
  });

  it("component shows food-only, verified, and return stats", () => {
    expect(componentSrc).toContain("Food Only");
    expect(componentSrc).toContain("Verified");
    expect(componentSrc).toContain("Return");
  });

  it("component returns null for zero ratings", () => {
    expect(componentSrc).toContain("data.totalRatings === 0");
    expect(componentSrc).toContain("return null");
  });

  // ── Business Page Integration ─────────────────────────────────

  it("business detail page imports ScoreBreakdown", () => {
    expect(bizPageSrc).toContain('from "@/components/business/ScoreBreakdown"');
  });

  it("business detail page renders ScoreBreakdown component", () => {
    expect(bizPageSrc).toContain("<ScoreBreakdown");
    expect(bizPageSrc).toContain("businessId={business.id}");
  });
});

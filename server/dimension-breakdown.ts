/**
 * Sprint 484: Dimension Score Breakdown
 *
 * Computes per-dimension average scores and visit type distribution
 * from raw ratings. Pure function — no DB dependencies.
 */

export interface DimensionData {
  food: number;
  service: number;
  vibe: number;
  packaging: number;
  waitTime: number;
  value: number;
}

export interface VisitTypeDistribution {
  dineIn: number;
  delivery: number;
  takeaway: number;
}

export interface DimensionBreakdownResult {
  dimensions: DimensionData;
  visitTypeDistribution: VisitTypeDistribution;
  totalRatings: number;
  primaryVisitType: "dineIn" | "delivery" | "takeaway";
}

interface RatingInput {
  visitType?: string | null;
  foodScore?: string | number | null;
  serviceScore?: string | number | null;
  vibeScore?: string | number | null;
  packagingScore?: string | number | null;
  waitTimeScore?: string | number | null;
  valueScore?: string | number | null;
}

function avgOrZero(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}

function toNum(val: string | number | null | undefined): number | null {
  if (val == null) return null;
  const n = typeof val === "string" ? parseFloat(val) : val;
  return isNaN(n) ? null : n;
}

export function computeDimensionBreakdown(ratings: RatingInput[]): DimensionBreakdownResult {
  const dist: VisitTypeDistribution = { dineIn: 0, delivery: 0, takeaway: 0 };
  const food: number[] = [];
  const service: number[] = [];
  const vibe: number[] = [];
  const packaging: number[] = [];
  const waitTime: number[] = [];
  const value: number[] = [];

  for (const r of ratings) {
    // Visit type distribution
    const vt = (r.visitType || "dine_in").toLowerCase().replace(/[-\s]/g, "_");
    if (vt === "dine_in" || vt === "dinein") dist.dineIn++;
    else if (vt === "delivery") dist.delivery++;
    else if (vt === "takeaway" || vt === "pickup") dist.takeaway++;
    else dist.dineIn++; // default

    // Dimension scores
    const f = toNum(r.foodScore);
    if (f !== null) food.push(f);
    const s = toNum(r.serviceScore);
    if (s !== null) service.push(s);
    const v = toNum(r.vibeScore);
    if (v !== null) vibe.push(v);
    const p = toNum(r.packagingScore);
    if (p !== null) packaging.push(p);
    const w = toNum(r.waitTimeScore);
    if (w !== null) waitTime.push(w);
    const val = toNum(r.valueScore);
    if (val !== null) value.push(val);
  }

  // Determine primary visit type
  const maxVisit = Math.max(dist.dineIn, dist.delivery, dist.takeaway);
  const primaryVisitType: "dineIn" | "delivery" | "takeaway" =
    maxVisit === dist.delivery ? "delivery" :
    maxVisit === dist.takeaway ? "takeaway" : "dineIn";

  return {
    dimensions: {
      food: avgOrZero(food),
      service: avgOrZero(service),
      vibe: avgOrZero(vibe),
      packaging: avgOrZero(packaging),
      waitTime: avgOrZero(waitTime),
      value: avgOrZero(value),
    },
    visitTypeDistribution: dist,
    totalRatings: ratings.length,
    primaryVisitType,
  };
}

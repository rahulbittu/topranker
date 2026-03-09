/**
 * Sprint 164 — Performance Audit: N+1 Fixes, Missing Indexes, Query Optimization
 *
 * Validates:
 * 1. businessPhotos table has index on businessId
 * 2. credibilityPenalties table has index on memberId
 * 3. Featured placements use batch query (not N+1)
 * 4. getBusinessesByIds exists for batch lookups
 * 5. detectAnomalies uses single query for score pattern checks
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Schema indexes — missing indexes added
// ---------------------------------------------------------------------------
describe("Schema indexes — Sprint 164 additions", () => {
  const schemaSrc = readFile("shared/schema.ts");

  it("businessPhotos has index on businessId + sortOrder", () => {
    expect(schemaSrc).toContain("idx_biz_photos_business");
    // Verify it indexes both businessId and sortOrder
    const indexMatch = schemaSrc.match(/idx_biz_photos_business.*\.on\(([^)]+)\)/);
    expect(indexMatch).not.toBeNull();
    expect(indexMatch![1]).toContain("businessId");
    expect(indexMatch![1]).toContain("sortOrder");
  });

  it("credibilityPenalties has index on memberId", () => {
    expect(schemaSrc).toContain("idx_penalties_member");
    const indexMatch = schemaSrc.match(/idx_penalties_member.*\.on\(([^)]+)\)/);
    expect(indexMatch).not.toBeNull();
    expect(indexMatch![1]).toContain("memberId");
  });

  it("ratings indexes still intact", () => {
    expect(schemaSrc).toContain("idx_rat_business");
    expect(schemaSrc).toContain("idx_rat_member");
  });

  it("businesses indexes still intact", () => {
    expect(schemaSrc).toContain("idx_biz_city_cat");
    expect(schemaSrc).toContain("idx_biz_score");
    expect(schemaSrc).toContain("idx_biz_rank");
    expect(schemaSrc).toContain("idx_biz_slug");
  });
});

// ---------------------------------------------------------------------------
// 2. Featured placements — batch query (no N+1)
// ---------------------------------------------------------------------------
describe("Featured placements — batch query optimization", () => {
  const routesSrc = readFile("server/routes.ts");

  it("imports getBusinessesByIds", () => {
    expect(routesSrc).toContain("getBusinessesByIds");
  });

  it("featured route uses getBusinessesByIds for batch lookup", () => {
    const featuredBlock = routesSrc.match(
      /api\/featured[\s\S]{0,800}getBusinessesByIds/,
    );
    expect(featuredBlock).not.toBeNull();
  });

  it("featured route calls getBusinessPhotosMap with all IDs at once", () => {
    const featuredBlock = routesSrc.match(
      /api\/featured[\s\S]{0,800}getBusinessPhotosMap\(bizIds\)/,
    );
    expect(featuredBlock).not.toBeNull();
  });

  it("featured route does NOT call getBusinessById in a loop", () => {
    // Find the featured handler block
    const featuredHandler = routesSrc.match(
      /api\/featured[\s\S]{0,1200}data: featured/,
    );
    expect(featuredHandler).not.toBeNull();
    // It should NOT contain getBusinessById (the N+1 pattern)
    expect(featuredHandler![0]).not.toContain("getBusinessById(p.businessId)");
  });
});

// ---------------------------------------------------------------------------
// 3. getBusinessesByIds batch function
// ---------------------------------------------------------------------------
describe("getBusinessesByIds — batch business lookup", () => {
  const bizStorageSrc = readFile("server/storage/businesses.ts");

  it("exports getBusinessesByIds function", () => {
    expect(bizStorageSrc).toContain("export async function getBusinessesByIds");
  });

  it("accepts string[] parameter", () => {
    const fnMatch = bizStorageSrc.match(
      /getBusinessesByIds\(ids:\s*string\[\]\)/,
    );
    expect(fnMatch).not.toBeNull();
  });

  it("returns early for empty array", () => {
    const fnBlock = bizStorageSrc.match(
      /getBusinessesByIds[\s\S]{0,200}/,
    );
    expect(fnBlock).not.toBeNull();
    expect(fnBlock![0]).toContain("ids.length === 0");
  });

  it("uses ANY array operator for batch query", () => {
    const fnBlock = bizStorageSrc.match(
      /getBusinessesByIds[\s\S]{0,500}/,
    );
    expect(fnBlock).not.toBeNull();
    expect(fnBlock![0]).toContain("ANY(ARRAY[");
  });
});

// ---------------------------------------------------------------------------
// 4. detectAnomalies — combined score pattern query
// ---------------------------------------------------------------------------
describe("detectAnomalies — optimized score pattern detection", () => {
  const ratingsSrc = readFile("server/storage/ratings.ts");

  it("uses FILTER clause for high/low score counts", () => {
    expect(ratingsSrc).toContain("FILTER (WHERE");
    expect(ratingsSrc).toContain(">= 4.8");
    expect(ratingsSrc).toContain("<= 1.5");
  });

  it("computes perfect_score_pattern and one_star_bomber from same query", () => {
    // Both flags should be checked after a single query block
    const patternBlock = ratingsSrc.match(
      /patternStats[\s\S]{0,500}perfect_score_pattern[\s\S]{0,200}one_star_bomber/,
    );
    expect(patternBlock).not.toBeNull();
  });

  it("does NOT have two separate unbounded member rating queries", () => {
    // Count occurrences of the old pattern: selecting rawScore WHERE memberId for anomaly detection
    // The old code had 2 separate queries — one for perfect_score, one for one_star
    const anomalyBlock = ratingsSrc.match(
      /detectAnomalies[\s\S]*?return flags/,
    );
    expect(anomalyBlock).not.toBeNull();
    // Count separate .select({ rawScore: ratings.rawScore }) calls in the anomaly block
    const rawScoreSelects = (anomalyBlock![0].match(/\.select\(\{\s*rawScore:\s*ratings\.rawScore/g) || []);
    // Should be 0 — we replaced those with the FILTER-based count query
    expect(rawScoreSelects.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 5. Existing anomaly flags still present
// ---------------------------------------------------------------------------
describe("Anomaly detection — all flags preserved", () => {
  const ratingsSrc = readFile("server/storage/ratings.ts");

  const expectedFlags = [
    "burst_velocity",
    "perfect_score_pattern",
    "one_star_bomber",
    "single_business_fixation",
    "new_account_high_volume",
    "coordinated_new_account_burst",
  ];

  for (const flag of expectedFlags) {
    it(`preserves "${flag}" flag`, () => {
      expect(ratingsSrc).toContain(`"${flag}"`);
    });
  }
});

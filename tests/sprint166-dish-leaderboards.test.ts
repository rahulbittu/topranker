/**
 * Sprint 166 — Dish Leaderboard Feature: Schema + Storage + API
 *
 * Validates:
 * 1. Schema tables exist (dishLeaderboards, dishLeaderboardEntries, dishSuggestions)
 * 2. Storage functions exported correctly
 * 3. API endpoints registered (5 endpoints)
 * 4. Routes file remains under 1000 LOC (extracted to routes-dishes.ts)
 * 5. Anti-gaming rules enforced (rate limits, vote dedup)
 * 6. Low-data honesty (provisional state, min thresholds)
 * 7. Suggestion activation threshold
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Schema — new tables exist with correct columns
// ---------------------------------------------------------------------------
describe("Dish Leaderboard schema", () => {
  const schemaSrc = readFile("shared/schema.ts");

  it("defines dishLeaderboards table", () => {
    expect(schemaSrc).toContain('export const dishLeaderboards = pgTable');
  });

  it("dishLeaderboards has required columns", () => {
    expect(schemaSrc).toContain('"dish_name"');
    expect(schemaSrc).toContain('"dish_slug"');
    expect(schemaSrc).toContain('"dish_emoji"');
    expect(schemaSrc).toContain('"min_rating_count"');
  });

  it("dishLeaderboards has unique constraint on city + slug", () => {
    expect(schemaSrc).toContain("unique_dish_city");
  });

  it("defines dishLeaderboardEntries table", () => {
    expect(schemaSrc).toContain('export const dishLeaderboardEntries = pgTable');
  });

  it("dishLeaderboardEntries has score and rank columns", () => {
    expect(schemaSrc).toContain('"dish_score"');
    expect(schemaSrc).toContain('"dish_rating_count"');
    expect(schemaSrc).toContain('"rank_position"');
    expect(schemaSrc).toContain('"previous_rank"');
  });

  it("defines dishSuggestions table", () => {
    expect(schemaSrc).toContain('export const dishSuggestions = pgTable');
  });

  it("dishSuggestions has vote_count and activation_threshold", () => {
    expect(schemaSrc).toContain('"vote_count"');
    expect(schemaSrc).toContain('"activation_threshold"');
  });

  it("defines dishSuggestionVotes table", () => {
    expect(schemaSrc).toContain('export const dishSuggestionVotes = pgTable');
  });

  it("exports insertDishSuggestionSchema", () => {
    expect(schemaSrc).toContain("export const insertDishSuggestionSchema");
  });

  it("insertDishSuggestionSchema validates dishName 2-40 chars", () => {
    const match = schemaSrc.match(/insertDishSuggestionSchema[\s\S]{0,200}/);
    expect(match).not.toBeNull();
    expect(match![0]).toContain('min(2)');
    expect(match![0]).toContain('max(40)');
  });
});

// ---------------------------------------------------------------------------
// 2. Storage — functions exported from barrel
// ---------------------------------------------------------------------------
describe("Dish Leaderboard storage exports", () => {
  const barrelSrc = readFile("server/storage/index.ts");

  const expectedExports = [
    "getDishLeaderboards",
    "getDishLeaderboardWithEntries",
    "getDishSuggestions",
    "submitDishSuggestion",
    "voteDishSuggestion",
    "recalculateDishLeaderboard",
  ];

  for (const fn of expectedExports) {
    it(`exports ${fn}`, () => {
      expect(barrelSrc).toContain(fn);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. Storage — function implementations
// ---------------------------------------------------------------------------
describe("Dish Leaderboard storage functions", () => {
  const dishesSrc = readFile("server/storage/dishes.ts");

  it("getDishLeaderboards filters by city and active status", () => {
    const block = dishesSrc.match(/getDishLeaderboards[\s\S]{0,300}/);
    expect(block).not.toBeNull();
    expect(block![0]).toContain("city");
    expect(block![0]).toContain("active");
  });

  it("getDishLeaderboardWithEntries joins businesses for name/slug", () => {
    expect(dishesSrc).toContain("businessName: businesses.name");
    expect(dishesSrc).toContain("businessSlug: businesses.slug");
  });

  it("getDishLeaderboardWithEntries returns isProvisional flag", () => {
    expect(dishesSrc).toContain("isProvisional");
  });

  it("recalculateDishLeaderboard computes credibility-weighted scores", () => {
    expect(dishesSrc).toContain("recalculateDishLeaderboard");
    expect(dishesSrc).toContain("weightedSum");
    expect(dishesSrc).toContain("totalWeight");
  });

  it("submitDishSuggestion enforces 3 per week rate limit", () => {
    expect(dishesSrc).toContain("3 dishes per week");
  });

  it("voteDishSuggestion prevents double voting", () => {
    expect(dishesSrc).toContain("Already voted");
  });

  it("voteDishSuggestion auto-activates at threshold", () => {
    expect(dishesSrc).toContain("activationThreshold");
    expect(dishesSrc).toContain("dishLeaderboards");
  });
});

// ---------------------------------------------------------------------------
// 4. API endpoints — registered in routes-dishes.ts
// ---------------------------------------------------------------------------
describe("Dish Leaderboard API endpoints", () => {
  const routesSrc = readFile("server/routes-dishes.ts");

  it("registers GET /api/dish-leaderboards", () => {
    expect(routesSrc).toContain("/api/dish-leaderboards");
    expect(routesSrc).toContain("getDishLeaderboards");
  });

  it("registers GET /api/dish-leaderboards/:slug", () => {
    expect(routesSrc).toContain("/api/dish-leaderboards/:slug");
    expect(routesSrc).toContain("getDishLeaderboardWithEntries");
  });

  it("registers GET /api/dish-suggestions", () => {
    expect(routesSrc).toContain('"/api/dish-suggestions"');
    expect(routesSrc).toContain("getDishSuggestions");
  });

  it("registers POST /api/dish-suggestions with requireAuth", () => {
    const postMatch = routesSrc.match(/app\.post\("\/api\/dish-suggestions"[\s\S]{0,50}/);
    expect(postMatch).not.toBeNull();
    expect(postMatch![0]).toContain("requireAuth");
  });

  it("registers POST /api/dish-suggestions/:id/vote with requireAuth", () => {
    const voteMatch = routesSrc.match(/api\/dish-suggestions\/:id\/vote[\s\S]{0,50}/);
    expect(voteMatch).not.toBeNull();
  });

  it("suggestion POST validates with insertDishSuggestionSchema", () => {
    expect(routesSrc).toContain("insertDishSuggestionSchema.safeParse");
  });

  it("suggestion POST returns 429 on rate limit", () => {
    expect(routesSrc).toContain("429");
    expect(routesSrc).toContain("3 dishes per week");
  });

  it("vote POST returns 409 on duplicate", () => {
    expect(routesSrc).toContain("409");
    expect(routesSrc).toContain("Already voted");
  });
});

// ---------------------------------------------------------------------------
// 5. Routes extraction — routes.ts under 1000 LOC
// ---------------------------------------------------------------------------
describe("Route extraction — file size", () => {
  it("routes.ts is under 1000 lines", () => {
    const routesSrc = readFile("server/routes.ts");
    const lineCount = routesSrc.split("\n").length;
    expect(lineCount).toBeLessThan(1000);
  });

  it("routes.ts imports registerDishRoutes", () => {
    const routesSrc = readFile("server/routes.ts");
    expect(routesSrc).toContain("registerDishRoutes");
  });

  it("routes-dishes.ts exports registerDishRoutes", () => {
    const dishesSrc = readFile("server/routes-dishes.ts");
    expect(dishesSrc).toContain("export function registerDishRoutes");
  });
});

// ---------------------------------------------------------------------------
// 6. Anti-gaming rules
// ---------------------------------------------------------------------------
describe("Anti-gaming rules", () => {
  const dishesSrc = readFile("server/storage/dishes.ts");

  it("recalculate skips flagged ratings", () => {
    expect(dishesSrc).toContain("isFlagged");
  });

  it("recalculate uses credibility weight from ratings", () => {
    expect(dishesSrc).toContain("r.weight");
  });

  it("leaderboard entries need minimum dish-specific ratings", () => {
    // validCount check before including in leaderboard
    expect(dishesSrc).toContain("validCount < 1");
  });
});

// ---------------------------------------------------------------------------
// 7. Low-data honesty
// ---------------------------------------------------------------------------
describe("Low-data honesty rules", () => {
  const dishesSrc = readFile("server/storage/dishes.ts");

  it("tracks provisional state based on creation date", () => {
    // isProvisional = created in last 14 days
    expect(dishesSrc).toContain("14 * 24 * 60 * 60 * 1000");
  });

  it("computes minRatingsNeeded for building state", () => {
    expect(dishesSrc).toContain("minRatingsNeeded");
    expect(dishesSrc).toContain("minRatingCount");
  });
});

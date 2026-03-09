/**
 * Sprint 177 — Owner Dashboard Rating Responses
 *
 * Validates:
 * 1. Schema — ratingResponses table
 * 2. Storage — CRUD for rating responses
 * 3. API — submit, get, delete endpoints
 * 4. Access control — owner only, Pro only
 * 5. Push notification trigger on response
 * 6. getRatingById helper
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Schema — ratingResponses table
// ---------------------------------------------------------------------------
describe("schema — ratingResponses table", () => {
  const schemaSrc = readFile("shared/schema.ts");

  it("defines ratingResponses table", () => {
    expect(schemaSrc).toContain("export const ratingResponses = pgTable");
  });

  it("has ratingId foreign key", () => {
    expect(schemaSrc).toContain("ratingId:");
    expect(schemaSrc).toContain("rating_id");
  });

  it("has businessId foreign key", () => {
    expect(schemaSrc).toContain('businessId: varchar("business_id")');
  });

  it("has ownerId foreign key", () => {
    expect(schemaSrc).toContain("ownerId:");
    expect(schemaSrc).toContain("owner_id");
  });

  it("has responseText field", () => {
    expect(schemaSrc).toContain("responseText:");
    expect(schemaSrc).toContain("response_text");
  });

  it("has timestamps", () => {
    expect(schemaSrc).toContain("createdAt:");
    expect(schemaSrc).toContain("updatedAt:");
  });

  it("has indexes on ratingId and businessId", () => {
    expect(schemaSrc).toContain("idx_resp_rating");
    expect(schemaSrc).toContain("idx_resp_business");
  });

  it("exports RatingResponse type", () => {
    expect(schemaSrc).toContain("export type RatingResponse");
  });
});

// ---------------------------------------------------------------------------
// 2. Storage — responses.ts
// ---------------------------------------------------------------------------
describe("storage — responses.ts", () => {
  const storageSrc = readFile("server/storage/responses.ts");

  it("exports submitRatingResponse", () => {
    expect(storageSrc).toContain("export async function submitRatingResponse");
  });

  it("exports getRatingResponse", () => {
    expect(storageSrc).toContain("export async function getRatingResponse");
  });

  it("exports getBusinessResponses", () => {
    expect(storageSrc).toContain("export async function getBusinessResponses");
  });

  it("exports getResponsesForRatings", () => {
    expect(storageSrc).toContain("export async function getResponsesForRatings");
  });

  it("exports deleteRatingResponse", () => {
    expect(storageSrc).toContain("export async function deleteRatingResponse");
  });

  it("submitRatingResponse does upsert (update existing)", () => {
    expect(storageSrc).toContain("existing");
    expect(storageSrc).toContain(".update(ratingResponses)");
  });

  it("getResponsesForRatings returns a map keyed by ratingId", () => {
    expect(storageSrc).toContain("map[r.ratingId]");
    expect(storageSrc).toContain("inArray");
  });

  it("deleteRatingResponse checks ownerId", () => {
    expect(storageSrc).toContain("eq(ratingResponses.ownerId, ownerId)");
  });
});

// ---------------------------------------------------------------------------
// 3. Storage barrel exports
// ---------------------------------------------------------------------------
describe("storage barrel — response exports", () => {
  const indexSrc = readFile("server/storage/index.ts");

  it("exports response functions", () => {
    expect(indexSrc).toContain("submitRatingResponse");
    expect(indexSrc).toContain("getRatingResponse");
    expect(indexSrc).toContain("getBusinessResponses");
    expect(indexSrc).toContain("getResponsesForRatings");
    expect(indexSrc).toContain("deleteRatingResponse");
  });

  it("exports getRatingById", () => {
    expect(indexSrc).toContain("getRatingById");
  });
});

// ---------------------------------------------------------------------------
// 4. API endpoints
// ---------------------------------------------------------------------------
describe("API — rating response endpoints", () => {
  const routesSrc = readFile("server/routes-businesses.ts");

  it("has POST /api/ratings/:id/response", () => {
    expect(routesSrc).toContain('"/api/ratings/:id/response"');
    expect(routesSrc).toContain("requireAuth");
  });

  it("has GET /api/ratings/:id/response", () => {
    expect(routesSrc).toContain('app.get("/api/ratings/:id/response"');
  });

  it("has DELETE /api/ratings/:id/response", () => {
    expect(routesSrc).toContain('app.delete("/api/ratings/:id/response"');
  });

  it("submit validates response text length", () => {
    expect(routesSrc).toContain("2-500 characters");
  });

  it("submit sanitizes input to 500 chars", () => {
    expect(routesSrc).toContain("sanitizeString(req.body.responseText, 500)");
  });

  it("submit looks up rating to find business", () => {
    expect(routesSrc).toContain("getRatingById");
  });
});

// ---------------------------------------------------------------------------
// 5. Access control
// ---------------------------------------------------------------------------
describe("rating responses — access control", () => {
  const routesSrc = readFile("server/routes-businesses.ts");

  it("verifies business ownership for submit", () => {
    expect(routesSrc).toContain("Only the business owner can respond to ratings");
  });

  it("requires Pro subscription for submit", () => {
    expect(routesSrc).toContain("Dashboard Pro subscription required");
  });

  it("admin can bypass Pro check", () => {
    expect(routesSrc).toContain("isAdmin");
    expect(routesSrc).toContain("isAdminEmail");
  });

  it("verifies ownership for delete", () => {
    expect(routesSrc).toContain("Only the business owner can delete responses");
  });

  it("get endpoint is public (no requireAuth)", () => {
    // The GET endpoint for responses should be public
    const getLine = routesSrc.indexOf('app.get("/api/ratings/:id/response"');
    const postLine = routesSrc.indexOf('app.post("/api/ratings/:id/response"');
    expect(getLine).toBeGreaterThan(postLine); // GET comes after POST
    // Check that GET line doesn't have requireAuth
    const getSection = routesSrc.substring(getLine, getLine + 100);
    expect(getSection).not.toContain("requireAuth");
  });
});

// ---------------------------------------------------------------------------
// 6. Push notification trigger
// ---------------------------------------------------------------------------
describe("rating responses — push notification", () => {
  const routesSrc = readFile("server/routes-businesses.ts");

  it("sends push notification to original rater", () => {
    expect(routesSrc).toContain("notifyRatingResponse");
  });

  it("looks up rater by memberId", () => {
    expect(routesSrc).toContain("getMemberById(rating.memberId)");
  });

  it("checks rater has push token before sending", () => {
    expect(routesSrc).toContain("rater?.pushToken");
  });

  it("non-blocking notification dispatch", () => {
    expect(routesSrc).toContain("notifyRatingResponse(rater.id, rater.pushToken");
    expect(routesSrc).toContain(".catch(() => {})");
  });
});

// ---------------------------------------------------------------------------
// 7. getRatingById helper
// ---------------------------------------------------------------------------
describe("getRatingById — ratings storage", () => {
  const ratingsSrc = readFile("server/storage/ratings.ts");

  it("exports getRatingById", () => {
    expect(ratingsSrc).toContain("export async function getRatingById");
  });

  it("queries by rating ID", () => {
    expect(ratingsSrc).toContain("eq(ratings.id, id)");
  });
});

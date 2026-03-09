/**
 * Sprint 183 — Rating Edit/Delete + Moderation Queue
 *
 * Validates:
 * 1. Rating edit storage function
 * 2. Rating delete storage function (soft delete)
 * 3. Rating flag submission
 * 4. Auto-flagged moderation queue
 * 5. Admin moderation review
 * 6. API endpoints
 * 7. Storage barrel exports
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Rating edit
// ---------------------------------------------------------------------------
describe("Rating edit — storage", () => {
  const src = readFile("server/storage/ratings.ts");

  it("exports editRating function", () => {
    expect(src).toContain("export async function editRating");
  });

  it("verifies author ownership", () => {
    expect(src).toContain("Cannot edit another user's rating");
  });

  it("enforces 24-hour edit window", () => {
    expect(src).toContain("Edit window has expired (24 hours)");
    expect(src).toContain("hoursSinceCreation > 24");
  });

  it("recalculates rawScore on edit", () => {
    expect(src).toContain("(q1 + q2 + q3) / 3");
  });

  it("recalculates business score after edit", () => {
    expect(src).toContain("recalculateBusinessScore(existing.businessId)");
  });

  it("updates member stats after edit", () => {
    expect(src).toContain("updateMemberStats(memberId)");
  });
});

// ---------------------------------------------------------------------------
// 2. Rating delete (soft)
// ---------------------------------------------------------------------------
describe("Rating delete — soft delete", () => {
  const src = readFile("server/storage/ratings.ts");

  it("exports deleteRating function", () => {
    expect(src).toContain("export async function deleteRating");
  });

  it("verifies author ownership", () => {
    expect(src).toContain("Cannot delete another user's rating");
  });

  it("sets isFlagged to true", () => {
    expect(src).toContain("isFlagged: true");
  });

  it("sets flagReason to user_deleted", () => {
    expect(src).toContain('"user_deleted"');
  });

  it("recalculates business score after delete", () => {
    // After soft-delete, business score should be recalculated
    expect(src).toContain("recalculateBusinessScore(existing.businessId)");
  });
});

// ---------------------------------------------------------------------------
// 3. Rating flag submission
// ---------------------------------------------------------------------------
describe("Rating flag — submitRatingFlag", () => {
  const src = readFile("server/storage/ratings.ts");

  it("exports submitRatingFlag function", () => {
    expect(src).toContain("export async function submitRatingFlag");
  });

  it("prevents self-flagging", () => {
    expect(src).toContain("Cannot flag your own rating");
  });

  it("accepts structured flag reasons", () => {
    expect(src).toContain("q1NoSpecificExperience");
    expect(src).toContain("q2ScoreMismatchNote");
    expect(src).toContain("q3InsiderSuspected");
    expect(src).toContain("q4CoordinatedPattern");
    expect(src).toContain("q5CompetitorBombing");
  });

  it("accepts explanation text", () => {
    expect(src).toContain("explanation");
  });

  it("inserts into ratingFlags table", () => {
    expect(src).toContain("db\n    .insert(ratingFlags)");
  });
});

// ---------------------------------------------------------------------------
// 4. Auto-flagged moderation queue
// ---------------------------------------------------------------------------
describe("Moderation queue — getAutoFlaggedRatings", () => {
  const src = readFile("server/storage/ratings.ts");

  it("exports getAutoFlaggedRatings", () => {
    expect(src).toContain("export async function getAutoFlaggedRatings");
  });

  it("filters for autoFlagged=true and isFlagged=false", () => {
    expect(src).toContain("eq(ratings.autoFlagged, true)");
    expect(src).toContain("eq(ratings.isFlagged, false)");
  });

  it("includes business name in results", () => {
    expect(src).toContain("businessName");
  });

  it("orders by creation date descending", () => {
    expect(src).toContain("desc(ratings.createdAt)");
  });

  it("supports pagination", () => {
    expect(src).toContain("limit(perPage)");
    expect(src).toContain("offset(offset)");
  });
});

// ---------------------------------------------------------------------------
// 5. Admin moderation review
// ---------------------------------------------------------------------------
describe("Moderation — reviewAutoFlaggedRating", () => {
  const src = readFile("server/storage/ratings.ts");

  it("exports reviewAutoFlaggedRating", () => {
    expect(src).toContain("export async function reviewAutoFlaggedRating");
  });

  it("confirm action sets isFlagged=true", () => {
    expect(src).toContain('action === "confirm"');
    expect(src).toContain("isFlagged: true");
  });

  it("dismiss action clears autoFlagged", () => {
    expect(src).toContain("autoFlagged: false");
  });

  it("recalculates after confirmation", () => {
    expect(src).toContain("recalculateBusinessScore(rating.businessId)");
  });
});

// ---------------------------------------------------------------------------
// 6. API endpoints
// ---------------------------------------------------------------------------
describe("Rating API — edit/delete/flag endpoints", () => {
  const routesSrc = readFile("server/routes.ts");

  it("has PATCH /api/ratings/:id for edit", () => {
    expect(routesSrc).toContain('"/api/ratings/:id"');
    expect(routesSrc).toContain("editRating");
  });

  it("has DELETE /api/ratings/:id", () => {
    expect(routesSrc).toContain("deleteRating");
  });

  it("has POST /api/ratings/:id/flag", () => {
    expect(routesSrc).toContain('"/api/ratings/:id/flag"');
    expect(routesSrc).toContain("submitRatingFlag");
  });

  it("broadcasts rating_updated on edit", () => {
    expect(routesSrc).toContain("rating_updated");
  });

  it("broadcasts rating_deleted on delete", () => {
    expect(routesSrc).toContain("rating_deleted");
  });

  it("handles duplicate flag errors", () => {
    expect(routesSrc).toContain("already flagged");
  });
});

describe("Admin moderation endpoints", () => {
  const adminSrc = readFile("server/routes-admin.ts");

  it("has GET /api/admin/moderation-queue", () => {
    expect(adminSrc).toContain('"/api/admin/moderation-queue"');
    expect(adminSrc).toContain("getAutoFlaggedRatings");
  });

  it("has PATCH /api/admin/moderation/:id", () => {
    expect(adminSrc).toContain('"/api/admin/moderation/:id"');
    expect(adminSrc).toContain("reviewAutoFlaggedRating");
  });

  it("validates action parameter", () => {
    expect(adminSrc).toContain("action must be");
    expect(adminSrc).toContain("confirm");
    expect(adminSrc).toContain("dismiss");
  });

  it("requires admin access", () => {
    expect(adminSrc).toContain("requireAdmin");
  });
});

// ---------------------------------------------------------------------------
// 7. Storage barrel exports
// ---------------------------------------------------------------------------
describe("Storage barrel — Sprint 183 exports", () => {
  const indexSrc = readFile("server/storage/index.ts");

  it("exports editRating", () => {
    expect(indexSrc).toContain("editRating");
  });

  it("exports deleteRating", () => {
    expect(indexSrc).toContain("deleteRating");
  });

  it("exports submitRatingFlag", () => {
    expect(indexSrc).toContain("submitRatingFlag");
  });

  it("exports getAutoFlaggedRatings", () => {
    expect(indexSrc).toContain("getAutoFlaggedRatings");
  });

  it("exports reviewAutoFlaggedRating", () => {
    expect(indexSrc).toContain("reviewAutoFlaggedRating");
  });
});

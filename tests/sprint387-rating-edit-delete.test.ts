/**
 * Sprint 387: Rating Edit/Delete Capability
 *
 * Verifies HistoryRow actions (long-press, edit, delete),
 * API functions, and profile integration.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. HistoryRow — edit/delete actions ──────────────────────────────

describe("Sprint 387 — HistoryRow edit/delete", () => {
  const historySrc = readFile("components/profile/HistoryRow.tsx");

  it("exports HistoryRowProps interface", () => {
    expect(historySrc).toContain("export interface HistoryRowProps");
  });

  it("accepts onDelete callback prop", () => {
    expect(historySrc).toContain("onDelete?: (ratingId: string) => void");
  });

  it("has handleLongPress function", () => {
    expect(historySrc).toContain("handleLongPress");
  });

  it("uses onLongPress for action toggle", () => {
    expect(historySrc).toContain("onLongPress={handleLongPress}");
  });

  it("has showActions state", () => {
    expect(historySrc).toContain("showActions");
  });

  it("has handleEdit function", () => {
    expect(historySrc).toContain("handleEdit");
  });

  it("navigates to rate page with editRatingId param", () => {
    expect(historySrc).toContain("editRatingId: r.id");
  });

  it("has handleDelete function with confirmation", () => {
    expect(historySrc).toContain("handleDelete");
    expect(historySrc).toContain("Delete Rating");
  });

  it("uses Alert.alert for delete confirmation", () => {
    expect(historySrc).toContain("Alert.alert");
  });

  it("has 48-hour edit window check", () => {
    expect(historySrc).toContain("hoursAgo <= 48");
  });

  it("shows expired message when edit window passed", () => {
    expect(historySrc).toContain("Edit window expired");
  });

  it("has edit button with create-outline icon", () => {
    expect(historySrc).toContain("create-outline");
    expect(historySrc).toContain("Edit");
  });

  it("has delete button with trash-outline icon", () => {
    expect(historySrc).toContain("trash-outline");
    expect(historySrc).toContain("Delete");
  });

  it("has accessibility hint for long press", () => {
    expect(historySrc).toContain("Long press for edit and delete options");
  });

  it("uses medium haptic for long press", () => {
    expect(historySrc).toContain("ImpactFeedbackStyle.Medium");
  });

  it("has actionRow style", () => {
    expect(historySrc).toContain("actionRow:");
  });

  it("has editBtn and deleteBtn styles", () => {
    expect(historySrc).toContain("editBtn:");
    expect(historySrc).toContain("deleteBtn:");
  });
});

// ── 2. API functions ─────────────────────────────────────────────────

describe("Sprint 387 — rating API functions", () => {
  // Sprint 562: Extracted to api-owner.ts, re-exported from api.ts
  const apiSrc = readFile("lib/api-owner.ts");

  it("exports editRatingApi function", () => {
    expect(apiSrc).toContain("export async function editRatingApi");
  });

  it("exports deleteRatingApi function", () => {
    expect(apiSrc).toContain("export async function deleteRatingApi");
  });

  it("editRatingApi uses PATCH method", () => {
    const editIdx = apiSrc.indexOf("editRatingApi");
    const section = apiSrc.slice(editIdx, editIdx + 400);
    expect(section).toContain("PATCH");
  });

  it("deleteRatingApi uses DELETE method", () => {
    const deleteIdx = apiSrc.indexOf("deleteRatingApi");
    const section = apiSrc.slice(deleteIdx, deleteIdx + 300);
    expect(section).toContain("DELETE");
  });

  it("editRatingApi sends rating updates in body", () => {
    expect(apiSrc).toContain("q1Score?: number");
    expect(apiSrc).toContain("wouldReturn?: boolean");
  });
});

// ── 3. Profile integration ───────────────────────────────────────────

describe("Sprint 387 — profile integration", () => {
  const profileSrc = readFile("app/(tabs)/profile.tsx");

  it("imports deleteRatingApi", () => {
    expect(profileSrc).toContain("deleteRatingApi");
  });

  it("has handleDeleteRating function", () => {
    expect(profileSrc).toContain("handleDeleteRating");
  });

  it("passes onDelete to HistoryRow", () => {
    expect(profileSrc).toContain("onDelete={handleDeleteRating}");
  });

  it("refetches profile after delete", () => {
    expect(profileSrc).toContain("refetch()");
  });
});

// ── 4. Server routes (pre-existing) ─────────────────────────────────

describe("Sprint 387 — server routes exist", () => {
  const routesSrc = readFile("server/routes-ratings.ts");

  it("has PATCH /api/ratings/:id route", () => {
    expect(routesSrc).toContain('app.patch("/api/ratings/:id"');
  });

  it("has DELETE /api/ratings/:id route", () => {
    expect(routesSrc).toContain('app.delete("/api/ratings/:id"');
  });

  it("PATCH route calls editRating", () => {
    expect(routesSrc).toContain("editRating(ratingId");
  });

  it("DELETE route calls deleteRating", () => {
    expect(routesSrc).toContain("deleteRating(req.params.id");
  });
});

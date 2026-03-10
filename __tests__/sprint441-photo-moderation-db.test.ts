/**
 * Sprint 441 — Photo Moderation DB Persistence
 *
 * Validates:
 * 1. Schema: photoSubmissions table in shared/schema.ts
 * 2. Migration: photo-moderation.ts uses DB, not in-memory Map
 * 3. Async API: all moderation functions are async
 * 4. Admin routes: handlers are async
 * 5. Routes-businesses: await submitPhoto
 * 6. Sprint & retro docs exist
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Schema — photoSubmissions table
// ---------------------------------------------------------------------------
describe("Schema — photoSubmissions table", () => {
  const src = readFile("shared/schema.ts");

  it("defines photoSubmissions table", () => {
    expect(src).toContain("export const photoSubmissions = pgTable(");
  });

  it("table name is photo_submissions", () => {
    expect(src).toContain('"photo_submissions"');
  });

  it("has businessId FK to businesses", () => {
    expect(src).toContain("business_id");
    expect(src).toContain("references(() => businesses.id)");
  });

  it("has memberId FK to members", () => {
    // Check the photo_submissions section specifically
    const tableStart = src.indexOf("photoSubmissions = pgTable");
    const tableEnd = src.indexOf(");", tableStart + 200);
    const tableSrc = src.slice(tableStart, tableEnd);
    expect(tableSrc).toContain("member_id");
  });

  it("has status column defaulting to pending", () => {
    const tableStart = src.indexOf("photoSubmissions = pgTable");
    const tableSrc = src.slice(tableStart, tableStart + 800);
    expect(tableSrc).toContain('default("pending")');
  });

  it("has rejectionReason column", () => {
    expect(src).toContain("rejection_reason");
  });

  it("has moderatorId FK", () => {
    const tableStart = src.indexOf("photoSubmissions = pgTable");
    const tableSrc = src.slice(tableStart, tableStart + 800);
    expect(tableSrc).toContain("moderator_id");
  });

  it("has fileSize and mimeType columns", () => {
    const tableStart = src.indexOf("photoSubmissions = pgTable");
    const tableSrc = src.slice(tableStart, tableStart + 800);
    expect(tableSrc).toContain("file_size");
    expect(tableSrc).toContain("mime_type");
  });

  it("has submittedAt and reviewedAt timestamps", () => {
    const tableStart = src.indexOf("photoSubmissions = pgTable");
    const tableSrc = src.slice(tableStart, tableStart + 1200);
    expect(tableSrc).toContain("submitted_at");
    expect(tableSrc).toContain("reviewed_at");
  });

  it("has indexes on businessId, memberId, status, submittedAt", () => {
    expect(src).toContain("idx_photo_sub_business");
    expect(src).toContain("idx_photo_sub_member");
    expect(src).toContain("idx_photo_sub_status");
    expect(src).toContain("idx_photo_sub_submitted");
  });

  it("exports PhotoSubmission type", () => {
    expect(src).toContain("export type PhotoSubmission = typeof photoSubmissions.$inferSelect");
  });
});

// ---------------------------------------------------------------------------
// 2. Migration — photo-moderation.ts uses DB
// ---------------------------------------------------------------------------
describe("Photo moderation — DB migration", () => {
  const src = readFile("server/photo-moderation.ts");

  it("imports db from ./db", () => {
    expect(src).toContain('from "./db"');
  });

  it("imports photoSubmissions from schema", () => {
    expect(src).toContain("photoSubmissions");
    expect(src).toContain("@shared/schema");
  });

  it("imports drizzle-orm operators", () => {
    expect(src).toContain("from \"drizzle-orm\"");
    expect(src).toContain("eq");
    expect(src).toContain("desc");
    expect(src).toContain("and");
  });

  it("does NOT use in-memory Map", () => {
    expect(src).not.toContain("new Map<");
    expect(src).not.toContain("submissions.set(");
    expect(src).not.toContain("submissions.get(");
    expect(src).not.toContain("submissions.clear()");
    expect(src).not.toContain("submissions.values()");
  });

  it("does NOT export clearSubmissions (no longer needed)", () => {
    expect(src).not.toContain("export function clearSubmissions");
  });

  it("does NOT have MAX_SUBMISSIONS cap (DB scales)", () => {
    expect(src).not.toContain("MAX_SUBMISSIONS");
  });

  it("uses db.insert for submitPhoto", () => {
    expect(src).toContain(".insert(photoSubmissions)");
  });

  it("uses db.update for approve/reject", () => {
    expect(src).toContain(".update(photoSubmissions)");
  });

  it("uses db.select for queries", () => {
    expect(src).toContain(".select()");
    expect(src).toContain(".from(photoSubmissions)");
  });

  it("uses .returning() for insert and update", () => {
    const returnCount = (src.match(/\.returning\(/g) || []).length;
    expect(returnCount).toBeGreaterThanOrEqual(3); // insert + approve + reject
  });
});

// ---------------------------------------------------------------------------
// 3. Async API — all functions are async
// ---------------------------------------------------------------------------
describe("Photo moderation — async functions", () => {
  const src = readFile("server/photo-moderation.ts");

  it("submitPhoto is async returning Promise", () => {
    expect(src).toContain("async function submitPhoto");
    expect(src).toContain("Promise<PhotoSubmissionRow");
  });

  it("approvePhoto is async returning Promise<boolean>", () => {
    expect(src).toContain("async function approvePhoto");
    expect(src).toContain("Promise<boolean>");
  });

  it("rejectPhoto is async returning Promise<boolean>", () => {
    expect(src).toContain("async function rejectPhoto");
  });

  it("getPendingPhotos is async", () => {
    expect(src).toContain("async function getPendingPhotos");
  });

  it("getPhotosByBusiness is async", () => {
    expect(src).toContain("async function getPhotosByBusiness");
  });

  it("getPhotoStats is async", () => {
    expect(src).toContain("async function getPhotoStats");
  });

  it("getAllowedMimeTypes and getMaxFileSize are synchronous (no DB)", () => {
    // These are pure utilities — should NOT be async
    expect(src).not.toContain("async function getAllowedMimeTypes");
    expect(src).not.toContain("async function getMaxFileSize");
  });
});

// ---------------------------------------------------------------------------
// 4. Admin routes — async handlers
// ---------------------------------------------------------------------------
describe("Admin photo routes — async handlers", () => {
  const src = readFile("server/routes-admin-photos.ts");

  it("pending handler is async", () => {
    expect(src).toContain("async (req, res)");
  });

  it("approve handler awaits approvePhoto", () => {
    expect(src).toContain("await approvePhoto");
  });

  it("reject handler awaits rejectPhoto", () => {
    expect(src).toContain("await rejectPhoto");
  });

  it("business photos handler awaits getPhotosByBusiness", () => {
    expect(src).toContain("await getPhotosByBusiness");
  });

  it("stats handler awaits getPhotoStats", () => {
    expect(src).toContain("await getPhotoStats");
  });
});

// ---------------------------------------------------------------------------
// 5. Routes-businesses — await submitPhoto
// ---------------------------------------------------------------------------
describe("Routes-businesses — async photo submission", () => {
  const src = readFile("server/routes-businesses.ts");

  it("awaits submitPhoto call", () => {
    expect(src).toContain("await submitPhoto(");
  });

  it("comments reference Sprint 441 DB migration", () => {
    expect(src).toContain("Sprint 441");
    expect(src).toContain("DB-backed");
  });
});

// ---------------------------------------------------------------------------
// 6. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 441 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-441-PHOTO-MODERATION-DB.md");
    expect(src).toContain("Sprint 441");
    expect(src).toContain("Photo Moderation");
    expect(src).toContain("DB");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-441-PHOTO-MODERATION-DB.md");
    expect(src).toContain("Retro 441");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-441-PHOTO-MODERATION-DB.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 442");
  });
});

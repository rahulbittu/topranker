/**
 * Sprint 254 — Photo Moderation Pipeline (updated Sprint 441: DB persistence)
 *
 * Validates:
 * 1. Photo moderation source analysis (12 tests)
 * 2. Photo moderation DB patterns (16 tests)
 * 3. Admin photo routes static (8 tests)
 * 4. Integration wiring (4 tests)
 *
 * Note: Sprint 441 migrated to DB — all tests are source-based (no runtime imports)
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Photo moderation — source analysis (12 tests)
// ---------------------------------------------------------------------------
describe("Photo moderation — server/photo-moderation.ts (static)", () => {
  const src = readFile("server/photo-moderation.ts");

  it("module file exists", () => {
    expect(fileExists("server/photo-moderation.ts")).toBe(true);
  });

  it("exports submitPhoto", () => {
    expect(src).toContain("export async function submitPhoto");
  });

  it("exports approvePhoto", () => {
    expect(src).toContain("export async function approvePhoto");
  });

  it("exports rejectPhoto", () => {
    expect(src).toContain("export async function rejectPhoto");
  });

  it("exports getPendingPhotos", () => {
    expect(src).toContain("export async function getPendingPhotos");
  });

  it("exports getPhotosByBusiness", () => {
    expect(src).toContain("export async function getPhotosByBusiness");
  });

  it("exports getPhotoStats", () => {
    expect(src).toContain("export async function getPhotoStats");
  });

  it("exports getAllowedMimeTypes", () => {
    expect(src).toContain("export function getAllowedMimeTypes");
  });

  it("exports getMaxFileSize", () => {
    expect(src).toContain("export function getMaxFileSize");
  });

  it("ALLOWED_MIME_TYPES includes jpeg, png, webp", () => {
    expect(src).toContain('"image/jpeg"');
    expect(src).toContain('"image/png"');
    expect(src).toContain('"image/webp"');
  });

  it("MAX_FILE_SIZE is 10MB", () => {
    expect(src).toContain("10 * 1024 * 1024");
  });

  it("uses logger with PhotoModeration tag", () => {
    expect(src).toContain('log.tag("PhotoModeration")');
  });
});

// ---------------------------------------------------------------------------
// 2. Photo moderation — DB patterns (16 tests)
// Sprint 441: Replaces in-memory runtime tests
// ---------------------------------------------------------------------------
describe("Photo moderation — DB persistence patterns", () => {
  const src = readFile("server/photo-moderation.ts");

  it("validates MIME type before insert", () => {
    expect(src).toContain("ALLOWED_MIME_TYPES.includes(mimeType)");
  });

  it("validates file size before insert", () => {
    expect(src).toContain("fileSize > MAX_FILE_SIZE");
  });

  it("validates caption length", () => {
    expect(src).toContain("caption.length > MAX_CAPTION_LENGTH");
  });

  it("returns error object for invalid MIME", () => {
    expect(src).toContain("Invalid mime type");
  });

  it("returns error object for oversized file", () => {
    expect(src).toContain("File too large");
  });

  it("returns error object for long caption", () => {
    expect(src).toContain("Caption too long");
  });

  it("sets approved status in approvePhoto", () => {
    expect(src).toContain('status: "approved"');
  });

  it("sets rejected status with reason in rejectPhoto", () => {
    expect(src).toContain('status: "rejected"');
    expect(src).toContain("rejectionReason: reason");
  });

  it("approvePhoto returns false if not found", () => {
    expect(src).toContain("result.length === 0) return false");
  });

  it("filters pending for getPendingPhotos", () => {
    expect(src).toContain('eq(photoSubmissions.status, "pending")');
  });

  it("getPhotosByBusiness filters by businessId and approved", () => {
    expect(src).toContain("eq(photoSubmissions.businessId, businessId)");
    expect(src).toContain('eq(photoSubmissions.status, "approved")');
  });

  it("getPhotoStats computes counts from all rows", () => {
    expect(src).toContain("allRows.length");
    expect(src).toContain("allRows.filter");
  });

  it("tracks rejection reasons in stats", () => {
    expect(src).toContain("byReason");
    expect(src).toContain("s.rejectionReason");
  });

  it("uses crypto.randomUUID for IDs", () => {
    expect(src).toContain("crypto.randomUUID()");
  });

  it("sets reviewedAt on approve/reject", () => {
    expect(src).toContain("reviewedAt: new Date()");
  });

  it("sets moderatorNote on approve/reject", () => {
    expect(src).toContain("moderatorNote: note || null");
  });
});

// ---------------------------------------------------------------------------
// 3. Admin photo routes — static analysis (8 tests)
// ---------------------------------------------------------------------------
describe("Admin photo routes — server/routes-admin-photos.ts (static)", () => {
  const src = readFile("server/routes-admin-photos.ts");

  it("module file exists", () => {
    expect(fileExists("server/routes-admin-photos.ts")).toBe(true);
  });

  it("exports registerAdminPhotoRoutes", () => {
    expect(src).toContain("export function registerAdminPhotoRoutes");
  });

  it("registers GET /api/admin/photos/pending", () => {
    expect(src).toContain("/api/admin/photos/pending");
  });

  it("registers GET /api/admin/photos/stats", () => {
    expect(src).toContain("/api/admin/photos/stats");
  });

  it("registers POST /api/admin/photos/:id/approve", () => {
    expect(src).toContain("/api/admin/photos/:id/approve");
  });

  it("registers POST /api/admin/photos/:id/reject", () => {
    expect(src).toContain("/api/admin/photos/:id/reject");
  });

  it("registers GET /api/photos/business/:businessId", () => {
    expect(src).toContain("/api/photos/business/:businessId");
  });

  it("imports from photo-moderation module", () => {
    expect(src).toContain("./photo-moderation");
  });
});

// ---------------------------------------------------------------------------
// 4. Integration wiring (4 tests)
// ---------------------------------------------------------------------------
describe("Integration — routes-admin.ts wiring", () => {
  const adminSrc = readFile("server/routes-admin.ts");

  it("routes-admin.ts imports registerAdminPhotoRoutes", () => {
    expect(adminSrc).toContain("registerAdminPhotoRoutes");
  });

  it("routes-admin.ts imports from routes-admin-photos", () => {
    expect(adminSrc).toContain("./routes-admin-photos");
  });

  it("routes-admin.ts calls registerAdminPhotoRoutes(app)", () => {
    expect(adminSrc).toContain("registerAdminPhotoRoutes(app)");
  });

  it("photo-moderation module uses crypto.randomUUID for IDs", () => {
    const src = readFile("server/photo-moderation.ts");
    expect(src).toContain("crypto.randomUUID()");
  });
});

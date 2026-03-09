/**
 * Sprint 254 — Photo Moderation Pipeline
 *
 * Validates:
 * 1. Photo moderation static analysis (12 tests)
 * 2. Photo moderation runtime (16 tests)
 * 3. Admin photo routes static (8 tests)
 * 4. Integration wiring (4 tests)
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  submitPhoto,
  approvePhoto,
  rejectPhoto,
  getPendingPhotos,
  getPhotosByBusiness,
  getPhotoStats,
  getAllowedMimeTypes,
  getMaxFileSize,
  clearSubmissions,
} from "../server/photo-moderation";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Photo moderation — static analysis (12 tests)
// ---------------------------------------------------------------------------
describe("Photo moderation — server/photo-moderation.ts (static)", () => {
  it("module file exists", () => {
    expect(fileExists("server/photo-moderation.ts")).toBe(true);
  });

  it("exports submitPhoto", () => {
    expect(typeof submitPhoto).toBe("function");
  });

  it("exports approvePhoto", () => {
    expect(typeof approvePhoto).toBe("function");
  });

  it("exports rejectPhoto", () => {
    expect(typeof rejectPhoto).toBe("function");
  });

  it("exports getPendingPhotos", () => {
    expect(typeof getPendingPhotos).toBe("function");
  });

  it("exports getPhotosByBusiness", () => {
    expect(typeof getPhotosByBusiness).toBe("function");
  });

  it("exports getPhotoStats", () => {
    expect(typeof getPhotoStats).toBe("function");
  });

  it("exports getAllowedMimeTypes", () => {
    expect(typeof getAllowedMimeTypes).toBe("function");
  });

  it("exports getMaxFileSize", () => {
    expect(typeof getMaxFileSize).toBe("function");
  });

  it("ALLOWED_MIME_TYPES includes jpeg, png, webp", () => {
    const types = getAllowedMimeTypes();
    expect(types).toContain("image/jpeg");
    expect(types).toContain("image/png");
    expect(types).toContain("image/webp");
  });

  it("MAX_FILE_SIZE is 10MB", () => {
    expect(getMaxFileSize()).toBe(10 * 1024 * 1024);
  });

  it("uses logger with PhotoModeration tag", () => {
    const src = readFile("server/photo-moderation.ts");
    expect(src).toContain('log.tag("PhotoModeration")');
  });
});

// ---------------------------------------------------------------------------
// 2. Photo moderation — runtime (16 tests)
// ---------------------------------------------------------------------------
describe("Photo moderation — runtime", () => {
  beforeEach(() => {
    clearSubmissions();
  });

  it("submitPhoto returns a submission with pending status", () => {
    const result = submitPhoto("biz1", "mem1", "https://img.test/1.jpg", "Great food", 500_000, "image/jpeg");
    expect(result).toHaveProperty("id");
    expect((result as any).status).toBe("pending");
    expect((result as any).businessId).toBe("biz1");
    expect((result as any).memberId).toBe("mem1");
  });

  it("submitPhoto rejects invalid mime type", () => {
    const result = submitPhoto("biz1", "mem1", "https://img.test/1.gif", "Pic", 500_000, "image/gif");
    expect(result).toHaveProperty("error");
    expect((result as any).error).toContain("Invalid mime type");
  });

  it("submitPhoto rejects file too large", () => {
    const result = submitPhoto("biz1", "mem1", "https://img.test/1.jpg", "Big", 15_000_000, "image/jpeg");
    expect(result).toHaveProperty("error");
    expect((result as any).error).toContain("File too large");
  });

  it("submitPhoto rejects caption too long", () => {
    const longCaption = "x".repeat(501);
    const result = submitPhoto("biz1", "mem1", "https://img.test/1.jpg", longCaption, 500_000, "image/jpeg");
    expect(result).toHaveProperty("error");
    expect((result as any).error).toContain("Caption too long");
  });

  it("approvePhoto changes status to approved", () => {
    const sub = submitPhoto("biz1", "mem1", "https://img.test/1.jpg", "Nice", 500_000, "image/jpeg") as any;
    const success = approvePhoto(sub.id, "mod1", "Looks good");
    expect(success).toBe(true);
    const stats = getPhotoStats();
    expect(stats.approved).toBe(1);
  });

  it("rejectPhoto changes status to rejected with reason", () => {
    const sub = submitPhoto("biz1", "mem1", "https://img.test/1.jpg", "Spam pic", 500_000, "image/jpeg") as any;
    const success = rejectPhoto(sub.id, "mod1", "spam", "Obvious spam");
    expect(success).toBe(true);
    const stats = getPhotoStats();
    expect(stats.rejected).toBe(1);
    expect(stats.byReason["spam"]).toBe(1);
  });

  it("approvePhoto returns false for non-existent photo", () => {
    expect(approvePhoto("nonexistent", "mod1")).toBe(false);
  });

  it("rejectPhoto returns false for non-existent photo", () => {
    expect(rejectPhoto("nonexistent", "mod1", "spam")).toBe(false);
  });

  it("approvePhoto returns false for already-reviewed photo", () => {
    const sub = submitPhoto("biz1", "mem1", "https://img.test/1.jpg", "Test", 500_000, "image/jpeg") as any;
    approvePhoto(sub.id, "mod1");
    expect(approvePhoto(sub.id, "mod2")).toBe(false);
  });

  it("rejectPhoto returns false for already-approved photo", () => {
    const sub = submitPhoto("biz1", "mem1", "https://img.test/1.jpg", "Test", 500_000, "image/jpeg") as any;
    approvePhoto(sub.id, "mod1");
    expect(rejectPhoto(sub.id, "mod2", "low_quality")).toBe(false);
  });

  it("getPendingPhotos returns only pending submissions", () => {
    submitPhoto("biz1", "mem1", "https://img.test/1.jpg", "A", 500_000, "image/jpeg");
    const sub2 = submitPhoto("biz1", "mem1", "https://img.test/2.jpg", "B", 500_000, "image/png") as any;
    approvePhoto(sub2.id, "mod1");
    const pending = getPendingPhotos();
    expect(pending.length).toBe(1);
    expect(pending[0].caption).toBe("A");
  });

  it("getPendingPhotos respects limit", () => {
    for (let i = 0; i < 5; i++) {
      submitPhoto("biz1", "mem1", `https://img.test/${i}.jpg`, `Cap ${i}`, 500_000, "image/jpeg");
    }
    expect(getPendingPhotos(3).length).toBe(3);
  });

  it("getPhotosByBusiness returns only approved photos for that business", () => {
    const sub1 = submitPhoto("biz1", "mem1", "https://img.test/1.jpg", "A", 500_000, "image/jpeg") as any;
    submitPhoto("biz1", "mem1", "https://img.test/2.jpg", "B", 500_000, "image/jpeg"); // pending
    submitPhoto("biz2", "mem1", "https://img.test/3.jpg", "C", 500_000, "image/jpeg"); // different biz
    approvePhoto(sub1.id, "mod1");
    const photos = getPhotosByBusiness("biz1");
    expect(photos.length).toBe(1);
    expect(photos[0].caption).toBe("A");
  });

  it("getPhotoStats returns correct counts", () => {
    const s1 = submitPhoto("biz1", "m1", "https://img.test/1.jpg", "A", 500_000, "image/jpeg") as any;
    const s2 = submitPhoto("biz1", "m1", "https://img.test/2.jpg", "B", 500_000, "image/jpeg") as any;
    submitPhoto("biz1", "m1", "https://img.test/3.jpg", "C", 500_000, "image/jpeg");
    approvePhoto(s1.id, "mod1");
    rejectPhoto(s2.id, "mod1", "low_quality");
    const stats = getPhotoStats();
    expect(stats.total).toBe(3);
    expect(stats.pending).toBe(1);
    expect(stats.approved).toBe(1);
    expect(stats.rejected).toBe(1);
    expect(stats.byReason["low_quality"]).toBe(1);
  });

  it("clearSubmissions empties the store", () => {
    submitPhoto("biz1", "m1", "https://img.test/1.jpg", "A", 500_000, "image/jpeg");
    clearSubmissions();
    expect(getPhotoStats().total).toBe(0);
  });

  it("getAllowedMimeTypes returns a defensive copy", () => {
    const types1 = getAllowedMimeTypes();
    types1.push("image/bmp");
    const types2 = getAllowedMimeTypes();
    expect(types2).not.toContain("image/bmp");
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
describe("Integration — routes.ts wiring", () => {
  const routesSrc = readFile("server/routes.ts");

  it("routes.ts imports registerAdminPhotoRoutes", () => {
    expect(routesSrc).toContain("registerAdminPhotoRoutes");
  });

  it("routes.ts imports from routes-admin-photos", () => {
    expect(routesSrc).toContain("./routes-admin-photos");
  });

  it("routes.ts calls registerAdminPhotoRoutes(app)", () => {
    expect(routesSrc).toContain("registerAdminPhotoRoutes(app)");
  });

  it("photo-moderation module uses crypto.randomUUID for IDs", () => {
    const src = readFile("server/photo-moderation.ts");
    expect(src).toContain("crypto.randomUUID()");
  });
});

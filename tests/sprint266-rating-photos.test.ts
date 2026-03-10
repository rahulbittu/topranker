/**
 * Sprint 266 — Rating Photo Upload Tests
 *
 * Validates:
 * 1. rating_photos table exists in schema
 * 2. Photo upload route registered in routes.ts
 * 3. Photo route validates ownership and file type
 * 4. Verification boost messaging in UI
 * 5. Client hook handles async photo upload
 * 6. File storage abstraction supports photo uploads
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 266: Rating Photo Upload", () => {
  const schemaSrc = readFile("shared/schema.ts");
  const routesSrc = readFile("server/routes.ts");
  const photoRoutesSrc = readFile("server/routes-rating-photos.ts");
  const hookSrc = readFile("lib/hooks/useRatingSubmit.ts");
  const extrasSrc = readFile("components/rate/RatingExtrasStep.tsx");
  const rateSrc = readFile("app/rate/[id].tsx");
  const archSrc = readFile("docs/ARCHITECTURE.md");

  // ── Schema ─────────────────────────────────────────────────────

  it("rating_photos table exists in schema.ts", () => {
    expect(schemaSrc).toContain('pgTable(\n  "rating_photos"');
    expect(schemaSrc).toContain("ratingId:");
    expect(schemaSrc).toContain("photoUrl:");
    expect(schemaSrc).toContain("cdnKey:");
    expect(schemaSrc).toContain("isVerifiedReceipt:");
  });

  it("RatingPhoto type is exported", () => {
    expect(schemaSrc).toContain("export type RatingPhoto");
  });

  it("ARCHITECTURE.md lists rating_photos table", () => {
    expect(archSrc).toContain("rating_photos");
    expect(archSrc).toContain("34 Tables"); // Sprint 542: +receipt_analysis
  });

  // ── Route Registration ──────────────────────────────────────────

  it("routes.ts imports and registers rating photo routes", () => {
    expect(routesSrc).toContain("registerRatingPhotoRoutes");
    expect(routesSrc).toContain('from "./routes-rating-photos"');
  });

  // ── Photo Upload Route ──────────────────────────────────────────

  it("photo route has POST /api/ratings/:id/photo endpoint", () => {
    expect(photoRoutesSrc).toContain('app.post("/api/ratings/:id/photo"');
  });

  it("photo route has GET /api/ratings/:id/photos endpoint", () => {
    expect(photoRoutesSrc).toContain('app.get("/api/ratings/:id/photos"');
  });

  it("photo route requires authentication", () => {
    expect(photoRoutesSrc).toContain("requireAuth");
  });

  it("photo route validates file ownership", () => {
    expect(photoRoutesSrc).toContain("rating.memberId !== memberId");
    expect(photoRoutesSrc).toContain("Cannot upload photo for another user");
  });

  it("photo route validates MIME types", () => {
    expect(photoRoutesSrc).toContain("image/jpeg");
    expect(photoRoutesSrc).toContain("image/png");
    expect(photoRoutesSrc).toContain("image/webp");
    expect(photoRoutesSrc).toContain("ALLOWED_MIME_TYPES");
  });

  it("photo route validates file size (max 10MB)", () => {
    expect(photoRoutesSrc).toContain("MAX_FILE_SIZE");
    expect(photoRoutesSrc).toContain("10 * 1024 * 1024");
  });

  it("photo route uses fileStorage for CDN upload", () => {
    expect(photoRoutesSrc).toContain("fileStorage.upload");
    expect(photoRoutesSrc).toContain('from "./file-storage"');
  });

  it("photo route computes verification boost", () => {
    expect(photoRoutesSrc).toContain("PHOTO_BOOST");
    expect(photoRoutesSrc).toContain("0.15"); // +15%
    expect(photoRoutesSrc).toContain("MAX_VERIFICATION_BOOST");
    expect(photoRoutesSrc).toContain("0.50"); // 50% cap
  });

  it("photo route creates rating_photos record", () => {
    expect(photoRoutesSrc).toContain("ratingPhotos");
    expect(photoRoutesSrc).toContain("db.insert(ratingPhotos)");
  });

  it("photo route triggers score recalculation", () => {
    expect(photoRoutesSrc).toContain("recalculateBusinessScore");
    expect(photoRoutesSrc).toContain("recalculateRanks");
  });

  it("photo route supports receipt flag", () => {
    expect(photoRoutesSrc).toContain("isReceipt");
    expect(photoRoutesSrc).toContain("isVerifiedReceipt");
    expect(photoRoutesSrc).toContain("0.25"); // receipt +25%
  });

  // ── Client Integration ──────────────────────────────────────────

  it("useRatingSubmit hook accepts photoUri parameter", () => {
    expect(hookSrc).toContain("photoUri: string | null");
    const match = hookSrc.match(/interface UseRatingSubmitOptions[\s\S]{0,500}photoUri/);
    expect(match).not.toBeNull();
  });

  it("hook triggers async photo upload on success", () => {
    expect(hookSrc).toContain("uploadRatingPhoto");
    expect(hookSrc).toContain("photoUri && ratingId");
  });

  it("uploadRatingPhoto function exists", () => {
    expect(hookSrc).toContain("async function uploadRatingPhoto");
    expect(hookSrc).toContain("/api/ratings/${ratingId}/photo");
  });

  it("photo upload is non-blocking (async, doesn't block confirmation)", () => {
    // Should use .then().catch() pattern, not await
    expect(hookSrc).toContain("uploadRatingPhoto(ratingId, photoUri).then(");
    expect(hookSrc).toContain(".catch(() =>");
  });

  it("rate screen passes photoUri to hook", () => {
    const match = rateSrc.match(/useRatingSubmit\(\{[\s\S]{0,500}photoUri/);
    expect(match).not.toBeNull();
  });

  // ── UI Verification Boost Messaging ─────────────────────────────

  // Sprint 424→466: boost meter + visit-type prompts (PhotoTips replaced)
  it("photo section includes boost meter and prompts", () => {
    expect(extrasSrc).toContain("PhotoBoostMeter");
    expect(extrasSrc).toContain("getPhotoPromptsByVisitType");
  });

  it("photo preview shows index badge", () => {
    expect(extrasSrc).toContain("photoIndexBadge");
    expect(extrasSrc).toContain("photoIndexText");
  });
});

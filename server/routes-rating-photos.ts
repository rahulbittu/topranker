/**
 * Sprint 266: Rating Photo Upload Routes
 * POST /api/ratings/:id/photo — async photo upload after rating submission
 *
 * Rating Integrity Part 4: Photo upload = +15% verification boost (capped at 50% total)
 * Design: Photo upload is async — doesn't block rating submission
 *
 * Owner: Sarah Nakamura (Lead Eng) + Nadia Kaur (Cybersecurity)
 */

import type { Express, Request, Response } from "express";
import { wrapAsync } from "./wrap-async";
import { requireAuth } from "./middleware";
import { sanitizeString } from "./sanitize";
import { fileStorage } from "./file-storage";
import { log } from "./logger";
import crypto from "crypto";

const photoLog = log.tag("RatingPhoto");

// Validation constants
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const PHOTO_BOOST = 0.15; // +15% verification boost for photos
const MAX_VERIFICATION_BOOST = 0.50; // Cap per Rating Integrity Part 4

export function registerRatingPhotoRoutes(app: Express): void {
  /**
   * POST /api/ratings/:id/photo
   * Accepts base64-encoded photo, uploads to CDN, creates rating_photos record.
   * Updates rating verification boost and triggers score recalculation.
   */
  app.post("/api/ratings/:id/photo", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const ratingId = req.params.id;
    const memberId = req.user!.id;

    // Validate rating exists and belongs to this user
    const { getRatingById } = await import("./storage/ratings");
    const rating = await getRatingById(ratingId);
    if (!rating) {
      return res.status(404).json({ error: "Rating not found" });
    }
    if (rating.memberId !== memberId) {
      return res.status(403).json({ error: "Cannot upload photo for another user's rating" });
    }

    // Validate photo data
    const { data: photoData, mimeType: rawMime, isReceipt } = req.body;
    const mimeType = sanitizeString(rawMime, 50) || "image/jpeg";

    if (!photoData || typeof photoData !== "string") {
      return res.status(400).json({ error: "Photo data is required (base64)" });
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return res.status(400).json({ error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}` });
    }

    // Decode and validate size
    const buffer = Buffer.from(photoData, "base64");
    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({ error: "Photo too large (max 10MB)" });
    }
    if (buffer.length < 1024) {
      return res.status(400).json({ error: "Photo too small — may be corrupted" });
    }

    // Generate CDN key
    const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
    const cdnKey = `rating-photos/${rating.businessId}/${ratingId}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    try {
      // Upload to storage (local in dev, R2 in prod)
      const photoUrl = await fileStorage.upload(cdnKey, buffer, mimeType);

      // Create rating_photos record
      const { db } = await import("./db");
      const { ratingPhotos, ratings } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");

      const [photo] = await db.insert(ratingPhotos).values({
        ratingId,
        photoUrl,
        cdnKey,
        isVerifiedReceipt: isReceipt === true,
      }).returning();

      // Compute verification boost
      // Photo = +15%, Receipt = +25% (if flagged as receipt), capped at 50%
      const photoBoost = PHOTO_BOOST;
      const receiptBoost = isReceipt === true ? 0.25 : 0;
      const totalBoost = Math.min(photoBoost + receiptBoost, MAX_VERIFICATION_BOOST);

      // Sprint 267: Update rating with photo verification signals
      const currentBoost = parseFloat(String(rating.verificationBoost ?? "0"));
      const newBoost = Math.min(currentBoost + totalBoost, MAX_VERIFICATION_BOOST);
      await db.update(ratings).set({
        hasPhoto: true,
        hasReceipt: isReceipt === true ? true : undefined,
        verificationBoost: newBoost.toFixed(3),
      }).where(eq(ratings.id, ratingId));

      // Trigger business score recalculation
      const { recalculateBusinessScore, recalculateRanks } = await import("./storage/businesses");
      const { getBusinessById } = await import("./storage");
      await recalculateBusinessScore(rating.businessId);
      const biz = await getBusinessById(rating.businessId);
      if (biz) await recalculateRanks(biz.city, biz.category);

      photoLog.info("Rating photo uploaded", {
        ratingId,
        memberId,
        cdnKey,
        isReceipt: isReceipt === true,
        boost: totalBoost,
      });

      return res.status(201).json({
        data: {
          id: photo.id,
          photoUrl,
          isReceipt: isReceipt === true,
          verificationBoost: totalBoost,
        },
      });
    } catch (err: any) {
      photoLog.error("Photo upload failed", { ratingId, error: err.message });
      return res.status(500).json({ error: "Photo upload failed. Please try again." });
    }
  }));

  /**
   * GET /api/ratings/:id/photos
   * Get all photos for a rating.
   */
  app.get("/api/ratings/:id/photos", wrapAsync(async (req: Request, res: Response) => {
    const ratingId = req.params.id;
    const { db } = await import("./db");
    const { ratingPhotos } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");

    const photos = await db.select().from(ratingPhotos).where(eq(ratingPhotos.ratingId, ratingId));
    return res.json({ data: photos });
  }));
}

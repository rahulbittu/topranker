/**
 * QR Code Routes — Sprint 178
 *
 * Endpoints:
 * - GET  /api/businesses/:slug/qr — Generate QR code data for a business
 * - POST /api/qr/scan — Record a QR scan event
 * - GET  /api/businesses/:slug/qr-stats — QR scan analytics (owner/admin only)
 */

import type { Express, Request, Response } from "express";
import { wrapAsync } from "./wrap-async";
import { requireAuth } from "./middleware";
import { getBusinessBySlug } from "./storage";
import { sanitizeString } from "./sanitize";
import { log } from "./logger";
import { config } from "./config";

const qrLog = log.tag("QR");

const SITE_URL = config.siteUrl;

export function registerQrRoutes(app: Express) {
  /**
   * Generate QR code payload for a business.
   * Returns the data needed for client-side QR rendering:
   * - URL to encode
   * - Business metadata for display
   * - QR styling configuration
   */
  app.get("/api/businesses/:slug/qr", wrapAsync(async (req: Request, res: Response) => {
    const business = await getBusinessBySlug(req.params.slug as string);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    const rateUrl = `${SITE_URL}/rate/${business.slug}?source=qr`;
    const profileUrl = `${SITE_URL}/business/${business.slug}`;

    return res.json({
      data: {
        businessId: business.id,
        businessName: business.name,
        businessSlug: business.slug,
        rateUrl,
        profileUrl,
        qrConfig: {
          data: rateUrl,
          width: 300,
          height: 300,
          dotsOptions: {
            color: "#0D1B2A",
            type: "rounded",
          },
          cornersSquareOptions: {
            color: "#C49A1A",
            type: "extra-rounded",
          },
          cornersDotOptions: {
            color: "#C49A1A",
            type: "dot",
          },
          backgroundOptions: {
            color: "#FFFFFF",
          },
        },
        printTemplate: {
          headline: `Rate ${business.name}`,
          subline: "Scan to rate on TopRanker",
          footer: "topranker.io",
        },
      },
    });
  }));

  /**
   * Record a QR scan event.
   * Called when a user scans a QR code — tracks for analytics.
   * Optional auth: logged-in users get memberId recorded.
   */
  app.post("/api/qr/scan", wrapAsync(async (req: Request, res: Response) => {
    const businessId = sanitizeString(req.body.businessId, 100);
    if (!businessId) {
      return res.status(400).json({ error: "businessId is required" });
    }

    const { getBusinessById } = await import("./storage");
    const business = await getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    const { recordQrScan } = await import("./storage");
    const memberId = req.user?.id || null;
    const scan = await recordQrScan(businessId, memberId);

    qrLog.info(`QR scan: business=${business.name}, member=${memberId || "anonymous"}`);

    return res.json({
      data: {
        scanId: scan.id,
        businessSlug: business.slug,
        businessName: business.name,
      },
    });
  }));

  /**
   * QR scan analytics for business owners.
   * Shows total scans, conversion rate, and recent scan activity.
   */
  app.get("/api/businesses/:slug/qr-stats", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const business = await getBusinessBySlug(req.params.slug as string);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Verify ownership or admin
    const { isAdminEmail } = await import("@shared/admin");
    const isOwner = business.ownerId && business.ownerId === req.user!.id;
    const isAdmin = isAdminEmail(req.user?.email);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "QR stats require business ownership" });
    }

    const { getQrScanStats } = await import("./storage");
    const stats = await getQrScanStats(business.id);

    return res.json({ data: stats });
  }));
}

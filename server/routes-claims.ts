/**
 * Claim routes — extracted from routes-businesses.ts (Sprint 659)
 *
 * Endpoints:
 * - POST /api/businesses/:slug/claim
 * - POST /api/businesses/claims/:claimId/verify
 */

import type { Express, Request, Response } from "express";
import { getBusinessBySlug } from "./storage";
import { sanitizeString } from "./sanitize";
import { wrapAsync } from "./wrap-async";
import { requireAuth } from "./middleware";
import { claimVerifyRateLimiter } from "./rate-limiter";

export function registerClaimRoutes(app: Express) {
  // ── Business Claims ────────────────────────────────────────
  app.post("/api/businesses/:slug/claim", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const business = await getBusinessBySlug(req.params.slug as string);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    const role = sanitizeString(req.body.role, 100);
    const phone = sanitizeString(req.body.phone, 20);
    const businessEmail = sanitizeString(req.body.businessEmail, 100);
    const website = sanitizeString(req.body.website, 200);
    const preferredMethod = sanitizeString(req.body.verificationMethod, 20) || "email";
    if (!role || role.length === 0) {
      return res.status(400).json({ error: "Role is required" });
    }

    const { getClaimByMemberAndBusiness, submitClaim, submitClaimWithCode } = await import("./storage");
    const existing = await getClaimByMemberAndBusiness(req.user!.id, business.id);
    if (existing) {
      return res.status(409).json({ error: "You already have a pending or approved claim for this business" });
    }

    // Sprint 394: Enhanced verification data
    const parts = [`role:${role}`, `method:${preferredMethod}`];
    if (phone) parts.push(`phone:${phone}`);
    if (businessEmail) parts.push(`email:${businessEmail}`);
    if (website) parts.push(`website:${website}`);
    const verificationMethod = parts.join(" | ");

    // Sprint 649: Email verification path — generate code + send verification email
    if (preferredMethod === "email" && businessEmail) {
      const claim = await submitClaimWithCode(business.id, req.user!.id, verificationMethod);
      const { sendClaimVerificationCodeEmail, sendClaimAdminNotification } = await import("./email");
      sendClaimVerificationCodeEmail({
        email: businessEmail,
        displayName: req.user!.displayName || "User",
        businessName: business.name,
        code: claim.verificationCode || "",
      }).catch(() => {});
      sendClaimAdminNotification({
        businessName: business.name,
        claimantName: req.user!.displayName || "Unknown",
        claimantEmail: req.user!.email || "",
      }).catch(() => {});
      return res.json({ data: { id: claim.id, status: claim.status, requiresCode: true } });
    }

    // Non-email path — manual admin review
    const claim = await submitClaim(business.id, req.user!.id, verificationMethod);
    const { sendClaimConfirmationEmail, sendClaimAdminNotification } = await import("./email");
    sendClaimConfirmationEmail({
      email: req.user!.email || "",
      displayName: req.user!.displayName || "User",
      businessName: business.name,
    }).catch(() => {});
    sendClaimAdminNotification({
      businessName: business.name,
      claimantName: req.user!.displayName || "Unknown",
      claimantEmail: req.user!.email || "",
    }).catch(() => {});

    return res.json({ data: { id: claim.id, status: claim.status } });
  }));

  // Sprint 649: Verify business claim with 6-digit code
  // Sprint 657: IP-based rate limiting (5 req/min) + auth + attempt lockout (server-side, max 5)
  app.post("/api/businesses/claims/:claimId/verify", claimVerifyRateLimiter, requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { claimId } = req.params;
    const code = sanitizeString(req.body.code, 6);
    if (!code || code.length !== 6) {
      return res.status(400).json({ error: "6-digit verification code required" });
    }

    const { verifyClaimByCode } = await import("./storage");
    const result = await verifyClaimByCode(claimId, req.user!.id, code);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Send approval email
    const { getClaimByMemberAndBusiness } = await import("./storage");
    const { sendClaimApprovedEmail } = await import("./email");
    sendClaimApprovedEmail({
      email: req.user!.email || "",
      displayName: req.user!.displayName || "User",
      businessName: "your business",
    }).catch(() => {});

    return res.json({ data: { verified: true } });
  }));
}

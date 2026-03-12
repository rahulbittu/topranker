/**
 * Payment routes — extracted from routes.ts per Arch Audit #8.
 * Handles Challenger, Dashboard Pro, and Featured Placement.
 * Pricing sourced from shared/pricing.ts (single source of truth).
 */
import type { Express, Request, Response } from "express";
import { wrapAsync } from "./wrap-async";
import { getBusinessBySlug, createPaymentRecord, createFeaturedPlacement, getPaymentById, updatePaymentStatus, expireFeaturedByPayment } from "./storage";
import { sendPaymentReceiptEmail } from "./email";
import { broadcast } from "./sse";
import { config } from "./config";
import { log } from "./logger";
import { sanitizeString, sanitizeSlug } from "./sanitize";
import { paymentRateLimiter } from "./rate-limiter";
import { requireAuth } from "./middleware";

export function registerPaymentRoutes(app: Express) {
  // Apply strict rate limiting to all payment routes (20 req/min per IP)
  app.use("/api/payments", paymentRateLimiter);

  app.post("/api/payments/challenger", requireAuth, wrapAsync(async (req: Request, res: Response) => {
      const businessName = sanitizeString(req.body.businessName, 100);
      const slug = sanitizeSlug(req.body.slug);
      if (!businessName || !slug) {
        return res.status(400).json({ error: "businessName and slug are required" });
      }
      const business = await getBusinessBySlug(slug);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      const { createChallengerPayment } = await import("./payments");
      const payment = await createChallengerPayment({
        challengerId: business.id,
        businessName,
        customerEmail: req.user!.email || "",
        userId: req.user!.id,
      });
      // Record in audit trail
      await createPaymentRecord({
        memberId: req.user!.id,
        businessId: business.id,
        type: "challenger_entry",
        amount: payment.amount,
        stripePaymentIntentId: payment.id,
        status: payment.status,
        metadata: payment.metadata,
      });
      // Send receipt email (fire-and-forget)
      sendPaymentReceiptEmail({
        email: req.user!.email || "",
        displayName: req.user!.displayName || "Member",
        type: "challenger_entry",
        amount: payment.amount,
        businessName,
        paymentId: payment.id,
      }).catch(() => {});
      return res.json({ data: payment });
  }));

  // Sprint 176: Subscription checkout for Dashboard Pro
  app.post("/api/payments/dashboard-pro", requireAuth, wrapAsync(async (req: Request, res: Response) => {
      const slug = sanitizeSlug(req.body.slug);
      if (!slug) {
        return res.status(400).json({ error: "slug is required" });
      }
      const business = await getBusinessBySlug(slug);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }

      // Verify caller owns the business
      if (business.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Only the business owner can subscribe" });
      }

      // Check for existing active subscription
      if (business.subscriptionStatus === "active") {
        return res.status(409).json({ error: "Business already has an active subscription" });
      }

      const { createDashboardProSubscription } = await import("./payments");
      const siteUrl = config.siteUrl;
      const checkout = await createDashboardProSubscription({
        businessId: business.id,
        businessName: business.name,
        customerEmail: req.user!.email || "",
        userId: req.user!.id,
        stripeCustomerId: business.stripeCustomerId || undefined,
        successUrl: `${siteUrl}/business/${slug}/dashboard?subscription=success`,
        cancelUrl: `${siteUrl}/business/${slug}/dashboard?subscription=cancelled`,
      });

      // Record the checkout in audit trail
      await createPaymentRecord({
        memberId: req.user!.id,
        businessId: business.id,
        type: "dashboard_pro",
        amount: 4900, // $49 — actual charge happens via Stripe webhook
        stripePaymentIntentId: checkout.id,
        status: checkout.status === "succeeded" ? "succeeded" : "pending",
        metadata: { checkoutSessionId: checkout.id },
      });

      // In dev mode (mock), immediately activate the subscription
      if (!checkout.url) {
        const { updateBusinessSubscription } = await import("./storage");
        await updateBusinessSubscription(business.id, {
          subscriptionStatus: "active",
          stripeCustomerId: `mock_cus_${Date.now()}`,
          stripeSubscriptionId: `mock_sub_${Date.now()}`,
          subscriptionPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
      }

      return res.json({ data: { id: checkout.id, url: checkout.url, status: checkout.status } });
  }));

  // Sprint 176: Subscription status check
  app.get("/api/payments/subscription-status/:slug", requireAuth, wrapAsync(async (req: Request, res: Response) => {
      const business = await getBusinessBySlug(req.params.slug as string);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      return res.json({
        data: {
          subscriptionStatus: business.subscriptionStatus || "none",
          subscriptionPeriodEnd: business.subscriptionPeriodEnd,
          isActive: business.subscriptionStatus === "active" || business.subscriptionStatus === "trialing",
        },
      });
  }));

  // Sprint 176: Cancel subscription
  app.post("/api/payments/subscription-cancel/:slug", requireAuth, wrapAsync(async (req: Request, res: Response) => {
      const business = await getBusinessBySlug(req.params.slug as string);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      if (business.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Only the business owner can cancel" });
      }
      if (!business.stripeSubscriptionId) {
        return res.status(400).json({ error: "No active subscription to cancel" });
      }
      const { cancelSubscription } = await import("./payments");
      await cancelSubscription(business.stripeSubscriptionId);
      const { updateBusinessSubscription } = await import("./storage");
      await updateBusinessSubscription(business.id, { subscriptionStatus: "cancelled" });
      log.info(`Subscription cancelled: business=${business.id} by user=${req.user!.id}`);
      return res.json({ data: { cancelled: true } });
  }));

  app.post("/api/payments/featured", requireAuth, wrapAsync(async (req: Request, res: Response) => {
      const slug = sanitizeSlug(req.body.slug);
      if (!slug) {
        return res.status(400).json({ error: "slug is required" });
      }
      const business = await getBusinessBySlug(slug);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      const { createFeaturedPlacementPayment } = await import("./payments");
      const payment = await createFeaturedPlacementPayment({
        businessId: business.id,
        businessName: business.name,
        city: business.city,
        customerEmail: req.user!.email || "",
        userId: req.user!.id,
      });
      const paymentRecord = await createPaymentRecord({
        memberId: req.user!.id,
        businessId: business.id,
        type: "featured_placement",
        amount: payment.amount,
        stripePaymentIntentId: payment.id,
        status: payment.status,
        metadata: payment.metadata,
      });
      // Create active featured placement (7-day window)
      if (payment.status === "succeeded") {
        await createFeaturedPlacement({
          businessId: business.id,
          paymentId: paymentRecord.id,
          city: business.city,
        });
        broadcast("featured_updated", { businessId: business.id, city: business.city });
      }
      sendPaymentReceiptEmail({
        email: req.user!.email || "",
        displayName: req.user!.displayName || "Member",
        type: "featured_placement",
        amount: payment.amount,
        businessName: business.name,
        paymentId: payment.id,
      }).catch(() => {});
      return res.json({ data: payment });
  }));

  // Cancel a subscription/payment — checks ownership BEFORE mutating
  app.post("/api/payments/cancel", requireAuth, wrapAsync(async (req: Request, res: Response) => {
      const { paymentId } = req.body;
      if (!paymentId) {
        return res.status(400).json({ error: "paymentId is required" });
      }
      // Check existence and ownership before mutation
      const existing = await getPaymentById(paymentId);
      if (!existing) {
        return res.status(404).json({ error: "Payment not found" });
      }
      if (existing.memberId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized to cancel this payment" });
      }
      const updated = await updatePaymentStatus(paymentId, "cancelled");
      // If this was a featured placement payment, expire the placement too
      if (existing.type === "featured_placement") {
        await expireFeaturedByPayment(paymentId).catch(() => {});
        broadcast("featured_updated", { cancelled: true });
      }
      log.info(`Payment ${paymentId} cancelled by ${req.user!.id}`);
      return res.json({ data: { id: updated!.id, status: "cancelled" } });
  }));
}

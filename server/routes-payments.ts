/**
 * Payment routes — extracted from routes.ts per Arch Audit #8.
 * Handles Challenger ($99), Dashboard Pro ($49/mo), and Featured Placement ($199/week).
 */
import type { Express, Request, Response } from "express";
import { getBusinessBySlug, createPaymentRecord, createFeaturedPlacement, getPaymentById, updatePaymentStatus } from "./storage";
import { sendPaymentReceiptEmail } from "./email";
import { log } from "./logger";

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export function registerPaymentRoutes(app: Express) {
  app.post("/api/payments/challenger", requireAuth, async (req: Request, res: Response) => {
    try {
      const { businessName, slug } = req.body;
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
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/payments/dashboard-pro", requireAuth, async (req: Request, res: Response) => {
    try {
      const { slug } = req.body;
      if (!slug) {
        return res.status(400).json({ error: "slug is required" });
      }
      const business = await getBusinessBySlug(slug);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      const { createDashboardProPayment } = await import("./payments");
      const payment = await createDashboardProPayment({
        businessId: business.id,
        businessName: business.name,
        customerEmail: req.user!.email || "",
        userId: req.user!.id,
      });
      await createPaymentRecord({
        memberId: req.user!.id,
        businessId: business.id,
        type: "dashboard_pro",
        amount: payment.amount,
        stripePaymentIntentId: payment.id,
        status: payment.status,
        metadata: payment.metadata,
      });
      sendPaymentReceiptEmail({
        email: req.user!.email || "",
        displayName: req.user!.displayName || "Member",
        type: "dashboard_pro",
        amount: payment.amount,
        businessName: business.name,
        paymentId: payment.id,
      }).catch(() => {});
      return res.json({ data: payment });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/payments/featured", requireAuth, async (req: Request, res: Response) => {
    try {
      const { slug } = req.body;
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
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Cancel a subscription/payment — checks ownership BEFORE mutating
  app.post("/api/payments/cancel", requireAuth, async (req: Request, res: Response) => {
    try {
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
      log.info(`Payment ${paymentId} cancelled by ${req.user!.id}`);
      return res.json({ data: { id: updated!.id, status: "cancelled" } });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });
}

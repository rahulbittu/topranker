/**
 * Sprint 542: Admin Receipt Review Routes
 *
 * Endpoints:
 * - GET  /api/admin/receipts/pending  — list receipts awaiting review
 * - GET  /api/admin/receipts/stats    — receipt analysis statistics
 * - POST /api/admin/receipts/:id/verify — mark receipt as verified
 * - POST /api/admin/receipts/:id/reject — mark receipt as rejected
 *
 * Owner: Sarah Nakamura (Lead Eng)
 */

import type { Express, Request, Response } from "express";
import { wrapAsync } from "./wrap-async";
import { requireAuth } from "./middleware";

function requireAdmin(req: Request, res: Response, next: Function) {
  if (!req.user || (req.user as any).role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
import {
  getPendingReceipts,
  getReceiptAnalysisStats,
  verifyReceipt,
  rejectReceipt,
} from "./receipt-analysis";
import { log } from "./logger";

const adminReceiptLog = log.tag("AdminReceipts");

export function registerAdminReceiptRoutes(app: Express): void {
  app.get("/api/admin/receipts/pending", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const receipts = await getPendingReceipts(limit);
    adminReceiptLog.info(`Fetched ${receipts.length} pending receipts`);
    return res.json({ data: receipts });
  }));

  app.get("/api/admin/receipts/stats", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const stats = await getReceiptAnalysisStats();
    return res.json({ data: stats });
  }));

  app.post("/api/admin/receipts/:id/verify", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const analysisId = req.params.id;
    const reviewerId = req.user!.id;
    const { businessName, amount, date, items, confidence, matchScore, note } = req.body;

    const result = {
      businessName: businessName || undefined,
      amount: amount ? parseFloat(amount) : undefined,
      date: date ? new Date(date) : undefined,
      items: items || undefined,
      confidence: parseFloat(confidence) || 0.5,
      matchScore: parseFloat(matchScore) || 0.5,
    };

    const success = await verifyReceipt(analysisId, reviewerId, result, note);
    if (!success) {
      return res.status(404).json({ error: "Receipt analysis not found or already reviewed" });
    }
    adminReceiptLog.info(`Receipt ${analysisId} verified by ${reviewerId}`);
    return res.json({ data: { id: analysisId, status: "verified" } });
  }));

  app.post("/api/admin/receipts/:id/reject", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const analysisId = req.params.id;
    const reviewerId = req.user!.id;
    const { note } = req.body;

    if (!note || typeof note !== "string") {
      return res.status(400).json({ error: "Rejection note is required" });
    }

    const success = await rejectReceipt(analysisId, reviewerId, note);
    if (!success) {
      return res.status(404).json({ error: "Receipt analysis not found or already reviewed" });
    }
    adminReceiptLog.info(`Receipt ${analysisId} rejected by ${reviewerId}`);
    return res.json({ data: { id: analysisId, status: "rejected" } });
  }));
}

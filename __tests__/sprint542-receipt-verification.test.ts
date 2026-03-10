/**
 * Sprint 542: Rating Receipt Verification — Photo Proof Upload + OCR Prep
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 542: Receipt Verification OCR Prep", () => {
  describe("Receipt Analysis Schema", () => {
    const src = readFile("shared/schema.ts");

    it("defines receiptAnalysis table", () => {
      expect(src).toContain("export const receiptAnalysis = pgTable");
      expect(src).toContain('"receipt_analysis"');
    });

    it("has ratingPhotoId foreign key", () => {
      expect(src).toContain("rating_photo_id");
      expect(src).toContain("ratingPhotos.id");
    });

    it("has ratingId and businessId foreign keys", () => {
      expect(src).toContain("rating_id");
      expect(src).toContain("business_id");
    });

    it("has OCR result fields", () => {
      expect(src).toContain("extracted_business_name");
      expect(src).toContain("extracted_amount");
      expect(src).toContain("extracted_date");
      expect(src).toContain("extracted_items");
    });

    it("has confidence and matchScore fields", () => {
      expect(src).toContain("confidence");
      expect(src).toContain("match_score");
    });

    it("has review tracking fields", () => {
      expect(src).toContain("reviewed_by");
      expect(src).toContain("reviewed_at");
      expect(src).toContain("review_note");
    });

    it("has status with default pending", () => {
      expect(src).toContain('"pending"');
    });

    it("has indexes on ratingId and status", () => {
      expect(src).toContain("idx_receipt_analysis_rating");
      expect(src).toContain("idx_receipt_analysis_status");
    });

    it("exports ReceiptAnalysis type", () => {
      expect(src).toContain("export type ReceiptAnalysis");
    });

    it("schema stays under 1000 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(1000);
    });
  });

  describe("Receipt Analysis Service", () => {
    const src = readFile("server/receipt-analysis.ts");

    it("exports queueReceiptForAnalysis function", () => {
      expect(src).toContain("export async function queueReceiptForAnalysis");
    });

    it("queueReceiptForAnalysis inserts into receiptAnalysis", () => {
      expect(src).toContain("insert(receiptAnalysis)");
      expect(src).toContain("ratingPhotoId");
      expect(src).toContain("ratingId");
      expect(src).toContain("businessId");
    });

    it("exports getPendingReceipts function", () => {
      expect(src).toContain("export async function getPendingReceipts");
    });

    it("getPendingReceipts joins with businesses and ratingPhotos", () => {
      expect(src).toContain("innerJoin(ratingPhotos");
      expect(src).toContain("innerJoin(businesses");
    });

    it("exports verifyReceipt function", () => {
      expect(src).toContain("export async function verifyReceipt");
    });

    it("verifyReceipt stores extracted data and reviewer info", () => {
      expect(src).toContain("extractedBusinessName");
      expect(src).toContain("extractedAmount");
      expect(src).toContain("reviewedBy");
      expect(src).toContain("reviewedAt");
    });

    it("exports rejectReceipt function", () => {
      expect(src).toContain("export async function rejectReceipt");
    });

    it("exports getReceiptAnalysisStats function", () => {
      expect(src).toContain("export async function getReceiptAnalysisStats");
    });

    it("stats returns total, pending, verified, rejected, avgConfidence", () => {
      expect(src).toContain("total");
      expect(src).toContain("pending");
      expect(src).toContain("verified");
      expect(src).toContain("rejected");
      expect(src).toContain("avgConfidence");
    });

    it("defines OCRProvider interface for V2", () => {
      expect(src).toContain("export interface OCRProvider");
      expect(src).toContain("analyzeReceipt");
    });

    it("has processReceiptOCR stub", () => {
      expect(src).toContain("export async function processReceiptOCR");
      expect(src).toContain("not yet implemented");
    });

    it("defines ReceiptStatus type", () => {
      expect(src).toContain("export type ReceiptStatus");
      expect(src).toContain("analyzing");
      expect(src).toContain("inconclusive");
    });

    it("defines ReceiptAnalysisResult interface", () => {
      expect(src).toContain("export interface ReceiptAnalysisResult");
      expect(src).toContain("businessName");
      expect(src).toContain("amount");
      expect(src).toContain("confidence");
      expect(src).toContain("matchScore");
    });
  });

  describe("Photo Upload — Receipt Queue Integration", () => {
    const src = readFile("server/routes-rating-photos.ts");

    it("queues receipt for analysis when isReceipt is true", () => {
      expect(src).toContain("queueReceiptForAnalysis");
    });

    it("imports from receipt-analysis module", () => {
      expect(src).toContain("./receipt-analysis");
    });

    it("only queues when isReceipt is true", () => {
      expect(src).toContain("if (isReceipt === true)");
    });

    it("passes photo.id, ratingId, and businessId", () => {
      expect(src).toContain("photo.id");
      expect(src).toContain("ratingId");
      expect(src).toContain("rating.businessId");
    });
  });

  describe("Admin Receipt Review Routes", () => {
    const src = readFile("server/routes-admin-receipts.ts");

    it("exports registerAdminReceiptRoutes function", () => {
      expect(src).toContain("export function registerAdminReceiptRoutes");
    });

    it("has GET /api/admin/receipts/pending endpoint", () => {
      expect(src).toContain("/api/admin/receipts/pending");
      expect(src).toContain("getPendingReceipts");
    });

    it("has GET /api/admin/receipts/stats endpoint", () => {
      expect(src).toContain("/api/admin/receipts/stats");
      expect(src).toContain("getReceiptAnalysisStats");
    });

    it("has POST /api/admin/receipts/:id/verify endpoint", () => {
      expect(src).toContain("/api/admin/receipts/:id/verify");
      expect(src).toContain("verifyReceipt");
    });

    it("has POST /api/admin/receipts/:id/reject endpoint", () => {
      expect(src).toContain("/api/admin/receipts/:id/reject");
      expect(src).toContain("rejectReceipt");
    });

    it("requires auth and admin authentication", () => {
      expect(src).toContain("requireAuth");
      expect(src).toContain("requireAdmin");
    });

    it("reject requires a note", () => {
      expect(src).toContain("Rejection note is required");
    });
  });

  describe("Route Registration", () => {
    const src = readFile("server/routes.ts");

    it("imports registerAdminReceiptRoutes", () => {
      expect(src).toContain("registerAdminReceiptRoutes");
      expect(src).toContain("./routes-admin-receipts");
    });

    it("registers admin receipt routes", () => {
      expect(src).toContain("registerAdminReceiptRoutes(app)");
    });
  });
});

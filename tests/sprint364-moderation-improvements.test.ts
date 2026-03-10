import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 364: Admin moderation queue improvements", () => {
  const queueSrc = readFile("server/moderation-queue.ts");
  const routesSrc = readFile("server/routes-admin-moderation.ts");

  // ── Filtered queue ────────────────────────────────────────

  describe("Filtered queue function", () => {
    it("should export getFilteredItems function", () => {
      expect(queueSrc).toContain("export function getFilteredItems");
    });

    it("should filter by status", () => {
      expect(queueSrc).toContain("opts.status");
      expect(queueSrc).toContain("i.status === opts.status");
    });

    it("should filter by content type", () => {
      expect(queueSrc).toContain("opts.contentType");
      expect(queueSrc).toContain("i.contentType === opts.contentType");
    });

    it("should sort by violation count when requested", () => {
      expect(queueSrc).toContain("sortByViolations");
      expect(queueSrc).toContain("b.violations.length - a.violations.length");
    });

    it("should respect limit parameter", () => {
      expect(queueSrc).toContain("opts.limit || 50");
    });
  });

  // ── Bulk actions ──────────────────────────────────────────

  describe("Bulk approve/reject", () => {
    it("should export bulkApprove function", () => {
      expect(queueSrc).toContain("export function bulkApprove");
    });

    it("should export bulkReject function", () => {
      expect(queueSrc).toContain("export function bulkReject");
    });

    it("should return approved/notFound counts from bulkApprove", () => {
      expect(queueSrc).toContain("{ approved, notFound }");
    });

    it("should return rejected/notFound counts from bulkReject", () => {
      expect(queueSrc).toContain("{ rejected, notFound }");
    });

    it("should iterate over item IDs", () => {
      expect(queueSrc).toContain("for (const id of itemIds)");
    });
  });

  // ── Resolved items ────────────────────────────────────────

  describe("Resolved items history", () => {
    it("should export getResolvedItems function", () => {
      expect(queueSrc).toContain("export function getResolvedItems");
    });

    it("should filter for approved or rejected status", () => {
      expect(queueSrc).toContain('i.status === "approved" || i.status === "rejected"');
    });
  });

  // ── Routes ────────────────────────────────────────────────

  describe("New API routes", () => {
    it("should have filtered queue endpoint", () => {
      expect(routesSrc).toContain('"/api/admin/moderation/filtered"');
    });

    it("should have resolved items endpoint", () => {
      expect(routesSrc).toContain('"/api/admin/moderation/resolved"');
    });

    it("should have member moderation endpoint", () => {
      expect(routesSrc).toContain('"/api/admin/moderation/member/:memberId"');
    });

    it("should have bulk approve endpoint", () => {
      expect(routesSrc).toContain('"/api/admin/moderation/bulk-approve"');
    });

    it("should have bulk reject endpoint", () => {
      expect(routesSrc).toContain('"/api/admin/moderation/bulk-reject"');
    });

    it("should validate ids array for bulk approve", () => {
      const bulkApproveSection = routesSrc.slice(routesSrc.indexOf("bulk-approve"));
      expect(bulkApproveSection).toContain("Array.isArray(ids)");
      expect(bulkApproveSection).toContain("ids array required");
    });

    it("should enforce 100-item limit on bulk actions", () => {
      expect(routesSrc).toContain("ids.length > 100");
      expect(routesSrc).toContain("Maximum 100 items per bulk action");
    });

    it("should support sort=violations query param", () => {
      expect(routesSrc).toContain('req.query.sort === "violations"');
    });

    it("should support status query param on filtered endpoint", () => {
      expect(routesSrc).toContain("req.query.status");
    });

    it("should support contentType query param on filtered endpoint", () => {
      expect(routesSrc).toContain("req.query.contentType");
    });
  });

  // ── Imports updated ───────────────────────────────────────

  describe("Route imports", () => {
    it("should import getFilteredItems", () => {
      expect(routesSrc).toContain("getFilteredItems");
    });

    it("should import bulkApprove", () => {
      expect(routesSrc).toContain("bulkApprove");
    });

    it("should import bulkReject", () => {
      expect(routesSrc).toContain("bulkReject");
    });

    it("should import getResolvedItems", () => {
      expect(routesSrc).toContain("getResolvedItems");
    });

    it("should import getItemsByMember", () => {
      expect(routesSrc).toContain("getItemsByMember");
    });
  });

  // ── Existing functionality preserved ─────────────────────

  describe("Existing endpoints preserved", () => {
    it("should still have queue endpoint", () => {
      expect(routesSrc).toContain('"/api/admin/moderation/queue"');
    });

    it("should still have stats endpoint", () => {
      expect(routesSrc).toContain('"/api/admin/moderation/stats"');
    });

    it("should still have approve endpoint", () => {
      expect(routesSrc).toContain('"/api/admin/moderation/:id/approve"');
    });

    it("should still have reject endpoint", () => {
      expect(routesSrc).toContain('"/api/admin/moderation/:id/reject"');
    });

    it("should still have business endpoint", () => {
      expect(routesSrc).toContain('"/api/admin/moderation/business/:businessId"');
    });
  });
});

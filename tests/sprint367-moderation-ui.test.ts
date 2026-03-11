import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 367: Admin moderation queue UI", () => {
  const modSrc = readFile("app/admin/moderation.tsx");
  const cardSrc = readFile("components/admin/ModerationItemCard.tsx");
  const allSrc = modSrc + "\n" + cardSrc;

  // ── Component structure ───────────────────────────────────

  describe("ModerationScreen component", () => {
    it("should export default ModerationScreen", () => {
      expect(modSrc).toContain("export default function ModerationScreen");
    });

    it("should have ModerationItem interface", () => {
      expect(allSrc).toContain("interface ModerationItem");
    });

    it("should have QueueStats interface", () => {
      expect(modSrc).toContain("interface QueueStats");
    });

    it("should define ContentType type", () => {
      expect(modSrc).toContain('type ContentType = "review" | "photo" | "reply"');
    });
  });

  // ── Stats display ─────────────────────────────────────────

  describe("Queue stats", () => {
    it("should use useQueueStats hook", () => {
      expect(modSrc).toContain("useQueueStats");
    });

    it("should display pending count", () => {
      expect(modSrc).toContain("pending");
    });

    it("should display approved count", () => {
      expect(modSrc).toContain("approved");
    });

    it("should display rejected count", () => {
      expect(modSrc).toContain("rejected");
    });

    it("should display total count", () => {
      expect(modSrc).toContain("total");
    });

    it("should fetch from admin moderation stats endpoint", () => {
      expect(modSrc).toContain("/api/admin/moderation/stats");
    });
  });

  // ── Filtering ─────────────────────────────────────────────

  describe("Filter functionality", () => {
    it("should have status filter state", () => {
      expect(modSrc).toContain("statusFilter");
      expect(modSrc).toContain("setStatusFilter");
    });

    it("should have content type filter", () => {
      expect(modSrc).toContain("typeFilter");
      expect(modSrc).toContain("setTypeFilter");
    });

    it("should have sort by violations toggle", () => {
      expect(modSrc).toContain("sortByViolations");
      expect(modSrc).toContain("setSortByViolations");
    });

    it("should use useFilteredQueue hook", () => {
      expect(modSrc).toContain("useFilteredQueue");
    });

    it("should fetch from filtered endpoint", () => {
      expect(modSrc).toContain("/api/admin/moderation/filtered");
    });

    it("should have filter chips for status", () => {
      expect(modSrc).toContain("filterChip");
      expect(modSrc).toContain("filterChipActive");
    });

    it("should have content type labels", () => {
      expect(modSrc).toContain("CONTENT_TYPE_LABELS");
    });
  });

  // ── Bulk actions ──────────────────────────────────────────

  describe("Bulk actions", () => {
    it("should have selected IDs state", () => {
      expect(modSrc).toContain("selectedIds");
      expect(modSrc).toContain("new Set()");
    });

    it("should have select all functionality", () => {
      expect(modSrc).toContain("selectAll");
      expect(modSrc).toContain("Select All");
      expect(modSrc).toContain("Deselect All");
    });

    it("should have bulk approve mutation", () => {
      expect(modSrc).toContain("bulkApproveMutation");
      expect(modSrc).toContain("/api/admin/moderation/bulk-approve");
    });

    it("should have bulk reject mutation", () => {
      expect(modSrc).toContain("bulkRejectMutation");
      expect(modSrc).toContain("/api/admin/moderation/bulk-reject");
    });

    it("should show confirmation dialog for bulk approve", () => {
      expect(modSrc).toContain("handleBulkAction");
      expect(modSrc).toContain("Approve");
    });

    it("should show confirmation dialog for bulk reject", () => {
      expect(modSrc).toContain("handleBulkAction");
      expect(modSrc).toContain("Reject");
    });

    it("should show bulk action bar when items selected", () => {
      expect(modSrc).toContain("selectedIds.size > 0");
      expect(modSrc).toContain("bulkBar");
    });

    it("should show selected count", () => {
      expect(modSrc).toContain("selectedIds.size");
      expect(modSrc).toContain("selected");
    });
  });

  // ── Single item actions ───────────────────────────────────

  describe("Single item actions", () => {
    it("should have approve mutation", () => {
      expect(modSrc).toContain("approveMutation");
    });

    it("should have reject mutation", () => {
      expect(modSrc).toContain("rejectMutation");
    });

    it("should show approve/reject buttons for pending items", () => {
      expect(modSrc).toContain('"pending"');
      expect(modSrc).toContain("Approve");
      expect(modSrc).toContain("Reject");
    });

    it("should show resolved status for non-pending items", () => {
      expect(allSrc).toContain("Approved");
      expect(allSrc).toContain("Rejected");
      expect(allSrc).toContain("resolvedRow");
    });
  });

  // ── Violation display ─────────────────────────────────────

  describe("Violation display", () => {
    it("should show violation badge with count", () => {
      expect(allSrc).toContain("violationBadge");
      expect(allSrc).toContain("item.violations.length");
    });

    it("should list individual violations", () => {
      expect(allSrc).toContain("violationList");
      expect(allSrc).toContain("violationItem");
    });

    it("should use warning icon for violations", () => {
      expect(allSrc).toContain('"warning"');
    });
  });

  // ── UI patterns ───────────────────────────────────────────

  describe("UI patterns", () => {
    it("should have pull-to-refresh", () => {
      expect(modSrc).toContain("RefreshControl");
    });

    it("should have empty state", () => {
      expect(modSrc).toContain("emptyState");
      expect(modSrc).toContain("No items matching filters");
    });

    it("should have loading indicator", () => {
      expect(modSrc).toContain("ActivityIndicator");
    });

    it("should invalidate queries on mutation success", () => {
      expect(modSrc).toContain("invalidateQueries");
      expect(modSrc).toContain("invalidateAll");
    });

    it("should use checkbox for item selection", () => {
      expect(modSrc).toContain("toggleSelect");
      expect(modSrc).toContain("checkbox");
    });
  });
});

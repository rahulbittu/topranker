/**
 * Sprint 242 — Review Moderation Queue + Content Policy Engine
 *
 * Validates:
 * 1. Content policy engine (server/content-policy.ts) — static + runtime
 * 2. Moderation queue (server/moderation-queue.ts) — static + runtime
 * 3. Admin moderation routes (server/routes-admin-moderation.ts) — static
 * 4. Integration wiring
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  CONTENT_POLICIES,
  checkContent,
  getPolicyRules,
} from "../server/content-policy";
import {
  addToQueue,
  getPendingItems,
  approveItem,
  rejectItem,
  getQueueStats,
  getItemsByBusiness,
  getItemsByMember,
  clearQueue,
  MAX_QUEUE,
} from "../server/moderation-queue";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Content Policy — Static
// ---------------------------------------------------------------------------
describe("Content policy — static analysis", () => {
  const src = readFile("server/content-policy.ts");

  it("file exists", () => {
    expect(fileExists("server/content-policy.ts")).toBe(true);
  });

  it("exports CONTENT_POLICIES array", () => {
    expect(src).toContain("export const CONTENT_POLICIES");
  });

  it("exports checkContent function", () => {
    expect(src).toContain("export function checkContent");
  });

  it("exports getPolicyRules function", () => {
    expect(src).toContain("export function getPolicyRules");
  });

  it("defines exactly 6 policy rules", () => {
    expect(CONTENT_POLICIES).toHaveLength(6);
  });

  it("all violation types are present", () => {
    const names = CONTENT_POLICIES.map(p => p.name);
    expect(names).toContain("profanity");
    expect(names).toContain("spam");
    expect(names).toContain("personal_info");
    expect(names).toContain("competitor_mention");
    expect(names).toContain("incentivized");
    expect(names).toContain("off_topic");
  });

  it("severity levels are low, medium, or high", () => {
    for (const policy of CONTENT_POLICIES) {
      expect(["low", "medium", "high"]).toContain(policy.severity);
    }
  });

  it("actions are approve, flag, or reject", () => {
    for (const policy of CONTENT_POLICIES) {
      expect(["approve", "flag", "reject"]).toContain(policy.action);
    }
  });

  it("uses tagged logger", () => {
    expect(src).toContain('log.tag("ContentPolicy")');
  });

  it("imports from logger", () => {
    expect(src).toContain('from "./logger"');
  });
});

// ---------------------------------------------------------------------------
// 2. Content Policy — Runtime
// ---------------------------------------------------------------------------
describe("Content policy — runtime", () => {
  it("clean text is approved", () => {
    const result = checkContent("Great food and wonderful service!");
    expect(result.approved).toBe(true);
    expect(result.action).toBe("approve");
    expect(result.violations).toHaveLength(0);
  });

  it("profanity triggers reject", () => {
    const result = checkContent("This place is shit");
    expect(result.approved).toBe(false);
    expect(result.action).toBe("reject");
    expect(result.violations.some(v => v.rule === "profanity")).toBe(true);
  });

  it("spam content triggers flag", () => {
    const result = checkContent("Click here for amazing deals buy now!");
    expect(result.approved).toBe(false);
    expect(result.action).toBe("flag");
    expect(result.violations.some(v => v.rule === "spam")).toBe(true);
  });

  it("personal info (phone) triggers reject", () => {
    const result = checkContent("Call me at 555-123-4567 for details");
    expect(result.approved).toBe(false);
    expect(result.action).toBe("reject");
    expect(result.violations.some(v => v.rule === "personal_info")).toBe(true);
  });

  it("personal info (email) triggers reject", () => {
    const result = checkContent("Email me at john@example.com");
    expect(result.approved).toBe(false);
    expect(result.action).toBe("reject");
    expect(result.violations.some(v => v.rule === "personal_info")).toBe(true);
  });

  it("competitor mention triggers flag", () => {
    const result = checkContent("This is way better than Yelp");
    expect(result.approved).toBe(false);
    expect(result.action).toBe("flag");
    expect(result.violations.some(v => v.rule === "competitor_mention")).toBe(true);
  });

  it("incentivized review triggers reject", () => {
    const result = checkContent("I was paid to review this restaurant");
    expect(result.approved).toBe(false);
    expect(result.action).toBe("reject");
    expect(result.violations.some(v => v.rule === "incentivized")).toBe(true);
  });

  it("off-topic content triggers flag", () => {
    const result = checkContent("Let me tell you about politics in this country");
    expect(result.approved).toBe(false);
    expect(result.action).toBe("flag");
    expect(result.violations.some(v => v.rule === "off_topic")).toBe(true);
  });

  it("multiple violations returns worst action (reject > flag)", () => {
    const result = checkContent("This shit place is just like Yelp");
    expect(result.action).toBe("reject");
    expect(result.violations.length).toBeGreaterThanOrEqual(2);
  });

  it("getPolicyRules returns all 6 rules", () => {
    const rules = getPolicyRules();
    expect(rules).toHaveLength(6);
    expect(rules[0]).toHaveProperty("name");
    expect(rules[0]).toHaveProperty("description");
    expect(rules[0]).toHaveProperty("severity");
    expect(rules[0]).toHaveProperty("action");
    expect(rules[0]).toHaveProperty("patterns");
  });
});

// ---------------------------------------------------------------------------
// 3. Moderation Queue — Static
// ---------------------------------------------------------------------------
describe("Moderation queue — static analysis", () => {
  const src = readFile("server/moderation-queue.ts");

  it("file exists", () => {
    expect(fileExists("server/moderation-queue.ts")).toBe(true);
  });

  it("exports addToQueue", () => {
    expect(src).toContain("export function addToQueue");
  });

  it("exports getPendingItems", () => {
    expect(src).toContain("export function getPendingItems");
  });

  it("exports approveItem and rejectItem", () => {
    expect(src).toContain("export function approveItem");
    expect(src).toContain("export function rejectItem");
  });

  it("MAX_QUEUE is 2000", () => {
    expect(MAX_QUEUE).toBe(2000);
  });

  it("supports review, photo, reply content types", () => {
    expect(src).toContain('"review"');
    expect(src).toContain('"photo"');
    expect(src).toContain('"reply"');
  });

  it("supports pending, approved, rejected statuses", () => {
    expect(src).toContain('"pending"');
    expect(src).toContain('"approved"');
    expect(src).toContain('"rejected"');
  });

  it("uses tagged logger", () => {
    expect(src).toContain('log.tag("ModerationQueue")');
  });
});

// ---------------------------------------------------------------------------
// 4. Moderation Queue — Runtime
// ---------------------------------------------------------------------------
describe("Moderation queue — runtime", () => {
  beforeEach(() => {
    clearQueue();
  });

  const sampleItem = {
    contentType: "review" as const,
    contentId: "review-1",
    memberId: "member-1",
    businessId: "biz-1",
    content: "Great tacos here",
    violations: [],
  };

  it("addToQueue creates item with pending status", () => {
    const item = addToQueue(sampleItem);
    expect(item.id).toBeDefined();
    expect(item.status).toBe("pending");
    expect(item.moderatorId).toBeNull();
    expect(item.moderatorNote).toBeNull();
    expect(item.createdAt).toBeDefined();
    expect(item.resolvedAt).toBeNull();
  });

  it("getPendingItems returns pending items", () => {
    addToQueue(sampleItem);
    addToQueue({ ...sampleItem, contentId: "review-2" });
    const pending = getPendingItems();
    expect(pending).toHaveLength(2);
  });

  it("getPendingItems respects limit", () => {
    addToQueue(sampleItem);
    addToQueue({ ...sampleItem, contentId: "review-2" });
    addToQueue({ ...sampleItem, contentId: "review-3" });
    const pending = getPendingItems(2);
    expect(pending).toHaveLength(2);
  });

  it("approveItem sets status to approved", () => {
    const item = addToQueue(sampleItem);
    const result = approveItem(item.id, "mod-1", "Looks good");
    expect(result).toBe(true);
    const stats = getQueueStats();
    expect(stats.approved).toBe(1);
    expect(stats.pending).toBe(0);
  });

  it("rejectItem sets status to rejected", () => {
    const item = addToQueue(sampleItem);
    const result = rejectItem(item.id, "mod-1", "Violates policy");
    expect(result).toBe(true);
    const stats = getQueueStats();
    expect(stats.rejected).toBe(1);
    expect(stats.pending).toBe(0);
  });

  it("approve already-resolved item returns false", () => {
    const item = addToQueue(sampleItem);
    approveItem(item.id, "mod-1");
    const result = approveItem(item.id, "mod-2");
    expect(result).toBe(false);
  });

  it("reject already-resolved item returns false", () => {
    const item = addToQueue(sampleItem);
    rejectItem(item.id, "mod-1");
    const result = rejectItem(item.id, "mod-2");
    expect(result).toBe(false);
  });

  it("getQueueStats returns correct counts", () => {
    addToQueue(sampleItem);
    const item2 = addToQueue({ ...sampleItem, contentId: "review-2" });
    const item3 = addToQueue({ ...sampleItem, contentId: "review-3" });
    approveItem(item2.id, "mod-1");
    rejectItem(item3.id, "mod-1");
    const stats = getQueueStats();
    expect(stats.total).toBe(3);
    expect(stats.pending).toBe(1);
    expect(stats.approved).toBe(1);
    expect(stats.rejected).toBe(1);
  });

  it("getItemsByBusiness filters correctly", () => {
    addToQueue(sampleItem);
    addToQueue({ ...sampleItem, businessId: "biz-2", contentId: "review-2" });
    const items = getItemsByBusiness("biz-1");
    expect(items).toHaveLength(1);
    expect(items[0].businessId).toBe("biz-1");
  });

  it("getItemsByMember filters correctly", () => {
    addToQueue(sampleItem);
    addToQueue({ ...sampleItem, memberId: "member-2", contentId: "review-2" });
    const items = getItemsByMember("member-1");
    expect(items).toHaveLength(1);
    expect(items[0].memberId).toBe("member-1");
  });

  it("clearQueue empties the queue", () => {
    addToQueue(sampleItem);
    addToQueue({ ...sampleItem, contentId: "review-2" });
    clearQueue();
    const stats = getQueueStats();
    expect(stats.total).toBe(0);
  });

  it("approve non-existent item returns false", () => {
    expect(approveItem("nonexistent-id", "mod-1")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. Admin Moderation Routes — Static
// ---------------------------------------------------------------------------
describe("Admin moderation routes — static analysis", () => {
  const src = readFile("server/routes-admin-moderation.ts");

  it("file exists", () => {
    expect(fileExists("server/routes-admin-moderation.ts")).toBe(true);
  });

  it("exports registerAdminModerationRoutes", () => {
    expect(src).toContain("export function registerAdminModerationRoutes");
  });

  it("defines GET /api/admin/moderation/queue", () => {
    expect(src).toContain("/api/admin/moderation/queue");
  });

  it("defines GET /api/admin/moderation/stats", () => {
    expect(src).toContain("/api/admin/moderation/stats");
  });

  it("defines POST /api/admin/moderation/:id/approve", () => {
    expect(src).toContain("/api/admin/moderation/:id/approve");
  });

  it("defines POST /api/admin/moderation/:id/reject", () => {
    expect(src).toContain("/api/admin/moderation/:id/reject");
  });

  it("defines GET /api/admin/moderation/business/:businessId", () => {
    expect(src).toContain("/api/admin/moderation/business/:businessId");
  });

  it("uses tagged logger", () => {
    expect(src).toContain('log.tag("AdminModeration")');
  });
});

// ---------------------------------------------------------------------------
// 6. Integration
// ---------------------------------------------------------------------------
describe("Integration — Sprint 242 wiring", () => {
  const routesSrc = readFile("server/routes.ts");

  it("routes.ts imports registerAdminModerationRoutes", () => {
    expect(routesSrc).toContain("registerAdminModerationRoutes");
  });

  it("routes.ts calls registerAdminModerationRoutes(app)", () => {
    expect(routesSrc).toContain("registerAdminModerationRoutes(app)");
  });

  it("content policy check feeds into moderation queue", () => {
    clearQueue();
    const policyResult = checkContent("This shit place sucks");
    expect(policyResult.action).toBe("reject");
    const item = addToQueue({
      contentType: "review",
      contentId: "review-policy-test",
      memberId: "member-policy",
      businessId: "biz-policy",
      content: "This shit place sucks",
      violations: policyResult.violations.map(v => v.rule),
    });
    expect(item.violations).toContain("profanity");
    expect(item.status).toBe("pending");
    clearQueue();
  });

  it("sprint doc exists", () => {
    expect(fileExists("docs/sprints/SPRINT-242-MODERATION-CONTENT-POLICY.md")).toBe(true);
  });
});

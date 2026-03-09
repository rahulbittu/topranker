/**
 * Sprint 211 — Beta Feedback Collection + Wave 3 Monitoring
 *
 * Validates:
 * 1. Beta feedback schema
 * 2. Feedback storage module
 * 3. User feedback API endpoint
 * 4. Admin feedback view endpoint
 * 5. Input validation
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Beta feedback schema
// ---------------------------------------------------------------------------
describe("Beta feedback table — shared/schema.ts", () => {
  const src = readFile("shared/schema.ts");

  it("defines betaFeedback table", () => {
    expect(src).toContain('"beta_feedback"');
  });

  it("has memberId field", () => {
    expect(src).toContain('"member_id"');
  });

  it("has rating field (integer)", () => {
    expect(src).toContain('integer("rating")');
  });

  it("has category field", () => {
    expect(src).toContain('text("category")');
  });

  it("has message field", () => {
    expect(src).toContain('text("message")');
  });

  it("has screenContext field", () => {
    expect(src).toContain('"screen_context"');
  });

  it("has appVersion field", () => {
    expect(src).toContain('"app_version"');
  });

  it("has createdAt timestamp", () => {
    expect(src).toContain('"created_at"');
  });

  it("has member index", () => {
    expect(src).toContain("idx_beta_feedback_member");
  });

  it("has createdAt index", () => {
    expect(src).toContain("idx_beta_feedback_created");
  });

  it("exports BetaFeedback type", () => {
    expect(src).toContain("export type BetaFeedback");
  });
});

// ---------------------------------------------------------------------------
// 2. Feedback storage module
// ---------------------------------------------------------------------------
describe("Feedback storage — server/storage/feedback.ts", () => {
  const src = readFile("server/storage/feedback.ts");

  it("exports createFeedback", () => {
    expect(src).toContain("export async function createFeedback");
  });

  it("exports getRecentFeedback", () => {
    expect(src).toContain("export async function getRecentFeedback");
  });

  it("exports getFeedbackStats", () => {
    expect(src).toContain("export async function getFeedbackStats");
  });

  it("orders by createdAt desc", () => {
    expect(src).toContain("desc(betaFeedback.createdAt)");
  });

  it("groups stats by category", () => {
    expect(src).toContain("betaFeedback.category");
  });

  it("returns total and byCategory", () => {
    expect(src).toContain("total");
    expect(src).toContain("byCategory");
  });
});

// ---------------------------------------------------------------------------
// 3. User feedback API endpoint
// ---------------------------------------------------------------------------
describe("Feedback endpoint — server/routes.ts", () => {
  const src = readFile("server/routes.ts");

  it("registers POST /api/feedback", () => {
    expect(src).toContain('"/api/feedback"');
  });

  it("requires authentication", () => {
    expect(src).toContain('"/api/feedback", requireAuth');
  });

  it("validates rating range 1-5", () => {
    expect(src).toContain("rating < 1 || rating > 5");
  });

  it("validates category values", () => {
    expect(src).toContain('"bug"');
    expect(src).toContain('"feature"');
    expect(src).toContain('"praise"');
    expect(src).toContain('"other"');
  });

  it("limits message to 2000 chars", () => {
    expect(src).toContain(".slice(0, 2000)");
  });

  it("returns 201 on success", () => {
    expect(src).toContain("res.status(201)");
  });
});

// ---------------------------------------------------------------------------
// 4. Admin feedback view endpoint
// ---------------------------------------------------------------------------
describe("Admin feedback — server/routes-admin.ts", () => {
  const src = readFile("server/routes-admin.ts");

  it("registers GET /api/admin/feedback", () => {
    expect(src).toContain("/api/admin/feedback");
  });

  it("requires admin auth", () => {
    expect(src).toContain('"/api/admin/feedback", requireAuth, requireAdmin');
  });

  it("imports getRecentFeedback", () => {
    expect(src).toContain("getRecentFeedback");
  });

  it("imports getFeedbackStats", () => {
    expect(src).toContain("getFeedbackStats");
  });

  it("fetches recent and stats in parallel", () => {
    expect(src).toContain("Promise.all");
  });

  it("returns recent and stats", () => {
    expect(src).toContain("recent, stats");
  });
});

// ---------------------------------------------------------------------------
// 5. Storage barrel exports
// ---------------------------------------------------------------------------
describe("Storage exports — server/storage/index.ts", () => {
  const src = readFile("server/storage/index.ts");

  it("exports createFeedback", () => {
    expect(src).toContain("createFeedback");
  });

  it("exports getRecentFeedback", () => {
    expect(src).toContain("getRecentFeedback");
  });

  it("exports getFeedbackStats", () => {
    expect(src).toContain("getFeedbackStats");
  });

  it("exports from feedback module", () => {
    expect(src).toContain("./feedback");
  });
});

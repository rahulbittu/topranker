/**
 * Sprint 253 — Business Response System (Owners Reply to Reviews)
 *
 * Validates:
 * 1. Business responses static analysis (10 tests)
 * 2. Business responses runtime (16 tests)
 * 3. Owner response routes static (8 tests)
 * 4. Integration wiring (4 tests)
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  createResponse,
  getResponse,
  getResponseForReview,
  getResponsesByBusiness,
  updateResponse,
  flagResponse,
  hideResponse,
  getResponseStats,
  clearResponses,
  MAX_RESPONSES,
} from "../server/business-responses";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Business responses — static analysis (10 tests)
// ---------------------------------------------------------------------------
describe("Business responses — server/business-responses.ts (static)", () => {
  it("module file exists", () => {
    expect(fileExists("server/business-responses.ts")).toBe(true);
  });

  it("exports createResponse", () => {
    expect(typeof createResponse).toBe("function");
  });

  it("exports getResponse", () => {
    expect(typeof getResponse).toBe("function");
  });

  it("exports getResponseForReview", () => {
    expect(typeof getResponseForReview).toBe("function");
  });

  it("exports getResponsesByBusiness", () => {
    expect(typeof getResponsesByBusiness).toBe("function");
  });

  it("exports updateResponse", () => {
    expect(typeof updateResponse).toBe("function");
  });

  it("exports flagResponse", () => {
    expect(typeof flagResponse).toBe("function");
  });

  it("exports hideResponse", () => {
    expect(typeof hideResponse).toBe("function");
  });

  it("exports getResponseStats", () => {
    expect(typeof getResponseStats).toBe("function");
  });

  it("MAX_RESPONSES is 5000", () => {
    expect(MAX_RESPONSES).toBe(5000);
  });
});

// ---------------------------------------------------------------------------
// 2. Business responses — runtime (16 tests)
// ---------------------------------------------------------------------------
describe("Business responses — runtime", () => {
  beforeEach(() => {
    clearResponses();
  });

  it("createResponse returns a valid response object", () => {
    const resp = createResponse("rev-1", "biz-1", "owner-1", "Thank you for your kind review!");
    expect(resp).not.toBeNull();
    expect(resp!.id).toBeDefined();
    expect(resp!.reviewId).toBe("rev-1");
    expect(resp!.businessId).toBe("biz-1");
    expect(resp!.ownerId).toBe("owner-1");
    expect(resp!.status).toBe("visible");
  });

  it("createResponse sets createdAt and updatedAt as ISO strings", () => {
    const resp = createResponse("rev-2", "biz-1", "owner-1", "We appreciate your feedback.");
    expect(resp).not.toBeNull();
    expect(resp!.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(resp!.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("duplicate response for same review returns null", () => {
    createResponse("rev-3", "biz-1", "owner-1", "First response to this review.");
    const dup = createResponse("rev-3", "biz-1", "owner-1", "Second response to same review.");
    expect(dup).toBeNull();
  });

  it("content too short (< 10 chars) returns null", () => {
    const resp = createResponse("rev-4", "biz-1", "owner-1", "Short");
    expect(resp).toBeNull();
  });

  it("content too long (> 2000 chars) returns null", () => {
    const long = "x".repeat(2001);
    const resp = createResponse("rev-5", "biz-1", "owner-1", long);
    expect(resp).toBeNull();
  });

  it("content at exactly 10 chars is accepted", () => {
    const resp = createResponse("rev-6", "biz-1", "owner-1", "1234567890");
    expect(resp).not.toBeNull();
  });

  it("content at exactly 2000 chars is accepted", () => {
    const resp = createResponse("rev-7", "biz-1", "owner-1", "x".repeat(2000));
    expect(resp).not.toBeNull();
  });

  it("getResponse retrieves by responseId", () => {
    const created = createResponse("rev-8", "biz-1", "owner-1", "Great feedback, thanks!");
    expect(created).not.toBeNull();
    const fetched = getResponse(created!.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.reviewId).toBe("rev-8");
  });

  it("getResponse returns null for unknown id", () => {
    expect(getResponse("nonexistent")).toBeNull();
  });

  it("getResponseForReview retrieves by reviewId", () => {
    createResponse("rev-9", "biz-2", "owner-2", "We value your input!");
    const resp = getResponseForReview("rev-9");
    expect(resp).not.toBeNull();
    expect(resp!.businessId).toBe("biz-2");
  });

  it("getResponseForReview returns null for unknown reviewId", () => {
    expect(getResponseForReview("nonexistent-review")).toBeNull();
  });

  it("getResponsesByBusiness filters correctly", () => {
    createResponse("rev-10", "biz-3", "owner-3", "Response to first review.");
    createResponse("rev-11", "biz-3", "owner-3", "Response to second review.");
    createResponse("rev-12", "biz-4", "owner-4", "Response from different biz.");
    const biz3 = getResponsesByBusiness("biz-3");
    expect(biz3.length).toBe(2);
    const biz4 = getResponsesByBusiness("biz-4");
    expect(biz4.length).toBe(1);
  });

  it("updateResponse changes content and updatedAt", () => {
    const resp = createResponse("rev-13", "biz-5", "owner-5", "Original response text.");
    expect(resp).not.toBeNull();
    const ok = updateResponse(resp!.id, "Updated response text here.");
    expect(ok).toBe(true);
    const updated = getResponse(resp!.id);
    expect(updated!.content).toBe("Updated response text here.");
    expect(updated!.updatedAt >= resp!.updatedAt).toBe(true);
  });

  it("flagResponse changes status to flagged", () => {
    const resp = createResponse("rev-14", "biz-5", "owner-5", "This will be flagged.");
    expect(resp).not.toBeNull();
    const ok = flagResponse(resp!.id);
    expect(ok).toBe(true);
    expect(getResponse(resp!.id)!.status).toBe("flagged");
  });

  it("hideResponse changes status to hidden", () => {
    const resp = createResponse("rev-15", "biz-5", "owner-5", "This will be hidden.");
    expect(resp).not.toBeNull();
    const ok = hideResponse(resp!.id);
    expect(ok).toBe(true);
    expect(getResponse(resp!.id)!.status).toBe("hidden");
  });

  it("getResponseStats returns correct counts", () => {
    createResponse("rev-16", "biz-6", "owner-6", "Visible response one.");
    createResponse("rev-17", "biz-6", "owner-6", "Visible response two.");
    const r3 = createResponse("rev-18", "biz-6", "owner-6", "Will be flagged resp.");
    flagResponse(r3!.id);
    const r4 = createResponse("rev-19", "biz-6", "owner-6", "Will be hidden response.");
    hideResponse(r4!.id);
    const stats = getResponseStats();
    expect(stats.total).toBe(4);
    expect(stats.visible).toBe(2);
    expect(stats.flagged).toBe(1);
    expect(stats.hidden).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 3. Owner response routes — static analysis (8 tests)
// ---------------------------------------------------------------------------
describe("Owner response routes — server/routes-owner-responses.ts (static)", () => {
  const src = readFile("server/routes-owner-responses.ts");

  it("module file exists", () => {
    expect(fileExists("server/routes-owner-responses.ts")).toBe(true);
  });

  it("exports registerOwnerResponseRoutes", () => {
    expect(src).toContain("export function registerOwnerResponseRoutes");
  });

  it("registers POST /api/owner/responses", () => {
    expect(src).toContain('"/api/owner/responses"');
    expect(src).toContain("app.post");
  });

  it("registers GET /api/owner/responses/:businessId", () => {
    expect(src).toContain('"/api/owner/responses/:businessId"');
  });

  it("registers PUT /api/owner/responses/:id", () => {
    expect(src).toContain('"/api/owner/responses/:id"');
    expect(src).toContain("app.put");
  });

  it("registers GET /api/reviews/:reviewId/response", () => {
    expect(src).toContain('"/api/reviews/:reviewId/response"');
  });

  it("registers POST /api/admin/responses/:id/flag", () => {
    expect(src).toContain('"/api/admin/responses/:id/flag"');
  });

  it("registers POST /api/admin/responses/:id/hide and GET stats", () => {
    expect(src).toContain('"/api/admin/responses/:id/hide"');
    expect(src).toContain('"/api/admin/responses/stats"');
  });
});

// ---------------------------------------------------------------------------
// 4. Integration wiring (4 tests)
// ---------------------------------------------------------------------------
describe("Integration — routes.ts wiring + module coherence", () => {
  const routesSrc = readFile("server/routes.ts");

  it("routes.ts imports registerOwnerResponseRoutes", () => {
    expect(routesSrc).toContain("registerOwnerResponseRoutes");
  });

  it("routes.ts imports from routes-owner-responses", () => {
    expect(routesSrc).toContain("./routes-owner-responses");
  });

  it("routes.ts calls registerOwnerResponseRoutes(app)", () => {
    expect(routesSrc).toContain("registerOwnerResponseRoutes(app)");
  });

  it("clearResponses resets all state", () => {
    clearResponses();
    createResponse("rev-int-1", "biz-int", "own-int", "Integration test response.");
    expect(getResponseStats().total).toBe(1);
    clearResponses();
    expect(getResponseStats().total).toBe(0);
    expect(getResponseForReview("rev-int-1")).toBeNull();
  });
});

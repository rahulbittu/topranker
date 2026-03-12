/**
 * Sprint 467 — Admin Enrichment Route Split
 *
 * Validates:
 * 1. Bulk routes in routes-admin-enrichment-bulk.ts
 * 2. Dashboard routes still in routes-admin-enrichment.ts
 * 3. Route registration in routes.ts
 * 4. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. Bulk routes file
// ---------------------------------------------------------------------------
describe("Enrichment bulk — routes-admin-enrichment-bulk.ts", () => {
  const src = readFile("server/routes-admin-enrichment-bulk.ts");

  it("exports registerAdminEnrichmentBulkRoutes", () => {
    expect(src).toContain("export function registerAdminEnrichmentBulkRoutes");
  });

  it("has bulk-dietary endpoint", () => {
    expect(src).toContain('"/api/admin/enrichment/bulk-dietary"');
  });

  it("has bulk-dietary-by-cuisine endpoint", () => {
    expect(src).toContain('"/api/admin/enrichment/bulk-dietary-by-cuisine"');
  });

  it("has bulk-hours endpoint", () => {
    expect(src).toContain('"/api/admin/enrichment/bulk-hours"');
  });

  it("has VALID_TAGS constant", () => {
    expect(src).toContain("VALID_TAGS");
  });

  it("references Sprint 467", () => {
    expect(src).toContain("Sprint 467");
  });
});

// ---------------------------------------------------------------------------
// 2. Dashboard routes reduced
// ---------------------------------------------------------------------------
describe("Enrichment dashboard — routes-admin-enrichment.ts", () => {
  const src = readFile("server/routes-admin-enrichment.ts");

  it("is under 260 LOC (was 382, +auth Sprint 472, +full-details Sprint 671)", () => {
    expect(countLines(src)).toBeLessThan(260);
  });

  it("still has dashboard endpoint", () => {
    expect(src).toContain('"/api/admin/enrichment/dashboard"');
  });

  it("still has hours-gaps endpoint", () => {
    expect(src).toContain('"/api/admin/enrichment/hours-gaps"');
  });

  it("still has dietary-gaps endpoint", () => {
    expect(src).toContain('"/api/admin/enrichment/dietary-gaps"');
  });

  it("no longer has bulk endpoints", () => {
    expect(src).not.toContain('"/api/admin/enrichment/bulk-dietary"');
    expect(src).not.toContain('"/api/admin/enrichment/bulk-hours"');
  });

  it("references Sprint 467 extraction", () => {
    expect(src).toContain("Sprint 467");
  });
});

// ---------------------------------------------------------------------------
// 3. Route registration
// ---------------------------------------------------------------------------
describe("Enrichment — route registration", () => {
  const routesSrc = readFile("server/routes.ts");
  const adminSrc = readFile("server/routes-admin.ts");

  it("routes.ts delegates to registerAllAdminRoutes", () => {
    expect(routesSrc).toContain("registerAllAdminRoutes(app)");
  });

  it("admin routes imports registerAdminEnrichmentBulkRoutes", () => {
    expect(adminSrc).toContain("registerAdminEnrichmentBulkRoutes");
  });

  it("admin routes calls registerAdminEnrichmentBulkRoutes", () => {
    expect(adminSrc).toContain("registerAdminEnrichmentBulkRoutes(app)");
  });

  it("admin routes still calls registerAdminEnrichmentRoutes", () => {
    expect(adminSrc).toContain("registerAdminEnrichmentRoutes(app)");
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 467 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-467-ENRICHMENT-SPLIT.md");
    expect(src).toContain("Sprint 467");
    expect(src).toContain("split");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-467-ENRICHMENT-SPLIT.md");
    expect(src).toContain("Retro 467");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-467-ENRICHMENT-SPLIT.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 468");
  });
});

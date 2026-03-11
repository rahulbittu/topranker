/**
 * Sprint 452 — Admin Enrichment Dashboard
 *
 * Validates:
 * 1. routes-admin-enrichment.ts (3 endpoints)
 * 2. routes.ts wiring
 * 3. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. routes-admin-enrichment — structure
// ---------------------------------------------------------------------------
describe("routes-admin-enrichment — structure", () => {
  const src = readFile("server/routes-admin-enrichment.ts");

  it("file exists", () => {
    expect(fileExists("server/routes-admin-enrichment.ts")).toBe(true);
  });

  it("exports registerAdminEnrichmentRoutes", () => {
    expect(src).toContain("export function registerAdminEnrichmentRoutes");
  });

  it("references Sprint 452", () => {
    expect(src).toContain("Sprint 452");
  });

  it("imports hours-utils", () => {
    expect(src).toContain("isOpenLate");
    expect(src).toContain("isOpenWeekends");
  });

  it("imports businesses schema", () => {
    expect(src).toContain("businesses");
    expect(src).toContain("@shared/schema");
  });
});

// ---------------------------------------------------------------------------
// 2. Dashboard endpoint
// ---------------------------------------------------------------------------
describe("routes-admin-enrichment — dashboard endpoint", () => {
  const src = readFile("server/routes-admin-enrichment.ts");

  it("registers GET /api/admin/enrichment/dashboard", () => {
    expect(src).toContain('"/api/admin/enrichment/dashboard"');
  });

  it("computes dietary coverage", () => {
    expect(src).toContain("dietaryTagged");
    expect(src).toContain("dietaryUntagged");
    expect(src).toContain("coveragePct");
  });

  it("computes hours coverage", () => {
    expect(src).toContain("hasHours");
    expect(src).toContain("missingHours");
  });

  it("counts hours characteristics", () => {
    expect(src).toContain("openLateCount");
    expect(src).toContain("openWeekendsCount");
    expect(src).toContain("has24Hour");
    expect(src).toContain("avgPeriodsPerBiz");
  });

  it("includes per-city breakdown", () => {
    expect(src).toContain("cityBreakdown");
    expect(src).toContain("dietaryCoveragePct");
    expect(src).toContain("hoursCoveragePct");
  });

  it("identifies businesses missing both", () => {
    expect(src).toContain("missingBoth");
  });

  it("includes tag distribution", () => {
    expect(src).toContain("tagCounts");
  });
});

// ---------------------------------------------------------------------------
// 3. Gap endpoints
// ---------------------------------------------------------------------------
describe("routes-admin-enrichment — gap endpoints", () => {
  const src = readFile("server/routes-admin-enrichment.ts");

  it("registers GET /api/admin/enrichment/hours-gaps", () => {
    expect(src).toContain('"/api/admin/enrichment/hours-gaps"');
  });

  it("hours-gaps supports city filter", () => {
    expect(src).toContain("req.query.city");
  });

  it("hours-gaps checks for weekday_text presence", () => {
    expect(src).toContain("hasWeekdayText");
  });

  it("registers GET /api/admin/enrichment/dietary-gaps", () => {
    expect(src).toContain('"/api/admin/enrichment/dietary-gaps"');
  });

  it("dietary-gaps supports city filter", () => {
    // Both gap endpoints support city filtering
    const cityRefs = src.match(/req\.query\.city/g);
    expect(cityRefs?.length).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// 4. routes.ts wiring
// ---------------------------------------------------------------------------
describe("routes.ts — enrichment wiring", () => {
  const routesSrc = readFile("server/routes.ts");
  const adminSrc = readFile("server/routes-admin.ts");

  it("routes.ts delegates to registerAllAdminRoutes", () => {
    expect(routesSrc).toContain("registerAllAdminRoutes(app)");
  });

  it("admin routes imports registerAdminEnrichmentRoutes", () => {
    expect(adminSrc).toContain("registerAdminEnrichmentRoutes");
  });

  it("admin routes calls registerAdminEnrichmentRoutes(app)", () => {
    expect(adminSrc).toContain("registerAdminEnrichmentRoutes(app)");
  });
});

// ---------------------------------------------------------------------------
// 5. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 452 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-452-ENRICHMENT-DASHBOARD.md");
    expect(src).toContain("Sprint 452");
    expect(src).toContain("enrichment");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-452-ENRICHMENT-DASHBOARD.md");
    expect(src).toContain("Retro 452");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-452-ENRICHMENT-DASHBOARD.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 453");
  });
});

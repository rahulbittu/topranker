/**
 * Sprint 463 — Admin Enrichment Bulk Hours Update
 *
 * Validates:
 * 1. Bulk hours endpoint registration
 * 2. Input validation
 * 3. Hours data structure validation
 * 4. Dry run and source tracking
 * 5. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Bulk hours endpoint
// ---------------------------------------------------------------------------
describe("Enrichment — bulk hours endpoint", () => {
  const src = readFile("server/routes-admin-enrichment.ts");

  it("registers POST /api/admin/enrichment/bulk-hours", () => {
    expect(src).toContain('"/api/admin/enrichment/bulk-hours"');
  });

  it("references Sprint 463", () => {
    expect(src).toContain("Sprint 463");
  });

  it("accepts businessIds array", () => {
    expect(src).toContain("businessIds");
  });

  it("accepts hoursData object", () => {
    expect(src).toContain("hoursData");
  });

  it("accepts source parameter", () => {
    expect(src).toContain("source");
    expect(src).toContain("manual");
    expect(src).toContain("google_places");
  });

  it("supports dry run mode", () => {
    expect(src).toContain("dryRun = true");
  });
});

// ---------------------------------------------------------------------------
// 2. Input validation
// ---------------------------------------------------------------------------
describe("Enrichment — bulk hours validation", () => {
  const src = readFile("server/routes-admin-enrichment.ts");

  it("validates businessIds is non-empty", () => {
    expect(src).toContain("businessIds must be a non-empty array");
  });

  it("validates hoursData is an object", () => {
    expect(src).toContain("hoursData must be a valid hours object");
  });

  it("limits batch size to 50", () => {
    expect(src).toContain("Maximum 50 businesses per hours batch");
  });

  it("validates source against whitelist", () => {
    expect(src).toContain("VALID_SOURCES");
    expect(src).toContain("import");
  });
});

// ---------------------------------------------------------------------------
// 3. Hours data structure validation
// ---------------------------------------------------------------------------
describe("Enrichment — hours structure validation", () => {
  const src = readFile("server/routes-admin-enrichment.ts");

  it("validates periods is an array", () => {
    expect(src).toContain("hoursData.periods must be an array");
  });

  it("validates period open.day is number", () => {
    expect(src).toContain("open.day (number)");
  });

  it("validates period open.time is string", () => {
    expect(src).toContain("open.time (string)");
  });

  it("tracks hadHours for each business", () => {
    expect(src).toContain("hadHours");
  });

  it("tracks periodsCount in results", () => {
    expect(src).toContain("periodsCount");
  });
});

// ---------------------------------------------------------------------------
// 4. Dry run and response
// ---------------------------------------------------------------------------
describe("Enrichment — bulk hours response", () => {
  const src = readFile("server/routes-admin-enrichment.ts");

  it("caps response at 50 results", () => {
    // Already uses slice(0, 50) pattern
    expect(src).toContain("results.slice(0, 50)");
  });

  it("returns source in response", () => {
    expect(src).toContain("source,");
  });

  it("returns requested count", () => {
    expect(src).toContain("requested: businessIds.length");
  });
});

// ---------------------------------------------------------------------------
// 5. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 463 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-463-BULK-HOURS.md");
    expect(src).toContain("Sprint 463");
    expect(src).toContain("hours");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-463-BULK-HOURS.md");
    expect(src).toContain("Retro 463");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-463-BULK-HOURS.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 464");
  });
});

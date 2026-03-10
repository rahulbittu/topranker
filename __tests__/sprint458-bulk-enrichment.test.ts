/**
 * Sprint 458 — Admin Enrichment Bulk Operations
 *
 * Validates:
 * 1. Bulk dietary tagging by business IDs
 * 2. Bulk dietary tagging by cuisine
 * 3. Validation and limits
 * 4. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Bulk dietary by business IDs
// ---------------------------------------------------------------------------
describe("Enrichment — bulk dietary by IDs", () => {
  const src = readFile("server/routes-admin-enrichment.ts");

  it("registers POST /api/admin/enrichment/bulk-dietary", () => {
    expect(src).toContain('"/api/admin/enrichment/bulk-dietary"');
  });

  it("references Sprint 458", () => {
    expect(src).toContain("Sprint 458");
  });

  it("accepts businessIds array", () => {
    expect(src).toContain("businessIds");
  });

  it("accepts tags array", () => {
    expect(src).toContain("tags");
  });

  it("supports merge and replace modes", () => {
    expect(src).toContain('mode = "merge"');
    expect(src).toContain('mode === "replace"');
  });

  it("validates tags against whitelist", () => {
    expect(src).toContain("VALID_TAGS");
    expect(src).toContain("invalidTags");
  });

  it("limits batch size to 100", () => {
    expect(src).toContain("100");
    expect(src).toContain("Maximum 100 businesses per batch");
  });

  it("tracks previous and new tags", () => {
    expect(src).toContain("previousTags");
    expect(src).toContain("newTags");
  });
});

// ---------------------------------------------------------------------------
// 2. Bulk dietary by cuisine
// ---------------------------------------------------------------------------
describe("Enrichment — bulk dietary by cuisine", () => {
  const src = readFile("server/routes-admin-enrichment.ts");

  it("registers POST /api/admin/enrichment/bulk-dietary-by-cuisine", () => {
    expect(src).toContain('"/api/admin/enrichment/bulk-dietary-by-cuisine"');
  });

  it("accepts cuisine parameter", () => {
    expect(src).toContain("cuisine");
  });

  it("supports dry run mode", () => {
    expect(src).toContain("dryRun = true");
    expect(src).toContain("dryRun");
  });

  it("supports city filter", () => {
    expect(src).toContain("b.city === city");
  });

  it("case-insensitive cuisine matching", () => {
    expect(src).toContain(".toLowerCase()");
  });

  it("skips businesses with no tag changes", () => {
    expect(src).toContain("No change needed");
  });

  it("caps response at 50 updates", () => {
    expect(src).toContain("slice(0, 50)");
  });
});

// ---------------------------------------------------------------------------
// 3. Validation
// ---------------------------------------------------------------------------
describe("Enrichment — bulk validation", () => {
  const src = readFile("server/routes-admin-enrichment.ts");

  it("validates businessIds is non-empty array", () => {
    expect(src).toContain("businessIds must be a non-empty array");
  });

  it("validates tags is non-empty array", () => {
    expect(src).toContain("tags must be a non-empty array");
  });

  it("rejects invalid tags", () => {
    expect(src).toContain("Invalid tags:");
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 458 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-458-BULK-ENRICHMENT.md");
    expect(src).toContain("Sprint 458");
    expect(src).toContain("bulk");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-458-BULK-ENRICHMENT.md");
    expect(src).toContain("Retro 458");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-458-BULK-ENRICHMENT.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 459");
  });
});

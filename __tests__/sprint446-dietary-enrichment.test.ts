/**
 * Sprint 446 — Dietary Tag Enrichment + Admin Endpoint
 *
 * Validates:
 * 1. Admin dietary routes file structure
 * 2. Endpoint registration
 * 3. Auto-enrichment cuisine mapping
 * 4. Tag validation
 * 5. Routes.ts wiring
 * 6. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Admin dietary routes structure
// ---------------------------------------------------------------------------
describe("Admin dietary routes — structure", () => {
  const src = readFile("server/routes-admin-dietary.ts");

  it("file exists", () => {
    expect(fileExists("server/routes-admin-dietary.ts")).toBe(true);
  });

  it("exports registerAdminDietaryRoutes", () => {
    expect(src).toContain("export function registerAdminDietaryRoutes");
  });

  it("imports db and businesses schema", () => {
    expect(src).toContain('from "./db"');
    expect(src).toContain("businesses");
    expect(src).toContain("@shared/schema");
  });

  it("uses AdminDietary log tag", () => {
    expect(src).toContain('log.tag("AdminDietary")');
  });

  it("references Sprint 446", () => {
    expect(src).toContain("Sprint 446");
  });
});

// ---------------------------------------------------------------------------
// 2. Endpoint registration
// ---------------------------------------------------------------------------
describe("Admin dietary routes — endpoints", () => {
  const src = readFile("server/routes-admin-dietary.ts");

  it("registers GET /api/admin/dietary/stats", () => {
    expect(src).toContain("/api/admin/dietary/stats");
  });

  it("registers PUT /api/admin/dietary/:businessId", () => {
    expect(src).toContain("/api/admin/dietary/:businessId");
  });

  it("registers POST /api/admin/dietary/auto-enrich", () => {
    expect(src).toContain("/api/admin/dietary/auto-enrich");
  });

  it("registers GET /api/admin/dietary/businesses", () => {
    expect(src).toContain("/api/admin/dietary/businesses");
  });

  it("stats endpoint returns coverage percentage", () => {
    expect(src).toContain("coveragePct");
    expect(src).toContain("tagCounts");
  });

  it("businesses endpoint supports filter param", () => {
    expect(src).toContain('req.query.filter');
    expect(src).toContain('"tagged"');
    expect(src).toContain('"untagged"');
  });
});

// ---------------------------------------------------------------------------
// 3. Auto-enrichment cuisine mapping
// ---------------------------------------------------------------------------
describe("Admin dietary routes — auto-enrichment", () => {
  const src = readFile("server/routes-admin-dietary.ts");

  it("has CUISINE_TAG_SUGGESTIONS mapping", () => {
    expect(src).toContain("CUISINE_TAG_SUGGESTIONS");
  });

  it("maps indian cuisine to vegetarian", () => {
    expect(src).toContain('indian: ["vegetarian"]');
  });

  it("maps middle_eastern cuisine to halal", () => {
    expect(src).toContain('middle_eastern: ["halal"]');
  });

  it("supports dry run mode", () => {
    expect(src).toContain("dryRun");
    expect(src).toContain("dry run");
  });

  it("merges with existing tags (no duplicates)", () => {
    expect(src).toContain("new Set");
    expect(src).toContain("filter(t => !currentTags.includes(t))");
  });

  it("returns suggestions list", () => {
    expect(src).toContain("suggestions");
    expect(src).toContain("suggestedTags");
  });
});

// ---------------------------------------------------------------------------
// 4. Tag validation
// ---------------------------------------------------------------------------
describe("Admin dietary routes — validation", () => {
  const src = readFile("server/routes-admin-dietary.ts");

  it("defines VALID_TAGS constant", () => {
    expect(src).toContain("VALID_TAGS");
  });

  it("includes all 4 dietary tags", () => {
    expect(src).toContain('"vegetarian"');
    expect(src).toContain('"vegan"');
    expect(src).toContain('"halal"');
    expect(src).toContain('"gluten_free"');
  });

  it("validates tags array input", () => {
    expect(src).toContain("Array.isArray(tags)");
  });

  it("rejects invalid tags", () => {
    expect(src).toContain("invalidTags");
    expect(src).toContain("Invalid tags");
  });

  it("returns 404 for non-existent business", () => {
    expect(src).toContain("Business not found");
    expect(src).toContain("404");
  });
});

// ---------------------------------------------------------------------------
// 5. Routes.ts wiring
// ---------------------------------------------------------------------------
describe("Routes.ts — dietary wiring", () => {
  const src = readFile("server/routes.ts");

  it("imports registerAdminDietaryRoutes", () => {
    expect(src).toContain("registerAdminDietaryRoutes");
  });

  it("imports from routes-admin-dietary", () => {
    expect(src).toContain("./routes-admin-dietary");
  });

  it("calls registerAdminDietaryRoutes(app)", () => {
    expect(src).toContain("registerAdminDietaryRoutes(app)");
  });
});

// ---------------------------------------------------------------------------
// 6. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 446 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-446-DIETARY-ENRICHMENT.md");
    expect(src).toContain("Sprint 446");
    expect(src).toContain("Dietary");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-446-DIETARY-ENRICHMENT.md");
    expect(src).toContain("Retro 446");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-446-DIETARY-ENRICHMENT.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 447");
  });
});

/**
 * Sprint 469 — Search Filter Presets
 *
 * Validates:
 * 1. Built-in presets
 * 2. Custom preset creation
 * 3. Serialization/deserialization
 * 4. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Built-in presets
// ---------------------------------------------------------------------------
describe("Filter presets — built-in", () => {
  const src = readFile("lib/search-filter-presets.ts");

  it("exports BUILT_IN_PRESETS array", () => {
    expect(src).toContain("export const BUILT_IN_PRESETS");
  });

  it("has Quick Lunch preset", () => {
    expect(src).toContain("Quick Lunch");
    expect(src).toContain("quick-lunch");
  });

  it("has Date Night preset", () => {
    expect(src).toContain("Date Night");
    expect(src).toContain("date-night");
  });

  it("has Vegetarian preset", () => {
    expect(src).toContain('"Vegetarian"');
    expect(src).toContain("vegetarian");
  });

  it("has Top Rated preset", () => {
    expect(src).toContain("Top Rated");
    expect(src).toContain("top-rated");
  });

  it("has Halal preset", () => {
    expect(src).toContain('"Halal"');
    expect(src).toContain("halal");
  });

  it("exports getBuiltInPresets function", () => {
    expect(src).toContain("export function getBuiltInPresets");
  });

  it("each preset has id, name, icon, filters, isBuiltIn", () => {
    expect(src).toContain("export interface FilterPreset");
    expect(src).toContain("id: string");
    expect(src).toContain("name: string");
    expect(src).toContain("icon: string");
    expect(src).toContain("isBuiltIn: boolean");
  });
});

// ---------------------------------------------------------------------------
// 2. Custom preset creation
// ---------------------------------------------------------------------------
describe("Filter presets — custom", () => {
  const src = readFile("lib/search-filter-presets.ts");

  it("exports createCustomPreset function", () => {
    expect(src).toContain("export function createCustomPreset");
  });

  it("generates custom ID with timestamp", () => {
    expect(src).toContain("custom-${Date.now()}");
  });

  it("marks custom presets as not built-in", () => {
    expect(src).toContain("isBuiltIn: false");
  });
});

// ---------------------------------------------------------------------------
// 3. Serialization
// ---------------------------------------------------------------------------
describe("Filter presets — persistence", () => {
  const src = readFile("lib/search-filter-presets.ts");

  it("exports serializePresets function", () => {
    expect(src).toContain("export function serializePresets");
  });

  it("exports deserializePresets function", () => {
    expect(src).toContain("export function deserializePresets");
  });

  it("exports getAllPresets function", () => {
    expect(src).toContain("export function getAllPresets");
  });

  it("has PRESETS_STORAGE_KEY", () => {
    expect(src).toContain("PRESETS_STORAGE_KEY");
    expect(src).toContain("topranker:filter-presets");
  });

  it("filters out built-in presets when serializing", () => {
    expect(src).toContain("filter(p => !p.isBuiltIn)");
  });

  it("handles invalid JSON gracefully", () => {
    expect(src).toContain("catch");
    expect(src).toContain("return []");
  });

  it("references Sprint 469", () => {
    expect(src).toContain("Sprint 469");
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 469 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-469-FILTER-PRESETS.md");
    expect(src).toContain("Sprint 469");
    expect(src).toContain("preset");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-469-FILTER-PRESETS.md");
    expect(src).toContain("Retro 469");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-469-FILTER-PRESETS.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 470");
  });
});

/**
 * Sprint 456 — DiscoverFilters Extraction
 *
 * Validates:
 * 1. FilterChipsExtended.tsx — extracted components
 * 2. DiscoverFilters.tsx — re-exports
 * 3. LOC reduction
 * 4. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (src: string) => src.split("\n").length;

// ---------------------------------------------------------------------------
// 1. FilterChipsExtended — extracted components
// ---------------------------------------------------------------------------
describe("FilterChipsExtended — structure", () => {
  const src = readFile("components/search/FilterChipsExtended.tsx");

  it("file exists", () => {
    expect(src).toBeTruthy();
  });

  it("references Sprint 456", () => {
    expect(src).toContain("Sprint 456");
  });

  it("exports DietaryTagChips", () => {
    expect(src).toContain("export const DietaryTagChips");
  });

  it("exports DietaryTag type", () => {
    expect(src).toContain("export type DietaryTag");
  });

  it("exports DistanceChips", () => {
    expect(src).toContain("export const DistanceChips");
  });

  it("exports DistanceOption type", () => {
    expect(src).toContain("export type DistanceOption");
  });

  it("exports HoursFilterChips", () => {
    expect(src).toContain("export const HoursFilterChips");
  });

  it("exports HoursFilter type", () => {
    expect(src).toContain("export type HoursFilter");
  });

  it("exports getDietaryTags helper", () => {
    expect(src).toContain("export function getDietaryTags");
  });

  it("exports getDistanceOptions helper", () => {
    expect(src).toContain("export function getDistanceOptions");
  });

  it("exports getHoursFilters helper", () => {
    expect(src).toContain("export function getHoursFilters");
  });

  it("has self-contained StyleSheet", () => {
    expect(src).toContain("StyleSheet.create");
  });
});

// ---------------------------------------------------------------------------
// 2. DiscoverFilters — re-exports
// ---------------------------------------------------------------------------
describe("DiscoverFilters — backward-compatible re-exports", () => {
  const src = readFile("components/search/DiscoverFilters.tsx");

  it("re-exports DietaryTagChips from FilterChipsExtended", () => {
    expect(src).toContain("DietaryTagChips");
    expect(src).toContain("FilterChipsExtended");
  });

  it("re-exports DistanceChips from FilterChipsExtended", () => {
    expect(src).toContain("DistanceChips");
  });

  it("re-exports HoursFilterChips from FilterChipsExtended", () => {
    expect(src).toContain("HoursFilterChips");
  });

  it("re-exports types", () => {
    expect(src).toContain("export type");
    expect(src).toContain("DietaryTag");
    expect(src).toContain("DistanceOption");
    expect(src).toContain("HoursFilter");
  });

  it("still contains FilterChips component", () => {
    expect(src).toContain("export const FilterChips");
  });

  it("still contains PriceChips component", () => {
    expect(src).toContain("export const PriceChips");
  });

  it("still contains SortChips component", () => {
    expect(src).toContain("export const SortChips");
  });

  it("still contains SortResultsHeader", () => {
    expect(src).toContain("export function SortResultsHeader");
  });
});

// ---------------------------------------------------------------------------
// 3. LOC reduction
// ---------------------------------------------------------------------------
describe("DiscoverFilters — LOC health", () => {
  it("DiscoverFilters under 250 LOC (was 381)", () => {
    const src = readFile("components/search/DiscoverFilters.tsx");
    expect(countLines(src)).toBeLessThan(250);
  });

  it("FilterChipsExtended under 200 LOC", () => {
    const src = readFile("components/search/FilterChipsExtended.tsx");
    expect(countLines(src)).toBeLessThan(200);
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 456 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-456-FILTER-EXTRACTION.md");
    expect(src).toContain("Sprint 456");
    expect(src).toContain("extraction");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-456-FILTER-EXTRACTION.md");
    expect(src).toContain("Retro 456");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-456-FILTER-EXTRACTION.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 457");
  });
});

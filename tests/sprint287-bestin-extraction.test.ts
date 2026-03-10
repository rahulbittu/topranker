/**
 * Sprint 287 — Best In Section Extraction from search.tsx
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");
const fileExists = (relPath: string) =>
  fs.existsSync(path.join(ROOT, relPath));
const countLines = (relPath: string) =>
  readFile(relPath).split("\n").length;

describe("Sprint 287: BestInSection component extracted", () => {
  it("BestInSection.tsx exists", () => {
    expect(fileExists("components/search/BestInSection.tsx")).toBe(true);
  });

  it("exports BestInSection function", () => {
    const src = readFile("components/search/BestInSection.tsx");
    expect(src).toContain("export function BestInSection");
  });

  it("has city, onSelectCategory, onSeeAll props", () => {
    const src = readFile("components/search/BestInSection.tsx");
    expect(src).toContain("city: string");
    expect(src).toContain("onSelectCategory:");
    expect(src).toContain("onSeeAll:");
  });

  it("contains cuisine picker logic", () => {
    const src = readFile("components/search/BestInSection.tsx");
    expect(src).toContain("bestInCuisine");
    expect(src).toContain("getAvailableCuisines");
    expect(src).toContain("getCategoriesByCuisine");
    expect(src).toContain("CUISINE_DISPLAY");
  });

  it("renders Best In cards", () => {
    const src = readFile("components/search/BestInSection.tsx");
    expect(src).toContain("bestInCard");
    expect(src).toContain("cat.displayName");
    expect(src).toContain("cat.emoji");
  });

  it("has all required styles", () => {
    const src = readFile("components/search/BestInSection.tsx");
    expect(src).toContain("bestInSection");
    expect(src).toContain("bestInHeader");
    expect(src).toContain("cuisineTab");
    expect(src).toContain("bestInCard");
    expect(src).toContain("bestInEmoji");
    expect(src).toContain("bestInName");
    expect(src).toContain("bestInSubtitle");
  });
});

describe("Sprint 287: search.tsx cleanup", () => {
  const search = readFile("app/(tabs)/search.tsx");

  it("search.tsx imports BestInSection", () => {
    expect(search).toContain("BestInSection");
    expect(search).toContain("components/search/BestInSection");
  });

  it("search.tsx uses BestInSection component", () => {
    expect(search).toContain("<BestInSection");
    expect(search).toContain("onSelectCategory");
    expect(search).toContain("onSeeAll");
  });

  it("search.tsx no longer has inline Best In styles", () => {
    expect(search).not.toContain("bestInSection:");
    expect(search).not.toContain("bestInCard:");
    expect(search).not.toContain("bestInEmoji:");
    expect(search).not.toContain("cuisineTab:");
  });

  it("search.tsx no longer imports best-in-categories directly", () => {
    expect(search).not.toContain("from \"@/shared/best-in-categories\"");
  });

  it("search.tsx is under 900 LOC (was 917, threshold 950)", () => {
    const lines = countLines("app/(tabs)/search.tsx");
    expect(lines).toBeLessThan(900);
  });

  it("search.tsx dropped at least 100 lines", () => {
    const lines = countLines("app/(tabs)/search.tsx");
    expect(lines).toBeLessThanOrEqual(820);
  });
});

describe("Sprint 287: Sprint docs", () => {
  it("sprint doc exists", () => {
    expect(fileExists("docs/sprints/SPRINT-287-BESTIN-EXTRACTION.md")).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fileExists("docs/retros/RETRO-287-BESTIN-EXTRACTION.md")).toBe(true);
  });

  it("sprint doc mentions LOC reduction", () => {
    const doc = readFile("docs/sprints/SPRINT-287-BESTIN-EXTRACTION.md");
    expect(doc).toContain("917");
    expect(doc).toContain("802");
  });
});

/**
 * Sprint 283 — Cuisine-Grouped UI on Rankings Page
 *
 * Validates:
 * 1. Rankings page imports cuisine picker functions
 * 2. Cuisine picker chips render via CuisineChipRow component
 * 3. Selected cuisine filters rankings
 * 4. CuisineChipRow has chip styles
 * 5. CUISINE_DISPLAY is used for cuisine labels
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 283: Rankings Cuisine Picker UI", () => {
  const indexSrc = readFile("app/(tabs)/index.tsx");
  const chipRowSrc = readFile("components/leaderboard/CuisineChipRow.tsx");

  it("imports cuisine functions from best-in-categories", () => {
    expect(indexSrc).toContain("getAvailableCuisines");
    expect(indexSrc).toContain("CUISINE_DISPLAY");
  });

  it("imports getAvailableCuisines from best-in-categories", () => {
    expect(indexSrc).toContain("getAvailableCuisines");
  });

  it("imports CUISINE_DISPLAY from best-in-categories", () => {
    expect(indexSrc).toContain("CUISINE_DISPLAY");
  });

  it("has selectedCuisine state", () => {
    expect(indexSrc).toContain("selectedCuisine");
  });

  it("uses selectedCuisine for cuisine filtering", () => {
    expect(indexSrc).toContain("selectedCuisine");
    expect(indexSrc).toContain("setSelectedCuisine");
  });

  it("uses CuisineChipRow component for cuisine chips", () => {
    expect(indexSrc).toContain("CuisineChipRow");
    expect(indexSrc).toContain("onSelect={setSelectedCuisine}");
  });

  it("cuisine picker calls setSelectedCuisine via onSelect", () => {
    expect(indexSrc).toContain("onSelect={setSelectedCuisine}");
  });

  it("has cuisineChip style in CuisineChipRow", () => {
    expect(chipRowSrc).toContain("chip:");
  });

  it("has cuisineChipActive style in CuisineChipRow", () => {
    expect(chipRowSrc).toContain("chipActive:");
  });

  it("has cuisineChipText style in CuisineChipRow", () => {
    expect(chipRowSrc).toContain("text:");
  });

  it("has cuisineChipTextActive style in CuisineChipRow", () => {
    expect(chipRowSrc).toContain("textActive:");
  });

  it("renders cuisine display emoji and label in CuisineChipRow", () => {
    expect(chipRowSrc).toContain("display.emoji");
    expect(chipRowSrc).toContain("display.label");
  });
});

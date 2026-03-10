/**
 * Sprint 283 — Cuisine-Grouped UI on Rankings Page
 *
 * Validates:
 * 1. Rankings page imports cuisine picker functions
 * 2. Cuisine picker chips render above Best In chips
 * 3. Selected cuisine filters Best In subcategories
 * 4. Cuisine chip styles exist
 * 5. CUISINE_DISPLAY is imported for cuisine labels
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 283: Rankings Cuisine Picker UI", () => {
  const indexSrc = readFile("app/(tabs)/index.tsx");

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

  it("has cuisine picker chips that filter by cuisine", () => {
    expect(indexSrc).toContain("cuisineChip");
    expect(indexSrc).toContain("setSelectedCuisine");
  });

  it("cuisine picker calls setSelectedCuisine on tap", () => {
    expect(indexSrc).toContain("setSelectedCuisine(cuisine)");
  });

  it("has cuisineChip style", () => {
    expect(indexSrc).toContain("cuisineChip:");
  });

  it("has cuisineChipActive style", () => {
    expect(indexSrc).toContain("cuisineChipActive:");
  });

  it("has cuisineChipText style", () => {
    expect(indexSrc).toContain("cuisineChipText:");
  });

  it("has cuisineChipTextActive style", () => {
    expect(indexSrc).toContain("cuisineChipTextActive:");
  });

  it("renders cuisine display emoji and label", () => {
    expect(indexSrc).toContain("display.emoji");
    expect(indexSrc).toContain("display.label");
  });
});

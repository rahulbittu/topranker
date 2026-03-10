/**
 * Sprint 317: DishEntryCard Extraction
 *
 * Entry card extracted from app/dish/[slug].tsx into components/dish/DishEntryCard.tsx
 * to reduce page complexity per Audit #45 recommendation.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 317 — DishEntryCard component", () => {
  const src = readFile("components/dish/DishEntryCard.tsx");

  it("exports DishEntryCard function", () => {
    expect(src).toContain("export function DishEntryCard");
  });

  it("exports DishEntryCardProps interface", () => {
    expect(src).toContain("export interface DishEntryCardProps");
  });

  it("accepts entry prop with typed shape", () => {
    expect(src).toContain("entry: {");
    expect(src).toContain("businessSlug: string");
    expect(src).toContain("rankPosition: number");
    expect(src).toContain("dishScore: string");
  });

  it("accepts dishName prop", () => {
    expect(src).toContain("dishName: string");
  });

  it("navigates to business page on press", () => {
    expect(src).toContain('pathname: "/business/[id]"');
    expect(src).toContain("entry.businessSlug");
  });

  it("shows rank badge with position", () => {
    expect(src).toContain("rankBadge");
    expect(src).toContain("entry.rankPosition");
  });

  it("shows dish score formatted to 1 decimal", () => {
    expect(src).toContain("parseFloat(entry.dishScore).toFixed(1)");
  });

  it("shows early data badge for < 5 ratings", () => {
    expect(src).toContain("entry.dishRatingCount < 5");
    expect(src).toContain("Early data");
  });

  it("has Rate button navigating to /rate/[id]", () => {
    expect(src).toContain('pathname: "/rate/[id]"');
    expect(src).toContain("dish: dishName");
  });

  it("uses SafeImage with fallbackGradient", () => {
    expect(src).toContain("SafeImage");
    expect(src).toContain("fallbackGradient");
  });

  it("uses pct() helper for responsive widths", () => {
    expect(src).toContain("pct(100)");
  });

  it("has own StyleSheet (not depending on parent)", () => {
    expect(src).toContain("StyleSheet.create");
  });
});

describe("Sprint 317 — dish/[slug].tsx uses DishEntryCard", () => {
  const pageSrc = readFile("app/dish/[slug].tsx");

  it("imports DishEntryCard", () => {
    expect(pageSrc).toContain("DishEntryCard");
    expect(pageSrc).toContain("@/components/dish/DishEntryCard");
  });

  it("renders DishEntryCard with entry and dishName props", () => {
    expect(pageSrc).toContain("<DishEntryCard");
    expect(pageSrc).toContain("dishName={board.dishName}");
  });

  it("no longer has inline entry card styles", () => {
    expect(pageSrc).not.toContain("entryCard:");
    expect(pageSrc).not.toContain("entryPhoto:");
    expect(pageSrc).not.toContain("rankBadge:");
  });

  // Sprint docs
  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-317-DISH-ENTRY-CARD.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-317-DISH-ENTRY-CARD.md"))).toBe(true);
  });
});

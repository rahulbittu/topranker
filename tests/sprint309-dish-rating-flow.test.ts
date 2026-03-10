/**
 * Sprint 309: Dish Rating Flow — Rate specific dish from leaderboard
 *
 * Each entry card on the dish leaderboard page gets a "Rate [dish]" button
 * that navigates to /rate/[id] with the dish name pre-filled.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const pageSrc = fs.readFileSync(path.join(ROOT, "app/dish/[slug].tsx"), "utf-8");
// Sprint 317: Entry card extracted to DishEntryCard component
const entryCardSrc = fs.readFileSync(path.join(ROOT, "components/dish/DishEntryCard.tsx"), "utf-8");
const rateSrc = fs.readFileSync(path.join(ROOT, "app/rate/[id].tsx"), "utf-8");

describe("Sprint 309 — Dish Rating Flow", () => {
  // ─── Entry card Rate button ────────────────────────────────

  // Sprint 317: Entry card extracted to DishEntryCard component
  it("entry card has 'Rate [dish]' button", () => {
    expect(entryCardSrc).toContain("Rate {dishName}");
  });

  it("Rate button navigates to /rate/[id] with dish param", () => {
    expect(entryCardSrc).toContain('pathname: "/rate/[id]"');
    expect(entryCardSrc).toContain("dish: dishName");
  });

  it("Rate button uses business slug as route param", () => {
    expect(entryCardSrc).toContain("id: entry.businessSlug");
  });

  it("Rate button has star-outline icon", () => {
    expect(entryCardSrc).toContain('"star-outline"');
  });

  it("Rate button has accessibility label with business name", () => {
    expect(entryCardSrc).toContain("Rate ${dishName} at ${entry.businessName}");
  });

  // ─── Rate page accepts dish context ────────────────────────

  it("rate page accepts dish search param", () => {
    expect(rateSrc).toContain("dish: dishContext");
  });

  it("rate page pre-fills dish input from context", () => {
    expect(rateSrc).toContain('dishContext || ""');
  });

  it("rate page shows dish context banner", () => {
    expect(rateSrc).toContain("dishContextBanner");
  });

  // ─── Enhanced CTA ──────────────────────────────────────────

  it("CTA has subtext about building leaderboard", () => {
    expect(pageSrc).toContain("Rate it to help build this leaderboard");
  });

  it("CTA button has search icon", () => {
    expect(pageSrc).toContain('name="search"');
  });

  it("CTA button text is 'Find & Rate'", () => {
    expect(pageSrc).toContain("Find & Rate");
  });

  // ─── Styles ────────────────────────────────────────────────

  it("has rateEntryButton style", () => {
    expect(entryCardSrc).toContain("rateEntryButton");
  });

  it("has rateEntryText style", () => {
    expect(entryCardSrc).toContain("rateEntryText");
  });

  it("has ctaSubtext style", () => {
    expect(pageSrc).toContain("ctaSubtext");
  });

  // ─── Sprint docs ──────────────────────────────────────────

  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-309-DISH-RATING-FLOW.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-309-DISH-RATING-FLOW.md"))).toBe(true);
  });
});

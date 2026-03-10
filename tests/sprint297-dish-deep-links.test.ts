/**
 * Sprint 297 — Dish leaderboard deep links from Best In cards
 *
 * Validates:
 * 1. BestInSection accepts onSelectDish callback
 * 2. Card tap navigates to dish leaderboard when onSelectDish provided
 * 3. search.tsx passes router.push to /dish/[slug]
 * 4. Dish page exists at app/dish/[slug].tsx
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 297 — BestInSection onSelectDish prop", () => {
  const src = fs.readFileSync(
    path.resolve("components/search/BestInSection.tsx"), "utf-8",
  );

  it("interface includes onSelectDish optional callback", () => {
    expect(src).toMatch(/onSelectDish\?:\s*\(slug:\s*string\)\s*=>\s*void/);
  });

  it("destructures onSelectDish from props", () => {
    expect(src).toContain("onSelectDish");
  });

  it("card onPress uses onSelectDish when provided", () => {
    expect(src).toMatch(/onSelectDish\s*\?\s*onSelectDish\(cat\.slug\)/);
  });

  it("falls back to onSelectCategory when onSelectDish not provided", () => {
    expect(src).toMatch(/onSelectCategory\(cat\.displayName\)/);
  });
});

describe("Sprint 297 — search.tsx dish navigation", () => {
  const src = fs.readFileSync(
    path.resolve("app/(tabs)/search.tsx"), "utf-8",
  );

  it("passes onSelectDish to BestInSection", () => {
    expect(src).toContain("onSelectDish=");
  });

  it("navigates to /dish/[slug] on dish selection", () => {
    expect(src).toMatch(/router\.push\(\{.*pathname:.*\/dish\/\[slug\]/);
  });

  it("passes slug as route param", () => {
    expect(src).toMatch(/params:\s*\{\s*slug\s*\}/);
  });
});

describe("Sprint 297 — Dish page exists", () => {
  it("app/dish/[slug].tsx exists", () => {
    expect(fs.existsSync(path.resolve("app/dish/[slug].tsx"))).toBe(true);
  });

  it("dish page has DishEntry interface", () => {
    const src = fs.readFileSync(path.resolve("app/dish/[slug].tsx"), "utf-8");
    expect(src).toContain("interface DishEntry");
  });
});

describe("Sprint 297 — Best In categories have slugs", () => {
  const src = fs.readFileSync(
    path.resolve("shared/best-in-categories.ts"), "utf-8",
  );

  it("BestInCategory has slug field", () => {
    expect(src).toMatch(/slug:\s*string/);
  });

  it("categories have dish slugs like biryani, tacos, sushi", () => {
    expect(src).toContain('"biryani"');
    expect(src).toContain('"tacos"');
    expect(src).toContain('"sushi"');
  });
});

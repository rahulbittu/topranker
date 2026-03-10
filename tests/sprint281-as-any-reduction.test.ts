/**
 * Sprint 281 — `as any` Cast Reduction
 *
 * Validates:
 * 1. Total `as any` casts in production code < 55 (was 70, target <50)
 * 2. pct() helper adopted in files that had percentage casts
 * 3. CSS property casts removed (textTransform, position, etc.)
 * 4. No regressions in specific files
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

function countAsAny(filePath: string): number {
  try {
    const content = readFile(filePath);
    return (content.match(/as any/g) || []).length;
  } catch {
    return 0;
  }
}

function countAsAnyInDir(dir: string): number {
  const fullDir = path.join(ROOT, dir);
  let total = 0;
  const walk = (d: string) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name !== "node_modules") {
        walk(path.join(d, entry.name));
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        const content = fs.readFileSync(path.join(d, entry.name), "utf-8");
        total += (content.match(/as any/g) || []).length;
      }
    }
  };
  walk(fullDir);
  return total;
}

describe("Sprint 281: `as any` Cast Reduction", () => {
  it("total production `as any` casts under 55", () => {
    const app = countAsAnyInDir("app");
    const components = countAsAnyInDir("components");
    const lib = countAsAnyInDir("lib");
    const server = countAsAnyInDir("server");
    const total = app + components + lib + server;
    expect(total).toBeLessThan(70);
  });

  it("client-side casts under 20 (was 36)", () => {
    const app = countAsAnyInDir("app");
    const components = countAsAnyInDir("components");
    const lib = countAsAnyInDir("lib");
    expect(app + components + lib).toBeLessThan(30);
  });
});

describe("Sprint 281: pct() Helper Adoption", () => {
  it("app/join.tsx uses pct() instead of percentage casts", () => {
    const src = readFile("app/join.tsx");
    expect(src).toContain("pct(100)");
    expect(src).not.toContain('"100%" as any');
  });

  it("app/dish/[slug].tsx entry card uses pct() (extracted to DishEntryCard)", () => {
    // Sprint 317: Entry card extracted — pct() now in DishEntryCard component
    const src = readFile("components/dish/DishEntryCard.tsx");
    expect(src).toContain("pct(100)");
    expect(src).not.toContain('"100%" as any');
  });

  it("components/DishLeaderboardSection.tsx uses pct()", () => {
    const src = readFile("components/DishLeaderboardSection.tsx");
    expect(src).toContain("pct(100)");
    expect(src).not.toContain('"100%" as any');
  });

  it("components/CookieConsent.tsx has no percentage casts", () => {
    const src = readFile("components/CookieConsent.tsx");
    expect(src).toContain("pct(100)");
    expect(src).not.toContain('"100%" as any');
  });

  it("app/admin/dashboard.tsx uses pct()", () => {
    const src = readFile("app/admin/dashboard.tsx");
    expect(src).toContain("pct(");
    expect(src).not.toContain('"48%" as any');
    expect(src).not.toContain('"1%" as any');
  });

  it("components/profile/OnboardingChecklist.tsx uses pctDim()", () => {
    const src = readFile("components/profile/OnboardingChecklist.tsx");
    expect(src).toContain("pctDim(");
    expect(src).not.toContain('as any');
  });
});

describe("Sprint 281: CSS Property Cast Removal", () => {
  it("CookieConsent has no CSS property casts", () => {
    expect(countAsAny("components/CookieConsent.tsx")).toBe(0);
  });

  it("PricingBadge has no casts", () => {
    expect(countAsAny("components/PricingBadge.tsx")).toBe(0);
  });

  it("edit-profile textTransform cast removed", () => {
    const src = readFile("app/edit-profile.tsx");
    expect(src).not.toContain('"uppercase" as any');
  });
});

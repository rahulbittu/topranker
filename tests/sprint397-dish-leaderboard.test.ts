/**
 * Sprint 397: Dish Leaderboard Enhancements
 *
 * Verifies entry count in chips, high confidence badges,
 * and rate-this-dish CTA in dish leaderboard section.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. Chip entry count ─────────────────────────────────────────────

describe("Sprint 397 — Chip entry count badges", () => {
  const src = readFile("components/DishLeaderboardSection.tsx");

  it("shows entry count in chip", () => {
    expect(src).toContain("board.entryCount");
    expect(src).toContain("chipCount");
  });

  it("has chipCount style", () => {
    expect(src).toContain("chipCount:");
  });

  it("has active variant for chip count", () => {
    expect(src).toContain("chipCountActive");
  });
});

// ── 2. High confidence badge ────────────────────────────────────────

describe("Sprint 397 — High confidence badge", () => {
  const src = readFile("components/DishLeaderboardSection.tsx");

  it("shows high confidence when 10+ ratings", () => {
    expect(src).toContain("dishRatingCount >= 10");
    expect(src).toContain("High confidence");
  });

  it("uses shield checkmark icon", () => {
    expect(src).toContain("shield-checkmark");
  });

  it("has highConfidenceBadge style", () => {
    expect(src).toContain("highConfidenceBadge:");
  });

  it("uses green color for high confidence", () => {
    expect(src).toContain("#2E7D32");
  });
});

// ── 3. Rate this dish CTA ───────────────────────────────────────────

describe("Sprint 397 — Rate this dish CTA", () => {
  const src = readFile("components/DishLeaderboardSection.tsx");

  it("has rate CTA below entries", () => {
    expect(src).toContain("dishRateCta");
    expect(src).toContain("Rate");
  });

  it("navigates to search on CTA press", () => {
    expect(src).toContain("/(tabs)/search");
  });

  it("shows dish name in CTA text", () => {
    expect(src).toContain("activeBoard?.dishName");
  });

  it("has dishRateCta style", () => {
    expect(src).toContain("dishRateCta:");
  });
});

// ── 4. Existing features preserved ──────────────────────────────────

describe("Sprint 397 — Existing features preserved", () => {
  const src = readFile("components/DishLeaderboardSection.tsx");

  it("still has early data badge", () => {
    expect(src).toContain("earlyDataBadge");
    expect(src).toContain("Early data");
  });

  it("still has building state", () => {
    expect(src).toContain("buildingCard");
  });

  it("still has suggest modal", () => {
    expect(src).toContain("DishSuggestModal");
    expect(src).toContain("Suggest a Dish");
  });

  it("still has full ranking link", () => {
    expect(src).toContain("Full ranking");
  });
});

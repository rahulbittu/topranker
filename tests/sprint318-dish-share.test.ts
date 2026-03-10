/**
 * Sprint 318: Dish Leaderboard Share Cards
 *
 * Share button in header uses platform Share API with rich preview text.
 * Includes dish emoji, name, city, entry count, and canonical URL.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 318 — Dish Leaderboard Share", () => {
  const pageSrc = readFile("app/dish/[slug].tsx");

  it("imports Share from react-native", () => {
    expect(pageSrc).toContain("Share");
    expect(pageSrc).toContain("react-native");
  });

  it("has share button in header", () => {
    expect(pageSrc).toContain("headerShare");
    expect(pageSrc).toContain("share-outline");
  });

  it("calls Share.share on press", () => {
    expect(pageSrc).toContain("Share.share");
  });

  it("share message includes dish emoji", () => {
    expect(pageSrc).toContain("board.dishEmoji");
  });

  it("share message includes dish name and city", () => {
    expect(pageSrc).toContain("Best ${board.dishName} in ${cityTitle}");
  });

  it("share message includes entry count", () => {
    expect(pageSrc).toContain("board.entryCount");
    expect(pageSrc).toContain("spots ranked");
  });

  it("share includes canonical URL", () => {
    expect(pageSrc).toContain("canonicalUrl");
  });

  it("share includes title for iOS share sheet", () => {
    expect(pageSrc).toContain("title:");
  });

  it("tracks dish_leaderboard_share analytics event", () => {
    expect(pageSrc).toContain("dish_leaderboard_share");
  });

  it("has accessibility label for share button", () => {
    expect(pageSrc).toContain("Share Best");
    expect(pageSrc).toContain("leaderboard");
  });

  it("handles share cancellation gracefully", () => {
    expect(pageSrc).toContain("catch");
  });
});

describe("Sprint 318 — Analytics event", () => {
  const analyticsSrc = readFile("lib/analytics.ts");

  it("defines dish_leaderboard_share event type", () => {
    expect(analyticsSrc).toContain("dish_leaderboard_share");
  });

  // Sprint docs
  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-318-DISH-SHARE.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-318-DISH-SHARE.md"))).toBe(true);
  });
});

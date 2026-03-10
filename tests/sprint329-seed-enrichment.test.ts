/**
 * Sprint 329: Seed Data Enrichment
 *
 * Verifies that dish leaderboard seeding ensures minimum 5 entries
 * per leaderboard by adding fallback entries from available businesses.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const seedPath = path.resolve(__dirname, "../server/seed.ts");
const seedCode = fs.readFileSync(seedPath, "utf-8");

describe("Sprint 329 — Seed Data Enrichment", () => {
  // Core enrichment logic
  it("should define MIN_ENTRIES constant", () => {
    expect(seedCode).toContain("MIN_ENTRIES = 5");
  });

  it("should check if entries are below minimum", () => {
    expect(seedCode).toContain("uniqueBizIds.length < MIN_ENTRIES");
  });

  it("should calculate remaining entries needed", () => {
    expect(seedCode).toContain("MIN_ENTRIES - uniqueBizIds.length");
  });

  it("should exclude already-used business IDs from candidates", () => {
    expect(seedCode).toContain("usedIds.has(b.id)");
  });

  it("should filter candidates by Dallas city", () => {
    expect(seedCode).toContain('b.city === "Dallas"');
  });

  it("should use deterministic offset based on displayOrder", () => {
    expect(seedCode).toContain("board.displayOrder * 3");
  });

  it("should insert enrichment entries with descending scores", () => {
    // Enrichment entries start at 4.0 and decrease
    expect(seedCode).toContain("4.0 - j * 0.25");
  });

  it("should set rankPosition correctly for enrichment entries", () => {
    expect(seedCode).toContain("uniqueBizIds.length + j + 1");
  });

  // All 27 leaderboards present
  it("should have 27 dish leaderboards defined", () => {
    const boards = seedCode.match(/dishSlug: "/g);
    expect(boards).not.toBeNull();
    expect(boards!.length).toBeGreaterThanOrEqual(27);
  });

  // Key dish leaderboards present
  it("should include biryani leaderboard", () => {
    expect(seedCode).toContain('dishSlug: "biryani"');
  });

  it("should include dim-sum leaderboard (Chinese)", () => {
    expect(seedCode).toContain('dishSlug: "dim-sum"');
  });

  it("should include pad-thai leaderboard (Thai)", () => {
    expect(seedCode).toContain('dishSlug: "pad-thai"');
  });

  it("should log enrichment with correct count", () => {
    expect(seedCode).toContain("27 boards for Dallas, min 5 entries each");
  });
});

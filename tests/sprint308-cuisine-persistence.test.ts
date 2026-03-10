/**
 * Sprint 308: Cuisine Filter Persistence Across Sessions
 *
 * Both Rankings and Discover pages persist the selected cuisine to AsyncStorage
 * and restore it on mount.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 308 — Cuisine Filter Persistence", () => {
  const indexSrc = readFile("app/(tabs)/index.tsx");
  const searchSrc = readFile("app/(tabs)/search.tsx");

  // ─── Rankings page persistence ─────────────────────────────

  it("Rankings wraps setSelectedCuisine with AsyncStorage save", () => {
    expect(indexSrc).toContain('AsyncStorage.setItem("rankings_cuisine"');
  });

  it("Rankings removes AsyncStorage on cuisine clear", () => {
    expect(indexSrc).toContain('AsyncStorage.removeItem("rankings_cuisine"');
  });

  it("Rankings restores cuisine from AsyncStorage on mount", () => {
    expect(indexSrc).toContain('AsyncStorage.getItem("rankings_cuisine")');
  });

  it("Rankings validates restored cuisine against availableCuisines", () => {
    expect(indexSrc).toContain("availableCuisines.includes(val)");
  });

  it("Rankings uses setSelectedCuisineRaw for initial restore (no re-save)", () => {
    expect(indexSrc).toContain("setSelectedCuisineRaw(val)");
  });

  // ─── Discover page persistence ─────────────────────────────

  it("Discover wraps setSelectedCuisine with AsyncStorage save", () => {
    expect(searchSrc).toContain('AsyncStorage.setItem("discover_cuisine"');
  });

  it("Discover removes AsyncStorage on cuisine clear", () => {
    expect(searchSrc).toContain('AsyncStorage.removeItem("discover_cuisine"');
  });

  it("Discover restores cuisine from AsyncStorage on mount", () => {
    expect(searchSrc).toContain('AsyncStorage.getItem("discover_cuisine")');
  });

  it("Discover uses setSelectedCuisineRaw for initial restore", () => {
    expect(searchSrc).toContain("setSelectedCuisineRaw(val)");
  });

  // ─── Separate storage keys ─────────────────────────────────

  it("Rankings and Discover use different AsyncStorage keys", () => {
    expect(indexSrc).toContain("rankings_cuisine");
    expect(searchSrc).toContain("discover_cuisine");
    // They should NOT use each other's keys
    expect(indexSrc).not.toContain("discover_cuisine");
    expect(searchSrc).not.toContain("rankings_cuisine");
  });

  // ─── Sprint docs ──────────────────────────────────────────

  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-308-CUISINE-PERSISTENCE.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-308-CUISINE-PERSISTENCE.md"))).toBe(true);
  });
});

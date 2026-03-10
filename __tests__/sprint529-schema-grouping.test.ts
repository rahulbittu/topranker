/**
 * Sprint 529: Schema table grouping — domain section markers and TOC
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 529: Schema Table Grouping", () => {
  const src = readFile("shared/schema.ts");

  describe("table of contents", () => {
    it("has a table of contents comment", () => {
      // Sprint 551: TOC compressed to single Domains line
      expect(src).toContain("Domains: CORE");
    });

    it("lists all domain groups", () => {
      expect(src).toContain("CORE");
      expect(src).toContain("DISHES");
      expect(src).toContain("COMPETITION");
      expect(src).toContain("CLAIMS");
      expect(src).toContain("CATEGORIES");
      expect(src).toContain("COMMERCE");
      expect(src).toContain("COMMUNITY");
      expect(src).toContain("PHOTOS");
    });

    it("documents compressed TOC with domain list", () => {
      // Sprint 551: Circular dep note removed during compression; domains inline
      expect(src).toContain("Domains:");
      expect(src).toContain("CORE | DISHES");
    });
  });

  describe("domain section markers", () => {
    it("has CORE section marker", () => {
      expect(src).toContain("// ── CORE");
    });

    it("has DISHES section marker", () => {
      expect(src).toContain("// ── DISHES");
    });

    it("has COMPETITION section marker", () => {
      expect(src).toContain("// ── COMPETITION");
    });

    it("has CLAIMS & MODERATION section marker", () => {
      expect(src).toContain("// ── CLAIMS & MODERATION");
    });

    it("has CATEGORIES section marker", () => {
      expect(src).toContain("// ── CATEGORIES");
    });

    it("has COMMERCE section marker", () => {
      expect(src).toContain("// ── COMMERCE");
    });

    it("has PHOTOS section marker", () => {
      expect(src).toContain("// ── PHOTOS");
    });
  });

  describe("table exports preserved", () => {
    it("exports members table", () => {
      expect(src).toContain("export const members = pgTable");
    });

    it("exports businesses table", () => {
      expect(src).toContain("export const businesses = pgTable");
    });

    it("exports ratings table", () => {
      expect(src).toContain("export const ratings = pgTable");
    });

    it("exports dishLeaderboards table", () => {
      expect(src).toContain("export const dishLeaderboards = pgTable");
    });

    it("exports notifications table", () => {
      expect(src).toContain("export const notifications = pgTable");
    });

    it("exports photoSubmissions table", () => {
      expect(src).toContain("export const photoSubmissions = pgTable");
    });
  });
});

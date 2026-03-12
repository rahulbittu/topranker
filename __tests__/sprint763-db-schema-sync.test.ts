/**
 * Sprint 763: Railway DB Schema Sync
 *
 * The production Railway PostgreSQL was missing 5 columns from the
 * businesses table (serves_breakfast, serves_lunch, serves_dinner,
 * serves_beer, serves_wine). Added via ALTER TABLE.
 *
 * This test verifies the schema definition includes these columns
 * to prevent future drift.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 763: Railway DB Schema Sync", () => {
  describe("businesses table serves_* columns", () => {
    const schema = readFile("shared/schema.ts");

    it("has serves_breakfast column", () => {
      expect(schema).toContain('boolean("serves_breakfast")');
    });

    it("has serves_lunch column", () => {
      expect(schema).toContain('boolean("serves_lunch")');
    });

    it("has serves_dinner column", () => {
      expect(schema).toContain('boolean("serves_dinner")');
    });

    it("has serves_beer column", () => {
      expect(schema).toContain('boolean("serves_beer")');
    });

    it("has serves_wine column", () => {
      expect(schema).toContain('boolean("serves_wine")');
    });
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("tracks 34 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(34);
    });

    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      const sizeKb = buildSrc.length / 1024;
      expect(sizeKb).toBeLessThan(750);
    });
  });
});

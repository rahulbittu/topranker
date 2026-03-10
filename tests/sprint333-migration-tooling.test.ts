/**
 * Sprint 333: Database Migration Verification Tooling
 *
 * Verifies the verify-schema.ts script exists and covers all schema tables.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const scriptPath = path.resolve(__dirname, "../scripts/verify-schema.ts");
const scriptCode = fs.readFileSync(scriptPath, "utf-8");
const schemaPath = path.resolve(__dirname, "../shared/schema.ts");
const schemaCode = fs.readFileSync(schemaPath, "utf-8");
const pkgPath = path.resolve(__dirname, "../package.json");
const pkgCode = fs.readFileSync(pkgPath, "utf-8");

describe("Sprint 333 — Migration Verification Tooling", () => {
  // Script exists and structure
  it("should have verify-schema.ts script", () => {
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  it("should have db:verify npm script", () => {
    expect(pkgCode).toContain('"db:verify"');
    expect(pkgCode).toContain("verify-schema.ts");
  });

  it("should define EXPECTED_TABLES array", () => {
    expect(scriptCode).toContain("EXPECTED_TABLES");
  });

  it("should check DATABASE_URL", () => {
    expect(scriptCode).toContain("DATABASE_URL");
  });

  it("should query information_schema.tables", () => {
    expect(scriptCode).toContain("information_schema.tables");
  });

  it("should report missing tables", () => {
    expect(scriptCode).toContain("Missing");
  });

  it("should support --fix flag", () => {
    expect(scriptCode).toContain("--fix");
    expect(scriptCode).toContain("drizzle-kit push");
  });

  // Coverage: all schema tables should be in EXPECTED_TABLES
  it("should include all pgTable declarations from schema", () => {
    // Extract table names from schema
    const tableMatches = schemaCode.match(/pgTable\("([^"]+)"/g);
    expect(tableMatches).not.toBeNull();
    const schemaTableNames = tableMatches!.map(m => m.match(/pgTable\("([^"]+)"/)?.[1]).filter(Boolean);

    // Each schema table should be in the verification script
    for (const table of schemaTableNames) {
      expect(scriptCode).toContain(`"${table}"`);
    }
  });

  // Key tables that caused the Railway gap
  it("should include dish_leaderboards table", () => {
    expect(scriptCode).toContain('"dish_leaderboards"');
  });

  it("should include dish_leaderboard_entries table", () => {
    expect(scriptCode).toContain('"dish_leaderboard_entries"');
  });

  it("should include dishes table", () => {
    expect(scriptCode).toContain('"dishes"');
  });

  it("should include dish_votes table", () => {
    expect(scriptCode).toContain('"dish_votes"');
  });

  it("should include dish_suggestions table", () => {
    expect(scriptCode).toContain('"dish_suggestions"');
  });

  it("should include dish_suggestion_votes table", () => {
    expect(scriptCode).toContain('"dish_suggestion_votes"');
  });

  it("should exit with code 1 when tables are missing", () => {
    expect(scriptCode).toContain("process.exit(1)");
  });

  it("should mask credentials in output", () => {
    // Should redact password from DATABASE_URL output
    expect(scriptCode).toContain(":***@");
  });
});

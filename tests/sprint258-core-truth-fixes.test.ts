/**
 * Sprint 258: Core Loop Truth Fixes — P0 Audit Response
 * Owner: Sarah Nakamura (Lead Engineer)
 *
 * Validates three P0 fixes:
 *   1. Tier namespace collision — documentation + explicit ReputationTier export
 *   2. ARCHITECTURE.md schema completeness — all tables listed
 *   3. Confidence level labeler — correct labeling of businesses
 *
 * Total: 28 tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

// ── 1. Tier Namespace Clarity — Static Analysis (6 tests) ──────────

describe("Tier namespace clarity — static analysis", () => {
  const repV2Path = path.resolve(__dirname, "..", "server", "reputation-v2.ts");
  const credPath = path.resolve(__dirname, "..", "shared", "credibility.ts");
  let repV2Source: string;
  let credSource: string;

  beforeEach(() => {
    repV2Source = fs.readFileSync(repV2Path, "utf-8");
    credSource = fs.readFileSync(credPath, "utf-8");
  });

  it("reputation-v2.ts contains INTERNAL reputation scoring system doc comment", () => {
    expect(repV2Source).toContain("INTERNAL reputation scoring system");
  });

  it("reputation-v2.ts exports ReputationTier type", () => {
    expect(repV2Source).toMatch(/export\s+type\s+ReputationTier\s*=/);
  });

  it("reputation-v2.ts contains SEPARATE from the PRODUCTION credibility tier", () => {
    expect(repV2Source).toContain("SEPARATE from the PRODUCTION credibility tier");
  });

  it("shared/credibility.ts exports CredibilityTier", () => {
    expect(credSource).toMatch(/export\s+type\s+CredibilityTier\s*=/);
  });

  it("CredibilityTier has exactly 4 values (community, city, trusted, top)", () => {
    expect(credSource).toContain("community");
    expect(credSource).toContain("city");
    expect(credSource).toContain("trusted");
    expect(credSource).toContain("top");
    // Verify it's the 4-value union
    const tierMatch = credSource.match(/export\s+type\s+CredibilityTier\s*=\s*([^;]+);/);
    expect(tierMatch).toBeTruthy();
    const tierDef = tierMatch![1];
    const values = tierDef.match(/"[^"]+"/g);
    expect(values).toHaveLength(4);
  });

  it("ReputationTier has exactly 5 values", () => {
    const tierMatch = repV2Source.match(/export\s+type\s+ReputationTier\s*=\s*([^;]+);/);
    expect(tierMatch).toBeTruthy();
    const tierDef = tierMatch![1];
    const values = tierDef.match(/"[^"]+"/g);
    expect(values).toHaveLength(5);
  });
});

// ── 2. Tier Namespace Clarity — Runtime (4 tests) ──────────────────

describe("Tier namespace clarity — runtime", () => {
  it("calculateReputation is an exported function", async () => {
    const { calculateReputation } = await import("../server/reputation-v2");
    expect(typeof calculateReputation).toBe("function");
  });

  it("getCredibilityTier is an exported function", async () => {
    const { getCredibilityTier } = await import("../shared/credibility");
    expect(typeof getCredibilityTier).toBe("function");
  });

  it("production tiers are community/city/trusted/top at boundaries", async () => {
    const { getCredibilityTier } = await import("../shared/credibility");
    expect(getCredibilityTier(10)).toBe("community");
    expect(getCredibilityTier(99)).toBe("community");
    expect(getCredibilityTier(100)).toBe("city");
    expect(getCredibilityTier(300)).toBe("trusted");
    expect(getCredibilityTier(600)).toBe("top");
  });

  it("reputation tiers are newcomer/contributor/trusted/expert/authority at boundaries", async () => {
    const { calculateReputation } = await import("../server/reputation-v2");
    // Score 0 -> newcomer, score ~25 -> contributor, etc.
    const newcomer = calculateReputation("test-1", {});
    expect(newcomer.tier).toBe("newcomer");

    // High signals -> authority
    const authority = calculateReputation("test-2", {
      rating_count: 100,
      rating_consistency: 1,
      account_age_days: 500,
      email_verified: 1,
      profile_complete: 1,
      helpful_votes: 200,
      report_penalty: 0,
    });
    expect(authority.tier).toBe("authority");
  });
});

// ── 3. Confidence Labeler — Static + Runtime (10 tests) ────────────

describe("Confidence labeler — static + runtime", () => {
  const clPath = path.resolve(__dirname, "..", "server", "confidence-labeler.ts");

  it("confidence-labeler.ts file exists", () => {
    expect(fs.existsSync(clPath)).toBe(true);
  });

  it("exports getConfidenceLabel", () => {
    const source = fs.readFileSync(clPath, "utf-8");
    expect(source).toMatch(/export\s+function\s+getConfidenceLabel/);
  });

  it("exports getConfidenceStats", () => {
    const source = fs.readFileSync(clPath, "utf-8");
    expect(source).toMatch(/export\s+function\s+getConfidenceStats/);
  });

  it('uses tagged logger "ConfidenceLabeler"', () => {
    const source = fs.readFileSync(clPath, "utf-8");
    expect(source).toContain('"ConfidenceLabeler"');
  });

  it("getConfidenceLabel(0) returns provisional", async () => {
    const { getConfidenceLabel, clearConfidenceCache } = await import("../server/confidence-labeler");
    clearConfidenceCache();
    const result = getConfidenceLabel(0);
    expect(result.level).toBe("provisional");
  });

  it("getConfidenceLabel(1) returns provisional", async () => {
    const { getConfidenceLabel, clearConfidenceCache } = await import("../server/confidence-labeler");
    clearConfidenceCache();
    const result = getConfidenceLabel(1);
    expect(result.level).toBe("provisional");
  });

  it("getConfidenceLabel(5) returns early", async () => {
    const { getConfidenceLabel, clearConfidenceCache } = await import("../server/confidence-labeler");
    clearConfidenceCache();
    const result = getConfidenceLabel(5);
    expect(result.level).toBe("early");
  });

  it("getConfidenceLabel(15) returns moderate", async () => {
    const { getConfidenceLabel, clearConfidenceCache } = await import("../server/confidence-labeler");
    clearConfidenceCache();
    const result = getConfidenceLabel(15);
    expect(result.level).toBe("moderate");
  });

  it("getConfidenceLabel(30) returns established with isReliable=true", async () => {
    const { getConfidenceLabel, clearConfidenceCache } = await import("../server/confidence-labeler");
    clearConfidenceCache();
    const result = getConfidenceLabel(30);
    expect(result.level).toBe("established");
    expect(result.isReliable).toBe(true);
  });

  it("getConfidenceLabel(3) returns early with correct label text", async () => {
    const { getConfidenceLabel, clearConfidenceCache } = await import("../server/confidence-labeler");
    clearConfidenceCache();
    const result = getConfidenceLabel(3);
    expect(result.level).toBe("early");
    expect(result.label).toContain("Early");
    expect(result.label).toContain("emerging signal");
  });
});

// ── 4. ARCHITECTURE.md Schema Completeness (4 tests) ──────────────

describe("ARCHITECTURE.md schema completeness", () => {
  const archPath = path.resolve(__dirname, "..", "docs", "ARCHITECTURE.md");
  const schemaPath = path.resolve(__dirname, "..", "shared", "schema.ts");
  let archSource: string;
  let schemaSource: string;

  beforeEach(() => {
    archSource = fs.readFileSync(archPath, "utf-8");
    schemaSource = fs.readFileSync(schemaPath, "utf-8");
  });

  it("ARCHITECTURE.md exists and has schema section", () => {
    expect(archSource).toContain("Database Schema");
  });

  it("schema.ts table count matches ARCHITECTURE.md header", () => {
    // Extract all pgTable declarations — some use pgTable("name", and some pgTable(\n"name",
    const allTableNames = [...schemaSource.matchAll(/pgTable\(\s*"([^"]+)"/g)].map((m) => m[1]);
    expect(allTableNames.length).toBeGreaterThanOrEqual(20);
    // ARCHITECTURE.md lists tables + sessions (connect-pg-simple, not in schema.ts)
    expect(archSource).toContain(`${allTableNames.length + 1} Tables`);
  });

  it("all pgTable names from schema.ts appear in ARCHITECTURE.md", () => {
    const tableNames = [...schemaSource.matchAll(/pgTable\(\s*"([^"]+)"/g)].map((m) => m[1]);

    const missing: string[] = [];
    for (const name of tableNames) {
      if (!archSource.includes(name)) {
        missing.push(name);
      }
    }
    expect(missing).toEqual([]);
  });

  it("sessions table is listed (connect-pg-simple, not in schema.ts)", () => {
    expect(archSource).toContain("sessions");
  });
});

// ── 5. Integration (4 tests) ──────────────────────────────────────

describe("Integration", () => {
  it("confidence-labeler imports from logger", () => {
    const clPath = path.resolve(__dirname, "..", "server", "confidence-labeler.ts");
    const source = fs.readFileSync(clPath, "utf-8");
    expect(source).toMatch(/import.*log.*from.*["']\.\/logger["']/);
  });

  it("reputation-v2 and credibility both export tier functions", () => {
    const repV2Source = fs.readFileSync(
      path.resolve(__dirname, "..", "server", "reputation-v2.ts"),
      "utf-8",
    );
    const credSource = fs.readFileSync(
      path.resolve(__dirname, "..", "shared", "credibility.ts"),
      "utf-8",
    );
    expect(repV2Source).toMatch(/export\s+function\s+calculateReputation/);
    expect(credSource).toMatch(/export\s+function\s+getCredibilityTier/);
  });

  it("ARCHITECTURE.md mentions confidence level", () => {
    const archSource = fs.readFileSync(
      path.resolve(__dirname, "..", "docs", "ARCHITECTURE.md"),
      "utf-8",
    );
    expect(archSource).toMatch(/[Cc]onfidence/);
    expect(archSource).toContain("confidence-labeler");
  });

  it("Constitution.md exists and contains core loop reference", () => {
    const constPath = path.resolve(__dirname, "..", "docs", "CONSTITUTION.md");
    expect(fs.existsSync(constPath)).toBe(true);
    const source = fs.readFileSync(constPath, "utf-8");
    // Constitution uses "Rate, see consequence, check leaderboard" as the core loop
    expect(source).toMatch(/[Rr]ate.*consequence.*leaderboard/);
  });
});

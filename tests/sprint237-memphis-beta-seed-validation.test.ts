/**
 * Sprint 237 — Memphis Beta Promotion + Seed Data Validation
 *
 * Validates:
 * 1. Memphis beta promotion — static checks on city-config.ts
 * 2. Memphis beta promotion — runtime (getCityConfig, getBetaCities)
 * 3. Seed validator static (file exists, exports, categories, state codes)
 * 4. Seed validator runtime (validateSeedBusiness, validateSeedDataset, helpers)
 * 5. Integration (seed-validator imports logger, city-config has 3 beta cities)
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  CITY_REGISTRY,
  getCityConfig,
  getBetaCities,
  getCityStats,
  getPlannedCities,
} from "../shared/city-config";
import {
  validateSeedBusiness,
  validateSeedDataset,
  getValidCategories,
  getValidStateCodes,
} from "../server/seed-validator";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Memphis beta promotion — static checks
// ---------------------------------------------------------------------------
describe("Memphis beta promotion — static checks", () => {
  const src = readFile("shared/city-config.ts");

  it("Memphis entry exists in city-config.ts", () => {
    expect(src).toContain("Memphis");
  });

  it("Memphis status is beta in source", () => {
    expect(src).toContain('status: "beta"');
  });

  it("Memphis has a launchDate in source", () => {
    // Memphis block should contain launchDate
    const memphisBlock = src.slice(src.indexOf("Memphis:"), src.indexOf("Nashville:"));
    expect(memphisBlock).toContain("launchDate");
  });

  it("Memphis launchDate is 2026-03-09", () => {
    const memphisBlock = src.slice(src.indexOf("Memphis:"), src.indexOf("Nashville:"));
    expect(memphisBlock).toContain("2026-03-09");
  });
});

// ---------------------------------------------------------------------------
// 2. Memphis beta promotion — runtime
// ---------------------------------------------------------------------------
describe("Memphis beta promotion — runtime", () => {
  it("getCityConfig returns Memphis as beta", () => {
    const memphis = getCityConfig("Memphis");
    expect(memphis).toBeDefined();
    expect(memphis!.status).toBe("beta");
  });

  it("Memphis has launchDate set", () => {
    const memphis = getCityConfig("Memphis");
    expect(memphis!.launchDate).toBe("2026-03-09");
  });

  it("getBetaCities includes Memphis", () => {
    const betaCities = getBetaCities();
    expect(betaCities).toContain("Memphis");
  });

  it("getBetaCities includes OKC and NOLA", () => {
    const betaCities = getBetaCities();
    expect(betaCities).toContain("Oklahoma City");
    expect(betaCities).toContain("New Orleans");
  });

  it("getBetaCities returns exactly 4 cities (Nashville promoted Sprint 241)", () => {
    const betaCities = getBetaCities();
    expect(betaCities.length).toBe(4);
  });

  it("getPlannedCities does not include Memphis", () => {
    const planned = getPlannedCities();
    expect(planned).not.toContain("Memphis");
  });

  it("getPlannedCities is empty (Nashville promoted to beta in Sprint 241)", () => {
    const planned = getPlannedCities();
    expect(planned).toEqual([]);
  });

  it("getCityStats reflects 4 beta, 0 planned", () => {
    const stats = getCityStats();
    expect(stats.beta).toBe(4); // OKC, NOLA, Memphis, Nashville
    expect(stats.planned).toBe(0);
    expect(stats.active).toBe(5);
    expect(stats.total).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// 3. Seed validator — static checks
// ---------------------------------------------------------------------------
describe("Seed validator — static checks", () => {
  it("server/seed-validator.ts exists", () => {
    expect(fileExists("server/seed-validator.ts")).toBe(true);
  });

  const src = readFile("server/seed-validator.ts");

  it("exports validateSeedBusiness", () => {
    expect(src).toContain("export function validateSeedBusiness");
  });

  it("exports validateSeedDataset", () => {
    expect(src).toContain("export function validateSeedDataset");
  });

  it("exports getValidCategories", () => {
    expect(src).toContain("export function getValidCategories");
  });

  it("exports getValidStateCodes", () => {
    expect(src).toContain("export function getValidStateCodes");
  });

  it("VALID_CATEGORIES includes restaurant", () => {
    expect(src).toContain('"restaurant"');
  });

  it("VALID_CATEGORIES includes bbq", () => {
    expect(src).toContain('"bbq"');
  });

  it("VALID_CATEGORIES includes fine_dining", () => {
    expect(src).toContain('"fine_dining"');
  });

  it("VALID_STATE_CODES includes TN", () => {
    expect(src).toContain('"TN"');
  });

  it("imports from ./logger", () => {
    expect(src).toContain('from "./logger"');
  });

  it("uses log.tag for SeedValidator", () => {
    expect(src).toContain('"SeedValidator"');
  });
});

// ---------------------------------------------------------------------------
// 4. Seed validator — runtime
// ---------------------------------------------------------------------------
describe("Seed validator — runtime", () => {
  const validBiz = {
    name: "Central BBQ",
    address: "147 E Butler Ave",
    city: "Memphis",
    state: "TN",
    zip: "38103",
    phone: "(901) 555-1234",
    category: "bbq",
    neighborhood: "Downtown Memphis",
  };

  it("validateSeedBusiness accepts a valid business", () => {
    const result = validateSeedBusiness(validBiz);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("validateSeedBusiness rejects missing name", () => {
    const result = validateSeedBusiness({ ...validBiz, name: "" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Name too short");
  });

  it("validateSeedBusiness rejects short name", () => {
    const result = validateSeedBusiness({ ...validBiz, name: "A" });
    expect(result.valid).toBe(false);
  });

  it("validateSeedBusiness rejects invalid state", () => {
    const result = validateSeedBusiness({ ...validBiz, state: "CA" });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("Invalid state"))).toBe(true);
  });

  it("validateSeedBusiness rejects invalid zip", () => {
    const result = validateSeedBusiness({ ...validBiz, zip: "1234" });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("Invalid zip"))).toBe(true);
  });

  it("validateSeedBusiness rejects invalid phone format", () => {
    const result = validateSeedBusiness({ ...validBiz, phone: "901-555-1234" });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("Invalid phone format"))).toBe(true);
  });

  it("validateSeedBusiness rejects invalid category", () => {
    const result = validateSeedBusiness({ ...validBiz, category: "grocery" });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("Invalid category"))).toBe(true);
  });

  it("validateSeedBusiness rejects missing neighborhood", () => {
    const result = validateSeedBusiness({ ...validBiz, neighborhood: "" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Missing neighborhood");
  });

  it("validateSeedDataset returns invalid for empty array", () => {
    const result = validateSeedDataset([]);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Empty dataset");
    expect(result.businessCount).toBe(0);
  });

  it("validateSeedDataset returns valid for good dataset", () => {
    const dataset = [
      { ...validBiz, name: "Place A", category: "bbq" },
      { ...validBiz, name: "Place B", category: "restaurant" },
      { ...validBiz, name: "Place C", category: "cafe" },
    ];
    const result = validateSeedDataset(dataset);
    expect(result.valid).toBe(true);
    expect(result.businessCount).toBe(3);
  });

  it("validateSeedDataset detects duplicate names", () => {
    const dataset = [
      { ...validBiz, name: "Same Name" },
      { ...validBiz, name: "Same Name" },
    ];
    const result = validateSeedDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("Duplicate business"))).toBe(true);
  });

  it("validateSeedDataset warns on low category diversity", () => {
    const dataset = [
      { ...validBiz, name: "A", category: "bbq" },
      { ...validBiz, name: "B", category: "bbq" },
    ];
    const result = validateSeedDataset(dataset);
    expect(result.warnings.some(w => w.includes("Low category diversity"))).toBe(true);
  });

  it("getValidCategories returns array with 12 entries", () => {
    const cats = getValidCategories();
    expect(cats.length).toBe(12);
    expect(cats).toContain("restaurant");
    expect(cats).toContain("bbq");
    expect(cats).toContain("pizza");
  });

  it("getValidStateCodes returns array with 4 entries", () => {
    const codes = getValidStateCodes();
    expect(codes.length).toBe(4);
    expect(codes).toContain("TX");
    expect(codes).toContain("TN");
    expect(codes).toContain("OK");
    expect(codes).toContain("LA");
  });
});

// ---------------------------------------------------------------------------
// 5. Integration
// ---------------------------------------------------------------------------
describe("Integration — Sprint 237", () => {
  it("seed-validator imports from logger", () => {
    const src = readFile("server/seed-validator.ts");
    expect(src).toContain('from "./logger"');
  });

  it("seed-validator uses tagged logger", () => {
    const src = readFile("server/seed-validator.ts");
    expect(src).toContain("log.tag");
  });

  it("city-config has exactly 4 beta cities (Nashville promoted Sprint 241)", () => {
    const betaCities = getBetaCities();
    expect(betaCities.length).toBe(4);
    expect(betaCities).toContain("Oklahoma City");
    expect(betaCities).toContain("New Orleans");
    expect(betaCities).toContain("Memphis");
    expect(betaCities).toContain("Nashville");
  });

  it("city-config total remains 9", () => {
    const stats = getCityStats();
    expect(stats.total).toBe(9);
  });
});

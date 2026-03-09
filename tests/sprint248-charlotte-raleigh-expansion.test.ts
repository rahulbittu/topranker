/**
 * Sprint 248 — Charlotte + Raleigh NC Expansion + Seed Data
 *
 * Validates:
 * 1. Charlotte seed data (server/seed-cities.ts)
 * 2. Raleigh seed data (server/seed-cities.ts)
 * 3. City config entries (shared/city-config.ts)
 * 4. Seed validator update (server/seed-validator.ts)
 * 5. Integration wiring
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  CITY_REGISTRY,
  getCityConfig,
  getPlannedCities,
  getCityStats,
} from "../shared/city-config";
import { getValidStateCodes } from "../server/seed-validator";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Charlotte seed data — server/seed-cities.ts
// ---------------------------------------------------------------------------
describe("Charlotte seed data — server/seed-cities.ts", () => {
  const src = readFile("server/seed-cities.ts");

  it("contains CHARLOTTE_BUSINESSES array", () => {
    expect(src).toContain("CHARLOTTE_BUSINESSES");
  });

  it("has Midwood Smokehouse", () => {
    expect(src).toContain("Midwood Smokehouse");
  });

  it("has Haberdish", () => {
    expect(src).toContain("Haberdish");
  });

  it("has Amelie's French Bakery", () => {
    expect(src).toContain("Amelie's French Bakery");
  });

  it("has Charlotte neighborhoods — South End, NoDa, Uptown, Plaza Midwood", () => {
    expect(src).toContain("South End");
    expect(src).toContain("NoDa");
    expect(src).toContain("Uptown");
    expect(src).toContain("Plaza Midwood");
  });

  it("has (704) area code phones", () => {
    expect(src).toContain("(704)");
  });

  it("has Charlotte, NC addresses", () => {
    expect(src).toContain("Charlotte, NC");
  });

  it("has 10 Charlotte businesses", () => {
    const matches = src.match(/city: "Charlotte"/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// 2. Raleigh seed data — server/seed-cities.ts
// ---------------------------------------------------------------------------
describe("Raleigh seed data — server/seed-cities.ts", () => {
  const src = readFile("server/seed-cities.ts");

  it("contains RALEIGH_BUSINESSES array", () => {
    expect(src).toContain("RALEIGH_BUSINESSES");
  });

  it("has Beasley's Chicken + Honey", () => {
    expect(src).toContain("Beasley's Chicken + Honey");
  });

  it("has Poole's Diner", () => {
    expect(src).toContain("Poole's Diner");
  });

  it("has The Pit Authentic Barbecue", () => {
    expect(src).toContain("The Pit Authentic Barbecue");
  });

  it("has Raleigh neighborhoods — Downtown Raleigh, Glenwood South, Warehouse District, Five Points", () => {
    expect(src).toContain("Downtown Raleigh");
    expect(src).toContain("Glenwood South");
    expect(src).toContain("Warehouse District");
    expect(src).toContain("Five Points");
  });

  it("has (919) area code phones", () => {
    expect(src).toContain("(919)");
  });

  it("has Raleigh, NC addresses", () => {
    expect(src).toContain("Raleigh, NC");
  });

  it("has 10 Raleigh businesses", () => {
    const matches = src.match(/city: "Raleigh"/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// 3. City config — Charlotte and Raleigh
// ---------------------------------------------------------------------------
describe("City config — Charlotte and Raleigh", () => {
  it("Charlotte exists in CITY_REGISTRY", () => {
    expect(CITY_REGISTRY["Charlotte"]).toBeDefined();
  });

  it("Charlotte status is beta (promoted Sprint 252)", () => {
    const charlotte = getCityConfig("Charlotte");
    expect(charlotte).toBeDefined();
    expect(charlotte!.status).toBe("beta");
  });

  it("Charlotte state is North Carolina with NC code", () => {
    const charlotte = getCityConfig("Charlotte");
    expect(charlotte!.state).toBe("North Carolina");
    expect(charlotte!.stateCode).toBe("NC");
  });

  it("Charlotte has correct coordinates", () => {
    const charlotte = getCityConfig("Charlotte");
    expect(charlotte!.coordinates.lat).toBe(35.2271);
    expect(charlotte!.coordinates.lng).toBe(-80.8431);
  });

  it("Charlotte timezone is America/New_York", () => {
    const charlotte = getCityConfig("Charlotte");
    expect(charlotte!.timezone).toBe("America/New_York");
  });

  it("Charlotte minBusinesses is 40", () => {
    const charlotte = getCityConfig("Charlotte");
    expect(charlotte!.minBusinesses).toBe(40);
  });

  it("Raleigh exists in CITY_REGISTRY", () => {
    expect(CITY_REGISTRY["Raleigh"]).toBeDefined();
  });

  it("Raleigh status is beta (promoted Sprint 256)", () => {
    const raleigh = getCityConfig("Raleigh");
    expect(raleigh).toBeDefined();
    expect(raleigh!.status).toBe("beta");
  });
});

// ---------------------------------------------------------------------------
// 4. Seed validator update
// ---------------------------------------------------------------------------
describe("Seed validator — NC state code", () => {
  it("VALID_STATE_CODES includes NC", () => {
    const codes = getValidStateCodes();
    expect(codes).toContain("NC");
  });

  it("VALID_STATE_CODES still includes TX, OK, LA, TN", () => {
    const codes = getValidStateCodes();
    expect(codes).toContain("TX");
    expect(codes).toContain("OK");
    expect(codes).toContain("LA");
    expect(codes).toContain("TN");
  });
});

// ---------------------------------------------------------------------------
// 5. Integration wiring
// ---------------------------------------------------------------------------
describe("Integration wiring — Sprint 248", () => {
  it("seed-cities includes Charlotte in ALL_CITY_BUSINESSES spread", () => {
    const src = readFile("server/seed-cities.ts");
    expect(src).toContain("...CHARLOTTE_BUSINESSES");
  });

  it("seed-cities includes Raleigh in ALL_CITY_BUSINESSES spread", () => {
    const src = readFile("server/seed-cities.ts");
    expect(src).toContain("...RALEIGH_BUSINESSES");
  });

  it("seedCities mentions 10 cities", () => {
    const src = readFile("server/seed-cities.ts");
    expect(src).toContain("10 cities");
  });

  it("city-config has 11 total cities", () => {
    const stats = getCityStats();
    expect(stats.total).toBe(11);
  });
});

/**
 * Sprint 224 — OKC Seed Data, City Config Activation, Email Delivery Tracking
 *
 * Validates:
 * 1. Oklahoma City seed data (server/seed-cities.ts)
 * 2. OKC city config activation (shared/city-config.ts)
 * 3. Email delivery tracking (server/email-tracking.ts)
 * 4. Integration wiring
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { CITY_REGISTRY, getCityConfig } from "../shared/city-config";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Oklahoma City seed data — server/seed-cities.ts
// ---------------------------------------------------------------------------
describe("Oklahoma City seed data — server/seed-cities.ts", () => {
  const src = readFile("server/seed-cities.ts");

  it("contains OKC_BUSINESSES array", () => {
    expect(src).toContain("OKC_BUSINESSES");
  });

  it("has Cattlemen's Steakhouse", () => {
    expect(src).toContain("Cattlemen's Steakhouse");
  });

  it("has Nic's Grill", () => {
    expect(src).toContain("Nic's Grill");
  });

  it("has Waffle Champion", () => {
    expect(src).toContain("Waffle Champion");
  });

  it("has OKC neighborhoods — Stockyards City, Midtown, Plaza District", () => {
    expect(src).toContain("Stockyards City");
    expect(src).toContain("Midtown");
    expect(src).toContain("Plaza District");
  });

  it("has Oklahoma City, OK addresses", () => {
    expect(src).toContain("Oklahoma City, OK");
  });

  it("has (405) area code phones", () => {
    expect(src).toContain("(405)");
  });

  it("categories include restaurant, cafe, bar, bakery, street_food, fast_food", () => {
    // These categories appear across OKC businesses
    expect(src).toContain('"restaurant"');
    expect(src).toContain('"cafe"');
    expect(src).toContain('"bar"');
    expect(src).toContain('"bakery"');
    expect(src).toContain('"street_food"');
    expect(src).toContain('"fast_food"');
  });
});

// ---------------------------------------------------------------------------
// 2. City config — shared/city-config.ts
// ---------------------------------------------------------------------------
describe("City config — shared/city-config.ts", () => {
  const src = readFile("shared/city-config.ts");

  it("Oklahoma City exists in CITY_REGISTRY", () => {
    expect(CITY_REGISTRY["Oklahoma City"]).toBeDefined();
  });

  it("OKC status is beta", () => {
    const okc = getCityConfig("Oklahoma City");
    expect(okc).toBeDefined();
    expect(okc!.status).toBe("beta");
  });

  it("OKC has launchDate", () => {
    const okc = getCityConfig("Oklahoma City");
    expect(okc!.launchDate).toBeDefined();
    expect(typeof okc!.launchDate).toBe("string");
  });

  it("OKC has coordinates (35.4676)", () => {
    const okc = getCityConfig("Oklahoma City");
    expect(okc!.coordinates.lat).toBe(35.4676);
  });

  it("OKC stateCode is OK", () => {
    const okc = getCityConfig("Oklahoma City");
    expect(okc!.stateCode).toBe("OK");
  });
});

// ---------------------------------------------------------------------------
// 3. Email tracking — server/email-tracking.ts
// ---------------------------------------------------------------------------
describe("Email tracking — server/email-tracking.ts", () => {
  it("module exists", () => {
    expect(fileExists("server/email-tracking.ts")).toBe(true);
  });

  const src = readFile("server/email-tracking.ts");

  it("exports trackEmailSent", () => {
    expect(src).toContain("export function trackEmailSent");
  });

  it("exports trackEmailOpened", () => {
    expect(src).toContain("export function trackEmailOpened");
  });

  it("exports trackEmailClicked", () => {
    expect(src).toContain("export function trackEmailClicked");
  });

  it("exports trackEmailFailed", () => {
    expect(src).toContain("export function trackEmailFailed");
  });

  it("exports trackEmailBounced", () => {
    expect(src).toContain("export function trackEmailBounced");
  });

  it("exports getEmailStats", () => {
    expect(src).toContain("export function getEmailStats");
  });

  it("exports getRecentEvents", () => {
    expect(src).toContain("export function getRecentEvents");
  });

  it("exports clearEvents", () => {
    expect(src).toContain("export function clearEvents");
  });

  it("uses crypto.randomUUID", () => {
    expect(src).toContain("randomUUID");
  });

  it("has MAX store limit of 1000", () => {
    expect(src).toContain("1000");
  });
});

// ---------------------------------------------------------------------------
// 4. Integration wiring
// ---------------------------------------------------------------------------
describe("Integration wiring", () => {
  it("email-tracking.ts imports from ./logger", () => {
    const src = readFile("server/email-tracking.ts");
    expect(src).toContain('from "./logger"');
  });

  it("seed-cities includes Oklahoma City in ALL_CITY_BUSINESSES spread", () => {
    const src = readFile("server/seed-cities.ts");
    expect(src).toContain("ALL_CITY_BUSINESSES");
    expect(src).toContain("...OKC_BUSINESSES");
  });

  it("seedCities mentions 10 cities", () => {
    const src = readFile("server/seed-cities.ts");
    expect(src).toContain("10 cities"); // Sprint 248: Charlotte + Raleigh added
  });
});

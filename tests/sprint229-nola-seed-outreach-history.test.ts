/**
 * Sprint 229 — New Orleans Seed Data, NOLA Beta Launch, Outreach Sent-History
 *
 * Validates:
 * 1. New Orleans seed data (server/seed-cities.ts)
 * 2. NOLA beta launch (shared/city-config.ts)
 * 3. Outreach sent-history tracking (server/outreach-history.ts)
 * 4. Integration wiring
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { CITY_REGISTRY, getCityConfig, getBetaCities } from "../shared/city-config";
import {
  recordOutreachSent,
  hasOutreachBeenSent,
  getOutreachHistory,
  clearOutreachHistory,
} from "../server/outreach-history";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. NOLA seed data — server/seed-cities.ts
// ---------------------------------------------------------------------------
describe("New Orleans seed data — server/seed-cities.ts", () => {
  const src = readFile("server/seed-cities.ts");

  it("contains NOLA_BUSINESSES array", () => {
    expect(src).toContain("NOLA_BUSINESSES");
  });

  it("has Commander's Palace", () => {
    expect(src).toContain("Commander's Palace");
  });

  it("has Cafe Du Monde", () => {
    expect(src).toContain("Cafe Du Monde");
  });

  it("has Willie Mae's", () => {
    expect(src).toContain("Willie Mae's");
  });

  it("has NOLA neighborhoods — French Quarter, Garden District, Treme", () => {
    expect(src).toContain("French Quarter");
    expect(src).toContain("Garden District");
    expect(src).toContain("Treme");
  });

  it("has (504) area code phones", () => {
    expect(src).toContain("(504)");
  });

  it("has New Orleans, LA addresses", () => {
    expect(src).toContain("New Orleans, LA");
  });

  it("ALL_CITY_BUSINESSES includes NOLA", () => {
    expect(src).toContain("ALL_CITY_BUSINESSES");
    expect(src).toContain("...NOLA_BUSINESSES");
  });

  it("mentions 6 cities", () => {
    expect(src).toContain("6 cities");
  });
});

// ---------------------------------------------------------------------------
// 2. City config — shared/city-config.ts
// ---------------------------------------------------------------------------
describe("City config — shared/city-config.ts", () => {
  it("New Orleans exists in CITY_REGISTRY", () => {
    expect(CITY_REGISTRY["New Orleans"]).toBeDefined();
  });

  it("New Orleans status is beta", () => {
    const nola = getCityConfig("New Orleans");
    expect(nola).toBeDefined();
    expect(nola!.status).toBe("beta");
  });

  it("New Orleans has launchDate", () => {
    const nola = getCityConfig("New Orleans");
    expect(nola!.launchDate).toBeDefined();
    expect(typeof nola!.launchDate).toBe("string");
  });

  it("getBetaCities includes both Oklahoma City and New Orleans", () => {
    const betas = getBetaCities();
    const names = betas.map((c: any) => c.name || c);
    expect(names).toContain("Oklahoma City");
    expect(names).toContain("New Orleans");
  });
});

// ---------------------------------------------------------------------------
// 3. Outreach history — server/outreach-history.ts (static)
// ---------------------------------------------------------------------------
describe("Outreach history — server/outreach-history.ts (static)", () => {
  it("module exists", () => {
    expect(fileExists("server/outreach-history.ts")).toBe(true);
  });

  const src = readFile("server/outreach-history.ts");

  it("exports recordOutreachSent", () => {
    expect(src).toContain("export function recordOutreachSent");
  });

  it("exports hasOutreachBeenSent", () => {
    expect(src).toContain("export function hasOutreachBeenSent");
  });

  it("exports getOutreachHistory", () => {
    expect(src).toContain("export function getOutreachHistory");
  });

  it("exports clearOutreachHistory", () => {
    expect(src).toContain("export function clearOutreachHistory");
  });
});

// ---------------------------------------------------------------------------
// 3b. Outreach history — runtime
// ---------------------------------------------------------------------------
describe("Outreach history — runtime", () => {
  beforeEach(() => {
    clearOutreachHistory();
  });

  it("recordOutreachSent records a send", () => {
    recordOutreachSent("biz-001", "welcome");
    expect(hasOutreachBeenSent("biz-001", "welcome", 30)).toBe(true);
  });

  it("hasOutreachBeenSent returns true for recently sent", () => {
    recordOutreachSent("biz-002", "follow_up");
    expect(hasOutreachBeenSent("biz-002", "follow_up", 30)).toBe(true);
  });

  it("hasOutreachBeenSent returns false for never-sent business", () => {
    expect(hasOutreachBeenSent("biz-never", "welcome", 30)).toBe(false);
  });

  it("getOutreachHistory returns history for a business", () => {
    recordOutreachSent("biz-003", "welcome");
    recordOutreachSent("biz-003", "follow_up");
    const history = getOutreachHistory("biz-003");
    expect(history).toHaveLength(2);
  });

  it("clearOutreachHistory clears the store", () => {
    recordOutreachSent("biz-004", "welcome");
    recordOutreachSent("biz-005", "follow_up");
    clearOutreachHistory();
    expect(hasOutreachBeenSent("biz-004", "welcome", 30)).toBe(false);
    expect(hasOutreachBeenSent("biz-005", "follow_up", 30)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. Integration wiring
// ---------------------------------------------------------------------------
describe("Integration wiring", () => {
  it("outreach-scheduler.ts imports from outreach-history", () => {
    const src = readFile("server/outreach-scheduler.ts");
    expect(src).toContain("outreach-history");
  });

  it("outreach-scheduler.ts checks hasOutreachBeenSent", () => {
    const src = readFile("server/outreach-scheduler.ts");
    expect(src).toContain("hasOutreachBeenSent");
  });

  it("outreach-scheduler.ts records sends", () => {
    const src = readFile("server/outreach-scheduler.ts");
    expect(src).toContain("recordOutreachSent");
  });
});

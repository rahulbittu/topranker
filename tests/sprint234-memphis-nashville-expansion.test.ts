/**
 * Sprint 234 — Memphis + Nashville Seed Data, City Config, Expansion Pipeline
 *
 * Validates:
 * 1. Memphis seed data (server/seed-cities.ts)
 * 2. Nashville seed data (server/seed-cities.ts)
 * 3. City config entries (shared/city-config.ts)
 * 4. Expansion pipeline module (server/expansion-pipeline.ts)
 * 5. Integration wiring
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  CITY_REGISTRY,
  getCityConfig,
  getPlannedCities,
  getCityStats,
} from "../shared/city-config";
import {
  getExpansionPipeline,
  getCityStage,
  setCityStage,
  advanceCityStage,
  getExpansionHistory,
  getAllExpansionHistory,
  clearExpansionHistory,
  getExpansionStats,
} from "../server/expansion-pipeline";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Memphis seed data — server/seed-cities.ts
// ---------------------------------------------------------------------------
describe("Memphis seed data — server/seed-cities.ts", () => {
  const src = readFile("server/seed-cities.ts");

  it("contains MEMPHIS_BUSINESSES array", () => {
    expect(src).toContain("MEMPHIS_BUSINESSES");
  });

  it("has Central BBQ", () => {
    expect(src).toContain("Central BBQ");
  });

  it("has Gus's World Famous Fried Chicken", () => {
    expect(src).toContain("Gus's World Famous Fried Chicken");
  });

  it("has Charlie Vergos' Rendezvous", () => {
    expect(src).toContain("Rendezvous");
  });

  it("has Memphis neighborhoods — Beale Street, Cooper-Young, Midtown Memphis, Downtown Memphis", () => {
    expect(src).toContain("Beale Street");
    expect(src).toContain("Cooper-Young");
    expect(src).toContain("Midtown Memphis");
    expect(src).toContain("Downtown Memphis");
  });

  it("has (901) area code phones", () => {
    expect(src).toContain("(901)");
  });

  it("has Memphis, TN addresses", () => {
    expect(src).toContain("Memphis, TN");
  });

  it("has 10 Memphis businesses", () => {
    const matches = src.match(/city: "Memphis"/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(10);
  });

  it("includes Muddy's Bake Shop", () => {
    expect(src).toContain("Muddy's Bake Shop");
  });

  it("includes Blues City Cafe", () => {
    expect(src).toContain("Blues City Cafe");
  });
});

// ---------------------------------------------------------------------------
// 2. Nashville seed data — server/seed-cities.ts
// ---------------------------------------------------------------------------
describe("Nashville seed data — server/seed-cities.ts", () => {
  const src = readFile("server/seed-cities.ts");

  it("contains NASHVILLE_BUSINESSES array", () => {
    expect(src).toContain("NASHVILLE_BUSINESSES");
  });

  it("has Prince's Hot Chicken Shack", () => {
    expect(src).toContain("Prince's Hot Chicken Shack");
  });

  it("has Hattie B's Hot Chicken", () => {
    expect(src).toContain("Hattie B's Hot Chicken");
  });

  it("has Biscuit Love", () => {
    expect(src).toContain("Biscuit Love");
  });

  it("has Nashville neighborhoods — Broadway, East Nashville, 12South, The Gulch", () => {
    expect(src).toContain("Broadway");
    expect(src).toContain("East Nashville");
    expect(src).toContain("12South");
    expect(src).toContain("The Gulch");
  });

  it("has (615) area code phones", () => {
    expect(src).toContain("(615)");
  });

  it("has Nashville, TN addresses", () => {
    expect(src).toContain("Nashville, TN");
  });

  it("has 10 Nashville businesses", () => {
    const matches = src.match(/city: "Nashville"/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(10);
  });

  it("includes Robert's Western World", () => {
    expect(src).toContain("Robert's Western World");
  });

  it("includes Five Daughters Bakery", () => {
    expect(src).toContain("Five Daughters Bakery");
  });
});

// ---------------------------------------------------------------------------
// 3. City config — shared/city-config.ts
// ---------------------------------------------------------------------------
describe("City config — Memphis and Nashville", () => {
  it("Memphis exists in CITY_REGISTRY", () => {
    expect(CITY_REGISTRY["Memphis"]).toBeDefined();
  });

  it("Memphis status is beta", () => {
    const memphis = getCityConfig("Memphis");
    expect(memphis).toBeDefined();
    expect(memphis!.status).toBe("beta"); // Sprint 237: promoted to beta
  });

  it("Memphis state is Tennessee with TN code", () => {
    const memphis = getCityConfig("Memphis");
    expect(memphis!.state).toBe("Tennessee");
    expect(memphis!.stateCode).toBe("TN");
  });

  it("Memphis has correct coordinates", () => {
    const memphis = getCityConfig("Memphis");
    expect(memphis!.coordinates.lat).toBe(35.1495);
    expect(memphis!.coordinates.lng).toBe(-90.049);
  });

  it("Memphis timezone is America/Chicago", () => {
    const memphis = getCityConfig("Memphis");
    expect(memphis!.timezone).toBe("America/Chicago");
  });

  it("Memphis minBusinesses is 30", () => {
    const memphis = getCityConfig("Memphis");
    expect(memphis!.minBusinesses).toBe(30);
  });

  it("Nashville exists in CITY_REGISTRY", () => {
    expect(CITY_REGISTRY["Nashville"]).toBeDefined();
  });

  it("Nashville status is beta", () => {
    const nashville = getCityConfig("Nashville");
    expect(nashville).toBeDefined();
    expect(nashville!.status).toBe("beta"); // Sprint 241: promoted to beta
  });

  it("Nashville state is Tennessee with TN code", () => {
    const nashville = getCityConfig("Nashville");
    expect(nashville!.state).toBe("Tennessee");
    expect(nashville!.stateCode).toBe("TN");
  });

  it("Nashville has correct coordinates", () => {
    const nashville = getCityConfig("Nashville");
    expect(nashville!.coordinates.lat).toBe(36.1627);
    expect(nashville!.coordinates.lng).toBe(-86.7816);
  });

  it("Nashville minBusinesses is 40", () => {
    const nashville = getCityConfig("Nashville");
    expect(nashville!.minBusinesses).toBe(40);
  });

  it("getPlannedCities includes neither Nashville nor Memphis", () => {
    const planned = getPlannedCities();
    expect(planned).not.toContain("Memphis"); // Sprint 237: promoted to beta
    expect(planned).not.toContain("Nashville"); // Sprint 241: promoted to beta
    expect(planned.length).toBe(2); // Sprint 248: Charlotte + Raleigh are planned
  });

  it("getCityStats shows 2 planned, 4 beta, 11 total", () => {
    const stats = getCityStats();
    expect(stats.planned).toBe(2); // Sprint 248: Charlotte + Raleigh
    expect(stats.beta).toBe(4); // OKC, NOLA, Memphis, Nashville
    expect(stats.total).toBe(11);
  });
});

// ---------------------------------------------------------------------------
// 4. Expansion pipeline — server/expansion-pipeline.ts
// ---------------------------------------------------------------------------
describe("Expansion pipeline — server/expansion-pipeline.ts", () => {
  it("module exists", () => {
    expect(fileExists("server/expansion-pipeline.ts")).toBe(true);
  });

  const src = readFile("server/expansion-pipeline.ts");

  it("exports getExpansionPipeline", () => {
    expect(src).toContain("export function getExpansionPipeline");
  });

  it("exports getCityStage", () => {
    expect(src).toContain("export function getCityStage");
  });

  it("exports advanceCityStage", () => {
    expect(src).toContain("export function advanceCityStage");
  });

  it("exports getExpansionHistory", () => {
    expect(src).toContain("export function getExpansionHistory");
  });

  it("exports clearExpansionHistory", () => {
    expect(src).toContain("export function clearExpansionHistory");
  });

  it("uses tagged logger: ExpansionPipeline", () => {
    expect(src).toContain('"ExpansionPipeline"');
  });

  it("imports from ./logger", () => {
    expect(src).toContain('from "./logger"');
  });

  it("defines ExpansionStage type", () => {
    expect(src).toContain("ExpansionStage");
  });

  it("defines StageTransition interface", () => {
    expect(src).toContain("StageTransition");
  });
});

// ---------------------------------------------------------------------------
// 4b. Expansion pipeline — runtime
// ---------------------------------------------------------------------------
describe("Expansion pipeline — runtime", () => {
  beforeEach(() => {
    clearExpansionHistory();
  });

  it("setCityStage sets a stage", () => {
    setCityStage("Memphis", "seed");
    expect(getCityStage("Memphis")).toBe("seed");
  });

  it("getCityStage returns undefined for unknown city", () => {
    expect(getCityStage("Atlantis")).toBeUndefined();
  });

  it("advanceCityStage moves from seed to planned", () => {
    setCityStage("Memphis", "seed");
    const next = advanceCityStage("Memphis");
    expect(next).toBe("planned");
    expect(getCityStage("Memphis")).toBe("planned");
  });

  it("advanceCityStage moves from planned to beta", () => {
    setCityStage("Nashville", "planned");
    const next = advanceCityStage("Nashville");
    expect(next).toBe("beta");
  });

  it("advanceCityStage moves from beta to active", () => {
    setCityStage("Nashville", "beta");
    const next = advanceCityStage("Nashville");
    expect(next).toBe("active");
  });

  it("advanceCityStage returns null for already-active city", () => {
    setCityStage("Dallas", "active");
    const next = advanceCityStage("Dallas");
    expect(next).toBeNull();
  });

  it("advanceCityStage returns null for unknown city", () => {
    const next = advanceCityStage("Atlantis");
    expect(next).toBeNull();
  });

  it("advanceCityStage stores a note", () => {
    setCityStage("Memphis", "seed");
    advanceCityStage("Memphis", "Sprint 234 expansion");
    const history = getExpansionHistory("Memphis");
    expect(history.length).toBe(1);
    expect(history[0].note).toBe("Sprint 234 expansion");
  });

  it("getExpansionHistory returns only transitions for requested city", () => {
    setCityStage("Memphis", "seed");
    setCityStage("Nashville", "seed");
    advanceCityStage("Memphis");
    advanceCityStage("Nashville");
    const memHistory = getExpansionHistory("Memphis");
    expect(memHistory.length).toBe(1);
    expect(memHistory[0].city).toBe("Memphis");
  });

  it("getAllExpansionHistory returns all transitions", () => {
    setCityStage("Memphis", "seed");
    setCityStage("Nashville", "seed");
    advanceCityStage("Memphis");
    advanceCityStage("Nashville");
    const all = getAllExpansionHistory();
    expect(all.length).toBe(2);
  });

  it("getExpansionPipeline returns current state", () => {
    setCityStage("Memphis", "planned");
    setCityStage("Nashville", "beta");
    const pipeline = getExpansionPipeline();
    expect(pipeline["Memphis"]).toBe("planned");
    expect(pipeline["Nashville"]).toBe("beta");
  });

  it("clearExpansionHistory resets all state", () => {
    setCityStage("Memphis", "planned");
    advanceCityStage("Memphis");
    clearExpansionHistory();
    expect(getCityStage("Memphis")).toBeUndefined();
    expect(getExpansionHistory("Memphis").length).toBe(0);
  });

  it("getExpansionStats returns counts by stage", () => {
    setCityStage("Memphis", "planned");
    setCityStage("Nashville", "planned");
    setCityStage("Dallas", "active");
    const stats = getExpansionStats();
    expect(stats.planned).toBe(2);
    expect(stats.active).toBe(1);
    expect(stats.seed).toBe(0);
    expect(stats.beta).toBe(0);
  });

  it("transition history includes timestamps", () => {
    setCityStage("Memphis", "seed");
    advanceCityStage("Memphis");
    const history = getExpansionHistory("Memphis");
    expect(history[0].timestamp).toBeTruthy();
    expect(history[0].fromStage).toBe("seed");
    expect(history[0].toStage).toBe("planned");
  });
});

// ---------------------------------------------------------------------------
// 5. Integration wiring
// ---------------------------------------------------------------------------
describe("Integration wiring — Sprint 234", () => {
  it("seed-cities includes Memphis in ALL_CITY_BUSINESSES spread", () => {
    const src = readFile("server/seed-cities.ts");
    expect(src).toContain("...MEMPHIS_BUSINESSES");
  });

  it("seed-cities includes Nashville in ALL_CITY_BUSINESSES spread", () => {
    const src = readFile("server/seed-cities.ts");
    expect(src).toContain("...NASHVILLE_BUSINESSES");
  });

  it("seedCities mentions 10 cities", () => {
    const src = readFile("server/seed-cities.ts");
    expect(src).toContain("10 cities");
  });

  it("city-config has 11 total cities", () => {
    const stats = getCityStats();
    expect(stats.total).toBe(11);
  });

  it("expansion-pipeline uses log.tag", () => {
    const src = readFile("server/expansion-pipeline.ts");
    expect(src).toContain("log.tag");
  });
});

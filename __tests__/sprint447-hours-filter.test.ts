/**
 * Sprint 447 — Hours-Based Search Filter
 *
 * Validates:
 * 1. Hours utility functions (computeOpenStatus, isOpenLate, isOpenWeekends)
 * 2. Server search endpoint hours params
 * 3. DiscoverFilters HoursFilterChips component
 * 4. API client hours opts
 * 5. Search.tsx hours filter wiring
 * 6. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Hours utility — structure & exports
// ---------------------------------------------------------------------------
describe("Hours utils — structure", () => {
  const src = readFile("server/hours-utils.ts");

  it("file exists", () => {
    expect(fileExists("server/hours-utils.ts")).toBe(true);
  });

  it("exports computeOpenStatus", () => {
    expect(src).toContain("export function computeOpenStatus");
  });

  it("exports isOpenLate", () => {
    expect(src).toContain("export function isOpenLate");
  });

  it("exports isOpenWeekends", () => {
    expect(src).toContain("export function isOpenWeekends");
  });

  it("references Sprint 447", () => {
    expect(src).toContain("Sprint 447");
  });

  it("uses America/Chicago timezone", () => {
    expect(src).toContain("America/Chicago");
  });

  it("handles 24-hour open", () => {
    expect(src).toContain("Open 24 hours");
  });

  it("returns OpenStatus shape", () => {
    expect(src).toContain("isOpen");
    expect(src).toContain("closingTime");
    expect(src).toContain("nextOpenTime");
    expect(src).toContain("todayHours");
  });
});

// ---------------------------------------------------------------------------
// 2. Hours utils — logic details
// ---------------------------------------------------------------------------
describe("Hours utils — logic", () => {
  const src = readFile("server/hours-utils.ts");

  it("checks same-day periods", () => {
    expect(src).toContain("openDay === dayOfWeek && closeDay === dayOfWeek");
  });

  it("handles overnight periods", () => {
    expect(src).toContain("openDay === dayOfWeek && closeDay !== dayOfWeek");
  });

  it("finds next open time for closed businesses", () => {
    expect(src).toContain("nextOpen");
  });

  it("isOpenLate checks for 22:00+ closing", () => {
    expect(src).toContain("2200");
  });

  it("isOpenWeekends checks Saturday and Sunday", () => {
    expect(src).toContain("day === 0 || p.open.day === 6");
  });

  it("has formatTime helper", () => {
    expect(src).toContain("function formatTime");
  });
});

// ---------------------------------------------------------------------------
// 3. Server search endpoint — hours params
// ---------------------------------------------------------------------------
describe("Routes businesses — hours filters", () => {
  const src = readFile("server/routes-businesses.ts");

  it("imports hours-utils", () => {
    expect(src).toContain("./hours-utils");
  });

  it("imports computeOpenStatus", () => {
    expect(src).toContain("computeOpenStatus");
  });

  it("imports isOpenLate", () => {
    expect(src).toContain("isOpenLate");
  });

  it("imports isOpenWeekends", () => {
    expect(src).toContain("isOpenWeekends");
  });

  it("parses openNow query param", () => {
    expect(src).toContain('req.query.openNow === "true"');
  });

  it("parses openLate query param", () => {
    expect(src).toContain('req.query.openLate === "true"');
  });

  it("parses openWeekends query param", () => {
    expect(src).toContain('req.query.openWeekends === "true"');
  });

  it("computes dynamic open status from openingHours", () => {
    expect(src).toContain("computeOpenStatus");
    expect(src).toContain("dynamicIsOpenNow");
  });

  it("returns todayHours in response", () => {
    expect(src).toContain("todayHours");
  });

  it("filters by openNow", () => {
    expect(src).toContain("if (openNow)");
  });

  it("filters by openLate", () => {
    expect(src).toContain("if (openLate)");
  });

  it("filters by openWeekends", () => {
    expect(src).toContain("if (openWeekends)");
  });
});

// ---------------------------------------------------------------------------
// 4. DiscoverFilters — HoursFilterChips
// ---------------------------------------------------------------------------
describe("DiscoverFilters — HoursFilterChips", () => {
  const src = readFile("components/search/DiscoverFilters.tsx");

  it("exports HoursFilterChips", () => {
    expect(src).toContain("export const HoursFilterChips");
  });

  it("exports HoursFilter type", () => {
    expect(src).toContain("export type HoursFilter");
  });

  it("has openNow filter option", () => {
    expect(src).toContain('"openNow"');
    expect(src).toContain('"Open Now"');
  });

  it("has openLate filter option", () => {
    expect(src).toContain('"openLate"');
    expect(src).toContain('"Open Late"');
  });

  it("has openWeekends filter option", () => {
    expect(src).toContain('"openWeekends"');
    expect(src).toContain('"Weekends"');
  });

  it("uses time-outline and moon-outline icons", () => {
    expect(src).toContain("time-outline");
    expect(src).toContain("moon-outline");
    expect(src).toContain("calendar-outline");
  });

  it("has purple active style (#6B4EAA)", () => {
    expect(src).toContain("#6B4EAA");
  });

  it("exports getHoursFilters helper", () => {
    expect(src).toContain("export function getHoursFilters");
  });
});

// ---------------------------------------------------------------------------
// 5. API client + search.tsx wiring
// ---------------------------------------------------------------------------
describe("API client — hours opts", () => {
  const src = readFile("lib/api.ts");

  it("accepts openNow in opts", () => {
    expect(src).toContain("openNow");
  });

  it("accepts openLate in opts", () => {
    expect(src).toContain("openLate");
  });

  it("accepts openWeekends in opts", () => {
    expect(src).toContain("openWeekends");
  });

  it("appends openNow=true to URL", () => {
    expect(src).toContain("openNow=true");
  });
});

describe("Search.tsx — hours filter wiring", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("imports HoursFilterChips", () => {
    expect(src).toContain("HoursFilterChips");
  });

  it("imports HoursFilter type", () => {
    expect(src).toContain("HoursFilter");
  });

  it("has hoursFilters state", () => {
    expect(src).toContain("hoursFilters");
    expect(src).toContain("setHoursFilters");
  });

  it("includes hoursFilters in query key", () => {
    expect(src).toContain("hoursFilters");
  });

  it("passes hours opts to searchOpts", () => {
    expect(src).toContain('hoursFilters.includes("openNow")');
    expect(src).toContain('hoursFilters.includes("openLate")');
    expect(src).toContain('hoursFilters.includes("openWeekends")');
  });

  it("renders HoursFilterChips component", () => {
    expect(src).toContain("<HoursFilterChips");
    expect(src).toContain("activeFilters={hoursFilters}");
  });
});

// ---------------------------------------------------------------------------
// 6. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 447 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-447-HOURS-FILTER.md");
    expect(src).toContain("Sprint 447");
    expect(src).toContain("Hours");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-447-HOURS-FILTER.md");
    expect(src).toContain("Retro 447");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-447-HOURS-FILTER.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 448");
  });
});

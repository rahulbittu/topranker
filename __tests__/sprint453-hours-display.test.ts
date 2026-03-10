/**
 * Sprint 453 — Business Detail Hours Display
 *
 * Validates:
 * 1. OpeningHoursCard enhanced props
 * 2. routes-businesses.ts dynamic hours on single-business endpoint
 * 3. business/[id].tsx wiring
 * 4. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. OpeningHoursCard — enhanced props
// ---------------------------------------------------------------------------
describe("OpeningHoursCard — Sprint 453 enhancements", () => {
  const src = readFile("components/business/OpeningHoursCard.tsx");

  it("accepts closingTime prop", () => {
    expect(src).toContain("closingTime");
  });

  it("accepts nextOpenTime prop", () => {
    expect(src).toContain("nextOpenTime");
  });

  it("accepts todayHours prop", () => {
    expect(src).toContain("todayHours");
  });

  it("references Sprint 453", () => {
    expect(src).toContain("Sprint 453");
  });

  it("computes effectiveStatusText from server data", () => {
    expect(src).toContain("effectiveStatusText");
  });

  it("prefers server-computed closing time when open", () => {
    expect(src).toContain("Open until ${closingTime}");
  });

  it("prefers server-computed next open time when closed", () => {
    expect(src).toContain("Opens ${nextOpenTime}");
  });

  it("falls back to client-parsed status", () => {
    expect(src).toContain("status.statusText");
  });
});

// ---------------------------------------------------------------------------
// 2. routes-businesses.ts — dynamic hours on single endpoint
// ---------------------------------------------------------------------------
describe("routes-businesses.ts — Sprint 453 dynamic hours", () => {
  const src = readFile("server/routes-businesses.ts");

  it("computes openStatus for single business", () => {
    expect(src).toContain("Sprint 453");
    expect(src).toContain("computeOpenStatus(bHours)");
  });

  it("returns closingTime in response", () => {
    expect(src).toContain("closingTime: openStatus.closingTime");
  });

  it("returns nextOpenTime in response", () => {
    expect(src).toContain("nextOpenTime: openStatus.nextOpenTime");
  });

  it("returns todayHours in response", () => {
    expect(src).toContain("todayHours: openStatus.todayHours");
  });

  it("returns dynamic isOpenNow", () => {
    expect(src).toContain("dynamicIsOpenNow");
  });
});

// ---------------------------------------------------------------------------
// 3. business/[id].tsx — wiring
// ---------------------------------------------------------------------------
describe("business/[id].tsx — hours display wiring", () => {
  const src = readFile("app/business/[id].tsx");

  it("passes closingTime to OpeningHoursCard", () => {
    expect(src).toContain("closingTime={business.closingTime}");
  });

  it("passes nextOpenTime to OpeningHoursCard", () => {
    expect(src).toContain("nextOpenTime={business.nextOpenTime}");
  });

  it("passes todayHours to OpeningHoursCard", () => {
    expect(src).toContain("todayHours={business.todayHours}");
  });

  it("business detail stays under LOC threshold", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(650);
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 453 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-453-HOURS-DISPLAY.md");
    expect(src).toContain("Sprint 453");
    expect(src).toContain("hours");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-453-HOURS-DISPLAY.md");
    expect(src).toContain("Retro 453");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-453-HOURS-DISPLAY.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 454");
  });
});

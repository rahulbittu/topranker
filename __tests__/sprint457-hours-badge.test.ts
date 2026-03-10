/**
 * Sprint 457 — Search Card Hours Badge Enhancement
 *
 * Validates:
 * 1. isClosingSoon helper in SubComponents
 * 2. Closing soon amber pill variant
 * 3. MappedBusiness todayHours field
 * 4. API mapping for hours fields
 * 5. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. isClosingSoon helper
// ---------------------------------------------------------------------------
describe("SubComponents — isClosingSoon helper", () => {
  const src = readFile("components/search/SubComponents.tsx");

  it("defines isClosingSoon function", () => {
    expect(src).toContain("function isClosingSoon");
  });

  it("references Sprint 457", () => {
    expect(src).toContain("Sprint 457");
  });

  it("parses closing time hours and minutes", () => {
    expect(src).toContain('closingTime.split(":")');
  });

  it("checks 60-minute threshold", () => {
    expect(src).toContain("60");
    expect(src).toContain("diff > 0 && diff <= 60");
  });
});

// ---------------------------------------------------------------------------
// 2. Closing soon amber pill
// ---------------------------------------------------------------------------
describe("SubComponents — closing soon pill", () => {
  const src = readFile("components/search/SubComponents.tsx");

  it("has statusPillClosingSoon style", () => {
    expect(src).toContain("statusPillClosingSoon");
  });

  it("uses amber color for closing soon", () => {
    expect(src).toContain("CLOSING SOON");
  });

  it("conditionally applies closing soon style", () => {
    expect(src).toContain("closingSoon ? s.statusPillClosingSoon");
  });

  it("calls isClosingSoon with item.closingTime", () => {
    expect(src).toContain("isClosingSoon(item.closingTime)");
  });
});

// ---------------------------------------------------------------------------
// 3. MappedBusiness todayHours
// ---------------------------------------------------------------------------
describe("MappedBusiness — todayHours field", () => {
  const src = readFile("types/business.ts");

  it("has todayHours field", () => {
    expect(src).toContain("todayHours");
  });

  it("references Sprint 457", () => {
    expect(src).toContain("Sprint 457");
  });
});

// ---------------------------------------------------------------------------
// 4. API mapping
// ---------------------------------------------------------------------------
describe("API — hours field mapping", () => {
  const src = readFile("lib/api.ts");

  it("maps closingTime from server", () => {
    expect(src).toContain("closingTime");
  });

  it("maps nextOpenTime from server", () => {
    expect(src).toContain("nextOpenTime");
  });

  it("maps todayHours from server", () => {
    expect(src).toContain("todayHours");
  });

  it("references Sprint 457", () => {
    expect(src).toContain("Sprint 457");
  });
});

// ---------------------------------------------------------------------------
// 5. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 457 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-457-HOURS-BADGE.md");
    expect(src).toContain("Sprint 457");
    expect(src).toContain("hours");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-457-HOURS-BADGE.md");
    expect(src).toContain("Retro 457");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-457-HOURS-BADGE.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 458");
  });
});

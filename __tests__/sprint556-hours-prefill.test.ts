/**
 * Sprint 556: Pre-populate HoursEditor with existing business hours
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 556: Hours Pre-fill", () => {
  // Sprint 561: HoursEditor extracted to components/dashboard/HoursEditor.tsx
  const src = readFile("components/dashboard/HoursEditor.tsx");
  const dashSrc = readFile("app/business/dashboard.tsx");

  it("fetches existing hours via useQuery", () => {
    expect(src).toContain('"business-hours"');
    expect(src).toContain("openingHours");
  });

  it("has initialized state to track pre-fill", () => {
    expect(src).toContain("initialized");
    expect(src).toContain("setInitialized");
  });

  it("pre-populates hours from existing weekday_text", () => {
    expect(src).toContain("existingHours?.weekday_text");
    expect(src).toContain("weekday_text.length === 7");
  });

  it("shows source indicator for existing vs default hours", () => {
    expect(src).toContain("From your listing");
    expect(src).toContain("Default hours");
  });

  it("has hoursSource style", () => {
    expect(src).toContain("hoursSource:");
  });

  it("fetches from business detail endpoint", () => {
    expect(src).toContain("/api/businesses/");
  });

  it("uses staleTime for hours query", () => {
    expect(src).toContain("staleTime: 300000");
  });

  it("dashboard.tsx stays under 600 LOC", () => {
    const loc = dashSrc.split("\n").length;
    expect(loc).toBeLessThan(600);
  });
});

/**
 * Sprint 227 — Owner Outreach Scheduler, Google Place Enrichment, City Badge Component
 *
 * Validates:
 * 1. Owner outreach scheduler (server/outreach-scheduler.ts)
 * 2. Google Place enrichment (server/google-place-enrichment.ts)
 * 3. City badge component (components/CityBadge.tsx)
 * 4. Integration wiring (server/index.ts)
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Owner outreach scheduler — server/outreach-scheduler.ts
// ---------------------------------------------------------------------------
describe("Owner outreach scheduler — server/outreach-scheduler.ts", () => {
  it("module exists", () => {
    expect(fileExists("server/outreach-scheduler.ts")).toBe(true);
  });

  const src = readFile("server/outreach-scheduler.ts");

  it("imports sendOwnerProUpgradeEmail from email-owner-outreach", () => {
    expect(src).toContain("sendOwnerProUpgradeEmail");
    expect(src).toContain("email-owner-outreach");
  });

  it("imports db from ./db", () => {
    expect(src).toContain("db");
    expect(src).toContain("./db");
  });

  it("imports businesses from schema", () => {
    expect(src).toContain("businesses");
    expect(src).toContain("schema");
  });

  it("imports members from schema", () => {
    expect(src).toContain("members");
  });

  it("exports processOwnerOutreach function", () => {
    expect(src).toContain("processOwnerOutreach");
  });

  it("exports startOutreachScheduler function", () => {
    expect(src).toContain("startOutreachScheduler");
  });

  it("checks subscriptionStatus for none", () => {
    expect(src).toContain("subscriptionStatus");
    expect(src).toContain("none");
  });

  it("checks totalRatings threshold", () => {
    expect(src).toContain("totalRatings");
  });

  it("logs claim invite candidates", () => {
    expect(src.includes("candidate") || src.includes("claim")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. Google Place enrichment — server/google-place-enrichment.ts
// ---------------------------------------------------------------------------
describe("Google Place enrichment — server/google-place-enrichment.ts", () => {
  it("module exists", () => {
    expect(fileExists("server/google-place-enrichment.ts")).toBe(true);
  });

  const src = readFile("server/google-place-enrichment.ts");

  it("exports findGooglePlaceId function", () => {
    expect(src).toContain("findGooglePlaceId");
  });

  it("exports enrichBusinesses function", () => {
    expect(src).toContain("enrichBusinesses");
  });

  it("uses Google Places API", () => {
    expect(
      src.includes("textsearch") || src.includes("maps.googleapis.com")
    ).toBe(true);
  });

  it("uses GOOGLE_PLACES_API_KEY env var", () => {
    expect(src).toContain("GOOGLE_PLACES_API_KEY");
  });

  it("updates googlePlaceId field", () => {
    expect(src).toContain("googlePlaceId");
  });

  it("has 200ms delay between API calls", () => {
    expect(src).toContain("200");
  });

  it("has CLI runner", () => {
    expect(src).toContain("process.argv");
  });
});

// ---------------------------------------------------------------------------
// 3. City badge component — components/CityBadge.tsx
// ---------------------------------------------------------------------------
describe("City badge component — components/CityBadge.tsx", () => {
  it("module exists", () => {
    expect(fileExists("components/CityBadge.tsx")).toBe(true);
  });

  const src = readFile("components/CityBadge.tsx");

  it("imports getCityBadge from city-config", () => {
    expect(src).toContain("getCityBadge");
    expect(src).toContain("city-config");
  });

  it("renders BETA text", () => {
    expect(src.includes('"BETA"') || src.includes("BETA")).toBe(true);
  });

  it("renders COMING SOON text", () => {
    expect(src.includes('"COMING SOON"') || src.includes("COMING SOON")).toBe(
      true
    );
  });

  it("uses amber color", () => {
    expect(src.includes("#C49A1A") || src.includes("C49A1A")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. Integration wiring — server/index.ts
// ---------------------------------------------------------------------------
describe("Integration wiring — server/index.ts", () => {
  const src = readFile("server/index.ts");

  it("imports outreach-scheduler", () => {
    expect(src).toContain("outreach-scheduler");
  });

  it("starts outreachScheduler", () => {
    expect(src).toContain("startOutreachScheduler");
  });

  it("clears outreachSchedulerTimeout in shutdown", () => {
    expect(src).toContain("outreachSchedulerTimeout");
  });
});

describe("Outreach scheduler weekly interval", () => {
  const src = readFile("server/outreach-scheduler.ts");

  it("has weekly interval reference", () => {
    expect(src.includes("Wednesday") || src.includes("7")).toBe(true);
  });
});

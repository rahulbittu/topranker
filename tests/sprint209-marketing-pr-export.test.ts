/**
 * Sprint 209 — Marketing, PR Strategy, Extended Export
 *
 * Validates:
 * 1. Extended analytics export with event breakdown
 * 2. PR strategy document
 * 3. OG image meta tags for social sharing
 * 4. Extended daily stats storage function
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Extended analytics export
// ---------------------------------------------------------------------------
describe("Extended export — server/routes-admin.ts", () => {
  const src = readFile("server/routes-admin.ts");

  it("supports detailed query parameter", () => {
    expect(src).toContain('req.query.detailed === "true"');
  });

  it("imports getPersistedDailyStatsExtended", () => {
    expect(src).toContain("getPersistedDailyStatsExtended");
  });

  it("extended CSV has date,event,count header", () => {
    expect(src).toContain("date,event,count");
  });

  it("extended CSV uses detailed filename", () => {
    expect(src).toContain("analytics-detailed-");
  });

  it("returns detailed flag in JSON response", () => {
    expect(src).toContain("detailed: true");
  });
});

// ---------------------------------------------------------------------------
// 2. Extended daily stats storage function
// ---------------------------------------------------------------------------
describe("Extended daily stats — server/storage/analytics.ts", () => {
  const src = readFile("server/storage/analytics.ts");

  it("exports getPersistedDailyStatsExtended", () => {
    expect(src).toContain("export async function getPersistedDailyStatsExtended");
  });

  it("groups by date and event type", () => {
    expect(src).toContain("analyticsEvents.event");
  });

  it("returns date, event, count fields", () => {
    expect(src).toContain("date: r.date");
    expect(src).toContain("event: r.event");
    expect(src).toContain("count: r.count");
  });
});

// ---------------------------------------------------------------------------
// 3. PR strategy document
// ---------------------------------------------------------------------------
describe("PR strategy — docs/PR-STRATEGY.md", () => {
  it("PR strategy file exists", () => {
    expect(fileExists("docs/PR-STRATEGY.md")).toBe(true);
  });

  const src = readFile("docs/PR-STRATEGY.md");

  it("has core narrative", () => {
    expect(src).toContain("Core Narrative");
  });

  it("has target audiences", () => {
    expect(src).toContain("Target Audiences");
  });

  it("has launch media plan", () => {
    expect(src).toContain("Launch Media Plan");
  });

  it("has key media targets", () => {
    expect(src).toContain("Key Media Targets");
  });

  it("has press kit contents", () => {
    expect(src).toContain("Press Kit");
  });

  it("has success metrics", () => {
    expect(src).toContain("Success Metrics");
  });

  it("mentions trust-weighted", () => {
    expect(src).toContain("trust-weighted");
  });
});

// ---------------------------------------------------------------------------
// 4. OG image meta tags
// ---------------------------------------------------------------------------
describe("Social sharing meta — app/+html.tsx", () => {
  const src = readFile("app/+html.tsx");

  it("has og:image tag", () => {
    expect(src).toContain('property="og:image"');
  });

  it("og:image points to topranker.com", () => {
    expect(src).toContain("topranker.com/assets/images/og-image.png");
  });

  it("has og:image:width", () => {
    expect(src).toContain('property="og:image:width"');
    expect(src).toContain('content="1200"');
  });

  it("has og:image:height", () => {
    expect(src).toContain('property="og:image:height"');
    expect(src).toContain('content="630"');
  });

  it("has twitter:image tag", () => {
    expect(src).toContain('name="twitter:image"');
  });

  it("has og:description", () => {
    expect(src).toContain('property="og:description"');
  });

  it("has twitter:card summary_large_image", () => {
    expect(src).toContain('content="summary_large_image"');
  });
});

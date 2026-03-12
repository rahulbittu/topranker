/**
 * Sprint 222 — Email Drip Campaign Integration
 *
 * Validates:
 * 1. Email drip integration with real sender
 * 2. Drip sequence definition
 * 3. Drip step helpers
 * 4. Template content integrity
 */

import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";

// Sprint 792: Dynamic import to allow env setup before config.ts loads
let DRIP_SEQUENCE: any[];
let getDripStepForDay: any;
let getDripStepNames: any;

beforeAll(async () => {
  process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://test:test@localhost/test";
  process.env.SESSION_SECRET = process.env.SESSION_SECRET || "test-secret-for-vitest";
  const mod = await import("../server/email-drip");
  DRIP_SEQUENCE = mod.DRIP_SEQUENCE;
  getDripStepForDay = mod.getDripStepForDay;
  getDripStepNames = mod.getDripStepNames;
});

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Email drip integration
// ---------------------------------------------------------------------------
describe("Email drip integration — server/email-drip.ts", () => {
  it("module exists", () => {
    expect(fileExists("server/email-drip.ts")).toBe(true);
  });

  const src = readFile("server/email-drip.ts");

  it("imports real sendEmail from email.ts", () => {
    expect(src).toContain('from "./email"');
    expect(src).toContain("sendEmailReal");
  });

  it("calls real sender in sendEmail wrapper", () => {
    expect(src).toContain("sendEmailReal(");
  });

  it("exports DRIP_SEQUENCE", () => {
    expect(src).toContain("DRIP_SEQUENCE");
  });

  it("exports getDripStepForDay", () => {
    expect(src).toContain("getDripStepForDay");
  });

  it("exports getDripStepNames", () => {
    expect(src).toContain("getDripStepNames");
  });
});

// ---------------------------------------------------------------------------
// 2. Drip sequence definition
// ---------------------------------------------------------------------------
describe("Drip sequence", () => {
  it("has 5 steps", () => {
    expect(DRIP_SEQUENCE.length).toBe(5);
  });

  it("step 1 is day 2 (neighborhood)", () => {
    expect(DRIP_SEQUENCE[0].day).toBe(2);
    expect(DRIP_SEQUENCE[0].name).toBe("top_5_neighborhood");
  });

  it("step 2 is day 3 (rating unlock)", () => {
    expect(DRIP_SEQUENCE[1].day).toBe(3);
    expect(DRIP_SEQUENCE[1].name).toBe("rating_unlock");
  });

  it("step 3 is day 7 (first week stats)", () => {
    expect(DRIP_SEQUENCE[2].day).toBe(7);
    expect(DRIP_SEQUENCE[2].name).toBe("first_week_stats");
  });

  it("step 4 is day 14 (challenger intro)", () => {
    expect(DRIP_SEQUENCE[3].day).toBe(14);
    expect(DRIP_SEQUENCE[3].name).toBe("challenger_intro");
  });

  it("step 5 is day 30 (first month recap)", () => {
    expect(DRIP_SEQUENCE[4].day).toBe(30);
    expect(DRIP_SEQUENCE[4].name).toBe("first_month_recap");
  });

  it("all steps have send functions", () => {
    for (const step of DRIP_SEQUENCE) {
      expect(typeof step.send).toBe("function");
    }
  });

  it("steps are in chronological order", () => {
    for (let i = 1; i < DRIP_SEQUENCE.length; i++) {
      expect(DRIP_SEQUENCE[i].day).toBeGreaterThan(DRIP_SEQUENCE[i - 1].day);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Drip step helpers
// ---------------------------------------------------------------------------
describe("Drip step helpers", () => {
  it("getDripStepForDay returns correct step for day 2", () => {
    const step = getDripStepForDay(2);
    expect(step).toBeDefined();
    expect(step!.name).toBe("top_5_neighborhood");
  });

  it("getDripStepForDay returns correct step for day 30", () => {
    const step = getDripStepForDay(30);
    expect(step).toBeDefined();
    expect(step!.name).toBe("first_month_recap");
  });

  it("getDripStepForDay returns undefined for non-drip days", () => {
    expect(getDripStepForDay(1)).toBeUndefined();
    expect(getDripStepForDay(5)).toBeUndefined();
    expect(getDripStepForDay(10)).toBeUndefined();
  });

  it("getDripStepNames returns all step names", () => {
    const names = getDripStepNames();
    expect(names).toContain("top_5_neighborhood");
    expect(names).toContain("rating_unlock");
    expect(names).toContain("first_week_stats");
    expect(names).toContain("challenger_intro");
    expect(names).toContain("first_month_recap");
    expect(names.length).toBe(5);
  });
});

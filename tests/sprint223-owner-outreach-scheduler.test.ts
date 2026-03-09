/**
 * Sprint 223 — Owner Outreach & Drip Scheduler
 *
 * Validates:
 * 1. Drip scheduler (server/drip-scheduler.ts)
 * 2. Unsubscribe routes (server/routes-unsubscribe.ts)
 * 3. Owner outreach emails (server/email-owner-outreach.ts)
 * 4. Integration wiring
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Drip scheduler — server/drip-scheduler.ts
// ---------------------------------------------------------------------------
describe("Drip scheduler — server/drip-scheduler.ts", () => {
  it("module exists", () => {
    expect(fileExists("server/drip-scheduler.ts")).toBe(true);
  });

  const src = readFile("server/drip-scheduler.ts");

  it("imports getDripStepForDay from email-drip", () => {
    expect(src).toContain("getDripStepForDay");
    expect(src).toContain('from "./email-drip"');
  });

  it("imports db from ./db", () => {
    expect(src).toContain('from "./db"');
    expect(src).toContain("db");
  });

  it("imports members from @shared/schema", () => {
    expect(src).toContain('from "@shared/schema"');
    expect(src).toContain("members");
  });

  it("exports processDripEmails function", () => {
    expect(src).toContain("export async function processDripEmails");
  });

  it("exports startDripScheduler function", () => {
    expect(src).toContain("export function startDripScheduler");
  });

  it("checks emailDrip preference", () => {
    expect(src).toContain("emailDrip");
  });

  it("calculates daysSinceSignup", () => {
    expect(src).toContain("daysSinceSignup");
  });
});

// ---------------------------------------------------------------------------
// 2. Unsubscribe routes — server/routes-unsubscribe.ts
// ---------------------------------------------------------------------------
describe("Unsubscribe routes — server/routes-unsubscribe.ts", () => {
  it("module exists", () => {
    expect(fileExists("server/routes-unsubscribe.ts")).toBe(true);
  });

  const src = readFile("server/routes-unsubscribe.ts");

  it("exports registerUnsubscribeRoutes", () => {
    expect(src).toContain("export function registerUnsubscribeRoutes");
  });

  it("has /api/unsubscribe endpoint", () => {
    expect(src).toContain("/api/unsubscribe");
  });

  it("has /api/resubscribe endpoint", () => {
    expect(src).toContain("/api/resubscribe");
  });

  it("handles drip type", () => {
    expect(src).toContain('"drip"');
  });

  it("handles weekly type", () => {
    expect(src).toContain('"weekly"');
  });

  it("handles all type", () => {
    expect(src).toContain('"all"');
  });

  it("updates notificationPrefs", () => {
    expect(src).toContain("notificationPrefs");
  });

  it("branded HTML with TopRanker styling", () => {
    expect(src).toContain("TopRanker");
    expect(src).toContain("#C49A1A");
  });
});

// ---------------------------------------------------------------------------
// 3. Owner outreach emails — server/email-owner-outreach.ts
// ---------------------------------------------------------------------------
describe("Owner outreach emails — server/email-owner-outreach.ts", () => {
  it("module exists", () => {
    expect(fileExists("server/email-owner-outreach.ts")).toBe(true);
  });

  const src = readFile("server/email-owner-outreach.ts");

  it("exports sendOwnerClaimInviteEmail", () => {
    expect(src).toContain("export async function sendOwnerClaimInviteEmail");
  });

  it("exports sendOwnerProUpgradeEmail", () => {
    expect(src).toContain("export async function sendOwnerProUpgradeEmail");
  });

  it("exports sendOwnerWeeklyDigestEmail", () => {
    expect(src).toContain("export async function sendOwnerWeeklyDigestEmail");
  });

  it("exports OWNER_OUTREACH_TEMPLATES with 3 templates", () => {
    expect(src).toContain("export const OWNER_OUTREACH_TEMPLATES");
    expect(src).toContain("owner_claim_invite");
    expect(src).toContain("owner_pro_upgrade");
    expect(src).toContain("owner_weekly_digest");
  });

  it("claim invite mentions current rank", () => {
    expect(src).toContain("currentRank");
    expect(src).toContain("ranked #");
  });

  it("pro upgrade mentions $49/mo", () => {
    expect(src).toContain("$49/mo");
  });

  it("weekly digest shows rank change", () => {
    expect(src).toContain("rankChange");
    expect(src).toContain("Rank Change");
  });
});

// ---------------------------------------------------------------------------
// 4. Integration wiring
// ---------------------------------------------------------------------------
describe("Integration wiring", () => {
  it("routes.ts imports routes-unsubscribe", () => {
    const src = readFile("server/routes.ts");
    expect(src).toContain("routes-unsubscribe");
    expect(src).toContain("registerUnsubscribeRoutes");
  });

  it("index.ts imports drip-scheduler", () => {
    const src = readFile("server/index.ts");
    expect(src).toContain("drip-scheduler");
    expect(src).toContain("startDripScheduler");
  });

  it("index.ts clears dripSchedulerTimeout in shutdown", () => {
    const src = readFile("server/index.ts");
    expect(src).toContain("clearTimeout(dripSchedulerTimeout)");
  });
});

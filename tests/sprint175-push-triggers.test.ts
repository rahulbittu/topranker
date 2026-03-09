/**
 * Sprint 175 — Push Notification Triggers
 *
 * Validates:
 * 1. Notification trigger module exists with all handlers
 * 2. Tier upgrade push wired into rating route
 * 3. Claim decision push wired into admin route
 * 4. Weekly digest scheduler registered in server startup
 * 5. Push notification infrastructure complete (push.ts)
 * 6. Graceful shutdown cleans up scheduler
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Notification trigger module
// ---------------------------------------------------------------------------
describe("notification-triggers.ts — trigger handlers", () => {
  const triggerSrc = readFile("server/notification-triggers.ts");

  it("exports onTierUpgrade", () => {
    expect(triggerSrc).toContain("export async function onTierUpgrade");
  });

  it("exports onClaimDecision", () => {
    expect(triggerSrc).toContain("export async function onClaimDecision");
  });

  it("exports sendWeeklyDigestPush", () => {
    expect(triggerSrc).toContain("export async function sendWeeklyDigestPush");
  });

  it("exports startWeeklyDigestScheduler", () => {
    expect(triggerSrc).toContain("export function startWeeklyDigestScheduler");
  });

  it("onTierUpgrade checks preferences before sending", () => {
    expect(triggerSrc).toContain("prefs.tierUpgrades === false");
  });

  it("onTierUpgrade skips when no push token", () => {
    expect(triggerSrc).toContain("if (!pushToken) return");
  });

  it("onClaimDecision sends different messages for approved vs rejected", () => {
    expect(triggerSrc).toContain("Claim approved:");
    expect(triggerSrc).toContain("Claim update:");
  });

  it("weekly digest queries members with push tokens", () => {
    expect(triggerSrc).toContain("isNotNull(members.pushToken)");
  });

  it("weekly digest respects preferences", () => {
    expect(triggerSrc).toContain("prefs.weeklyDigest === false");
  });

  it("weekly scheduler targets Monday 10am UTC", () => {
    expect(triggerSrc).toContain("setUTCHours(10, 0, 0, 0)");
  });

  it("uses sendPushNotification from push.ts", () => {
    expect(triggerSrc).toContain('import { sendPushNotification } from "./push"');
  });

  it("logs trigger events", () => {
    expect(triggerSrc).toContain('log.tag("NotifyTrigger")');
  });
});

// ---------------------------------------------------------------------------
// 2. Tier upgrade wired into rating route
// ---------------------------------------------------------------------------
describe("rating route — tier upgrade push trigger", () => {
  const routesSrc = readFile("server/routes.ts");

  it("checks tierUpgraded flag", () => {
    expect(routesSrc).toContain("result.tierUpgraded");
  });

  it("checks pushToken exists", () => {
    expect(routesSrc).toContain("req.user!.pushToken");
  });

  it("imports notifyTierUpgrade from push", () => {
    expect(routesSrc).toContain("notifyTierUpgrade");
  });

  it("sends non-blocking (catch)", () => {
    // After the tier upgrade block
    expect(routesSrc).toContain("notifyTierUpgrade(memberId, req.user!.pushToken, result.newTier).catch");
  });
});

// ---------------------------------------------------------------------------
// 3. Claim decision push wired into admin route
// ---------------------------------------------------------------------------
describe("admin claim review — push notification trigger", () => {
  const adminSrc = readFile("server/routes-admin.ts");

  it("sends push notification for claim decisions", () => {
    expect(adminSrc).toContain("sendPushNotification");
  });

  it("checks member has pushToken", () => {
    expect(adminSrc).toContain("member?.pushToken");
  });

  it("sends approved push with dashboard CTA", () => {
    expect(adminSrc).toContain("verified owner");
    expect(adminSrc).toContain("dashboard");
  });

  it("sends rejected push with support CTA", () => {
    expect(adminSrc).toContain("could not be verified");
    expect(adminSrc).toContain("Contact support");
  });

  it("non-blocking push dispatch", () => {
    const pushSection = adminSrc.slice(adminSrc.indexOf("Sprint 175: Push notification"));
    expect(pushSection).toContain(".catch(() => {})");
  });
});

// ---------------------------------------------------------------------------
// 4. Weekly digest scheduler in server startup
// ---------------------------------------------------------------------------
describe("server startup — weekly digest scheduler", () => {
  const indexSrc = readFile("server/index.ts");

  it("imports startWeeklyDigestScheduler", () => {
    expect(indexSrc).toContain("startWeeklyDigestScheduler");
  });

  it("starts the scheduler", () => {
    expect(indexSrc).toContain("startWeeklyDigestScheduler()");
  });

  it("stores timeout for cleanup", () => {
    expect(indexSrc).toContain("weeklyDigestTimeout");
  });

  it("clears timeout on graceful shutdown", () => {
    expect(indexSrc).toContain("clearTimeout(weeklyDigestTimeout)");
  });
});

// ---------------------------------------------------------------------------
// 5. Push infrastructure (push.ts) completeness
// ---------------------------------------------------------------------------
describe("push.ts — notification infrastructure", () => {
  const pushSrc = readFile("server/push.ts");

  it("exports sendPushNotification", () => {
    expect(pushSrc).toContain("export async function sendPushNotification");
  });

  it("exports notifyRatingResponse", () => {
    expect(pushSrc).toContain("export async function notifyRatingResponse");
  });

  it("exports notifyTierUpgrade", () => {
    expect(pushSrc).toContain("export async function notifyTierUpgrade");
  });

  it("exports notifyChallengerResult", () => {
    expect(pushSrc).toContain("export async function notifyChallengerResult");
  });

  it("exports notifyNewChallenger", () => {
    expect(pushSrc).toContain("export async function notifyNewChallenger");
  });

  it("sends to Expo Push API", () => {
    expect(pushSrc).toContain("exp.host/--/api/v2/push/send");
  });

  it("has dev mode logging", () => {
    expect(pushSrc).toContain("DEV MODE");
  });

  it("includes navigation data in messages", () => {
    expect(pushSrc).toContain('screen: "business"');
    expect(pushSrc).toContain('screen: "profile"');
    expect(pushSrc).toContain('screen: "challenger"');
  });
});

// ---------------------------------------------------------------------------
// 6. Notification preferences respected
// ---------------------------------------------------------------------------
describe("notification preference checks", () => {
  const pushSrc = readFile("server/push.ts");
  const triggerSrc = readFile("server/notification-triggers.ts");

  it("notifyRatingResponse checks ratingResponses pref", () => {
    expect(pushSrc).toContain("prefs.ratingResponses === false");
  });

  it("notifyTierUpgrade checks tierUpgrades pref", () => {
    expect(pushSrc).toContain("prefs.tierUpgrades === false");
  });

  it("notifyChallengerResult checks challengerResults pref", () => {
    expect(pushSrc).toContain("prefs.challengerResults === false");
  });

  it("notifyNewChallenger checks newChallengers pref", () => {
    expect(pushSrc).toContain("prefs.newChallengers === false");
  });

  it("weekly digest checks weeklyDigest pref", () => {
    expect(triggerSrc).toContain("prefs.weeklyDigest === false");
  });
});

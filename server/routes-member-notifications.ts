/**
 * Sprint 586: Member Notification Routes — extracted from routes-members.ts
 *
 * Endpoints:
 * - POST /api/members/me/push-token
 * - GET  /api/members/me/notification-preferences
 * - PUT  /api/members/me/notification-preferences
 * - GET  /api/members/me/notification-frequency
 * - PUT  /api/members/me/notification-frequency
 *
 * Owner: Sarah Nakamura (Lead Eng)
 */

import type { Express, Request, Response } from "express";
import { log } from "./logger";
import { wrapAsync } from "./wrap-async";
import { requireAuth } from "./middleware";

export function registerMemberNotificationRoutes(app: Express) {
  // Push token storage
  app.post("/api/members/me/push-token", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { pushToken } = req.body;
    if (!pushToken || typeof pushToken !== "string") {
      return res.status(400).json({ error: "pushToken is required" });
    }
    const { updatePushToken } = await import("./storage");
    await updatePushToken(req.user!.id, pushToken);
    return res.json({ ok: true });
  }));

  // ── Notification Preferences ─────────────────────────────────
  app.get("/api/members/me/notification-preferences", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { getMemberById } = await import("./storage");
    const member = await getMemberById(req.user!.id);
    const stored = (member?.notificationPrefs as Record<string, boolean>) || {};
    const prefs = {
      tierUpgrades: true,
      challengerResults: true,
      newChallengers: true,
      weeklyDigest: false,
      // Sprint 479: Push notification categories
      rankingChanges: true,
      savedBusinessAlerts: true,
      cityAlerts: true,
      marketingEmails: false,
      ...stored,
    };
    return res.json({ data: prefs });
  }));

  app.put("/api/members/me/notification-preferences", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const {
      tierUpgrades, challengerResults,
      newChallengers, weeklyDigest, marketingEmails,
      // Sprint 479: Push notification categories
      rankingChanges, savedBusinessAlerts, cityAlerts,
    } = req.body;
    const prefs: Record<string, boolean> = {
      tierUpgrades: tierUpgrades !== false,
      challengerResults: challengerResults !== false,
      newChallengers: newChallengers !== false,
      weeklyDigest: weeklyDigest === true,
      rankingChanges: rankingChanges !== false,
      savedBusinessAlerts: savedBusinessAlerts !== false,
      cityAlerts: cityAlerts !== false,
      marketingEmails: marketingEmails === true,
    };
    const { updateNotificationPrefs } = await import("./storage");
    const saved = await updateNotificationPrefs(req.user!.id, prefs);
    log.tag("Notifications").info(`Preferences updated for user ${req.user!.id}: ${JSON.stringify(saved)}`);
    return res.json({ data: saved });
  }));

  // Sprint 518: Notification frequency preferences
  app.get("/api/members/me/notification-frequency", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { getMemberById } = await import("./storage");
    const member = await getMemberById(req.user!.id);
    const stored = (member?.notificationFrequencyPrefs as Record<string, string>) || {};
    const prefs = { rankingChanges: "realtime", newRatings: "realtime", cityAlerts: "realtime", ...stored };
    return res.json({ data: prefs });
  }));

  app.put("/api/members/me/notification-frequency", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const VALID = ["realtime", "daily", "weekly"];
    const prefs: Record<string, string> = {};
    for (const key of ["rankingChanges", "newRatings", "cityAlerts"]) {
      const val = req.body[key];
      prefs[key] = VALID.includes(val) ? val : "realtime";
    }
    const { updateNotificationFrequencyPrefs } = await import("./storage");
    const saved = await updateNotificationFrequencyPrefs(req.user!.id, prefs);
    log.tag("Notifications").info(`Frequency prefs updated for user ${req.user!.id}: ${JSON.stringify(saved)}`);
    return res.json({ data: saved });
  }));
}

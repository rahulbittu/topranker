/**
 * Member routes — extracted from routes.ts (Sprint 171)
 *
 * Endpoints:
 * - POST /api/members/me/avatar
 * - GET  /api/members/me
 * - PUT  /api/members/me/email
 * - PUT  /api/members/me
 * - GET  /api/members/:username
 * - GET  /api/members/me/impact
 * - POST /api/members/me/push-token
 * - GET  /api/members/me/notification-preferences
 * - PUT  /api/members/me/notification-preferences
 */

import type { Express, Request, Response } from "express";
import { log } from "./logger";
import {
  getMemberById, getMemberRatings, recalculateCredibilityScore,
} from "./storage";
import { wrapAsync } from "./wrap-async";
import { checkAndRefreshTier } from "./tier-staleness";
import { requireAuth } from "./middleware";
import { fileStorage } from "./file-storage";
import crypto from "node:crypto";

export function registerMemberRoutes(app: Express) {
  // ── Avatar Upload ──────────────────────────────────────────
  app.post("/api/members/me/avatar", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
    const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

    const isMultipart = (req.headers["content-type"] || "").includes("multipart/form-data");

    if (!isMultipart) {
      return res.status(400).json({
        error: "Avatar upload requires multipart/form-data with an 'avatar' file field.",
      });
    }

    const file = (req as any).file as
      | { buffer: Buffer; mimetype: string; size: number }
      | undefined;

    if (!file) {
      return res.status(400).json({
        error: "No file found in multipart request. Send an 'avatar' field.",
      });
    }

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return res.status(400).json({
        error: `Unsupported image type: ${file.mimetype}. Allowed: ${ALLOWED_TYPES.join(", ")}`,
      });
    }

    if (file.size > MAX_SIZE) {
      return res.status(413).json({ error: "Image exceeds 2 MB limit" });
    }

    const fileBuffer = file.buffer;
    const contentType = file.mimetype;

    const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const key = `avatars/${req.user!.id}-${uniqueId}.${ext}`;

    const avatarUrl = await fileStorage.upload(key, fileBuffer, contentType);

    const { updateMemberAvatar } = await import("./storage");
    const updated = await updateMemberAvatar(req.user!.id, avatarUrl);
    if (!updated) {
      return res.status(404).json({ error: "Member not found" });
    }

    return res.json({ data: { avatarUrl: updated.avatarUrl } });
  }));

  app.get("/api/members/me", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const member = await getMemberById(req.user!.id);
    if (!member) return res.status(404).json({ error: "Member not found" });

    const { score, tier: computedTier, breakdown } = await recalculateCredibilityScore(member.id);
    const tier = checkAndRefreshTier(computedTier, score);
    const { ratings, total } = await getMemberRatings(member.id);
    const { getSeasonalRatingCounts, getDishVoteStreakStats } = await import("./storage");
    const seasonal = await getSeasonalRatingCounts(member.id);
    const streakStats = await getDishVoteStreakStats(member.id);

    const daysActive = Math.floor(
      (Date.now() - new Date(member.joinedAt).getTime()) / (1000 * 60 * 60 * 24),
    );

    return res.json({
      data: {
        id: member.id,
        displayName: member.displayName,
        username: member.username,
        email: member.email,
        city: member.city,
        avatarUrl: member.avatarUrl,
        credibilityScore: score,
        credibilityTier: tier,
        totalRatings: member.totalRatings,
        totalCategories: member.totalCategories,
        distinctBusinesses: member.distinctBusinesses,
        isFoundingMember: member.isFoundingMember,
        joinedAt: member.joinedAt,
        daysActive,
        ratingVariance: parseFloat(member.ratingVariance),
        credibilityBreakdown: breakdown,
        ratingHistory: ratings,
        ...seasonal,
        ...streakStats,
      },
    });
  }));

  // ── Email Change ─────────────────────────────────────────
  app.put("/api/members/me/email", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    try {
      const { updateMemberEmail } = await import("./storage");
      const updated = await updateMemberEmail(req.user!.id, email);
      if (!updated) {
        return res.status(404).json({ error: "Member not found" });
      }

      log.tag("EmailChange").info(
        `Email changed for user ${req.user!.id} to ${email}`
      );

      return res.json({ data: { email: updated.email } });
    } catch (err: any) {
      if (err.message === "Email already in use") {
        return res.status(409).json({ error: "Email already in use" });
      }
      throw err;
    }
  }));

  app.put("/api/members/me", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { displayName, username } = req.body;
    const updates: { displayName?: string; username?: string } = {};

    if (displayName !== undefined) {
      if (typeof displayName !== "string" || displayName.length < 1 || displayName.length > 50) {
        return res.status(400).json({ error: "displayName must be 1-50 characters" });
      }
      updates.displayName = displayName;
    }

    if (username !== undefined) {
      if (typeof username !== "string" || !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
        return res.status(400).json({ error: "username must be 3-30 alphanumeric or underscore characters" });
      }
      updates.username = username;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const { updateMemberProfile } = await import("./storage");
    const updated = await updateMemberProfile(req.user!.id, updates);
    if (!updated) return res.status(404).json({ error: "Member not found" });

    return res.json({ data: updated });
  }));

  app.get("/api/members/:username", wrapAsync(async (req: Request, res: Response) => {
    const { getMemberByUsername } = await import("./storage");
    const member = await getMemberByUsername(req.params.username as string);
    if (!member) return res.status(404).json({ error: "Member not found" });

    const freshTier = checkAndRefreshTier(member.credibilityTier, member.credibilityScore);

    return res.json({
      data: {
        displayName: member.displayName,
        username: member.username,
        credibilityTier: freshTier,
        totalRatings: member.totalRatings,
        joinedAt: member.joinedAt,
      },
    });
  }));

  app.get("/api/members/me/impact", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { getMemberImpact } = await import("./storage");
    const data = await getMemberImpact(req.user!.id);
    return res.json({ data });
  }));

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

  // Sprint 185: Onboarding progress checklist
  app.get("/api/members/me/onboarding", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { getOnboardingProgress } = await import("./storage");
    const progress = await getOnboardingProgress(req.user!.id);
    return res.json({ data: progress });
  }));
}

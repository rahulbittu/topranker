/**
 * Auth + Account/GDPR routes — extracted from routes.ts (Sprint 171)
 *
 * Endpoints:
 * - POST /api/auth/signup
 * - POST /api/auth/login
 * - POST /api/auth/google
 * - POST /api/auth/logout
 * - GET  /api/auth/me
 * - GET  /api/account/export
 * - DELETE /api/account
 * - POST /api/account/schedule-deletion
 * - POST /api/account/cancel-deletion
 * - GET  /api/account/deletion-status
 */

import type { Express, Request, Response } from "express";
import passport from "passport";
import { registerMember, authenticateGoogleUser } from "./auth";
import { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } from "./email";
import { log } from "./logger";
import {
  getMemberById, getMemberRatings, getMemberImpact,
  getSeasonalRatingCounts, getMemberBadges,
} from "./storage";
import { authRateLimiter } from "./rate-limiter";
import { sanitizeString, sanitizeEmail } from "./sanitize";
import { trackEvent } from "./analytics";
import { wrapAsync } from "./wrap-async";
import { checkAndRefreshTier } from "./tier-staleness";
import { requireAuth } from "./middleware";
import { scheduleDeletion, getDeletionStatus, cancelDeletion } from "./gdpr";

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/signup", authRateLimiter, wrapAsync(async (req: Request, res: Response) => {
    try {
      const { password, city } = req.body;
      const displayName = sanitizeString(req.body.displayName, 100);
      const username = sanitizeString(req.body.username, 50);
      const email = sanitizeEmail(req.body.email);

      if (!displayName || !username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }
      if (!/\d/.test(password)) {
        return res.status(400).json({ error: "Password must contain at least one number" });
      }

      const member = await registerMember({ displayName, username, email, password, city });

      // Sprint 186: Send verification email + welcome email
      const { generateEmailVerificationToken } = await import("./storage");
      const verificationToken = await generateEmailVerificationToken(member.id);
      sendVerificationEmail({
        email: member.email,
        displayName: member.displayName,
        token: verificationToken,
      }).catch((err) => log.error("Verification email failed:", err));

      sendWelcomeEmail({
        email: member.email,
        displayName: member.displayName,
        city: member.city,
        username: member.username,
      }).catch((emailErr) => log.error("Welcome email failed:", emailErr));

      trackEvent("signup_completed", member.id);

      req.login(
        {
          id: member.id,
          displayName: member.displayName,
          username: member.username,
          email: member.email,
          city: member.city,
          credibilityScore: member.credibilityScore,
          credibilityTier: member.credibilityTier,
        },
        (err) => {
          if (err) return res.status(500).json({ error: "Login failed after signup" });
          return res.status(201).json({ data: req.user });
        },
      );
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }));

  app.post("/api/auth/login", authRateLimiter, (req: Request, res: Response, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return res.status(500).json({ error: "Internal server error" });
      if (!user) return res.status(401).json({ error: info?.message || "Invalid credentials" });

      req.login(user, (loginErr) => {
        if (loginErr) return res.status(500).json({ error: "Login failed" });
        return res.json({ data: user });
      });
    })(req, res, next);
  });

  app.post("/api/auth/google", authRateLimiter, wrapAsync(async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ error: "ID token is required" });
      }

      const member = await authenticateGoogleUser(idToken);

      req.login(
        {
          id: member.id,
          displayName: member.displayName,
          username: member.username,
          email: member.email,
          city: member.city,
          credibilityScore: member.credibilityScore,
          credibilityTier: member.credibilityTier,
        },
        (err) => {
          if (err) return res.status(500).json({ error: "Login failed" });
          return res.json({ data: req.user });
        },
      );
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }));

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      return res.json({ data: { message: "Logged out" } });
    });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.json({ data: null });
    }
    return res.json({ data: req.user });
  });

  // ── Sprint 186: Email Verification ─────────────────────────
  app.post("/api/auth/verify-email", wrapAsync(async (req: Request, res: Response) => {
    const token = sanitizeString(req.body.token, 100);
    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    const { verifyEmailToken } = await import("./storage");
    const result = await verifyEmailToken(token);

    if (!result.success) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    return res.json({ data: { verified: true } });
  }));

  app.post("/api/auth/resend-verification", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { isEmailVerified, generateEmailVerificationToken } = await import("./storage");

    const verified = await isEmailVerified(req.user!.id);
    if (verified) {
      return res.json({ data: { message: "Email already verified" } });
    }

    const token = await generateEmailVerificationToken(req.user!.id);
    sendVerificationEmail({
      email: req.user!.email,
      displayName: req.user!.displayName,
      token,
    }).catch((err) => log.error("Resend verification failed:", err));

    return res.json({ data: { message: "Verification email sent" } });
  }));

  // ── Sprint 186: Password Reset ────────────────────────────
  app.post("/api/auth/forgot-password", authRateLimiter, wrapAsync(async (req: Request, res: Response) => {
    const email = sanitizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const { generatePasswordResetToken } = await import("./storage");
    const result = await generatePasswordResetToken(email);

    // Always return success to prevent email enumeration
    if (result) {
      sendPasswordResetEmail({
        email,
        displayName: result.displayName,
        token: result.token,
      }).catch((err) => log.error("Password reset email failed:", err));
    }

    return res.json({ data: { message: "If an account exists with that email, a reset link has been sent" } });
  }));

  app.post("/api/auth/reset-password", authRateLimiter, wrapAsync(async (req: Request, res: Response) => {
    const token = sanitizeString(req.body.token, 100);
    const password = req.body.password as string;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and new password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    if (!/\d/.test(password)) {
      return res.status(400).json({ error: "Password must contain at least one number" });
    }

    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.hash(password, 10);

    const { resetPasswordWithToken } = await import("./storage");
    const result = await resetPasswordWithToken(token, hashedPassword);

    if (!result.success) {
      return res.status(400).json({ error: result.error || "Password reset failed" });
    }

    return res.json({ data: { message: "Password has been reset successfully" } });
  }));

  // ── GDPR / CCPA Data Export (Portability) ───────────────────
  app.get("/api/account/export", wrapAsync(async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userId = req.user!.id;
    const [profile, ratings, impact, seasonal, badges] = await Promise.all([
      getMemberById(userId),
      getMemberRatings(userId, 1, 10000),
      getMemberImpact(userId),
      getSeasonalRatingCounts(userId),
      getMemberBadges(userId),
    ]);

    const freshExportTier = profile
      ? checkAndRefreshTier(profile.credibilityTier, profile.credibilityScore)
      : null;

    const exportData = {
      exportDate: new Date().toISOString(),
      format: "GDPR Art. 20 compliant",
      profile: profile ? {
        displayName: profile.displayName,
        username: profile.username,
        email: profile.email,
        city: profile.city,
        credibilityScore: profile.credibilityScore,
        credibilityTier: freshExportTier,
        totalRatings: profile.totalRatings,
        joinedAt: profile.joinedAt,
        lastActive: profile.lastActive,
      } : null,
      ratings: ratings || [],
      impact: impact || null,
      seasonalActivity: seasonal || [],
      badges: badges || [],
    };

    res.setHeader("Content-Disposition", `attachment; filename="topranker-data-export-${userId}.json"`);
    return res.json({ data: exportData });
  }));

  // ── GDPR / CCPA Account Deletion Request ────────────────────
  app.delete("/api/account", wrapAsync(async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    log.tag("AccountDeletion").info(
      `Deletion requested for user ${req.user!.id}, scheduled for ${deletionDate.toISOString()}`
    );

    return res.json({
      data: {
        message: "Account scheduled for deletion",
        deletionDate: deletionDate.toISOString(),
        gracePeriodDays: 30,
        note: "You can cancel this request by logging in within 30 days.",
      },
    });
  }));

  // ── GDPR Deletion Grace Period ──────────────────────────────
  app.post("/api/account/schedule-deletion", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const request = await scheduleDeletion(userId, 30);

    log.tag("GDPR").info(
      `Deletion scheduled for user ${userId}, deleteAt: ${request.deleteAt.toISOString()}`
    );

    return res.json({
      data: {
        message: "Account deletion scheduled",
        scheduledAt: request.scheduledAt.toISOString(),
        deleteAt: request.deleteAt.toISOString(),
        gracePeriodDays: 30,
        status: request.status,
        note: "You can cancel this request by checking your deletion status within 30 days.",
      },
    });
  }));

  app.post("/api/account/cancel-deletion", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const cancelled = await cancelDeletion(userId);

    if (!cancelled) {
      return res.status(404).json({ error: "No pending deletion request found" });
    }

    log.tag("GDPR").info(`Deletion cancelled for user ${userId}`);

    return res.json({
      data: { cancelled: true },
    });
  }));

  app.get("/api/account/deletion-status", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const status = await getDeletionStatus(userId);

    if (!status) {
      return res.json({ data: { hasPendingDeletion: false } });
    }

    return res.json({
      data: {
        hasPendingDeletion: status.status === "pending",
        scheduledAt: status.scheduledAt.toISOString(),
        deleteAt: status.deleteAt.toISOString(),
        status: status.status,
      },
    });
  }));
}

/**
 * Shared Express middleware — extracted per Arch Audit #12 (N3).
 *
 * requireAuth was duplicated identically across routes.ts, routes-admin.ts,
 * routes-payments.ts, and routes-badges.ts. Now lives here as single source of truth.
 */
import type { Request, Response } from "express";
import { recordUserActivity } from "./analytics";

export function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  // Sprint 199: Track active users on every authenticated request
  if (req.user?.id) {
    recordUserActivity(req.user.id);
  }
  next();
}

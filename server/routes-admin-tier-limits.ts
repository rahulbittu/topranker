/**
 * Sprint 247: Admin Tier Rate Limit Routes
 * Exposes tier-based rate limit configuration and usage stats for admins.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { Router } from "express";
import { log } from "./logger";
import { getAllTierLimits, getTierLimits, getUsageStats, getUsage } from "./tiered-rate-limiter";

const adminTierLog = log.tag("AdminTierLimits");

export function registerAdminTierLimitRoutes(app: Router): void {
  // All tier limits
  app.get("/api/admin/tier-limits", (_req, res) => {
    adminTierLog.info("Fetching all tier limits");
    res.json(getAllTierLimits());
  });

  // Usage stats aggregate
  app.get("/api/admin/tier-limits/usage/stats", (_req, res) => {
    adminTierLog.info("Fetching tier usage stats");
    res.json(getUsageStats());
  });

  // Usage for a specific key
  app.get("/api/admin/tier-limits/usage/:key", (req, res) => {
    const record = getUsage(req.params.key);
    if (!record) {
      return res.status(404).json({ error: "No usage record found for key" });
    }
    adminTierLog.info(`Fetching usage for key: ${req.params.key}`);
    res.json(record);
  });

  // Limits for a specific tier
  app.get("/api/admin/tier-limits/:tier", (req, res) => {
    const tier = req.params.tier as "free" | "pro" | "enterprise" | "admin";
    const validTiers = ["free", "pro", "enterprise", "admin"];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({ error: `Invalid tier: ${tier}. Must be one of: ${validTiers.join(", ")}` });
    }
    adminTierLog.info(`Fetching limits for tier: ${tier}`);
    res.json(getTierLimits(tier));
  });
}

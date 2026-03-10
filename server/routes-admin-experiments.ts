/**
 * Admin endpoints for A/B experiment management.
 * All routes require authentication + admin role.
 */

import type { Express, Request, Response } from "express";
import { wrapAsync } from "./wrap-async";
import { requireAuth } from "./middleware";
import {
  getActiveExperiments,
  getExperiment,
  getExperimentStats,
  completeExperiment,
  createExperiment,
} from "./email-ab-testing";
import { getEmailStats } from "./email-tracking";
import {
  createPushExperiment,
  listPushExperiments,
  getPushExperiment,
  deactivatePushExperiment,
} from "./push-ab-testing";
import { computeExperimentDashboard } from "./experiment-tracker";

function requireAdmin(req: Request, res: Response, next: Function) {
  if (!req.user || (req.user as any).role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export function registerAdminExperimentRoutes(app: Express) {
  // List all active experiments with stats
  app.get("/api/admin/experiments", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const experiments = getActiveExperiments();
    const experimentsWithStats = experiments.map((exp) => ({
      ...exp,
      stats: getExperimentStats(exp.id),
    }));
    return res.json({
      data: {
        experiments: experimentsWithStats,
        emailStats: getEmailStats(),
      },
    });
  }));

  // Get single experiment with stats
  app.get("/api/admin/experiments/:id", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const experiment = getExperiment(req.params.id);
    if (!experiment) {
      return res.status(404).json({ error: "Experiment not found" });
    }
    const stats = getExperimentStats(req.params.id);
    return res.json({ data: { experiment, stats } });
  }));

  // Create new experiment
  app.post("/api/admin/experiments", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const { name, variants } = req.body;
    if (!name || !variants || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ error: "name and variants[] are required" });
    }
    const experiment = createExperiment(name, variants);
    return res.json({ data: experiment });
  }));

  // Complete experiment with winner
  app.post("/api/admin/experiments/:id/complete", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const experiment = getExperiment(req.params.id);
    if (!experiment) {
      return res.status(404).json({ error: "Experiment not found" });
    }
    const { winnerVariantId } = req.body;
    completeExperiment(req.params.id, winnerVariantId);
    return res.json({ data: { completed: true } });
  }));

  // ── Sprint 508: Push Notification A/B Testing ──────────────

  // List all push notification experiments
  app.get("/api/admin/push-experiments", requireAuth, requireAdmin, wrapAsync(async (_req: Request, res: Response) => {
    const pushExperiments = listPushExperiments();
    const withDashboards = pushExperiments.map((exp) => ({
      ...exp,
      dashboard: computeExperimentDashboard(exp.id),
    }));
    return res.json({ data: withDashboards });
  }));

  // Get single push experiment with dashboard
  app.get("/api/admin/push-experiments/:id", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const exp = getPushExperiment(req.params.id);
    if (!exp) return res.status(404).json({ error: "Push experiment not found" });
    return res.json({ data: { ...exp, dashboard: computeExperimentDashboard(exp.id) } });
  }));

  // Create push notification experiment
  app.post("/api/admin/push-experiments", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const { id, description, category, variants } = req.body;
    if (!id || !description || !category || !variants || variants.length < 2) {
      return res.status(400).json({ error: "id, description, category, and 2+ variants required" });
    }
    const exp = createPushExperiment(id, description, category, variants);
    if (!exp) return res.status(409).json({ error: "Experiment already exists or invalid" });
    return res.json({ data: exp });
  }));

  // Deactivate push experiment
  app.post("/api/admin/push-experiments/:id/deactivate", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const success = deactivatePushExperiment(req.params.id);
    if (!success) return res.status(404).json({ error: "Push experiment not found" });
    return res.json({ data: { deactivated: true } });
  }));
}

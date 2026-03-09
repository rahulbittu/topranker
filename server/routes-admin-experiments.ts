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
}

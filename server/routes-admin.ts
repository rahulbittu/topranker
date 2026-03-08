/**
 * Admin routes — extracted from routes.ts per Arch Audit H1 recommendation.
 * All endpoints under /api/admin/* require authentication + admin email check.
 */
import type { Express, Request, Response } from "express";
import { isAdminEmail } from "@shared/admin";
import {
  getPendingClaims,
  reviewClaim,
  getClaimCount,
  getPendingFlags,
  reviewFlag,
  getFlagCount,
  getAdminMemberList,
  getMemberCount,
  getBusinessesWithoutPhotos,
  getRecentWebhookEvents,
  getWebhookEventById,
  markWebhookProcessed,
} from "./storage";
import { fetchAndStorePhotos } from "./google-places";
import { getPerfStats } from "./perf-monitor";

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: Function) {
  if (!isAdminEmail(req.user?.email)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export function registerAdminRoutes(app: Express) {
  // ── Category Suggestions ─────────────────────────────────
  app.patch("/api/admin/category-suggestions/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
      }
      const { reviewSuggestion } = await import("./storage");
      const updated = await reviewSuggestion(req.params.id as string, status, req.user!.id);
      if (!updated) {
        return res.status(404).json({ error: "Suggestion not found" });
      }
      return res.json({ data: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Seed Cities ──────────────────────────────────────────
  app.post("/api/admin/seed-cities", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { seedCities } = await import("./seed-cities");
      await seedCities();
      return res.json({ data: { message: "Cities seeded successfully" } });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Google Places Photo Fetching ─────────────────────────
  app.post("/api/admin/fetch-photos", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const city = req.body.city as string | undefined;
      const limit = Math.min(50, parseInt(req.body.limit as string) || 20);
      const businesses = await getBusinessesWithoutPhotos(city, limit);

      if (businesses.length === 0) {
        return res.json({ data: { message: "All businesses already have photos", fetched: 0 } });
      }

      let totalFetched = 0;
      const results: { name: string; photos: number }[] = [];
      for (const biz of businesses) {
        const count = await fetchAndStorePhotos(biz.id, biz.googlePlaceId);
        totalFetched += count;
        results.push({ name: biz.name, photos: count });
      }

      return res.json({
        data: {
          message: `Fetched photos for ${businesses.length} businesses`,
          fetched: totalFetched,
          results,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Claims ───────────────────────────────────────────────
  app.get("/api/admin/claims", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const data = await getPendingClaims();
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/admin/claims/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
      }
      const updated = await reviewClaim(req.params.id as string, status, req.user!.id);
      if (!updated) return res.status(404).json({ error: "Claim not found" });
      return res.json({ data: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/claims/count", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const count = await getClaimCount();
      return res.json({ data: { count } });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Flags ────────────────────────────────────────────────
  app.get("/api/admin/flags", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const data = await getPendingFlags();
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/admin/flags/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!["confirmed", "dismissed"].includes(status)) {
        return res.status(400).json({ error: "Status must be 'confirmed' or 'dismissed'" });
      }
      const updated = await reviewFlag(req.params.id as string, status, req.user!.id);
      if (!updated) return res.status(404).json({ error: "Flag not found" });
      return res.json({ data: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/flags/count", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const count = await getFlagCount();
      return res.json({ data: { count } });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Members ──────────────────────────────────────────────
  app.get("/api/admin/members", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
      const data = await getAdminMemberList(limit);
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/members/count", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const count = await getMemberCount();
      return res.json({ data: { count } });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Webhook Events ──────────────────────────────────────────
  app.get("/api/admin/webhooks", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const source = (req.query.source as string) || "stripe";
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
      const events = await getRecentWebhookEvents(source, limit);
      return res.json({ data: events });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/webhooks/:id/replay", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const event = await getWebhookEventById(req.params.id);
      if (!event) return res.status(404).json({ error: "Webhook event not found" });

      // Re-process the webhook by importing and calling the handler
      const { processStripeEvent } = await import("./stripe-webhook");
      if (event.source === "stripe" && event.payload) {
        await processStripeEvent(event.payload as any);
        await markWebhookProcessed(event.id);
        return res.json({ data: { id: event.id, replayed: true } });
      }
      return res.status(400).json({ error: `Unsupported webhook source: ${event.source}` });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Performance Stats ─────────────────────────────────────
  app.get("/api/admin/perf", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const data = getPerfStats();
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Revenue Metrics ──────────────────────────────────────
  app.get("/api/admin/revenue", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { getRevenueMetrics } = await import("./storage");
      const metrics = await getRevenueMetrics();
      return res.json({ data: metrics });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });
}

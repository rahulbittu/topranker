/**
 * Dish Leaderboard routes — Sprint 166
 * Extracted from routes.ts to keep file under 1000 LOC.
 */
import type { Express, Request, Response } from "express";
import { sanitizeString } from "./sanitize";
import { insertDishSuggestionSchema } from "@shared/schema";
import { wrapAsync } from "./wrap-async";
import { requireAuth } from "./middleware";
import {
  getDishLeaderboards,
  getDishLeaderboardWithEntries,
  getDishSuggestions,
  submitDishSuggestion,
  voteDishSuggestion,
} from "./storage";

export function registerDishRoutes(app: Express) {
  app.get("/api/dish-leaderboards", wrapAsync(async (req: Request, res: Response) => {
    const city = sanitizeString(req.query.city, 100) || "dallas";
    const data = await getDishLeaderboards(city);
    return res.json({ data });
  }));

  app.get("/api/dish-leaderboards/:slug", wrapAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug as string;
    const city = sanitizeString(req.query.city, 100) || "dallas";
    const result = await getDishLeaderboardWithEntries(slug, city);
    if (!result) return res.status(404).json({ error: "Dish leaderboard not found" });
    return res.json({ data: result });
  }));

  app.get("/api/dish-suggestions", wrapAsync(async (req: Request, res: Response) => {
    const city = sanitizeString(req.query.city, 100) || "dallas";
    const data = await getDishSuggestions(city);
    return res.json({ data });
  }));

  app.post("/api/dish-suggestions", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const parsed = insertDishSuggestionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
    const memberId = req.user!.id;
    try {
      const suggestion = await submitDishSuggestion(memberId, parsed.data.city, parsed.data.dishName);
      return res.status(201).json({ data: suggestion });
    } catch (err: any) {
      if (err.message.includes("3 dishes per week")) return res.status(429).json({ error: err.message });
      return res.status(400).json({ error: err.message });
    }
  }));

  app.post("/api/dish-suggestions/:id/vote", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const memberId = req.user!.id;
    try {
      const suggestion = await voteDishSuggestion(memberId, req.params.id as string);
      return res.json({ data: suggestion });
    } catch (err: any) {
      if (err.message.includes("Already voted")) return res.status(409).json({ error: err.message });
      return res.status(400).json({ error: err.message });
    }
  }));

  /**
   * Sprint 277: GET /api/businesses/:id/top-dishes
   * Returns top dishes for a specific business with vote counts and rating mentions.
   */
  app.get("/api/businesses/:id/top-dishes", wrapAsync(async (req: Request, res: Response) => {
    const businessId = req.params.id;
    const { getBusinessDishes } = await import("./storage/dishes");
    const topDishes = await getBusinessDishes(businessId, 10);

    const enriched = topDishes.map(d => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      voteCount: d.voteCount,
      photoUrl: d.photoUrl,
    }));

    return res.json({ data: enriched });
  }));
}

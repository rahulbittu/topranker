/**
 * Best In routes — Sprint 259
 * "Best X in City" sub-category system — the core differentiator.
 */
import type { Express, Request, Response } from "express";
import { wrapAsync } from "./wrap-async";
import { requireAuth } from "./middleware";
import {
  getActiveCategories,
  getCategoryBySlug,
  searchCategories,
  getBestInTitle,
  getCategoryCount,
  BEST_IN_CATEGORIES,
} from "../shared/best-in-categories";
import { sanitizeString } from "./sanitize";

export function registerBestInRoutes(app: Express) {
  // GET /api/best-in — list all active categories
  app.get("/api/best-in", wrapAsync(async (req: Request, res: Response) => {
    const categories = getActiveCategories();
    return res.json({ data: categories });
  }));

  // GET /api/best-in/search?q=biryani — search categories
  app.get("/api/best-in/search", wrapAsync(async (req: Request, res: Response) => {
    const q = sanitizeString(req.query.q, 200) || "";
    if (!q) return res.json({ data: [] });
    const results = searchCategories(q);
    return res.json({ data: results });
  }));

  // GET /api/best-in/:slug — get category details + top businesses
  app.get("/api/best-in/:slug", wrapAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const category = getCategoryBySlug(slug);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    const title = getBestInTitle(slug);
    return res.json({
      data: {
        ...category,
        title,
        businesses: [], // TODO: wire to storage layer
      },
    });
  }));

  // GET /api/best-in/:slug/leaderboard — leaderboard for this category
  app.get("/api/best-in/:slug/leaderboard", wrapAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const category = getCategoryBySlug(slug);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    const city = sanitizeString(req.query.city, 100) || category.city;
    const title = getBestInTitle(slug, city);
    return res.json({
      data: {
        category,
        title,
        city,
        entries: [], // TODO: wire to storage layer
      },
    });
  }));

  // GET /api/admin/best-in/stats — category stats (admin only)
  app.get("/api/admin/best-in/stats", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const counts = getCategoryCount();
    const byParent: Record<string, number> = {};
    for (const cat of BEST_IN_CATEGORIES) {
      byParent[cat.parentCategory] = (byParent[cat.parentCategory] || 0) + 1;
    }
    return res.json({
      data: {
        ...counts,
        byParent,
      },
    });
  }));
}

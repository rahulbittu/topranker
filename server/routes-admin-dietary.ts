/**
 * Sprint 446: Admin Dietary Tag Management
 * Endpoints for managing business dietary tags and auto-enrichment.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { Router, Request, Response } from "express";
import { log } from "./logger";
import { db } from "./db";
import { businesses } from "@shared/schema";
import { eq, sql, and, isNotNull } from "drizzle-orm";

const dietaryLog = log.tag("AdminDietary");

const VALID_TAGS = ["vegetarian", "vegan", "halal", "gluten_free"] as const;
type DietaryTag = (typeof VALID_TAGS)[number];

// Cuisine → auto-suggested tags mapping
const CUISINE_TAG_SUGGESTIONS: Record<string, DietaryTag[]> = {
  indian: ["vegetarian"],
  thai: ["gluten_free"],
  middle_eastern: ["halal"],
  mediterranean: ["vegetarian"],
  japanese: ["gluten_free"],
  mexican: ["gluten_free"],
  vegan: ["vegan", "vegetarian"],
  vegetarian: ["vegetarian"],
};

export function registerAdminDietaryRoutes(app: Router): void {
  // GET /api/admin/dietary/stats — overview of tag coverage
  app.get("/api/admin/dietary/stats", async (_req: Request, res: Response) => {
    dietaryLog.info("Fetching dietary tag stats");
    const allBiz = await db.select({
      id: businesses.id,
      name: businesses.name,
      cuisine: businesses.cuisine,
      dietaryTags: businesses.dietaryTags,
    }).from(businesses).where(eq(businesses.isActive, true));

    const tagged = allBiz.filter(b => Array.isArray(b.dietaryTags) && (b.dietaryTags as string[]).length > 0);
    const untagged = allBiz.filter(b => !Array.isArray(b.dietaryTags) || (b.dietaryTags as string[]).length === 0);
    const tagCounts: Record<string, number> = {};
    for (const b of tagged) {
      for (const tag of (b.dietaryTags as string[])) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    res.json({
      total: allBiz.length,
      tagged: tagged.length,
      untagged: untagged.length,
      coveragePct: allBiz.length > 0 ? Math.round((tagged.length / allBiz.length) * 100) : 0,
      tagCounts,
      validTags: [...VALID_TAGS],
    });
  });

  // PUT /api/admin/dietary/:businessId — set tags for a business
  app.put("/api/admin/dietary/:businessId", async (req: Request, res: Response) => {
    const { businessId } = req.params;
    const { tags } = req.body || {};

    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: "tags must be an array" });
    }

    const invalidTags = tags.filter((t: string) => !VALID_TAGS.includes(t as DietaryTag));
    if (invalidTags.length > 0) {
      return res.status(400).json({ error: `Invalid tags: ${invalidTags.join(", ")}. Valid: ${VALID_TAGS.join(", ")}` });
    }

    const result = await db
      .update(businesses)
      .set({ dietaryTags: tags })
      .where(eq(businesses.id, businessId))
      .returning({ id: businesses.id, name: businesses.name });

    if (result.length === 0) {
      return res.status(404).json({ error: "Business not found" });
    }

    dietaryLog.info(`Updated dietary tags for ${result[0].name}: [${tags.join(", ")}]`);
    res.json({ success: true, business: result[0].name, tags });
  });

  // POST /api/admin/dietary/auto-enrich — suggest tags based on cuisine
  app.post("/api/admin/dietary/auto-enrich", async (req: Request, res: Response) => {
    const { dryRun = true } = req.body || {};
    dietaryLog.info(`Auto-enrichment ${dryRun ? "(dry run)" : "(applying)"}`);

    const untagged = await db.select({
      id: businesses.id,
      name: businesses.name,
      cuisine: businesses.cuisine,
      dietaryTags: businesses.dietaryTags,
    }).from(businesses).where(
      and(
        eq(businesses.isActive, true),
        isNotNull(businesses.cuisine),
      ),
    );

    const suggestions: { id: string; name: string; cuisine: string; suggestedTags: string[] }[] = [];

    for (const biz of untagged) {
      const currentTags: string[] = Array.isArray(biz.dietaryTags) ? biz.dietaryTags as string[] : [];
      const cuisineLower = (biz.cuisine || "").toLowerCase().replace(/[^a-z_]/g, "_");
      const suggested = CUISINE_TAG_SUGGESTIONS[cuisineLower] || [];
      const newTags = suggested.filter(t => !currentTags.includes(t));

      if (newTags.length > 0) {
        const merged = [...new Set([...currentTags, ...newTags])];
        suggestions.push({
          id: biz.id,
          name: biz.name,
          cuisine: biz.cuisine || "",
          suggestedTags: newTags,
        });

        if (!dryRun) {
          await db.update(businesses)
            .set({ dietaryTags: merged })
            .where(eq(businesses.id, biz.id));
        }
      }
    }

    dietaryLog.info(`Auto-enrichment: ${suggestions.length} businesses ${dryRun ? "would be" : "were"} updated`);
    res.json({
      dryRun,
      updated: suggestions.length,
      suggestions,
    });
  });

  // GET /api/admin/dietary/businesses — list businesses with their tags
  app.get("/api/admin/dietary/businesses", async (req: Request, res: Response) => {
    const filter = req.query.filter as string; // "tagged" | "untagged" | undefined
    dietaryLog.info(`Listing businesses (filter: ${filter || "all"})`);

    const allBiz = await db.select({
      id: businesses.id,
      name: businesses.name,
      cuisine: businesses.cuisine,
      city: businesses.city,
      dietaryTags: businesses.dietaryTags,
    }).from(businesses).where(eq(businesses.isActive, true));

    let filtered = allBiz;
    if (filter === "tagged") {
      filtered = allBiz.filter(b => Array.isArray(b.dietaryTags) && (b.dietaryTags as string[]).length > 0);
    } else if (filter === "untagged") {
      filtered = allBiz.filter(b => !Array.isArray(b.dietaryTags) || (b.dietaryTags as string[]).length === 0);
    }

    res.json({ data: filtered, total: filtered.length });
  });
}

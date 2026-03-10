/**
 * Sprint 467: Admin Enrichment Bulk Operations
 * Extracted from routes-admin-enrichment.ts (Sprints 458, 463)
 *
 * Bulk dietary tagging (by IDs and by cuisine) and bulk hours updates.
 */

import { Router, Request, Response } from "express";
import { log } from "./logger";
import { db } from "./db";
import { businesses } from "@shared/schema";
import { eq } from "drizzle-orm";

const bulkLog = log.tag("AdminEnrichmentBulk");

interface HoursData {
  periods?: { open: { day: number; time: string }; close?: { day: number; time: string } }[];
  weekday_text?: string[];
}

const VALID_TAGS = ["vegetarian", "vegan", "halal", "gluten_free"];

export function registerAdminEnrichmentBulkRoutes(app: Router): void {
  // Sprint 458: POST /api/admin/enrichment/bulk-dietary — batch tag multiple businesses
  app.post("/api/admin/enrichment/bulk-dietary", async (req: Request, res: Response) => {
    const { businessIds, tags, mode = "merge" } = req.body || {};

    if (!Array.isArray(businessIds) || businessIds.length === 0) {
      return res.status(400).json({ error: "businessIds must be a non-empty array" });
    }
    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: "tags must be a non-empty array" });
    }

    const invalidTags = tags.filter((t: string) => !VALID_TAGS.includes(t));
    if (invalidTags.length > 0) {
      return res.status(400).json({ error: `Invalid tags: ${invalidTags.join(", ")}` });
    }

    if (businessIds.length > 100) {
      return res.status(400).json({ error: "Maximum 100 businesses per batch" });
    }

    bulkLog.info(`Bulk dietary: ${businessIds.length} businesses, tags=[${tags}], mode=${mode}`);

    const results: { id: string; name: string; previousTags: string[]; newTags: string[] }[] = [];

    for (const bizId of businessIds) {
      const [biz] = await db.select({
        id: businesses.id,
        name: businesses.name,
        dietaryTags: businesses.dietaryTags,
      }).from(businesses).where(eq(businesses.id, bizId));

      if (!biz) continue;

      const previousTags: string[] = Array.isArray(biz.dietaryTags) ? biz.dietaryTags as string[] : [];
      const newTags = mode === "replace" ? [...tags] : [...new Set([...previousTags, ...tags])];

      await db.update(businesses)
        .set({ dietaryTags: newTags })
        .where(eq(businesses.id, bizId));

      results.push({ id: biz.id, name: biz.name, previousTags, newTags });
    }

    bulkLog.info(`Bulk dietary complete: ${results.length}/${businessIds.length} updated`);
    res.json({ updated: results.length, requested: businessIds.length, mode, results });
  });

  // Sprint 458: POST /api/admin/enrichment/bulk-dietary-by-cuisine — tag all businesses with a cuisine
  app.post("/api/admin/enrichment/bulk-dietary-by-cuisine", async (req: Request, res: Response) => {
    const { cuisine, tags, city, dryRun = true } = req.body || {};

    if (!cuisine || typeof cuisine !== "string") {
      return res.status(400).json({ error: "cuisine is required" });
    }
    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: "tags must be a non-empty array" });
    }

    const invalidTags = tags.filter((t: string) => !VALID_TAGS.includes(t));
    if (invalidTags.length > 0) {
      return res.status(400).json({ error: `Invalid tags: ${invalidTags.join(", ")}` });
    }

    bulkLog.info(`Bulk dietary by cuisine: ${cuisine}, tags=[${tags}], city=${city || "all"}, dryRun=${dryRun}`);

    let allBiz = await db.select({
      id: businesses.id,
      name: businesses.name,
      cuisine: businesses.cuisine,
      city: businesses.city,
      dietaryTags: businesses.dietaryTags,
    }).from(businesses).where(eq(businesses.isActive, true));

    // Filter by cuisine (case-insensitive)
    allBiz = allBiz.filter(b => b.cuisine?.toLowerCase() === cuisine.toLowerCase());
    if (city) {
      allBiz = allBiz.filter(b => b.city === city);
    }

    const updates: { id: string; name: string; previousTags: string[]; newTags: string[] }[] = [];

    for (const biz of allBiz) {
      const previousTags: string[] = Array.isArray(biz.dietaryTags) ? biz.dietaryTags as string[] : [];
      const newTags = [...new Set([...previousTags, ...tags])];

      if (newTags.length === previousTags.length && newTags.every(t => previousTags.includes(t))) {
        continue; // No change needed
      }

      if (!dryRun) {
        await db.update(businesses)
          .set({ dietaryTags: newTags })
          .where(eq(businesses.id, biz.id));
      }

      updates.push({ id: biz.id, name: biz.name, previousTags, newTags });
    }

    bulkLog.info(`Bulk by cuisine ${dryRun ? "(dry run)" : ""}: ${updates.length}/${allBiz.length} ${dryRun ? "would be" : "were"} updated`);
    res.json({
      dryRun,
      cuisine,
      city: city || "all",
      matched: allBiz.length,
      updated: updates.length,
      updates: updates.slice(0, 50), // cap for response size
    });
  });

  // Sprint 463: POST /api/admin/enrichment/bulk-hours — batch update opening hours
  app.post("/api/admin/enrichment/bulk-hours", async (req: Request, res: Response) => {
    const { businessIds, hoursData, source = "manual", dryRun = true } = req.body || {};

    if (!Array.isArray(businessIds) || businessIds.length === 0) {
      return res.status(400).json({ error: "businessIds must be a non-empty array" });
    }
    if (!hoursData || typeof hoursData !== "object") {
      return res.status(400).json({ error: "hoursData must be a valid hours object" });
    }
    if (businessIds.length > 50) {
      return res.status(400).json({ error: "Maximum 50 businesses per hours batch" });
    }

    // Validate hoursData structure
    const VALID_SOURCES = ["manual", "google_places", "import"];
    if (!VALID_SOURCES.includes(source)) {
      return res.status(400).json({ error: `Invalid source: ${source}. Must be one of: ${VALID_SOURCES.join(", ")}` });
    }

    const periods = hoursData.periods;
    if (periods && !Array.isArray(periods)) {
      return res.status(400).json({ error: "hoursData.periods must be an array" });
    }
    if (periods) {
      for (const p of periods) {
        if (!p.open || typeof p.open.day !== "number" || typeof p.open.time !== "string") {
          return res.status(400).json({ error: "Each period must have open.day (number) and open.time (string)" });
        }
      }
    }

    bulkLog.info(`Bulk hours: ${businessIds.length} businesses, source=${source}, dryRun=${dryRun}`);

    const results: { id: string; name: string; hadHours: boolean; periodsCount: number }[] = [];

    for (const bizId of businessIds) {
      const [biz] = await db.select({
        id: businesses.id,
        name: businesses.name,
        openingHours: businesses.openingHours,
      }).from(businesses).where(eq(businesses.id, bizId));

      if (!biz) continue;

      const prevHours = biz.openingHours as HoursData | null;
      const hadHours = !!(prevHours && prevHours.periods && prevHours.periods.length > 0);

      if (!dryRun) {
        await db.update(businesses)
          .set({ openingHours: hoursData })
          .where(eq(businesses.id, bizId));
      }

      results.push({
        id: biz.id,
        name: biz.name,
        hadHours,
        periodsCount: periods?.length || 0,
      });
    }

    bulkLog.info(`Bulk hours ${dryRun ? "(dry run)" : ""}: ${results.length}/${businessIds.length} ${dryRun ? "would be" : "were"} updated`);
    res.json({
      dryRun,
      source,
      requested: businessIds.length,
      updated: results.length,
      results: results.slice(0, 50),
    });
  });
}

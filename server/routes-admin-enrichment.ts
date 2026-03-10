/**
 * Sprint 452: Admin Enrichment Dashboard
 * Aggregated view of dietary tag coverage and hours data completeness.
 * Gives ops team visibility into enrichment progress across all active businesses.
 */

import { Router, Request, Response } from "express";
import { log } from "./logger";
import { db } from "./db";
import { businesses } from "@shared/schema";
import { eq } from "drizzle-orm";
import { isOpenLate, isOpenWeekends } from "./hours-utils";

const enrichLog = log.tag("AdminEnrichment");

interface EnrichmentRow {
  id: string;
  name: string;
  city: string;
  cuisine: string | null;
  dietaryTags: unknown;
  openingHours: unknown;
}

interface HoursData {
  periods?: { open: { day: number; time: string }; close?: { day: number; time: string } }[];
  weekday_text?: string[];
}

export function registerAdminEnrichmentRoutes(app: Router): void {
  // GET /api/admin/enrichment/dashboard — full enrichment overview
  app.get("/api/admin/enrichment/dashboard", async (_req: Request, res: Response) => {
    enrichLog.info("Generating enrichment dashboard");

    const allBiz = await db.select({
      id: businesses.id,
      name: businesses.name,
      city: businesses.city,
      cuisine: businesses.cuisine,
      dietaryTags: businesses.dietaryTags,
      openingHours: businesses.openingHours,
    }).from(businesses).where(eq(businesses.isActive, true));

    // --- Dietary coverage ---
    const dietaryTagged = allBiz.filter(b => Array.isArray(b.dietaryTags) && (b.dietaryTags as string[]).length > 0);
    const dietaryUntagged = allBiz.filter(b => !Array.isArray(b.dietaryTags) || (b.dietaryTags as string[]).length === 0);
    const tagCounts: Record<string, number> = {};
    for (const b of dietaryTagged) {
      for (const tag of (b.dietaryTags as string[])) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    // --- Hours coverage ---
    const hasHours = allBiz.filter(b => {
      const h = b.openingHours as HoursData | null;
      return h && h.periods && h.periods.length > 0;
    });
    const missingHours = allBiz.filter(b => {
      const h = b.openingHours as HoursData | null;
      return !h || !h.periods || h.periods.length === 0;
    });

    // Hours characteristics
    let openLateCount = 0;
    let openWeekendsCount = 0;
    let has24Hour = 0;
    let avgPeriodsPerBiz = 0;
    let totalPeriods = 0;

    for (const b of hasHours) {
      const h = b.openingHours as HoursData;
      if (isOpenLate(h as Parameters<typeof isOpenLate>[0])) openLateCount++;
      if (isOpenWeekends(h as Parameters<typeof isOpenWeekends>[0])) openWeekendsCount++;
      if (h.periods && h.periods.length === 1 && !h.periods[0].close) has24Hour++;
      totalPeriods += h.periods?.length || 0;
    }
    avgPeriodsPerBiz = hasHours.length > 0 ? Math.round((totalPeriods / hasHours.length) * 10) / 10 : 0;

    // --- Per-city breakdown ---
    const cities = [...new Set(allBiz.map(b => b.city).filter(Boolean))];
    const cityBreakdown = cities.map(city => {
      const cityBiz = allBiz.filter(b => b.city === city);
      const cityDietary = cityBiz.filter(b => Array.isArray(b.dietaryTags) && (b.dietaryTags as string[]).length > 0);
      const cityHours = cityBiz.filter(b => {
        const h = b.openingHours as HoursData | null;
        return h && h.periods && h.periods.length > 0;
      });
      return {
        city,
        total: cityBiz.length,
        dietaryTagged: cityDietary.length,
        dietaryCoveragePct: cityBiz.length > 0 ? Math.round((cityDietary.length / cityBiz.length) * 100) : 0,
        hoursPresent: cityHours.length,
        hoursCoveragePct: cityBiz.length > 0 ? Math.round((cityHours.length / cityBiz.length) * 100) : 0,
      };
    }).sort((a, b) => b.total - a.total);

    // --- Businesses missing both ---
    const missingBoth = allBiz.filter(b => {
      const noDietary = !Array.isArray(b.dietaryTags) || (b.dietaryTags as string[]).length === 0;
      const noHours = !(b.openingHours as HoursData)?.periods?.length;
      return noDietary && noHours;
    }).map(b => ({ id: b.id, name: b.name, city: b.city, cuisine: b.cuisine }));

    res.json({
      generatedAt: new Date().toISOString(),
      total: allBiz.length,
      dietary: {
        tagged: dietaryTagged.length,
        untagged: dietaryUntagged.length,
        coveragePct: allBiz.length > 0 ? Math.round((dietaryTagged.length / allBiz.length) * 100) : 0,
        tagCounts,
      },
      hours: {
        present: hasHours.length,
        missing: missingHours.length,
        coveragePct: allBiz.length > 0 ? Math.round((hasHours.length / allBiz.length) * 100) : 0,
        openLateCount,
        openWeekendsCount,
        has24Hour,
        avgPeriodsPerBiz,
      },
      missingBoth: {
        count: missingBoth.length,
        businesses: missingBoth.slice(0, 50), // cap at 50 for response size
      },
      cityBreakdown,
    });
  });

  // GET /api/admin/enrichment/hours-gaps — businesses with missing/incomplete hours
  app.get("/api/admin/enrichment/hours-gaps", async (req: Request, res: Response) => {
    const city = req.query.city as string | undefined;
    enrichLog.info(`Fetching hours gaps${city ? ` for ${city}` : ""}`);

    let allBiz = await db.select({
      id: businesses.id,
      name: businesses.name,
      city: businesses.city,
      cuisine: businesses.cuisine,
      openingHours: businesses.openingHours,
    }).from(businesses).where(eq(businesses.isActive, true));

    if (city) {
      allBiz = allBiz.filter(b => b.city === city);
    }

    const gaps = allBiz.filter(b => {
      const h = b.openingHours as HoursData | null;
      return !h || !h.periods || h.periods.length === 0;
    }).map(b => ({
      id: b.id,
      name: b.name,
      city: b.city,
      cuisine: b.cuisine,
      hasWeekdayText: !!(b.openingHours as HoursData)?.weekday_text?.length,
    }));

    res.json({
      total: allBiz.length,
      missingHours: gaps.length,
      gaps,
    });
  });

  // GET /api/admin/enrichment/dietary-gaps — businesses with no dietary tags
  app.get("/api/admin/enrichment/dietary-gaps", async (req: Request, res: Response) => {
    const city = req.query.city as string | undefined;
    enrichLog.info(`Fetching dietary gaps${city ? ` for ${city}` : ""}`);

    let allBiz = await db.select({
      id: businesses.id,
      name: businesses.name,
      city: businesses.city,
      cuisine: businesses.cuisine,
      dietaryTags: businesses.dietaryTags,
    }).from(businesses).where(eq(businesses.isActive, true));

    if (city) {
      allBiz = allBiz.filter(b => b.city === city);
    }

    const gaps = allBiz.filter(b => {
      return !Array.isArray(b.dietaryTags) || (b.dietaryTags as string[]).length === 0;
    }).map(b => ({
      id: b.id,
      name: b.name,
      city: b.city,
      cuisine: b.cuisine,
    }));

    res.json({
      total: allBiz.length,
      missingDietary: gaps.length,
      gaps,
    });
  });

  // Sprint 458: POST /api/admin/enrichment/bulk-dietary — batch tag multiple businesses
  app.post("/api/admin/enrichment/bulk-dietary", async (req: Request, res: Response) => {
    const { businessIds, tags, mode = "merge" } = req.body || {};

    if (!Array.isArray(businessIds) || businessIds.length === 0) {
      return res.status(400).json({ error: "businessIds must be a non-empty array" });
    }
    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: "tags must be a non-empty array" });
    }

    const VALID_TAGS = ["vegetarian", "vegan", "halal", "gluten_free"];
    const invalidTags = tags.filter((t: string) => !VALID_TAGS.includes(t));
    if (invalidTags.length > 0) {
      return res.status(400).json({ error: `Invalid tags: ${invalidTags.join(", ")}` });
    }

    if (businessIds.length > 100) {
      return res.status(400).json({ error: "Maximum 100 businesses per batch" });
    }

    enrichLog.info(`Bulk dietary: ${businessIds.length} businesses, tags=[${tags}], mode=${mode}`);

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

    enrichLog.info(`Bulk dietary complete: ${results.length}/${businessIds.length} updated`);
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

    const VALID_TAGS = ["vegetarian", "vegan", "halal", "gluten_free"];
    const invalidTags = tags.filter((t: string) => !VALID_TAGS.includes(t));
    if (invalidTags.length > 0) {
      return res.status(400).json({ error: `Invalid tags: ${invalidTags.join(", ")}` });
    }

    enrichLog.info(`Bulk dietary by cuisine: ${cuisine}, tags=[${tags}], city=${city || "all"}, dryRun=${dryRun}`);

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

    enrichLog.info(`Bulk by cuisine ${dryRun ? "(dry run)" : ""}: ${updates.length}/${allBiz.length} ${dryRun ? "would be" : "were"} updated`);
    res.json({
      dryRun,
      cuisine,
      city: city || "all",
      matched: allBiz.length,
      updated: updates.length,
      updates: updates.slice(0, 50), // cap for response size
    });
  });
}

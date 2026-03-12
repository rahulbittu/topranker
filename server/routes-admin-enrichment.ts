/**
 * Sprint 452: Admin Enrichment Dashboard
 * Sprint 472: Added requireAuth + requireAdmin middleware to all endpoints
 *
 * Aggregated view of dietary tag coverage and hours data completeness.
 * Gives ops team visibility into enrichment progress across all active businesses.
 */

import { Router, Request, Response } from "express";
import { log } from "./logger";
import { db } from "./db";
import { businesses } from "@shared/schema";
import { eq } from "drizzle-orm";
import { isOpenLate, isOpenWeekends } from "./hours-utils";
import { requireAuth } from "./middleware";
import { isAdminEmail } from "@shared/admin";

const enrichLog = log.tag("AdminEnrichment");

// Sprint 472: Admin auth middleware — resolves 4-cycle critique item
function requireAdmin(req: Request, res: Response, next: Function) {
  if (!isAdminEmail(req.user?.email)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

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
  app.get("/api/admin/enrichment/dashboard", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
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
  app.get("/api/admin/enrichment/hours-gaps", requireAuth, requireAdmin, async (req: Request, res: Response) => {
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
  app.get("/api/admin/enrichment/dietary-gaps", requireAuth, requireAdmin, async (req: Request, res: Response) => {
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

  // Sprint 663: Batch enrich action URLs (DoorDash, Uber Eats, menu, Maps)
  app.post("/api/admin/enrichment/action-urls", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    enrichLog.info("Starting batch action URL enrichment");
    const { batchEnrichActionUrls } = await import("./google-places");
    const enriched = await batchEnrichActionUrls();
    res.json({ enriched, message: `Enriched ${enriched} businesses with action URLs` });
  });

  // Sprint 671: Batch enrich full details (hours, description, price) from Google Places
  app.post("/api/admin/enrichment/full-details", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    enrichLog.info("Starting batch full details enrichment");
    const { isNotNull, isNull, and } = await import("drizzle-orm");
    const { enrichBusinessFullDetails } = await import("./google-places");

    const unenriched = await db
      .select({ id: businesses.id, googlePlaceId: businesses.googlePlaceId })
      .from(businesses)
      .where(and(isNotNull(businesses.googlePlaceId), isNull(businesses.openingHours)))
      .limit(50);

    let enriched = 0;
    for (const biz of unenriched) {
      if (!biz.googlePlaceId) continue;
      try {
        const success = await enrichBusinessFullDetails(biz.id, biz.googlePlaceId);
        if (success) enriched++;
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        enrichLog.error(`Batch full details failed for ${biz.id}: ${err}`);
      }
    }

    res.json({ enriched, total: unenriched.length, message: `Enriched ${enriched}/${unenriched.length} businesses with full details` });
  });

  // Sprint 467: Bulk operations extracted to routes-admin-enrichment-bulk.ts
}

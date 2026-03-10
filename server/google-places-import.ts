/**
 * Sprint 593: Auto-import real Google Places data on server startup.
 * Only runs if no google_bulk_import businesses exist in the DB.
 * Searches for real restaurants in Dallas-area cities and imports them with photos.
 */

import { config } from "./config";
import { log } from "./logger";
import { db } from "./db";
import { businesses } from "@shared/schema";
import { eq } from "drizzle-orm";
import { searchNearbyRestaurants, normalizeCategory, fetchAndStorePhotos } from "./google-places";
import { bulkImportBusinesses } from "./storage/businesses";

const IMPORT_QUERIES = [
  { city: "Irving", query: "Indian restaurants in Irving TX" },
  { city: "Irving", query: "best restaurants in Irving TX" },
  { city: "Plano", query: "Indian restaurants in Plano TX" },
  { city: "Plano", query: "best restaurants in Plano TX" },
  { city: "Frisco", query: "Indian restaurants in Frisco TX" },
  { city: "Dallas", query: "Indian restaurants in Dallas TX" },
  { city: "Dallas", query: "best biryani in Dallas TX" },
  { city: "Dallas", query: "best restaurants in Dallas TX" },
];

export async function autoImportGooglePlaces(): Promise<void> {
  if (!config.googleMapsApiKey) {
    log.tag("GoogleImport").info("No Google Maps API key — skipping auto-import");
    return;
  }

  // Check if we already have Google-imported data
  const existing = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.dataSource, "google_bulk_import"))
    .limit(1);

  if (existing.length > 0) {
    log.tag("GoogleImport").info("Google Places data already imported — skipping");
    return;
  }

  log.tag("GoogleImport").info("Starting auto-import of real Google Places data...");

  let totalImported = 0;

  for (const { city, query } of IMPORT_QUERIES) {
    try {
      const places = await searchNearbyRestaurants(city, "restaurant", 20);
      if (places.length === 0) continue;

      const importData = places.map(p => ({
        placeId: p.placeId,
        name: p.name,
        address: p.address,
        city,
        category: normalizeCategory(p.types),
        lat: p.lat,
        lng: p.lng,
        googleRating: p.rating,
        priceRange: p.priceLevel || "$$",
      }));

      const result = await bulkImportBusinesses(importData);
      totalImported += result.imported;

      if (result.imported > 0) {
        log.tag("GoogleImport").info(`${city}: imported ${result.imported} restaurants`);

        // Fetch photos for imported businesses (async, best-effort)
        for (const r of result.results) {
          if (r.status === "imported") {
            const match = importData.find(d => d.name === r.name);
            if (match) {
              const [biz] = await db
                .select({ id: businesses.id })
                .from(businesses)
                .where(eq(businesses.googlePlaceId, match.placeId));
              if (biz) {
                await fetchAndStorePhotos(biz.id, match.placeId).catch(() => {});
              }
            }
          }
        }
      }

      // Rate limit between queries
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err: any) {
      log.tag("GoogleImport").error(`Failed for "${query}": ${err.message}`);
    }
  }

  log.tag("GoogleImport").info(`Auto-import complete: ${totalImported} restaurants imported`);
}

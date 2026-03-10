/**
 * Import real restaurants from Google Places API into the database.
 * Replaces hardcoded seed data with real restaurant data for demo purposes.
 *
 * Usage: npx tsx --env-file=.env scripts/import-google-places.ts
 *
 * Searches for restaurants in Dallas-area cities (Irving, Plano, Frisco, Dallas)
 * and imports them with real Google Place photos.
 */

import { searchNearbyRestaurants, normalizeCategory, fetchAndStorePhotos } from "../server/google-places";
import { bulkImportBusinesses } from "../server/storage/businesses";
import { db } from "../server/db";
import { businesses } from "../shared/schema";
import { eq } from "drizzle-orm";

const CITIES = [
  { name: "Irving", queries: ["Indian restaurants in Irving TX", "best restaurants in Irving TX"] },
  { name: "Plano", queries: ["Indian restaurants in Plano TX", "best restaurants in Plano TX"] },
  { name: "Frisco", queries: ["Indian restaurants in Frisco TX", "best restaurants in Frisco TX"] },
  { name: "Dallas", queries: ["Indian restaurants in Dallas TX", "best biryani in Dallas TX"] },
];

async function importFromGoogle() {
  console.log("=== Google Places Import ===\n");

  // Check existing real imports
  const existingGoogle = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.dataSource, "google_bulk_import"))
    .limit(1);

  if (existingGoogle.length > 0) {
    console.log("Google Places data already imported. Skipping to avoid duplicates.");
    console.log("To re-import, manually delete google_bulk_import businesses first.\n");
    process.exit(0);
  }

  let totalImported = 0;
  let totalSkipped = 0;

  for (const city of CITIES) {
    console.log(`\n--- ${city.name} ---`);

    for (const query of city.queries) {
      console.log(`Searching: "${query}"...`);

      try {
        const places = await searchNearbyRestaurants(city.name, "restaurant", 20);

        if (places.length === 0) {
          console.log(`  No results for "${query}"`);
          continue;
        }

        console.log(`  Found ${places.length} places`);

        const importData = places.map(p => ({
          placeId: p.placeId,
          name: p.name,
          address: p.address,
          city: city.name,
          category: normalizeCategory(p.types),
          lat: p.lat,
          lng: p.lng,
          googleRating: p.rating,
          priceRange: p.priceLevel || "$$",
        }));

        const result = await bulkImportBusinesses(importData);
        totalImported += result.imported;
        totalSkipped += result.skipped;

        console.log(`  Imported: ${result.imported}, Skipped: ${result.skipped}`);

        // Fetch photos for newly imported businesses
        for (const r of result.results) {
          if (r.status === "imported") {
            const match = importData.find(d => d.name === r.name);
            if (match) {
              // Find the business we just inserted
              const [biz] = await db
                .select({ id: businesses.id })
                .from(businesses)
                .where(eq(businesses.googlePlaceId, match.placeId));
              if (biz) {
                const photoCount = await fetchAndStorePhotos(biz.id, match.placeId);
                if (photoCount > 0) {
                  console.log(`    📷 ${r.name}: ${photoCount} photos`);
                }
              }
            }
          }
        }
      } catch (err: any) {
        console.error(`  Error: ${err.message}`);
      }

      // Rate limit: 1 second between API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n=== Import Complete ===`);
  console.log(`Total imported: ${totalImported}`);
  console.log(`Total skipped: ${totalSkipped}`);
  process.exit(0);
}

importFromGoogle().catch(err => {
  console.error("Import failed:", err);
  process.exit(1);
});

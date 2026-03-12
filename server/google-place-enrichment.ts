import { db } from "./db";
import { businesses } from "@shared/schema";
import { log } from "./logger";
import { eq, isNull, and } from "drizzle-orm";

export interface PlaceEnrichment {
  googlePlaceId: string;
  googleRating?: number;
  googleMapsUrl?: string;
  photoUrl?: string;
}

export async function findGooglePlaceId(
  name: string,
  city: string,
): Promise<PlaceEnrichment | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    log.warn("GOOGLE_PLACES_API_KEY not set — skipping place enrichment");
    return null;
  }

  const query = encodeURIComponent(`${name} ${city}`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

  try {
    // Sprint 784: 10s timeout for legacy Places API
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();

    if (!data.results?.length) return null;

    const place = data.results[0];
    const placeId = place.place_id;

    return {
      googlePlaceId: placeId,
      googleRating: place.rating ?? undefined,
      googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
      photoUrl: place.photos?.[0]
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
        : undefined,
    };
  } catch (err) {
    log.error(`Google Places lookup failed for "${name}" in ${city}:`, err);
    return null;
  }
}

export async function enrichBusinesses(city?: string): Promise<number> {
  const conditions = [isNull(businesses.googlePlaceId)];
  if (city) conditions.push(eq(businesses.city, city));

  const rows = await db
    .select({ id: businesses.id, name: businesses.name, city: businesses.city })
    .from(businesses)
    .where(and(...conditions));

  log.info(`Found ${rows.length} businesses to enrich${city ? ` in ${city}` : ""}`);

  let enriched = 0;
  for (const row of rows) {
    try {
      const result = await findGooglePlaceId(row.name, row.city);
      if (result) {
        await db
          .update(businesses)
          .set({
            googlePlaceId: result.googlePlaceId,
            googleRating: result.googleRating?.toString() ?? null,
            googleMapsUrl: result.googleMapsUrl ?? null,
            photoUrl: result.photoUrl ?? null,
          })
          .where(eq(businesses.id, row.id));
        enriched++;
      }
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      log.error(`Failed to enrich business ${row.id} ("${row.name}"):`, err);
    }
  }

  log.info(`Enriched ${enriched}/${rows.length} businesses`);
  return enriched;
}

const isDirectRun = process.argv[1]?.includes("google-place-enrichment");
if (isDirectRun) {
  enrichBusinesses(process.argv[2])
    .then((count) => {
      log.info(`Done — enriched ${count} businesses`);
      process.exit(0);
    })
    .catch((err) => {
      log.error("Enrichment failed:", err);
      process.exit(1);
    });
}

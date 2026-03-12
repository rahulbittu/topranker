/**
 * Google Places API (New) integration.
 * Fetches place details and photo references for businesses that have a googlePlaceId.
 * Photo references are stored in businessPhotos table and served via /api/photos/proxy.
 */

import { config } from "./config";
import { log } from "./logger";

const API_BASE = "https://places.googleapis.com/v1";

interface PlacePhoto {
  name: string; // e.g. "places/ChIJ.../photos/ATCDNf..."
  widthPx: number;
  heightPx: number;
  authorAttributions?: { displayName: string; uri: string }[];
}

interface PlaceDetailsResponse {
  photos?: PlacePhoto[];
  displayName?: { text: string };
}

/**
 * Fetch photo references for a Google Place ID.
 * Returns up to `limit` photo reference strings (e.g. "places/ChIJ.../photos/ATCDNf...").
 */
export async function fetchPlacePhotos(
  googlePlaceId: string,
  limit: number = 5,
): Promise<string[]> {
  const apiKey = config.googleMapsApiKey;
  if (!apiKey) {
    log.tag("GooglePlaces").warn("No API key configured — skipping photo fetch");
    return [];
  }

  const url = `${API_BASE}/places/${googlePlaceId}?fields=photos&key=${apiKey}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const body = await response.text();
      log.tag("GooglePlaces").error(
        `Place details failed for ${googlePlaceId}: ${response.status} — ${body.slice(0, 200)}`,
      );
      return [];
    }

    const data: PlaceDetailsResponse = await response.json();

    if (!data.photos || data.photos.length === 0) {
      log.tag("GooglePlaces").info(`No photos found for ${googlePlaceId}`);
      return [];
    }

    // Return photo reference names (e.g. "places/ChIJ.../photos/ATCDNf...")
    return data.photos.slice(0, limit).map((p) => p.name);
  } catch (err: any) {
    if (err.name === "TimeoutError") {
      log.tag("GooglePlaces").error(`Timeout fetching photos for ${googlePlaceId}`);
    } else {
      log.tag("GooglePlaces").error(`Error fetching photos for ${googlePlaceId}: ${err.message}`);
    }
    return [];
  }
}

/**
 * Search for a place by name + city and return the Place ID.
 * Useful for populating googlePlaceId on existing businesses.
 */
export async function searchPlace(
  query: string,
  city: string,
): Promise<{ placeId: string; name: string } | null> {
  const apiKey = config.googleMapsApiKey;
  if (!apiKey) return null;

  const url = `${API_BASE}/places:searchText`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName",
      },
      body: JSON.stringify({
        textQuery: `${query} ${city}`,
        maxResultCount: 1,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const place = data.places?.[0];
    if (!place) return null;

    return {
      placeId: place.id,
      name: place.displayName?.text || query,
    };
  } catch {
    return null;
  }
}

/**
 * Sprint 187: Search for restaurants near a location using Google Places Text Search.
 * Returns up to `maxResults` places with full metadata for bulk import.
 */
export async function searchNearbyRestaurants(
  city: string,
  category: string = "restaurant",
  maxResults: number = 20,
): Promise<Array<{
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  priceLevel: string | null;
  types: string[];
}>> {
  const apiKey = config.googleMapsApiKey;
  if (!apiKey) {
    log.tag("GooglePlaces").warn("No API key — skipping nearby search");
    return [];
  }

  const typeQuery = category === "restaurant" ? "restaurants" :
    category === "cafe" ? "cafes" :
    category === "bar" ? "bars" :
    category === "bakery" ? "bakeries" :
    category === "street_food" ? "street food" :
    category === "fast_food" ? "fast food" : "restaurants";

  try {
    const response = await fetch(`${API_BASE}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.types",
      },
      body: JSON.stringify({
        textQuery: `best ${typeQuery} in ${city}`,
        maxResultCount: Math.min(maxResults, 20),
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const body = await response.text();
      log.tag("GooglePlaces").error(`Nearby search failed: ${response.status} — ${body.slice(0, 200)}`);
      return [];
    }

    const data = await response.json();
    if (!data.places || data.places.length === 0) return [];

    const priceLevelMap: Record<string, string> = {
      PRICE_LEVEL_FREE: "$",
      PRICE_LEVEL_INEXPENSIVE: "$",
      PRICE_LEVEL_MODERATE: "$$",
      PRICE_LEVEL_EXPENSIVE: "$$$",
      PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
    };

    return data.places.map((p: any) => ({
      placeId: p.id,
      name: p.displayName?.text || "Unknown",
      address: p.formattedAddress || "",
      lat: p.location?.latitude || 0,
      lng: p.location?.longitude || 0,
      rating: p.rating || null,
      priceLevel: priceLevelMap[p.priceLevel] || "$$",
      types: p.types || [],
    }));
  } catch (err: any) {
    log.tag("GooglePlaces").error(`Nearby search error: ${err.message}`);
    return [];
  }
}

/**
 * Sprint 187: Map Google place types to TopRanker categories.
 */
export function normalizeCategory(types: string[]): string {
  if (types.includes("cafe") || types.includes("coffee_shop")) return "cafe";
  if (types.includes("bar") || types.includes("night_club")) return "bar";
  if (types.includes("bakery")) return "bakery";
  if (types.includes("meal_delivery") || types.includes("meal_takeaway")) return "fast_food";
  return "restaurant";
}

/**
 * Sprint 662: Fetch action URLs (website, menu, Google Maps) from Google Places.
 * Also constructs DoorDash/UberEats search URLs from business name + city.
 */
export async function fetchPlaceActionUrls(
  googlePlaceId: string,
  businessName: string,
  city: string,
): Promise<{
  websiteUri: string | null;
  googleMapsUri: string | null;
  menuUrl: string | null;
  doordashUrl: string | null;
  uberEatsUrl: string | null;
}> {
  const apiKey = config.googleMapsApiKey;
  const result = {
    websiteUri: null as string | null,
    googleMapsUri: null as string | null,
    menuUrl: null as string | null,
    doordashUrl: null as string | null,
    uberEatsUrl: null as string | null,
  };

  // Construct delivery platform search URLs from business name + city
  const encodedName = encodeURIComponent(`${businessName} ${city}`);
  result.doordashUrl = `https://www.doordash.com/search/store/${encodedName}/`;
  result.uberEatsUrl = `https://www.ubereats.com/search?q=${encodedName}`;

  if (!apiKey) {
    log.tag("GooglePlaces").warn("No API key — returning constructed URLs only");
    return result;
  }

  try {
    const fields = "websiteUri,googleMapsUri";
    const url = `${API_BASE}/places/${googlePlaceId}?fields=${fields}&key=${apiKey}`;
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      log.tag("GooglePlaces").error(`Action URL fetch failed for ${googlePlaceId}: ${response.status}`);
      return result;
    }

    const data = await response.json();
    result.websiteUri = data.websiteUri || null;
    result.googleMapsUri = data.googleMapsUri || null;

    // Use website as menu URL fallback (many restaurants host menus on their site)
    if (result.websiteUri && !result.menuUrl) {
      result.menuUrl = result.websiteUri;
    }

    log.tag("GooglePlaces").info(`Fetched action URLs for ${googlePlaceId}: website=${!!result.websiteUri}, maps=${!!result.googleMapsUri}`);
  } catch (err: any) {
    log.tag("GooglePlaces").error(`Action URL fetch error for ${googlePlaceId}: ${err.message}`);
  }

  return result;
}

/**
 * Sprint 662: Auto-enrich a business with action URLs from Google Places.
 * Called on business detail view when action URLs are missing.
 */
export async function enrichBusinessActionUrls(
  businessId: string,
  googlePlaceId: string,
  businessName: string,
  city: string,
): Promise<boolean> {
  const urls = await fetchPlaceActionUrls(googlePlaceId, businessName, city);
  const updates: Record<string, string | null> = {};

  if (urls.menuUrl) updates.menuUrl = urls.menuUrl;
  if (urls.doordashUrl) updates.doordashUrl = urls.doordashUrl;
  if (urls.uberEatsUrl) updates.uberEatsUrl = urls.uberEatsUrl;

  if (Object.keys(updates).length === 0) return false;

  const { updateBusinessActions } = await import("./storage");
  await updateBusinessActions(businessId, updates);

  // Also update googleMapsUrl if we got it
  if (urls.googleMapsUri) {
    const { db } = await import("./db");
    const { businesses } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    await db.update(businesses).set({ googleMapsUrl: urls.googleMapsUri }).where(eq(businesses.id, businessId));
  }

  log.tag("GooglePlaces").info(`Enriched action URLs for business ${businessId}: ${Object.keys(updates).join(", ")}`);
  return true;
}

/**
 * Sprint 663: Batch enrich all businesses that have googlePlaceId but no action URLs.
 * Processes in batches with delays to respect API rate limits.
 */
export async function batchEnrichActionUrls(): Promise<number> {
  const { db } = await import("./db");
  const { businesses } = await import("@shared/schema");
  const { isNotNull, isNull, and } = await import("drizzle-orm");

  const unenriched = await db
    .select({
      id: businesses.id,
      googlePlaceId: businesses.googlePlaceId,
      name: businesses.name,
      city: businesses.city,
    })
    .from(businesses)
    .where(and(
      isNotNull(businesses.googlePlaceId),
      isNull(businesses.doordashUrl),
    ))
    .limit(50); // Process max 50 per batch to limit API calls

  let enriched = 0;
  for (const biz of unenriched) {
    if (!biz.googlePlaceId) continue;
    try {
      const success = await enrichBusinessActionUrls(biz.id, biz.googlePlaceId, biz.name, biz.city || "Dallas");
      if (success) enriched++;
      // Rate limit: 200ms between API calls
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      log.tag("GooglePlaces").error(`Batch enrich failed for ${biz.id}: ${err}`);
    }
  }

  log.tag("GooglePlaces").info(`Batch enriched ${enriched}/${unenriched.length} businesses with action URLs`);
  return enriched;
}

/**
 * Sprint 671: Fetch full business details from Google Places.
 * Populates description, opening hours, price level, and service flags.
 */
export async function fetchPlaceFullDetails(
  googlePlaceId: string,
): Promise<{
  description: string | null;
  openingHours: { weekday_text: string[] } | null;
  isOpenNow: boolean;
  priceRange: string | null;
  servesBreakfast: boolean;
  servesLunch: boolean;
  servesDinner: boolean;
  servesBeer: boolean;
  servesWine: boolean;
} | null> {
  const apiKey = config.googleMapsApiKey;
  if (!apiKey) return null;

  const fields = [
    "editorialSummary",
    "currentOpeningHours",
    "priceLevel",
    "servesBreakfast",
    "servesLunch",
    "servesDinner",
    "servesBeer",
    "servesWine",
  ].join(",");

  try {
    const url = `${API_BASE}/places/${googlePlaceId}?fields=${fields}&key=${apiKey}`;
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      log.tag("GooglePlaces").error(`Full details failed for ${googlePlaceId}: ${response.status}`);
      return null;
    }

    const data = await response.json();

    const priceLevelMap: Record<string, string> = {
      PRICE_LEVEL_FREE: "$",
      PRICE_LEVEL_INEXPENSIVE: "$",
      PRICE_LEVEL_MODERATE: "$$",
      PRICE_LEVEL_EXPENSIVE: "$$$",
      PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
    };

    const hours = data.currentOpeningHours;
    const weekdayText = hours?.weekdayDescriptions || [];

    return {
      description: data.editorialSummary?.text || null,
      openingHours: weekdayText.length > 0 ? { weekday_text: weekdayText } : null,
      isOpenNow: hours?.openNow ?? false,
      priceRange: priceLevelMap[data.priceLevel] || null,
      servesBreakfast: data.servesBreakfast ?? false,
      servesLunch: data.servesLunch ?? false,
      servesDinner: data.servesDinner ?? false,
      servesBeer: data.servesBeer ?? false,
      servesWine: data.servesWine ?? false,
    };
  } catch (err: any) {
    log.tag("GooglePlaces").error(`Full details error for ${googlePlaceId}: ${err.message}`);
    return null;
  }
}

/**
 * Sprint 671: Enrich a single business with full Google Places details.
 * Updates description (if empty), opening hours, isOpenNow, and priceRange.
 */
export async function enrichBusinessFullDetails(
  businessId: string,
  googlePlaceId: string,
): Promise<boolean> {
  const details = await fetchPlaceFullDetails(googlePlaceId);
  if (!details) return false;

  const { db } = await import("./db");
  const { businesses } = await import("@shared/schema");
  const { eq } = await import("drizzle-orm");

  const updates: Record<string, any> = {};

  // Only overwrite description if currently empty
  if (details.description) updates.description = details.description;
  if (details.openingHours) updates.openingHours = details.openingHours;
  if (details.priceRange) updates.priceRange = details.priceRange;
  updates.isOpenNow = details.isOpenNow;
  updates.hoursLastUpdated = new Date();

  if (Object.keys(updates).length === 0) return false;

  await db.update(businesses).set(updates).where(eq(businesses.id, businessId));
  log.tag("GooglePlaces").info(`Enriched full details for business ${businessId}`);
  return true;
}

/**
 * Batch fetch and store photos for a business.
 * Returns the number of photos stored.
 */
export async function fetchAndStorePhotos(
  businessId: string,
  googlePlaceId: string,
): Promise<number> {
  const photoRefs = await fetchPlacePhotos(googlePlaceId, 5);
  if (photoRefs.length === 0) return 0;

  const { insertBusinessPhotos } = await import("./storage");
  await insertBusinessPhotos(
    businessId,
    photoRefs.map((ref, i) => ({
      photoUrl: ref,
      isHero: i === 0,
      sortOrder: i,
    })),
  );

  log.tag("GooglePlaces").info(
    `Stored ${photoRefs.length} photos for business ${businessId} (place: ${googlePlaceId})`,
  );
  return photoRefs.length;
}

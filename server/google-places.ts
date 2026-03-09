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

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

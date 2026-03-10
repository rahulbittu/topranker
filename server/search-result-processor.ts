/**
 * Sprint 476: Search Result Processor
 * Extracted from routes-businesses.ts (Audit #53 H-2)
 *
 * Pure functions for processing search results: enrichment, filtering,
 * distance calculation, hours status, and relevance sorting.
 */

import { combinedRelevance } from "./search-ranking-v2";
import { computeOpenStatus, isOpenLate, isOpenWeekends } from "./hours-utils";

// Sprint 442: Haversine distance calculation (km)
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface SearchProcessingOpts {
  query: string;
  userLat?: number;
  userLng?: number;
  maxDistanceKm?: number;
  dietaryTags: string[];
  openNow: boolean;
  openLate: boolean;
  openWeekends: boolean;
}

/**
 * Enrich business records with relevance scores, distance, and real-time open status.
 */
export function enrichSearchResults(
  bizList: any[],
  photoMap: Record<string, string[]>,
  opts: SearchProcessingOpts,
) {
  return bizList.map(b => {
    const photos = photoMap[b.id] || (b.photoUrl ? [b.photoUrl] : []);
    const searchCtx = {
      query: opts.query,
      hasPhotos: photos.length > 0,
      hasHours: !!b.closingTime,
      hasCuisine: !!b.cuisine,
      hasDescription: !!b.description,
      category: b.category,
      cuisine: b.cuisine,
      neighborhood: b.neighborhood,
      ratingCount: b.ratingCount ? Number(b.ratingCount) : 0,
    };
    const relevanceScore = opts.query
      ? Math.round(combinedRelevance(b.name, searchCtx) * 100) / 100
      : 0;
    // Sprint 442: Compute distance if user location provided
    let distanceKm: number | null = null;
    if (opts.userLat != null && opts.userLng != null && b.lat && b.lng) {
      distanceKm = haversineKm(opts.userLat, opts.userLng, parseFloat(b.lat), parseFloat(b.lng));
    }
    // Sprint 447: Compute real-time open status from openingHours
    const bHours = (b as any).openingHours;
    const openStatus = computeOpenStatus(bHours);
    const dynamicIsOpenNow = bHours ? openStatus.isOpen : (b.isOpenNow ?? false);
    return {
      ...b,
      photoUrls: photos,
      relevanceScore,
      distanceKm: distanceKm != null ? Math.round(distanceKm * 10) / 10 : null,
      isOpenNow: dynamicIsOpenNow,
      closingTime: openStatus.closingTime,
      nextOpenTime: openStatus.nextOpenTime,
      todayHours: openStatus.todayHours,
    };
  });
}

/**
 * Apply post-query filters: dietary tags, distance, hours status.
 */
export function applySearchFilters(
  data: any[],
  opts: SearchProcessingOpts,
): any[] {
  let filtered = data;

  // Sprint 442: Filter by dietary tags (business must have ALL requested tags)
  if (opts.dietaryTags.length > 0) {
    filtered = filtered.filter(b => {
      const bizTags: string[] = Array.isArray((b as any).dietaryTags) ? (b as any).dietaryTags : [];
      return opts.dietaryTags.every(tag => bizTags.includes(tag));
    });
  }

  // Sprint 442: Filter by distance
  if (opts.maxDistanceKm != null && opts.userLat != null && opts.userLng != null) {
    filtered = filtered.filter(b => b.distanceKm != null && b.distanceKm <= opts.maxDistanceKm!);
  }

  // Sprint 447: Hours-based filters
  if (opts.openNow) {
    filtered = filtered.filter(b => b.isOpenNow === true);
  }
  if (opts.openLate) {
    filtered = filtered.filter(b => { const h = (b as any).openingHours; return isOpenLate(h); });
  }
  if (opts.openWeekends) {
    filtered = filtered.filter(b => { const h = (b as any).openingHours; return isOpenWeekends(h); });
  }

  return filtered;
}

/**
 * Sort results by relevance when a search query is present.
 */
export function sortByRelevance(data: any[], query: string): any[] {
  if (!query) return data;
  return [...data].sort((a, b) =>
    b.relevanceScore - a.relevanceScore || parseFloat(b.weightedScore) - parseFloat(a.weightedScore)
  );
}

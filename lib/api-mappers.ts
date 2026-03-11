/**
 * Sprint 656: Extracted from lib/api.ts to reduce file size (560→481 LOC)
 * Business and rating mapping functions for API responses.
 */
import { getApiUrl } from "@/lib/query-client";
import type { CredibilityTier } from "@/lib/data";
import type { ApiBusiness, ApiRating } from "./api";

export function resolvePhotoUrl(url: string): string {
  if (url.startsWith("places/")) {
    const base = getApiUrl();
    return `${base}/api/photos/proxy?ref=${encodeURIComponent(url)}&maxwidth=600`;
  }
  return url;
}

export function mapApiBusiness(biz: ApiBusiness) {
  const rawUrls = biz.photoUrls && biz.photoUrls.length > 0
    ? biz.photoUrls
    : biz.photoUrl
    ? [biz.photoUrl]
    : [];
  const photoUrls = rawUrls.map(resolvePhotoUrl);

  return {
    id: biz.id,
    name: biz.name,
    slug: biz.slug,
    neighborhood: biz.neighborhood || "",
    city: biz.city,
    category: biz.category,
    cuisine: biz.cuisine || null,
    weightedScore: parseFloat(biz.weightedScore) || 0,
    rawAvgScore: parseFloat(biz.rawAvgScore) || 0,
    rank: biz.rankPosition || 0,
    prevRank: biz.prevRankPosition,
    rankDelta: biz.rankDelta,
    ratingCount: biz.totalRatings,
    isChallenger: biz.inChallenger,
    description: biz.description || undefined,
    priceRange: biz.priceRange || undefined,
    phone: biz.phone || undefined,
    website: biz.website || undefined,
    address: biz.address || undefined,
    photoUrl: photoUrls[0] || undefined,
    photoUrls,
    isOpenNow: biz.isOpenNow,
    // Sprint 457: Map dynamic hours fields from server
    closingTime: (biz as any).closingTime || undefined,
    nextOpenTime: (biz as any).nextOpenTime || undefined,
    todayHours: (biz as any).todayHours || undefined,
    lat: biz.lat ? parseFloat(biz.lat) : undefined,
    lng: biz.lng ? parseFloat(biz.lng) : undefined,
    isClaimed: biz.isClaimed,
    isPro: biz.subscriptionStatus === "active" || biz.subscriptionStatus === "trialing",
    googleRating: biz.googleRating ? parseFloat(biz.googleRating) : undefined,
    googleMapsUrl: biz.googleMapsUrl || undefined,
    openingHours: biz.openingHours || undefined,
    // Sprint 626: Decision-to-Action fields
    menuUrl: biz.menuUrl || undefined,
    orderUrl: biz.orderUrl || undefined,
    pickupUrl: biz.pickupUrl || undefined,
    doordashUrl: biz.doordashUrl || undefined,
    uberEatsUrl: biz.uberEatsUrl || undefined,
    reservationUrl: biz.reservationUrl || undefined,
  };
}

export function mapApiRating(rating: ApiRating) {
  return {
    id: rating.id,
    memberId: rating.memberId,
    userName: rating.memberName || "Anonymous",
    userTier: (rating.memberTier || "community") as CredibilityTier,
    userAvatarUrl: rating.memberAvatarUrl || undefined,
    rawScore: parseFloat(rating.rawScore) || 0,
    weight: parseFloat(rating.weight) || 0,
    q1: rating.q1Score,
    q2: rating.q2Score,
    q3: rating.q3Score,
    wouldReturn: rating.wouldReturn,
    comment: rating.note,
    hasPhoto: rating.hasPhoto || false, // Sprint 548
    hasReceipt: rating.hasReceipt || false, // Sprint 548
    createdAt: new Date(rating.createdAt).getTime(),
  };
}

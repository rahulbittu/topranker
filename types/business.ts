export interface MappedBusiness {
  id: string;
  name: string;
  slug: string;
  neighborhood: string;
  city?: string;
  category: string;
  cuisine?: string | null;
  weightedScore: number;
  rank: number;
  rankDelta: number;
  ratingCount?: number;
  isChallenger: boolean;
  isOpenNow?: boolean;
  closingTime?: string;
  nextOpenTime?: string;
  todayHours?: string; // Sprint 457: "11:00 AM – 10:00 PM" or "Open 24 hours"
  priceRange?: string;
  photoUrl?: string;
  photoUrls?: string[];
  dishRankings?: { dishSlug: string; dishName: string; dishEmoji: string | null; rankPosition: number }[];
  lat?: number;
  lng?: number;
  googleRating?: number;
  isClaimed?: boolean;
  relevanceScore?: number;
}

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
  priceRange?: string;
  photoUrl?: string;
  photoUrls?: string[];
  dishRankings?: { dishSlug: string; dishName: string; dishEmoji: string | null; rankPosition: number }[];
  lat?: number;
  lng?: number;
  googleRating?: number;
  isClaimed?: boolean;
}

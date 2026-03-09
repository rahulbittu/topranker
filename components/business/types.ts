import type { CredibilityTier } from "@/lib/data";

export interface MappedRating {
  id: string;
  memberId: string;
  userName: string;
  userTier: CredibilityTier;
  userAvatarUrl?: string;
  rawScore: number;
  weight: number;
  q1: number;
  q2: number;
  q3: number;
  wouldReturn: boolean;
  comment: string | null;
  createdAt: number;
}

export interface RankHistoryPoint {
  rank: number;
  date: string;
}

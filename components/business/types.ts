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
  hasPhoto?: boolean; // Sprint 548: rating photo indicator
  hasReceipt?: boolean; // Sprint 548: receipt indicator
  createdAt: number;
}

export interface RankHistoryPoint {
  rank: number;
  date: string;
}

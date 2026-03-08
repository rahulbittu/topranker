import { db } from "../db";

export { db };

// Re-export from shared — single source of truth (Sprint 138)
export {
  getVoteWeight,
  getCredibilityTier,
  getTierFromScore,
  getTemporalMultiplier,
} from "@shared/credibility";

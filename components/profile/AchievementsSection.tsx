/**
 * Sprint 393/429: Profile Achievements & Milestones
 *
 * Sprint 429 upgrade: delegates to AchievementGallery with category-grouped
 * achievements and progress tracking. This wrapper preserves the existing
 * AchievementsSection export and props interface.
 */
import React from "react";
import { type CredibilityTier } from "@/lib/data";
import { AchievementGallery } from "./AchievementGallery";

export interface AchievementsSectionProps {
  totalRatings: number;
  distinctBusinesses: number;
  tier: CredibilityTier;
  currentStreak: number;
  earnedBadgeCount: number;
  daysActive: number;
}

export function AchievementsSection(props: AchievementsSectionProps) {
  return <AchievementGallery {...props} />;
}

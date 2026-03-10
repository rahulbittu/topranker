/**
 * Sprint 393: Profile Achievements & Milestones
 *
 * Displays earned milestones based on profile stats.
 * Milestones are computed client-side from existing data — no new API calls.
 */
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import { type CredibilityTier, TIER_DISPLAY_NAMES, TIER_COLORS } from "@/lib/data";

const AMBER = BRAND.colors.amber;

interface Milestone {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  earned: boolean;
  color: string;
}

export interface AchievementsSectionProps {
  totalRatings: number;
  distinctBusinesses: number;
  tier: CredibilityTier;
  currentStreak: number;
  earnedBadgeCount: number;
  daysActive: number;
}

export function AchievementsSection({
  totalRatings,
  distinctBusinesses,
  tier,
  currentStreak,
  earnedBadgeCount,
  daysActive,
}: AchievementsSectionProps) {
  const milestones = useMemo((): Milestone[] => {
    const tierColor = TIER_COLORS[tier];
    return [
      {
        id: "first_rating",
        icon: "star",
        title: "First Rating",
        description: "Rate your first restaurant",
        earned: totalRatings >= 1,
        color: AMBER,
      },
      {
        id: "five_ratings",
        icon: "star-half",
        title: "Getting Started",
        description: "Complete 5 ratings",
        earned: totalRatings >= 5,
        color: AMBER,
      },
      {
        id: "ten_ratings",
        icon: "flame",
        title: "Regular Rater",
        description: "Complete 10 ratings",
        earned: totalRatings >= 10,
        color: "#FF6B35",
      },
      {
        id: "twentyfive_ratings",
        icon: "trophy",
        title: "Power Rater",
        description: "Complete 25 ratings",
        earned: totalRatings >= 25,
        color: AMBER,
      },
      {
        id: "fifty_ratings",
        icon: "medal",
        title: "Top Contributor",
        description: "Complete 50 ratings",
        earned: totalRatings >= 50,
        color: "#C49A1A",
      },
      {
        id: "five_places",
        icon: "map",
        title: "Explorer",
        description: "Rate 5 different restaurants",
        earned: distinctBusinesses >= 5,
        color: "#4A90D9",
      },
      {
        id: "fifteen_places",
        icon: "compass",
        title: "Pathfinder",
        description: "Rate 15 different restaurants",
        earned: distinctBusinesses >= 15,
        color: "#2E7D32",
      },
      {
        id: "tier_city",
        icon: "shield-checkmark",
        title: "City Tier",
        description: `Reach ${TIER_DISPLAY_NAMES.city} tier`,
        earned: tier === "city" || tier === "trusted" || tier === "top",
        color: TIER_COLORS.city,
      },
      {
        id: "tier_trusted",
        icon: "shield",
        title: "Trusted Tier",
        description: `Reach ${TIER_DISPLAY_NAMES.trusted} tier`,
        earned: tier === "trusted" || tier === "top",
        color: TIER_COLORS.trusted,
      },
      {
        id: "tier_top",
        icon: "diamond",
        title: "Top Judge",
        description: `Reach ${TIER_DISPLAY_NAMES.top} tier`,
        earned: tier === "top",
        color: TIER_COLORS.top,
      },
      {
        id: "streak_three",
        icon: "flash",
        title: "On Fire",
        description: "3-week rating streak",
        earned: currentStreak >= 3,
        color: "#FF6B35",
      },
      {
        id: "five_badges",
        icon: "ribbon",
        title: "Badge Collector",
        description: "Earn 5 badges",
        earned: earnedBadgeCount >= 5,
        color: "#9C27B0",
      },
      {
        id: "thirty_days",
        icon: "calendar",
        title: "Month Active",
        description: "30 days on TopRanker",
        earned: daysActive >= 30,
        color: "#607D8B",
      },
    ];
  }, [totalRatings, distinctBusinesses, tier, currentStreak, earnedBadgeCount, daysActive]);

  const earned = milestones.filter(m => m.earned);
  const upcoming = milestones.filter(m => !m.earned);
  const nextMilestone = upcoming[0];

  if (earned.length === 0 && !nextMilestone) return null;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Ionicons name="trophy-outline" size={16} color={AMBER} />
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.countBadge}>{earned.length}/{milestones.length}</Text>
      </View>

      {earned.length > 0 && (
        <View style={styles.grid}>
          {earned.map(m => (
            <View key={m.id} style={styles.milestoneCard}>
              <View style={[styles.iconCircle, { backgroundColor: m.color + "20" }]}>
                <Ionicons name={m.icon} size={18} color={m.color} />
              </View>
              <Text style={styles.milestoneTitle} numberOfLines={1}>{m.title}</Text>
              <Text style={styles.milestoneDesc} numberOfLines={1}>{m.description}</Text>
            </View>
          ))}
        </View>
      )}

      {nextMilestone && (
        <View style={styles.nextMilestone}>
          <View style={[styles.nextIconCircle, { borderColor: nextMilestone.color + "40" }]}>
            <Ionicons name={nextMilestone.icon} size={14} color={Colors.textTertiary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nextLabel}>Next: {nextMilestone.title}</Text>
            <Text style={styles.nextDesc}>{nextMilestone.description}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    ...Colors.cardShadow,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
    flex: 1,
  },
  countBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: AMBER,
    fontFamily: "DMSans_600SemiBold",
    backgroundColor: AMBER + "15",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  milestoneCard: {
    width: "30%" as any,
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
    textAlign: "center",
  },
  milestoneDesc: {
    fontSize: 8,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
  },
  nextMilestone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  nextIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  nextLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold",
  },
  nextDesc: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
});

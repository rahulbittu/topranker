/**
 * Sprint 429: Profile Achievements Gallery
 *
 * Category-grouped achievements with progress tracking.
 * Shows earned milestones prominently, unearned with progress bars.
 * Categories: Rating, Exploration, Credibility, Engagement.
 */
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { type CredibilityTier, TIER_DISPLAY_NAMES, TIER_COLORS } from "@/lib/data";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];
const AMBER = BRAND.colors.amber;

export interface AchievementDef {
  id: string;
  icon: IoniconsName;
  title: string;
  description: string;
  earned: boolean;
  progress: number; // 0-1
  color: string;
  category: AchievementCategory;
}

export type AchievementCategory = "rating" | "exploration" | "credibility" | "engagement";

const CATEGORY_META: Record<AchievementCategory, { label: string; icon: IoniconsName; color: string }> = {
  rating: { label: "Rating Milestones", icon: "star-outline", color: AMBER },
  exploration: { label: "Exploration", icon: "compass-outline", color: "#4A90D9" },
  credibility: { label: "Credibility", icon: "shield-checkmark-outline", color: "#2E7D32" },
  engagement: { label: "Engagement", icon: "flash-outline", color: "#FF6B35" },
};

const CATEGORY_ORDER: AchievementCategory[] = ["rating", "exploration", "credibility", "engagement"];

export interface AchievementGalleryProps {
  totalRatings: number;
  distinctBusinesses: number;
  tier: CredibilityTier;
  currentStreak: number;
  earnedBadgeCount: number;
  daysActive: number;
}

function buildAchievements(props: AchievementGalleryProps): AchievementDef[] {
  const { totalRatings, distinctBusinesses, tier, currentStreak, earnedBadgeCount, daysActive } = props;
  const tierRank = { community: 0, city: 1, trusted: 2, top: 3 };
  const rank = tierRank[tier];

  return [
    // Rating milestones
    { id: "first_rating", icon: "star", title: "First Rating", description: "Rate your first restaurant",
      earned: totalRatings >= 1, progress: Math.min(totalRatings / 1, 1), color: AMBER, category: "rating" },
    { id: "five_ratings", icon: "star-half", title: "Getting Started", description: "Complete 5 ratings",
      earned: totalRatings >= 5, progress: Math.min(totalRatings / 5, 1), color: AMBER, category: "rating" },
    { id: "ten_ratings", icon: "flame", title: "Regular Rater", description: "Complete 10 ratings",
      earned: totalRatings >= 10, progress: Math.min(totalRatings / 10, 1), color: "#FF6B35", category: "rating" },
    { id: "twentyfive_ratings", icon: "trophy", title: "Power Rater", description: "Complete 25 ratings",
      earned: totalRatings >= 25, progress: Math.min(totalRatings / 25, 1), color: AMBER, category: "rating" },
    { id: "fifty_ratings", icon: "medal", title: "Top Contributor", description: "Complete 50 ratings",
      earned: totalRatings >= 50, progress: Math.min(totalRatings / 50, 1), color: "#C49A1A", category: "rating" },

    // Exploration
    { id: "five_places", icon: "map", title: "Explorer", description: "Rate 5 different restaurants",
      earned: distinctBusinesses >= 5, progress: Math.min(distinctBusinesses / 5, 1), color: "#4A90D9", category: "exploration" },
    { id: "fifteen_places", icon: "compass", title: "Pathfinder", description: "Rate 15 different restaurants",
      earned: distinctBusinesses >= 15, progress: Math.min(distinctBusinesses / 15, 1), color: "#2E7D32", category: "exploration" },

    // Credibility
    { id: "tier_city", icon: "shield-checkmark", title: "City Tier",
      description: `Reach ${TIER_DISPLAY_NAMES.city} tier`,
      earned: rank >= 1, progress: Math.min(rank / 1, 1), color: TIER_COLORS.city, category: "credibility" },
    { id: "tier_trusted", icon: "shield", title: "Trusted Tier",
      description: `Reach ${TIER_DISPLAY_NAMES.trusted} tier`,
      earned: rank >= 2, progress: Math.min(rank / 2, 1), color: TIER_COLORS.trusted, category: "credibility" },
    { id: "tier_top", icon: "diamond", title: "Top Judge",
      description: `Reach ${TIER_DISPLAY_NAMES.top} tier`,
      earned: rank >= 3, progress: Math.min(rank / 3, 1), color: TIER_COLORS.top, category: "credibility" },

    // Engagement
    { id: "streak_three", icon: "flash", title: "On Fire", description: "3-week rating streak",
      earned: currentStreak >= 3, progress: Math.min(currentStreak / 3, 1), color: "#FF6B35", category: "engagement" },
    { id: "five_badges", icon: "ribbon", title: "Badge Collector", description: "Earn 5 badges",
      earned: earnedBadgeCount >= 5, progress: Math.min(earnedBadgeCount / 5, 1), color: "#9C27B0", category: "engagement" },
    { id: "thirty_days", icon: "calendar", title: "Month Active", description: "30 days on TopRanker",
      earned: daysActive >= 30, progress: Math.min(daysActive / 30, 1), color: "#607D8B", category: "engagement" },
  ];
}

function AchievementTile({ achievement }: { achievement: AchievementDef }) {
  const { icon, title, description, earned, progress, color } = achievement;
  return (
    <View style={[s.tile, !earned && s.tileUnearned]}>
      <View style={[s.tileIcon, { backgroundColor: earned ? color + "20" : Colors.surfaceRaised }]}>
        <Ionicons name={icon} size={20} color={earned ? color : Colors.textTertiary} />
      </View>
      <Text style={[s.tileTitle, !earned && s.tileTitleDim]} numberOfLines={1}>{title}</Text>
      <Text style={s.tileDesc} numberOfLines={1}>{description}</Text>
      {!earned && (
        <View style={s.progressRow}>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: color }]} />
          </View>
          <Text style={s.progressPct}>{Math.round(progress * 100)}%</Text>
        </View>
      )}
      {earned && (
        <View style={[s.earnedBadge, { backgroundColor: color + "15" }]}>
          <Ionicons name="checkmark" size={10} color={color} />
          <Text style={[s.earnedText, { color }]}>Earned</Text>
        </View>
      )}
    </View>
  );
}

function CategorySection({ category, achievements }: { category: AchievementCategory; achievements: AchievementDef[] }) {
  const meta = CATEGORY_META[category];
  const earnedCount = achievements.filter(a => a.earned).length;
  return (
    <View style={s.categorySection}>
      <View style={s.categoryHeader}>
        <Ionicons name={meta.icon} size={14} color={meta.color} />
        <Text style={s.categoryLabel}>{meta.label}</Text>
        <Text style={[s.categoryCount, { color: meta.color }]}>{earnedCount}/{achievements.length}</Text>
      </View>
      <View style={s.categoryGrid}>
        {achievements.map(a => <AchievementTile key={a.id} achievement={a} />)}
      </View>
    </View>
  );
}

export function AchievementGallery(props: AchievementGalleryProps) {
  const achievements = useMemo(() => buildAchievements(props), [
    props.totalRatings, props.distinctBusinesses, props.tier,
    props.currentStreak, props.earnedBadgeCount, props.daysActive,
  ]);

  const [showAll, setShowAll] = useState(false);
  const totalEarned = achievements.filter(a => a.earned).length;

  const grouped = useMemo(() => {
    const map = new Map<AchievementCategory, AchievementDef[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const a of achievements) map.get(a.category)!.push(a);
    return map;
  }, [achievements]);

  // Collapsed: show only categories with earned achievements
  const visibleCategories = showAll
    ? CATEGORY_ORDER
    : CATEGORY_ORDER.filter(c => grouped.get(c)!.some(a => a.earned));

  if (totalEarned === 0 && !showAll) {
    return (
      <TouchableOpacity style={s.emptyContainer} onPress={() => setShowAll(true)} activeOpacity={0.7}>
        <Ionicons name="trophy-outline" size={24} color={Colors.textTertiary} />
        <Text style={s.emptyTitle}>Achievements Gallery</Text>
        <Text style={s.emptyDesc}>Start rating to unlock achievements</Text>
        <Text style={s.emptyTap}>Tap to see all {achievements.length} achievements</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Ionicons name="trophy-outline" size={16} color={AMBER} />
        <Text style={s.headerTitle}>Achievements Gallery</Text>
        <Text style={s.headerBadge}>{totalEarned}/{achievements.length}</Text>
      </View>

      {visibleCategories.map(cat => (
        <CategorySection key={cat} category={cat} achievements={grouped.get(cat)!} />
      ))}

      {!showAll && visibleCategories.length < CATEGORY_ORDER.length && (
        <TouchableOpacity style={s.showAllBtn} onPress={() => setShowAll(true)} activeOpacity={0.7}>
          <Text style={s.showAllText}>Show All Categories</Text>
          <Ionicons name="chevron-down" size={14} color={AMBER} />
        </TouchableOpacity>
      )}

      {showAll && (
        <TouchableOpacity style={s.showAllBtn} onPress={() => setShowAll(false)} activeOpacity={0.7}>
          <Text style={s.showAllText}>Show Less</Text>
          <Ionicons name="chevron-up" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 16, gap: 14,
    ...Colors.cardShadow,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: {
    fontSize: 15, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold", flex: 1,
  },
  headerBadge: {
    fontSize: 11, fontWeight: "600", color: AMBER, fontFamily: "DMSans_600SemiBold",
    backgroundColor: AMBER + "15", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  categorySection: { gap: 8 },
  categoryHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  categoryLabel: {
    fontSize: 12, fontWeight: "600", color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold", flex: 1,
  },
  categoryCount: { fontSize: 10, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: {
    width: "30%", alignItems: "center", gap: 4, paddingVertical: 10,
    backgroundColor: Colors.surface, borderRadius: 10,
  },
  tileUnearned: { opacity: 0.7 },
  tileIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  tileTitle: {
    fontSize: 10, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold", textAlign: "center",
  },
  tileTitleDim: { color: Colors.textTertiary },
  tileDesc: {
    fontSize: 8, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textAlign: "center",
  },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2, paddingHorizontal: 4 },
  progressBg: {
    flex: 1, height: 3, backgroundColor: Colors.surfaceRaised, borderRadius: 2, overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 2 },
  progressPct: { fontSize: 8, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  earnedBadge: {
    flexDirection: "row", alignItems: "center", gap: 2,
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, marginTop: 2,
  },
  earnedText: { fontSize: 8, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
  showAllBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4,
    paddingVertical: 8,
  },
  showAllText: { fontSize: 12, fontWeight: "600", color: AMBER, fontFamily: "DMSans_600SemiBold" },
  emptyContainer: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 24,
    alignItems: "center", gap: 6, ...Colors.cardShadow,
  },
  emptyTitle: {
    fontSize: 15, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  emptyDesc: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  emptyTap: { fontSize: 11, color: AMBER, fontFamily: "DMSans_600SemiBold", marginTop: 4 },
});

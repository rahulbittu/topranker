/**
 * Sprint 536: Extracted from app/(tabs)/profile.tsx
 * Credibility card, stats rows, getting started prompt, growth prompt.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import { pct } from "@/lib/style-helpers";
import {
  TIER_COLORS, TIER_DISPLAY_NAMES, TIER_WEIGHTS,
  TIER_SCORE_RANGES, TIER_INFLUENCE_LABELS,
  type CredibilityTier,
} from "@/lib/data";
import ScoreCountUp from "@/components/animations/ScoreCountUp";

const AMBER = BRAND.colors.amber;

interface ProfileCredibilitySectionProps {
  tier: CredibilityTier;
  credibilityScore: number;
  credibilityBreakdown: any;
  totalRatings: number;
  distinctBusinesses: number;
  totalCategories: number;
  daysActive: number;
  earnedBadgeCount: number;
  ratingHistory: { rawScore: number }[];
  currentStreak: number;
  joinedAt: string | null;
}

export function ProfileCredibilitySection({
  tier,
  credibilityScore,
  totalRatings,
  distinctBusinesses,
  totalCategories,
  daysActive,
  earnedBadgeCount,
  ratingHistory,
  currentStreak,
  joinedAt,
}: ProfileCredibilitySectionProps) {
  const tierColor = TIER_COLORS[tier];
  const scoreRange = TIER_SCORE_RANGES[tier];

  const nextTierMap: Record<string, CredibilityTier | null> = {
    community: "city", city: "trusted", trusted: "top", top: null,
  };
  const nextTier = nextTierMap[tier];
  const nextRange = nextTier ? TIER_SCORE_RANGES[nextTier] : null;
  const progressToNext = nextRange
    ? Math.min(((credibilityScore - scoreRange.min) / (nextRange.min - scoreRange.min)) * 100, 100)
    : 100;

  return (
    <>
      {/* Credibility Card */}
      <View style={s.credibilityCard}>
        <View style={s.credScoreRow}>
          <View>
            <Text style={s.credScoreLabel}>Credibility</Text>
            <ScoreCountUp
              targetValue={credibilityScore}
              duration={1000}
              decimalPlaces={0}
              style={[s.credScore, { color: tierColor }]}
              highlightThreshold={999}
            />
          </View>
          <View style={s.credWeightBox}>
            <Text style={s.credWeightLabel}>{TIER_INFLUENCE_LABELS[tier]}</Text>
            <Text style={[s.credWeight, { color: tierColor }]}>{TIER_DISPLAY_NAMES[tier]}</Text>
          </View>
        </View>

        {nextTier && nextRange && (
          <View style={s.credProgress}>
            <View style={s.credProgressHeader}>
              <Text style={s.credProgressLabel}>
                Progress to {TIER_DISPLAY_NAMES[nextTier]}
              </Text>
              <Text style={s.credProgressPct}>{Math.round(progressToNext)}%</Text>
            </View>
            <View style={s.progressBarBg}>
              <View style={[s.progressBarFill, { width: pct(progressToNext), backgroundColor: tierColor }]} />
            </View>
            <Text style={s.credProgressHint}>
              {Math.max(nextRange.min - credibilityScore, 0)} points to {TIER_DISPLAY_NAMES[nextTier]}
            </Text>
          </View>
        )}
      </View>

      {/* Getting Started (0 ratings) */}
      {totalRatings === 0 && (
        <TouchableOpacity
          style={s.gettingStartedCard}
          onPress={() => router.push("/(tabs)/search")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Find a place to rate"
        >
          <View style={s.gettingStartedIcon}>
            <Ionicons name="restaurant" size={24} color={AMBER} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.gettingStartedTitle}>Rate Your First Place</Text>
            <Text style={s.gettingStartedDesc}>
              Your influence grows with every honest rating. Find a restaurant you know well and share your experience.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={AMBER} />
        </TouchableOpacity>
      )}

      {/* Growth Prompt */}
      {nextTier && totalRatings > 0 && (
        <View style={s.growthPrompt}>
          <Ionicons name="trending-up" size={18} color={AMBER} />
          <Text style={s.growthPromptText}>Keep rating to unlock your next tier</Text>
        </View>
      )}

      {/* Stats Row */}
      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statNum}>{totalRatings.toLocaleString()}</Text>
          <Text style={s.statLabel}>Ratings</Text>
        </View>
        <View style={[s.statBox, s.statBoxMiddle]}>
          <Text style={s.statNum}>{distinctBusinesses.toLocaleString()}</Text>
          <Text style={s.statLabel}>Places</Text>
        </View>
        <View style={[s.statBox, s.statBoxMiddle]}>
          <Text style={s.statNum}>{totalCategories.toLocaleString()}</Text>
          <Text style={s.statLabel}>Categories</Text>
        </View>
        <View style={[s.statBox, s.statBoxMiddle]}>
          <Text style={s.statNum}>{daysActive.toLocaleString()}</Text>
          <Text style={s.statLabel}>Days</Text>
        </View>
        <TouchableOpacity style={s.statBox} onPress={() => router.push("/badge-leaderboard")} activeOpacity={0.7}>
          <Text style={[s.statNum, { color: AMBER }]}>{earnedBadgeCount}</Text>
          <Text style={s.statLabel}>Badges</Text>
        </TouchableOpacity>
      </View>

      {/* Enhanced Stats */}
      <View style={s.enhancedStatsRow}>
        <View style={s.enhancedStatBox}>
          <Text style={[s.enhancedStatNum, { color: tierColor }]}>{TIER_WEIGHTS[tier]}x</Text>
          <Text style={s.enhancedStatLabel}>Weight</Text>
        </View>
        {currentStreak > 0 && (
          <View style={s.enhancedStatBox}>
            <Text style={[s.enhancedStatNum, { color: AMBER }]}>{currentStreak}</Text>
            <Text style={s.enhancedStatLabel}>Streak</Text>
          </View>
        )}
        {ratingHistory.length > 0 && (
          <View style={s.enhancedStatBox}>
            <Text style={s.enhancedStatNum}>
              {(ratingHistory.reduce((sum, r) => sum + r.rawScore, 0) / ratingHistory.length).toFixed(1)}
            </Text>
            <Text style={s.enhancedStatLabel}>Avg Given</Text>
          </View>
        )}
        {joinedAt && (
          <View style={s.enhancedStatBox}>
            <Text style={s.enhancedStatNum}>
              {new Date(joinedAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
            </Text>
            <Text style={s.enhancedStatLabel}>Joined</Text>
          </View>
        )}
      </View>
    </>
  );
}

const s = StyleSheet.create({
  credibilityCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    gap: 14, ...Colors.cardShadow,
  },
  credScoreRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  credScoreLabel: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary, letterSpacing: 0.5, textTransform: "uppercase" as const },
  credScore: { fontSize: 48, fontWeight: "700", fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -2 },
  credWeightBox: { alignItems: "center", gap: 2 },
  credWeightLabel: { fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  credWeight: { fontSize: 24, fontWeight: "700", fontFamily: "PlayfairDisplay_700Bold" },
  credProgress: { gap: 6 },
  credProgressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  credProgressLabel: { ...TYPOGRAPHY.ui.label, color: Colors.textSecondary },
  credProgressPct: { fontSize: 12, fontWeight: "700", color: Colors.gold, fontFamily: "DMSans_700Bold" },
  progressBarBg: { height: 4, backgroundColor: Colors.surfaceRaised, borderRadius: 2, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 2 },
  credProgressHint: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary, marginTop: 4 },
  gettingStartedCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: `${BRAND.colors.amber}10`, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: `${BRAND.colors.amber}25`,
    marginHorizontal: 16, marginTop: 16,
  },
  gettingStartedIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: `${BRAND.colors.amber}15`,
    alignItems: "center", justifyContent: "center",
  },
  gettingStartedTitle: { fontSize: 15, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  gettingStartedDesc: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 17 },
  growthPrompt: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(196,154,26,0.08)",
    borderWidth: 1, borderColor: "rgba(196,154,26,0.2)",
    borderRadius: 10, padding: 14,
    marginHorizontal: 16, marginTop: 12,
  },
  growthPromptText: { fontSize: 13, color: Colors.text, fontFamily: "DMSans_500Medium" },
  statsRow: {
    flexDirection: "row", backgroundColor: "rgba(13,27,42,0.9)", borderRadius: 14,
    overflow: "hidden",
  },
  statBox: { flex: 1, alignItems: "center", paddingVertical: 16, gap: 4 },
  statBoxMiddle: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  statNum: { fontSize: 24, fontWeight: "700", color: AMBER, fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "DMSans_400Regular" },
  enhancedStatsRow: {
    flexDirection: "row", justifyContent: "space-evenly",
    paddingVertical: 8, paddingHorizontal: 12, marginTop: 4,
  },
  enhancedStatBox: { alignItems: "center", gap: 2, minWidth: 60 },
  enhancedStatNum: {
    fontSize: 15, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold",
  },
  enhancedStatLabel: {
    fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textTransform: "uppercase" as const, letterSpacing: 0.5,
  },
});

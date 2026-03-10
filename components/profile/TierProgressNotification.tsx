/**
 * Sprint 573: Tier Progress Notification
 * Shows a motivational notification banner when a user is close to their next tier.
 * Displays progress percentage, points needed, and actionable tips.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import {
  TIER_DISPLAY_NAMES, TIER_COLORS, TIER_SCORE_RANGES,
  TIER_WEIGHTS, type CredibilityTier,
} from "@/lib/data";
import { pct } from "@/lib/style-helpers";

const AMBER = BRAND.colors.amber;

/** Threshold (0-1) — show notification when user is within this % of the next tier */
const PROXIMITY_THRESHOLD = 0.60;

const TIER_ICONS: Record<CredibilityTier, React.ComponentProps<typeof Ionicons>["name"]> = {
  community: "person",
  city: "star",
  trusted: "shield-checkmark",
  top: "trophy",
};

const TIER_TIPS: Record<CredibilityTier, string[]> = {
  community: [
    "Rate restaurants you've visited recently",
    "Try rating across different categories",
    "Add photos to boost your credibility faster",
  ],
  city: [
    "Rate consistently — variety and frequency both count",
    "Explore new neighborhoods for diversity bonus",
    "Detailed ratings with photos carry more weight",
  ],
  trusted: [
    "Maintain rating quality — variance matters at this level",
    "Keep your zero-flag record clean",
    "You're in the top tier of influence already",
  ],
  top: [],
};

export interface TierProgressNotificationProps {
  tier: CredibilityTier;
  credibilityScore: number;
  totalRatings: number;
  delay?: number;
  onDismiss?: () => void;
}

export function TierProgressNotification({
  tier,
  credibilityScore,
  totalRatings,
  delay = 0,
  onDismiss,
}: TierProgressNotificationProps) {
  const nextTierMap: Record<string, CredibilityTier | null> = {
    community: "city", city: "trusted", trusted: "top", top: null,
  };
  const nextTier = nextTierMap[tier];

  // No notification for top tier
  if (!nextTier) return null;

  const currentRange = TIER_SCORE_RANGES[tier];
  const nextRange = TIER_SCORE_RANGES[nextTier];
  const totalSpan = nextRange.min - currentRange.min;
  const progress = Math.min((credibilityScore - currentRange.min) / totalSpan, 1);
  const pointsNeeded = Math.max(nextRange.min - credibilityScore, 0);

  // Only show when user has made meaningful progress toward next tier
  if (progress < PROXIMITY_THRESHOLD) return null;

  const nextTierColor = TIER_COLORS[nextTier];
  const nextWeight = TIER_WEIGHTS[nextTier];
  const tips = TIER_TIPS[tier];
  const tipIndex = totalRatings % tips.length;
  const tip = tips[tipIndex];

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400).springify()} style={s.container}>
      <View style={s.header}>
        <View style={[s.iconCircle, { backgroundColor: `${nextTierColor}20` }]}>
          <Ionicons name={TIER_ICONS[nextTier]} size={18} color={nextTierColor} />
        </View>
        <View style={s.headerText}>
          <Text style={s.title}>Almost {TIER_DISPLAY_NAMES[nextTier]}!</Text>
          <Text style={s.subtitle}>
            {pointsNeeded} point{pointsNeeded !== 1 ? "s" : ""} away from {nextWeight}x influence
          </Text>
        </View>
        {onDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
          >
            <Ionicons name="close" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Progress bar */}
      <View style={s.progressSection}>
        <View style={s.progressBarBg}>
          <View style={[s.progressBarFill, { width: pct(progress * 100), backgroundColor: nextTierColor }]} />
        </View>
        <Text style={[s.progressPct, { color: nextTierColor }]}>{Math.round(progress * 100)}%</Text>
      </View>

      {/* Tip */}
      {tip && (
        <View style={s.tipRow}>
          <Ionicons name="bulb-outline" size={14} color={AMBER} />
          <Text style={s.tipText}>{tip}</Text>
        </View>
      )}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(196,154,26,0.15)",
    ...Colors.cardShadow,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
  },
  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.surfaceRaised,
    overflow: "hidden" as const,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  progressPct: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "DMSans_700Bold",
    minWidth: 36,
    textAlign: "right" as const,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: `${AMBER}08`,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "DMSans_500Medium",
    flex: 1,
    lineHeight: 17,
  },
});

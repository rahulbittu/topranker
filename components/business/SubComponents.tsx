/**
 * Extracted sub-components from app/business/[id].tsx
 * These are presentational components that don't depend on screen state.
 * Extracted per Audit N1 to reduce the main screen file from 1210 LOC.
 */
import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Easing,
  LayoutAnimation, Platform, UIManager,
} from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import {
  formatTimeAgo, TIER_COLORS, TIER_DISPLAY_NAMES, type CredibilityTier,
} from "@/lib/data";
import type { ApiDish } from "@/lib/api";

export interface MappedRating {
  id: string;
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

export function SubScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min((value / 5) * 100, 100);
  return (
    <View style={s.subScoreRow}>
      <Text style={s.subScoreLabel}>{label}</Text>
      <View style={s.subScoreTrack}>
        <View style={[s.subScoreFill, { width: `${pct}%` as any }]} />
      </View>
      <Text style={s.subScoreValue}>{value.toFixed(1)}</Text>
    </View>
  );
}

export const DistributionChart = React.memo(function DistributionChart({ ratings }: { ratings: MappedRating[] }) {
  const counts = [5, 4, 3, 2, 1].map(n => ({
    star: n,
    count: ratings.filter(r => Math.round(r.rawScore) === n).length
  }));
  const maxCount = Math.max(...counts.map(c => c.count), 1);

  return (
    <View style={s.distChart}>
      {counts.map(({ star, count }) => (
        <View key={star} style={s.distRow}>
          <Text style={s.distStar}>{star}</Text>
          <View style={s.distBarTrack}>
            <View
              style={[s.distBarFill, {
                width: `${(count / maxCount) * 100}%` as any,
                backgroundColor: count === maxCount && count > 0 ? Colors.gold : Colors.border,
              }]}
            />
          </View>
          <Text style={s.distCount}>{count}</Text>
        </View>
      ))}
    </View>
  );
});

export const RatingRow = React.memo(function RatingRow({ rating }: { rating: MappedRating }) {
  const tierColor = TIER_COLORS[rating.userTier];
  const tierName = TIER_DISPLAY_NAMES[rating.userTier];
  return (
    <View style={s.ratingRow}>
      <View style={s.ratingTop}>
        <View style={s.ratingUser}>
          <View style={s.ratingAvatar}>
            {rating.userAvatarUrl ? (
              <Image source={{ uri: rating.userAvatarUrl }} style={s.ratingAvatarImg} contentFit="cover" />
            ) : (
              <Text style={s.ratingAvatarText}>
                {rating.userName.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View>
            <Text style={s.ratingName}>{rating.userName}</Text>
            <Text style={[s.ratingTierText, { color: tierColor }]}>{tierName}</Text>
          </View>
        </View>
        <View style={s.ratingScoreBox}>
          <Text style={s.ratingScore}>{rating.rawScore.toFixed(1)}</Text>
          <Text style={s.ratingWeight}>{rating.weight.toFixed(2)}x</Text>
          <Text style={s.ratingTime}>{formatTimeAgo(rating.createdAt)}</Text>
        </View>
      </View>
      <View style={s.ratingSubScores}>
        <View style={s.ratingSubItem}>
          <Text style={s.ratingSubLabel}>Quality</Text>
          <Text style={s.ratingSubVal}>{rating.q1}</Text>
        </View>
        <View style={s.ratingSubItem}>
          <Text style={s.ratingSubLabel}>Value</Text>
          <Text style={s.ratingSubVal}>{rating.q2}</Text>
        </View>
        <View style={s.ratingSubItem}>
          <Text style={s.ratingSubLabel}>Service</Text>
          <Text style={s.ratingSubVal}>{rating.q3}</Text>
        </View>
        <View style={s.ratingSubItem}>
          <Text style={s.ratingSubLabel}>Return</Text>
          <Ionicons
            name={rating.wouldReturn ? "checkmark-circle" : "close-circle"}
            size={14}
            color={rating.wouldReturn ? Colors.green : Colors.red}
          />
        </View>
      </View>
      {rating.comment && (
        <Text style={s.ratingComment}>"{rating.comment}"</Text>
      )}
    </View>
  );
});

export function ActionButton({ icon, label, onPress, disabled }: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[s.actionBtn, disabled && s.actionBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Ionicons name={icon} size={18} color={disabled ? Colors.textTertiary : Colors.text} />
      <Text style={[s.actionBtnLabel, disabled && s.actionBtnLabelDisabled]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function CollapsibleReviews({ ratings }: { ratings: MappedRating[] }) {
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
    if (expanded) setVisibleCount(5);
  };

  const showMore = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVisibleCount(v => v + 10);
  };

  const visibleRatings = ratings.slice(0, visibleCount);
  const hasMore = visibleCount < ratings.length;

  return (
    <View style={s.collapsibleSection}>
      <TouchableOpacity
        style={s.collapsibleHeader}
        onPress={toggleExpanded}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse community reviews" : "Expand community reviews"}
      >
        <Ionicons name="chatbubbles-outline" size={16} color={BRAND.colors.amber} />
        <Text style={s.collapsibleTitle}>Community Reviews</Text>
        <View style={s.collapsibleBadge}>
          <Text style={s.collapsibleBadgeText}>{ratings.length}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
      {expanded && (
        <View style={s.collapsibleBody}>
          <DistributionChart ratings={ratings} />
          {visibleRatings.map((rating: MappedRating) => (
            <RatingRow key={rating.id} rating={rating} />
          ))}
          {hasMore && (
            <TouchableOpacity onPress={showMore} style={s.showMoreBtn} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Show more reviews">
              <Text style={s.showMoreText}>Show more ({ratings.length - visibleCount} remaining)</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

export function AnimatedScore({ value, style }: { value: number; style: any }) {
  const animVal = useRef(new Animated.Value(0)).current;
  const [displayVal, setDisplayVal] = useState("0.00");

  useEffect(() => {
    animVal.setValue(0);
    const listener = animVal.addListener(({ value: v }) => {
      setDisplayVal(v.toFixed(2));
    });
    Animated.timing(animVal, {
      toValue: value,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => animVal.removeListener(listener);
  }, [value]);

  return <Text style={style}>{displayVal}</Text>;
}

export function DishPill({ dish }: { dish: ApiDish }) {
  return (
    <View style={s.dishPill}>
      <Text style={s.dishPillText}>{dish.name}</Text>
      <Text style={s.dishVoteCountText}>{dish.voteCount}</Text>
    </View>
  );
}

// Styles for extracted sub-components
const s = StyleSheet.create({
  subScoreRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  subScoreLabel: { width: 60, fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  subScoreTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: Colors.border, overflow: "hidden" },
  subScoreFill: { height: 6, borderRadius: 3, backgroundColor: BRAND.colors.amber },
  subScoreValue: { width: 30, fontSize: 13, fontWeight: "600", color: Colors.text, textAlign: "right", fontFamily: "DMSans_600SemiBold" },

  distChart: { gap: 4, marginBottom: 12 },
  distRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  distStar: { width: 16, fontSize: 12, color: Colors.textSecondary, textAlign: "center", fontFamily: "DMSans_400Regular" },
  distBarTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: `${Colors.border}60`, overflow: "hidden" },
  distBarFill: { height: 8, borderRadius: 4 },
  distCount: { width: 24, fontSize: 11, color: Colors.textTertiary, textAlign: "right", fontFamily: "DMSans_400Regular" },

  ratingRow: {
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 8,
  },
  ratingTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  ratingUser: { flexDirection: "row", alignItems: "center", gap: 10 },
  ratingAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: `${BRAND.colors.amber}18`,
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  ratingAvatarImg: { width: 32, height: 32, borderRadius: 16 },
  ratingAvatarText: { fontSize: 14, fontWeight: "600", color: BRAND.colors.amber },
  ratingName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  ratingTierText: { fontSize: 10, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
  ratingScoreBox: { alignItems: "flex-end", gap: 2 },
  ratingScore: { fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold" },
  ratingWeight: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  ratingTime: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  ratingSubScores: { flexDirection: "row", gap: 16, paddingLeft: 42 },
  ratingSubItem: { alignItems: "center", gap: 2 },
  ratingSubLabel: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  ratingSubVal: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  ratingComment: {
    fontSize: 13, color: Colors.textSecondary, fontStyle: "italic",
    fontFamily: "DMSans_400Regular", paddingLeft: 42, lineHeight: 18,
  },

  actionBtn: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 4,
    paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.surface,
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnLabel: { fontSize: 11, color: Colors.text, fontFamily: "DMSans_500Medium" },
  actionBtnLabelDisabled: { color: Colors.textTertiary },

  collapsibleSection: {
    backgroundColor: Colors.surface, borderRadius: 14, overflow: "hidden",
    ...Colors.cardShadow,
  },
  collapsibleHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 14,
  },
  collapsibleTitle: {
    fontSize: 15, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  collapsibleBadge: {
    backgroundColor: `${BRAND.colors.amber}15`,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  collapsibleBadgeText: {
    fontSize: 11, fontWeight: "700", color: BRAND.colors.amber,
    fontFamily: "DMSans_700Bold",
  },
  collapsibleBody: { paddingHorizontal: 14, paddingBottom: 14 },

  showMoreBtn: {
    paddingVertical: 10, alignItems: "center",
  },
  showMoreText: {
    fontSize: 13, color: BRAND.colors.amber, fontWeight: "600",
    fontFamily: "DMSans_600SemiBold",
  },

  dishPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: `${BRAND.colors.amber}10`,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: `${BRAND.colors.amber}25`,
  },
  dishPillText: {
    fontSize: 13, color: Colors.text, fontFamily: "DMSans_500Medium",
  },
  dishVoteCountText: {
    fontSize: 11, color: BRAND.colors.amber, fontWeight: "700",
    fontFamily: "DMSans_700Bold",
  },
});

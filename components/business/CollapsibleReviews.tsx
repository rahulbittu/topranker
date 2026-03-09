import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  LayoutAnimation, Platform, UIManager,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import { pct as pctDim } from "@/lib/style-helpers";
import { formatTimeAgo, TIER_COLORS, TIER_DISPLAY_NAMES } from "@/lib/data";
import type { MappedRating } from "./types";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
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
                width: pctDim((count / maxCount) * 100),
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

export default CollapsibleReviews;

const s = StyleSheet.create({
  distChart: { gap: 4, marginBottom: 12 },
  distRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  distStar: { width: 16, fontSize: 12, color: Colors.textSecondary, textAlign: "center", fontFamily: "DMSans_400Regular" },
  distBarTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: `${Colors.border}60`, overflow: "hidden" },
  distBarFill: { height: 8, borderRadius: 4 },
  distCount: { width: 24, ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary, textAlign: "right" },

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
  ratingWeight: { ...TYPOGRAPHY.ui.small, color: Colors.textTertiary },
  ratingTime: { ...TYPOGRAPHY.ui.small, color: Colors.textTertiary },
  ratingSubScores: { flexDirection: "row", gap: 16, paddingLeft: 42 },
  ratingSubItem: { alignItems: "center", gap: 2 },
  ratingSubLabel: { ...TYPOGRAPHY.ui.small, color: Colors.textTertiary },
  ratingSubVal: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  ratingComment: {
    fontSize: 13, color: Colors.textSecondary, fontStyle: "italic",
    fontFamily: "DMSans_400Regular", paddingLeft: 42, lineHeight: 18,
  },

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
});

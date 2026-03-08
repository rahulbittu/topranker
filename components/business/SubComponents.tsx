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
import { TYPOGRAPHY } from "@/constants/typography";
import { pct as pctDim } from "@/lib/style-helpers";
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
        <View style={[s.subScoreFill, { width: pctDim(pct) }]} />
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

export interface RankHistoryPoint {
  rank: number;
  date: string;
}

export const RatingDistribution = React.memo(function RatingDistribution({ ratings }: { ratings: MappedRating[] }) {
  const dist = [0, 0, 0, 0, 0];
  ratings.forEach(r => {
    const bucket = Math.min(4, Math.max(0, Math.round(r.rawScore) - 1));
    dist[bucket]++;
  });
  const maxCount = Math.max(...dist);

  return (
    <View style={s.rdCard}>
      <Text style={s.rdTitle}>Rating Distribution</Text>
      <Text style={s.rdSubtitle}>Transparent breakdown of all community ratings</Text>
      {[5, 4, 3, 2, 1].map(score => {
        const count = dist[score - 1];
        const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
        return (
          <View key={score} style={s.rdRow}>
            <Text style={s.rdLabel}>{score}</Text>
            <View style={s.rdBarBg}>
              <View style={[s.rdBarFill, { width: pctDim(pct), backgroundColor: score >= 4 ? Colors.green : score === 3 ? BRAND.colors.amber : Colors.red }]} />
            </View>
            <Text style={s.rdCount}>{count}</Text>
          </View>
        );
      })}
    </View>
  );
});

export const RankHistoryChart = React.memo(function RankHistoryChart({ points }: { points: RankHistoryPoint[] }) {
  const maxRank = Math.max(...points.map(p => p.rank));
  const minRank = Math.min(...points.map(p => p.rank));
  const range = Math.max(maxRank - minRank, 1);
  const chartW = 280;
  const chartH = 60;

  return (
    <View style={s.rhCard}>
      <View style={s.rhHeader}>
        <Ionicons name="trending-up" size={14} color={BRAND.colors.amber} />
        <Text style={s.rhTitle}>30-Day Rank Trend</Text>
      </View>
      <View style={s.rhChart}>
        {points.map((p, i) => {
          const x = (i / (points.length - 1)) * chartW;
          const y = chartH - ((maxRank - p.rank) / range) * chartH;
          return (
            <View
              key={i}
              style={[s.rhDot, { left: x - 3, top: y - 3 }]}
            />
          );
        })}
        <View style={[s.rhLine, { width: chartW }]} />
      </View>
      <View style={s.rhLabels}>
        <Text style={s.rhLabel}>#{maxRank}</Text>
        <Text style={s.rhLabel}>#{minRank}</Text>
      </View>
    </View>
  );
});

// ── Opening Hours Card ─────────────────────────────────────────
export function OpeningHoursCard({ hours }: { hours: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const todayLine = hours.find(h => h.toLowerCase().startsWith(todayName));
  return (
    <View style={s.hoursCard}>
      <TouchableOpacity
        onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpanded(!expanded); }}
        activeOpacity={0.7}
        style={s.hoursHeader}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse hours" : "Expand hours"}
      >
        <Text style={s.sectionTitle}>Hours</Text>
        <View style={s.hoursTodayRow}>
          <Text style={s.hoursTodaySummary} numberOfLines={1}>{todayLine || hours[0] || "—"}</Text>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={Colors.textSecondary} />
        </View>
      </TouchableOpacity>
      {expanded && hours.map((line: string, i: number) => {
        const isToday = line.toLowerCase().startsWith(todayName);
        return (
          <View key={i} style={[s.hoursRow, isToday && s.hoursRowToday]}>
            <Text style={[s.hoursText, isToday && s.hoursTextToday]}>{line}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Location Card with Map ─────────────────────────────────────
export function LocationCard({
  address,
  lat,
  lng,
  onDirections,
}: {
  address: string;
  lat?: string | null;
  lng?: string | null;
  onDirections: () => void;
}) {
  return (
    <View style={s.locationCard}>
      <Text style={s.sectionTitle}>Location</Text>
      {Platform.OS === "web" && lat && lng && (
        <View style={s.mapEmbed}>
          <iframe
            src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
            style={{ width: "100%", height: 180, border: "none", borderRadius: 10 } as any}
            loading="lazy"
          />
        </View>
      )}
      <Text style={s.addressText}>{address}</Text>
      <TouchableOpacity style={s.directionsBtn} onPress={onDirections} accessibilityRole="button" accessibilityLabel="Get directions">
        <Text style={s.directionsBtnText}>Get Directions</Text>
      </TouchableOpacity>
    </View>
  );
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

  rdCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 8,
    ...Colors.cardShadow,
  },
  rdTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  rdSubtitle: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary, marginBottom: 4 },
  rdRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  rdLabel: { width: 12, fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_500Medium", textAlign: "center" },
  rdBarBg: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: "hidden" },
  rdBarFill: { height: "100%", borderRadius: 2 },
  rdCount: { width: 20, ...TYPOGRAPHY.ui.small, color: Colors.textTertiary, textAlign: "right" },

  rhCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 10,
    ...Colors.cardShadow,
  },
  rhHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  rhTitle: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  rhChart: { height: 66, position: "relative" },
  rhDot: {
    position: "absolute", width: 6, height: 6, borderRadius: 3,
    backgroundColor: BRAND.colors.amber,
  },
  rhLine: { position: "absolute", top: "50%", left: 0, height: 1, backgroundColor: Colors.border },
  rhLabels: { flexDirection: "row", justifyContent: "space-between" },
  rhLabel: { ...TYPOGRAPHY.ui.small, color: Colors.textTertiary },

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

  // Opening Hours
  hoursCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 4,
    ...Colors.cardShadow,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold", marginBottom: 8,
  },
  hoursHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hoursTodayRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1, marginLeft: 12 },
  hoursTodaySummary: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", flex: 1, textAlign: "right" },
  hoursRow: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginTop: 2 },
  hoursRowToday: { backgroundColor: `${BRAND.colors.amber}10` },
  hoursText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  hoursTextToday: { color: Colors.text, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },

  // Location Card
  locationCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 8,
    ...Colors.cardShadow,
  },
  mapEmbed: { borderRadius: 10, overflow: "hidden", marginBottom: 4 },
  addressText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  directionsBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10,
    backgroundColor: Colors.surfaceRaised, alignSelf: "flex-start",
  },
  directionsBtnText: {
    fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
});

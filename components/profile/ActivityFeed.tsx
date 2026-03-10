/**
 * Sprint 419: Activity feed timeline for profile page.
 * Shows recent ratings as a vertical timeline with business name, score, and time.
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { formatTimeAgo } from "@/lib/data";
import { type ApiRating } from "@/lib/api";

const AMBER = BRAND.colors.amber;
const INITIAL_SHOW = 5;

type RatingWithBusiness = ApiRating & { businessName: string; businessSlug?: string };

interface ActivityFeedProps {
  ratings: RatingWithBusiness[];
  tier: string;
}

function getActivityIcon(score: number): { name: string; color: string } {
  if (score >= 8) return { name: "star", color: AMBER };
  if (score >= 6) return { name: "thumbs-up", color: Colors.green };
  if (score >= 4) return { name: "remove-circle-outline", color: Colors.textSecondary };
  return { name: "thumbs-down", color: Colors.red };
}

function ActivityRow({ rating, isLast }: { rating: RatingWithBusiness; isLast: boolean }) {
  const score = parseFloat(rating.rawScore);
  const icon = getActivityIcon(score);
  const timeAgo = formatTimeAgo(rating.createdAt);

  return (
    <TouchableOpacity
      style={s.activityRow}
      onPress={() => {
        if (rating.businessSlug) {
          router.push({ pathname: "/business/[id]", params: { id: rating.businessSlug } });
        }
      }}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Rated ${rating.businessName} ${score.toFixed(1)} out of 10, ${timeAgo}`}
    >
      {/* Timeline dot + line */}
      <View style={s.timelineCol}>
        <View style={[s.timelineDot, { backgroundColor: icon.color }]}>
          <Ionicons name={icon.name as any} size={10} color="#fff" />
        </View>
        {!isLast && <View style={s.timelineLine} />}
      </View>

      {/* Content */}
      <View style={s.activityContent}>
        <View style={s.activityHeader}>
          <Text style={s.activityBusiness} numberOfLines={1}>{rating.businessName}</Text>
          <Text style={[s.activityScore, { color: icon.color }]}>{score.toFixed(1)}</Text>
        </View>
        <View style={s.activityMeta}>
          <Text style={s.activityTime}>{timeAgo}</Text>
          {rating.note && (
            <Text style={s.activityNote} numberOfLines={1}>"{rating.note}"</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function ActivityFeed({ ratings, tier }: ActivityFeedProps) {
  const [showAll, setShowAll] = useState(false);
  const displayRatings = showAll ? ratings : ratings.slice(0, INITIAL_SHOW);

  if (ratings.length === 0) return null;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.title}>Recent Activity</Text>
          <View style={s.countBadge}>
            <Text style={s.countText}>{ratings.length}</Text>
          </View>
        </View>
      </View>

      <View style={s.timeline}>
        {displayRatings.map((r, i) => (
          <ActivityRow
            key={r.id}
            rating={r}
            isLast={i === displayRatings.length - 1}
          />
        ))}
      </View>

      {ratings.length > INITIAL_SHOW && (
        <TouchableOpacity
          style={s.showMoreBtn}
          onPress={() => setShowAll(v => !v)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={showAll ? "Show fewer ratings" : `Show all ${ratings.length} ratings`}
        >
          <Text style={s.showMoreText}>
            {showAll ? "Show Less" : `Show All ${ratings.length}`}
          </Text>
          <Ionicons
            name={showAll ? "chevron-up" : "chevron-down"}
            size={14}
            color={AMBER}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: 10, marginTop: 8 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  title: {
    fontSize: 15, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  countBadge: {
    backgroundColor: `${AMBER}15`, borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  countText: {
    fontSize: 11, fontWeight: "700", color: AMBER,
    fontFamily: "DMSans_700Bold",
  },
  timeline: { gap: 0 },
  activityRow: {
    flexDirection: "row", gap: 12,
  },
  timelineCol: {
    alignItems: "center", width: 24,
  },
  timelineDot: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  timelineLine: {
    width: 2, flex: 1, backgroundColor: Colors.border,
    marginVertical: 2,
  },
  activityContent: {
    flex: 1, paddingBottom: 14, gap: 3,
  },
  activityHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  activityBusiness: {
    fontSize: 13, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold", flex: 1, marginRight: 8,
  },
  activityScore: {
    fontSize: 14, fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold",
  },
  activityMeta: {
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  activityTime: {
    fontSize: 11, color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  activityNote: {
    fontSize: 11, color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular", fontStyle: "italic",
    flex: 1,
  },
  showMoreBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 4, paddingVertical: 8,
  },
  showMoreText: {
    fontSize: 12, fontWeight: "600", color: AMBER,
    fontFamily: "DMSans_600SemiBold",
  },
});

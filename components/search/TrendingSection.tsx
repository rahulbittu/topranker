/**
 * Sprint 404: Trending Section — Extracted from search.tsx
 *
 * Shows trending businesses with rank delta, score, photo thumbnail,
 * and explicit timeframe context.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { getCategoryDisplay, getRankDisplay, BRAND } from "@/constants/brand";
import { SafeImage } from "@/components/SafeImage";
import type { MappedBusiness } from "@/types/business";

const AMBER = BRAND.colors.amber;

export interface TrendingSectionProps {
  trending: MappedBusiness[];
}

export function TrendingSection({ trending }: TrendingSectionProps) {
  if (trending.length === 0) return null;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Ionicons name="trending-up" size={16} color={AMBER} />
          <Text style={s.title}>Trending This Week</Text>
        </View>
        <Text style={s.subtitle}>{trending.length} movers</Text>
      </View>
      {trending.map((biz) => {
        const displayCat = getCategoryDisplay(biz.category);
        const photoUrl = biz.photoUrl || (biz.photoUrls?.[0]);
        return (
          <TouchableOpacity
            key={biz.id}
            style={s.row}
            onPress={() => router.push({ pathname: "/business/[id]", params: { id: biz.slug } })}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${biz.name}, moved up ${biz.rankDelta} spots this week`}
          >
            {/* Photo thumbnail */}
            <View style={s.thumbWrap}>
              {photoUrl ? (
                <SafeImage uri={photoUrl} style={s.thumb} contentFit="cover" category={biz.category} />
              ) : (
                <View style={[s.thumb, s.thumbPlaceholder]}>
                  <Text style={s.thumbEmoji}>{displayCat.emoji || "🍽"}</Text>
                </View>
              )}
            </View>

            <View style={s.info}>
              <Text style={s.name} numberOfLines={1}>{biz.name}</Text>
              <View style={s.metaRow}>
                <Text style={s.rank}>{getRankDisplay(biz.rank)}</Text>
                <Text style={s.separator}>·</Text>
                <Text style={s.score}>{biz.weightedScore.toFixed(1)}</Text>
                <Text style={s.separator}>·</Text>
                <Text style={s.category}>{displayCat.label}</Text>
              </View>
            </View>

            {/* Rank delta badge */}
            <View style={s.deltaContainer}>
              <View style={s.deltaBadge}>
                <Ionicons name="arrow-up" size={10} color={Colors.green} />
                <Text style={s.deltaText}>{biz.rankDelta}</Text>
              </View>
              <Text style={s.deltaLabel}>this week</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row", alignItems: "center", gap: 6,
  },
  title: {
    fontSize: 15, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold",
  },
  subtitle: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  row: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 10, ...Colors.cardShadow,
  },
  thumbWrap: {
    width: 44, height: 44, borderRadius: 10, overflow: "hidden",
  },
  thumb: {
    width: 44, height: 44,
  },
  thumbPlaceholder: {
    backgroundColor: Colors.surfaceRaised, alignItems: "center", justifyContent: "center",
  },
  thumbEmoji: { fontSize: 20 },
  info: { flex: 1, gap: 3 },
  name: {
    fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  metaRow: {
    flexDirection: "row", alignItems: "center", gap: 4,
  },
  rank: {
    fontSize: 12, fontWeight: "700", color: AMBER, fontFamily: "DMSans_700Bold",
  },
  separator: { fontSize: 10, color: Colors.textTertiary },
  score: {
    fontSize: 12, fontWeight: "600", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold",
  },
  category: {
    fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
  deltaContainer: { alignItems: "center", gap: 2 },
  deltaBadge: {
    flexDirection: "row", alignItems: "center", gap: 2,
    backgroundColor: "rgba(34,139,34,0.08)", paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8,
  },
  deltaText: {
    fontSize: 13, fontWeight: "700", color: Colors.green, fontFamily: "DMSans_700Bold",
  },
  deltaLabel: {
    fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
});

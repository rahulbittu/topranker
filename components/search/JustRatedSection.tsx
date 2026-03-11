/**
 * Sprint 617: "Just Rated" feed section for Discover
 * Shows businesses that received ratings in the last 24 hours.
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

export interface JustRatedSectionProps {
  businesses: MappedBusiness[];
}

export function JustRatedSection({ businesses }: JustRatedSectionProps) {
  if (businesses.length === 0) return null;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Ionicons name="flash-outline" size={16} color={AMBER} />
          <Text style={s.title}>Just Rated</Text>
        </View>
        <Text style={s.subtitle}>last 24 hours</Text>
      </View>
      {businesses.map((biz) => {
        const displayCat = getCategoryDisplay(biz.category);
        const photoUrl = biz.photoUrl || (biz.photoUrls?.[0]);
        return (
          <TouchableOpacity
            key={biz.id}
            style={s.row}
            onPress={() => router.push({ pathname: "/business/[id]", params: { id: biz.slug } })}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${biz.name}, recently rated`}
          >
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

            <View style={s.badge}>
              <Ionicons name="star" size={10} color={AMBER} />
              <Text style={s.badgeText}>New rating</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: 8 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
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
  thumbWrap: { width: 44, height: 44, borderRadius: 10, overflow: "hidden" },
  thumb: { width: 44, height: 44 },
  thumbPlaceholder: {
    backgroundColor: Colors.surfaceRaised, alignItems: "center", justifyContent: "center",
  },
  thumbEmoji: { fontSize: 20 },
  info: { flex: 1, gap: 3 },
  name: {
    fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
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
  badge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(196,154,26,0.08)", paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10, fontWeight: "600", color: AMBER, fontFamily: "DMSans_600SemiBold",
  },
});

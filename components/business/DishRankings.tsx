/**
 * Sprint 322: Dish Rankings Card
 * Shows which dish leaderboards this business is ranked on.
 * "Ranked #1 for Biryani, #3 for Butter Chicken"
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { apiFetch } from "@/lib/query-client";

const AMBER = BRAND.colors.amber;

interface DishRanking {
  dishSlug: string;
  dishName: string;
  dishEmoji: string | null;
  rankPosition: number;
  dishScore: string;
  entryCount: number;
}

interface DishRankingsProps {
  businessId: string;
}

export function DishRankings({ businessId }: DishRankingsProps) {
  const { data: rankings } = useQuery({
    queryKey: ["dish-rankings", businessId],
    queryFn: async () => {
      const res = await apiFetch(`/api/businesses/${businessId}/dish-rankings`);
      const json = await res.json();
      return json.data as DishRanking[];
    },
    enabled: !!businessId,
    staleTime: 120000,
  });

  if (!rankings || rankings.length === 0) return null;

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>DISH RANKINGS</Text>
      <View style={s.rankingList}>
        {rankings.map((r) => (
          <TouchableOpacity
            key={r.dishSlug}
            style={s.rankingRow}
            onPress={() => router.push({ pathname: "/dish/[slug]", params: { slug: r.dishSlug } })}
            activeOpacity={0.7}
            accessibilityRole="link"
            accessibilityLabel={`Ranked #${r.rankPosition} for ${r.dishName}`}
          >
            <View style={s.rankBadge}>
              <Text style={s.rankBadgeText}>#{r.rankPosition}</Text>
            </View>
            <Text style={s.dishEmoji}>{r.dishEmoji || "🍽️"}</Text>
            <View style={s.rankingInfo}>
              <Text style={s.dishName} numberOfLines={1}>Best {r.dishName}</Text>
              <Text style={s.dishMeta}>
                {parseFloat(r.dishScore).toFixed(1)} score · {r.entryCount} ranked
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    ...Colors.cardShadow,
  },
  cardTitle: {
    fontSize: 10, fontWeight: "700", color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold", letterSpacing: 1.5,
  },
  rankingList: { gap: 8 },
  rankingRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 6, paddingHorizontal: 4,
    backgroundColor: "rgba(196,154,26,0.04)", borderRadius: 10,
  },
  rankBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: AMBER, alignItems: "center", justifyContent: "center",
  },
  rankBadgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  dishEmoji: { fontSize: 20 },
  rankingInfo: { flex: 1 },
  dishName: {
    fontSize: 14, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  dishMeta: {
    fontSize: 11, color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
});

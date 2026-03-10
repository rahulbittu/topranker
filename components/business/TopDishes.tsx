/**
 * Sprint 277: Top Dishes Card
 * Shows the most-voted dishes for a specific business.
 * Constitution #47: "Specificity creates disruption."
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { apiFetch } from "@/lib/query-client";
import { SafeImage } from "@/components/SafeImage";

interface TopDish {
  id: string;
  name: string;
  slug: string;
  voteCount: number;
  photoUrl: string | null;
}

interface TopDishesProps {
  businessId: string;
  businessName: string;
}

export function TopDishes({ businessId, businessName }: TopDishesProps) {
  const { data: dishes } = useQuery({
    queryKey: ["top-dishes", businessId],
    queryFn: async () => {
      const res = await apiFetch(`/api/businesses/${businessId}/top-dishes`);
      const json = await res.json();
      return json.data as TopDish[];
    },
    enabled: !!businessId,
  });

  if (!dishes || dishes.length === 0) return null;

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>TOP DISHES</Text>
      <View style={s.dishList}>
        {dishes.slice(0, 5).map((dish, i) => (
          <TouchableOpacity
            key={dish.id}
            style={s.dishRow}
            onPress={() => router.push(`/dish/${dish.slug}`)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${dish.name}, ${dish.voteCount} votes`}
          >
            <Text style={s.dishRank}>#{i + 1}</Text>
            {dish.photoUrl ? (
              <SafeImage source={{ uri: dish.photoUrl }} style={s.dishPhoto} />
            ) : (
              <View style={s.dishPhotoPlaceholder}>
                <Ionicons name="restaurant-outline" size={14} color={Colors.textTertiary} />
              </View>
            )}
            <View style={s.dishInfo}>
              <Text style={s.dishName} numberOfLines={1}>{dish.name}</Text>
              <Text style={s.dishVotes}>{dish.voteCount} {dish.voteCount === 1 ? "vote" : "votes"}</Text>
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
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold",
    letterSpacing: 1.5,
  },
  dishList: { gap: 8 },
  dishRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  dishRank: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.gold,
    fontFamily: "PlayfairDisplay_700Bold",
    width: 24,
  },
  dishPhoto: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  dishPhotoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  dishInfo: { flex: 1 },
  dishName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  dishVotes: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
});

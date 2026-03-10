import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { getActiveCategories, getCategoriesByCuisine, getAvailableCuisines, CUISINE_DISPLAY, type BestInCategory } from "@/shared/best-in-categories";

const AMBER = BRAND.colors.amber;

interface BestInSectionProps {
  city: string;
  onSelectCategory: (displayName: string) => void;
  onSelectDish?: (slug: string) => void;
  onSeeAll: () => void;
  onCuisineChange?: (cuisine: string | null) => void;
  entryCounts?: Record<string, number>;
}

export function BestInSection({ city, onSelectCategory, onSelectDish, onSeeAll, onCuisineChange, entryCounts }: BestInSectionProps) {
  const [bestInCuisine, setBestInCuisine] = useState<string | null>(null);
  const bestInCuisines = useMemo(() => getAvailableCuisines(), []);
  const bestInItems = useMemo(() =>
    bestInCuisine ? getCategoriesByCuisine(bestInCuisine) : getActiveCategories().slice(0, 15),
    [bestInCuisine],
  );

  return (
    <View style={styles.bestInSection}>
      <View style={styles.bestInHeader}>
        <View style={styles.bestInHeaderLeft}>
          <Ionicons name="trophy" size={16} color={AMBER} />
          <Text style={styles.bestInTitle}>Best In {city}</Text>
        </View>
        <TouchableOpacity
          onPress={onSeeAll}
          accessibilityRole="button"
          accessibilityLabel="See all Best In categories"
        >
          <Text style={styles.bestInSeeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cuisineTabsScroll}
      >
        <TouchableOpacity
          onPress={() => { Haptics.selectionAsync(); setBestInCuisine(null); onCuisineChange?.(null); }}
          style={[styles.cuisineTab, bestInCuisine === null && styles.cuisineTabActive]}
        >
          <Text style={[styles.cuisineTabText, bestInCuisine === null && styles.cuisineTabTextActive]}>All</Text>
        </TouchableOpacity>
        {bestInCuisines.filter(c => c !== "universal").map((cuisine) => {
          const display = CUISINE_DISPLAY[cuisine] || { label: cuisine, emoji: "" };
          return (
            <TouchableOpacity
              key={cuisine}
              onPress={() => { Haptics.selectionAsync(); setBestInCuisine(cuisine); onCuisineChange?.(cuisine); }}
              style={[styles.cuisineTab, bestInCuisine === cuisine && styles.cuisineTabActive]}
            >
              <Text style={[styles.cuisineTabText, bestInCuisine === cuisine && styles.cuisineTabTextActive]}>
                {display.emoji} {display.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bestInScroll}
      >
        {bestInItems.map((cat: BestInCategory) => (
          <TouchableOpacity
            key={cat.slug}
            style={styles.bestInCard}
            onPress={() => { Haptics.selectionAsync(); onSelectDish ? onSelectDish(cat.slug) : onSelectCategory(cat.displayName); }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Best ${cat.displayName} in ${city}`}
          >
            <Text style={styles.bestInEmoji}>{cat.emoji}</Text>
            <Text style={styles.bestInName} numberOfLines={1}>{cat.displayName}</Text>
            <Text style={styles.bestInSubtitle} numberOfLines={1}>
              {entryCounts && entryCounts[cat.slug] ? `${entryCounts[cat.slug]} ranked` : `Best in ${city}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bestInSection: {
    marginBottom: 12,
  },
  bestInHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 10,
  },
  bestInHeaderLeft: {
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  bestInTitle: {
    fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  bestInSeeAll: {
    fontSize: 12, fontWeight: "600", color: AMBER, fontFamily: "DMSans_600SemiBold",
  },
  cuisineTabsScroll: {
    flexDirection: "row", paddingBottom: 8, gap: 6,
  },
  cuisineTab: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
    backgroundColor: "rgba(13, 27, 42, 0.06)",
  },
  cuisineTabActive: {
    backgroundColor: "rgba(13, 27, 42, 0.12)", borderWidth: 1, borderColor: "#0D1B2A",
  },
  cuisineTabText: {
    fontSize: 11, fontFamily: "DMSans_500Medium", color: Colors.textSecondary,
  },
  cuisineTabTextActive: {
    color: "#0D1B2A", fontFamily: "DMSans_700Bold",
  },
  bestInScroll: {
    gap: 10, paddingRight: 4,
  },
  bestInCard: {
    width: 100, backgroundColor: Colors.surface, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 8, alignItems: "center", gap: 4,
    borderWidth: 1, borderColor: Colors.border,
    ...Colors.cardShadow,
  },
  bestInEmoji: {
    fontSize: 28,
  },
  bestInName: {
    fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
    textAlign: "center" as const,
  },
  bestInSubtitle: {
    fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textAlign: "center" as const,
  },
});

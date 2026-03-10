/**
 * Sprint 386: Extracted ListHeaderComponent from Rankings screen.
 * Category chips, cuisine filter, dish shortcuts, welcome banner,
 * hero card, and rankings summary.
 */
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import { getCategoryDisplay, BRAND } from "@/constants/brand";
import { CUISINE_DISPLAY } from "@/shared/best-in-categories";
import { formatTimeAgo } from "@/lib/data";
import { MappedBusiness } from "@/types/business";
import { HeroCard } from "@/components/leaderboard/SubComponents";
import { CuisineChipRow } from "@/components/leaderboard/CuisineChipRow";
import { Analytics } from "@/lib/analytics";
import { WeeklySummaryCard } from "@/components/leaderboard/WeeklySummaryCard";

const AMBER = BRAND.colors.amber;

interface CategoryChip {
  slug: string;
  label: string;
  emoji: string;
}

interface DishShortcut {
  slug: string;
  name: string;
  emoji: string;
  entryCount: number;
}

export interface RankingsListHeaderProps {
  categoryChips: CategoryChip[];
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
  onShowSuggest: () => void;
  availableCuisines: string[];
  selectedCuisine: string | null;
  onCuisineChange: (cuisine: string | null) => void;
  dishShortcuts: DishShortcut[];
  showBanner: boolean;
  onDismissBanner: () => void;
  heroBiz: MappedBusiness | null;
  filteredCount: number;
  dataUpdatedAt: number;
  city: string;
  businesses: MappedBusiness[];
}

export function RankingsListHeader({
  categoryChips,
  activeCategory,
  onCategoryChange,
  onShowSuggest,
  availableCuisines,
  selectedCuisine,
  onCuisineChange,
  dishShortcuts,
  showBanner,
  onDismissBanner,
  heroBiz,
  filteredCount,
  dataUpdatedAt,
  city,
  businesses,
}: RankingsListHeaderProps) {
  return (
    <>
      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chipsContainer}
        style={s.chipsRow}
      >
        {categoryChips.map((chip) => {
          const isActive = activeCategory === chip.slug;
          return (
            <TouchableOpacity
              key={chip.slug}
              onPress={() => { Haptics.selectionAsync(); onCategoryChange(chip.slug); }}
              style={[s.chip, isActive && s.chipActive]}
              accessibilityRole="button"
              accessibilityLabel={`${chip.label} category${isActive ? ", selected" : ""}`}
              accessibilityState={{ selected: isActive }}
            >
              <View style={[s.chipEmojiCircle, isActive && s.chipEmojiCircleActive]}>
                <Text style={s.chipEmoji}>{chip.emoji}</Text>
              </View>
              <Text style={[s.chipLabel, isActive && s.chipLabelActive]}>{chip.label}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          onPress={() => { Haptics.selectionAsync(); onShowSuggest(); }}
          style={s.suggestChip}
          accessibilityRole="button"
          accessibilityLabel="Suggest a new category"
        >
          <Ionicons name="add-circle-outline" size={16} color={AMBER} />
          <Text style={s.suggestChipText}>Suggest</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={s.bestInHeader}>
        <Text style={s.bestInTitle}>Best In {city}</Text>
      </View>

      {/* Cuisine filter */}
      <CuisineChipRow
        cuisines={availableCuisines}
        selectedCuisine={selectedCuisine}
        onSelect={onCuisineChange}
        analyticsSource="rankings"
      />

      {/* Dish shortcuts */}
      {dishShortcuts.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.dishShortcutsContainer}
          style={s.dishShortcutsRow}
        >
          <Text style={s.dishShortcutsLabel}>Dish Rankings:</Text>
          {dishShortcuts.map((dish) => (
            <TouchableOpacity
              key={dish.slug}
              onPress={() => {
                Haptics.selectionAsync();
                Analytics.dishDeepLinkTap(dish.slug);
                router.push({ pathname: "/dish/[slug]", params: { slug: dish.slug } });
              }}
              style={s.dishShortcutChip}
              accessibilityRole="link"
              accessibilityLabel={`Best ${dish.name} leaderboard`}
            >
              <Text style={s.dishShortcutText}>
                {dish.emoji} Best {dish.name}{dish.entryCount > 0 ? ` · ${dish.entryCount}` : ""}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={AMBER} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Welcome banner */}
      {showBanner && (
        <View style={s.welcomeBanner}>
          <Text style={s.welcomeBannerText}>Trust-weighted rankings by real people.</Text>
          <Text style={s.welcomeBannerSubtext}>Rate businesses you've visited to build your credibility.</Text>
          <TouchableOpacity
            style={s.welcomeBannerClose}
            onPress={onDismissBanner}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Dismiss welcome banner"
          >
            <Ionicons name="close" size={16} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>
      )}

      {/* Weekly summary — Sprint 423 */}
      <WeeklySummaryCard businesses={businesses} city={city} />

      {/* Hero card */}
      {heroBiz ? <HeroCard item={heroBiz} categoryLabel={getCategoryDisplay(activeCategory).label} /> : null}

      {/* Rankings summary */}
      {filteredCount > 0 && (
        <View style={s.rankingSummary}>
          <Text style={s.rankingSummaryText}>
            {filteredCount} {selectedCuisine && CUISINE_DISPLAY[selectedCuisine] ? `${CUISINE_DISPLAY[selectedCuisine].label} ` : ""}{getCategoryDisplay(activeCategory).label.toLowerCase()} ranked
          </Text>
          {dataUpdatedAt > 0 && (
            <Text style={s.rankingSummaryTime}>
              Updated {formatTimeAgo(dataUpdatedAt)}
            </Text>
          )}
        </View>
      )}
    </>
  );
}

const s = StyleSheet.create({
  chipsRow: { flexGrow: 0, minHeight: 52, marginBottom: 12 },
  chipsContainer: { paddingHorizontal: 16, gap: 8, flexDirection: "row", paddingVertical: 6 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, height: 38, borderRadius: 100,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: AMBER, borderColor: AMBER,
    shadowColor: AMBER, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  chipEmojiCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.04)", alignItems: "center", justifyContent: "center",
  },
  chipEmojiCircleActive: { backgroundColor: "rgba(255,255,255,0.2)" },
  chipEmoji: { fontSize: 13 },
  chipLabel: { fontSize: 13, fontFamily: "DMSans_600SemiBold", color: Colors.text },
  chipLabelActive: { color: "#FFFFFF", fontFamily: "DMSans_700Bold" },
  suggestChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 14, height: 38, borderRadius: 100,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: AMBER, borderStyle: "dashed",
  },
  suggestChipText: { fontSize: 12, fontFamily: "DMSans_600SemiBold", color: AMBER },
  bestInHeader: { paddingHorizontal: 20, paddingTop: 2, paddingBottom: 4 },
  bestInTitle: { fontSize: 15, fontFamily: "DMSans_700Bold", color: Colors.text },
  dishShortcutsRow: { flexGrow: 0, minHeight: 38, marginBottom: 4 },
  dishShortcutsContainer: { paddingHorizontal: 16, flexDirection: "row", alignItems: "center", paddingVertical: 2 },
  dishShortcutsLabel: { fontSize: 11, fontFamily: "DMSans_600SemiBold", color: Colors.textTertiary, marginRight: 8 },
  dishShortcutChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    marginRight: 8, backgroundColor: "rgba(196,154,26,0.08)",
    borderWidth: 1, borderColor: "rgba(196,154,26,0.25)",
  },
  dishShortcutText: { fontSize: 12, fontFamily: "DMSans_600SemiBold", color: AMBER },
  welcomeBanner: {
    backgroundColor: "#0D1B2A", borderRadius: 12,
    padding: 16, marginBottom: 12, marginHorizontal: 0,
    position: "relative" as const,
  },
  welcomeBannerText: {
    color: "#FFFFFF", fontSize: 14, fontFamily: "DMSans_600SemiBold", paddingRight: 24,
  },
  welcomeBannerSubtext: {
    color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "DMSans_400Regular",
    marginTop: 4, paddingRight: 24,
  },
  welcomeBannerClose: { position: "absolute" as const, top: 12, right: 12 },
  rankingSummary: {
    flexDirection: "row" as const, alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 6, marginBottom: 4,
  },
  rankingSummaryText: {
    fontSize: 12, fontWeight: "500" as const, color: Colors.textSecondary, fontFamily: "DMSans_500Medium",
  },
  rankingSummaryTime: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
});

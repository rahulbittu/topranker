/**
 * Sprint 571: Extracted discover-mode sections from search.tsx
 * Renders CityComparisonOverlay, BestInSection, TrendingSection, DishLeaderboardSection
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { Analytics } from "@/lib/analytics";
import { BestInSection } from "@/components/search/BestInSection";
import { TrendingSection } from "@/components/search/TrendingSection";
import { DishLeaderboardSection } from "@/components/DishLeaderboardSection";
import { CityComparisonOverlay } from "@/components/search/CityComparisonOverlay";
import { FeaturedSection, type FeaturedBusiness } from "@/components/FeaturedCard";
import { JustRatedSection } from "@/components/search/JustRatedSection";
import { CUISINE_DISPLAY } from "@/shared/best-in-categories";
import * as Haptics from "expo-haptics";

const AMBER = BRAND.colors.amber;

export interface DiscoverSectionsProps {
  city: string;
  debouncedQuery: string;
  selectedCuisine: string | null;
  activeFilter: string;
  filteredCount: number;
  trending: any[];
  featuredBusinesses: FeaturedBusiness[];
  dishEntryCounts: Record<string, number>;
  justRated: any[]; // Sprint 617
  showDiscoverTip: boolean;
  onDismissDiscoverTip: () => void;
  onSetQuery: (q: string) => void;
  onSetActiveFilter: (f: string) => void;
  onSetSelectedCuisine: (c: string | null) => void;
}

export function DiscoverSections({
  city,
  debouncedQuery,
  selectedCuisine,
  activeFilter,
  filteredCount,
  trending,
  featuredBusinesses,
  dishEntryCounts,
  justRated,
  showDiscoverTip,
  onDismissDiscoverTip,
  onSetQuery,
  onSetActiveFilter,
  onSetSelectedCuisine,
}: DiscoverSectionsProps) {
  return (
    <>
      {showDiscoverTip && (
        <View style={s.discoverTip}>
          <Ionicons name="compass-outline" size={20} color={AMBER} style={{ marginTop: 2 }} />
          <View style={s.discoverTipTextStack}>
            <Text style={s.discoverTipTitle}>Discover top-rated places near you</Text>
            <Text style={s.discoverTipSubtext}>Search by name, category, or explore the map</Text>
          </View>
          <TouchableOpacity
            style={s.discoverTipClose}
            onPress={onDismissDiscoverTip}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Dismiss discover tip"
          >
            <Ionicons name="close" size={14} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Sprint 568: City comparison overlay */}
      {!debouncedQuery && <CityComparisonOverlay currentCity={city} delay={200} />}

      {/* Best In [City] — Category Browsing */}
      {!debouncedQuery && (
        <BestInSection
          city={city}
          onSelectCategory={(name) => { onSetQuery(name); onSetActiveFilter("All"); }}
          onSelectDish={(slug) => { Analytics.dishDeepLinkTap(slug); router.push({ pathname: "/dish/[slug]", params: { slug } }); }}
          onSeeAll={() => onSetQuery("best in " + city.toLowerCase())}
          onCuisineChange={(cuisine) => { onSetSelectedCuisine(cuisine); cuisine ? Analytics.cuisineFilterSelect(cuisine, "discover") : Analytics.cuisineFilterClear("discover"); }}
          entryCounts={dishEntryCounts}
        />
      )}

      {/* Active cuisine filter indicator */}
      {selectedCuisine && (
        <View style={s.activeCuisineRow}>
          <View style={s.activeCuisineChip}>
            <Text style={s.activeCuisineText}>
              {CUISINE_DISPLAY[selectedCuisine]?.emoji || ""} {CUISINE_DISPLAY[selectedCuisine]?.label || selectedCuisine}
            </Text>
            <TouchableOpacity
              onPress={() => { Haptics.selectionAsync(); onSetSelectedCuisine(null); }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Clear ${selectedCuisine} filter`}
            >
              <Ionicons name="close-circle" size={14} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={s.activeCuisineCount}>
            {filteredCount} result{filteredCount !== 1 ? "s" : ""}
          </Text>
        </View>
      )}

      {/* Featured / Promoted Listings */}
      {activeFilter === "Top 10" && <FeaturedSection featured={featuredBusinesses} />}

      {/* Trending section */}
      {!debouncedQuery && <TrendingSection trending={trending} />}
      {/* Sprint 617: Just Rated feed */}
      {!debouncedQuery && <JustRatedSection businesses={justRated} />}
      {/* Dish Leaderboards */}
      {!debouncedQuery && <DishLeaderboardSection city={city} />}
    </>
  );
}

const s = StyleSheet.create({
  discoverTip: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "#fff", borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, padding: 14, marginBottom: 12, marginHorizontal: 0,
    position: "relative" as const,
  },
  discoverTipTextStack: { flex: 1, gap: 2, paddingRight: 20 },
  discoverTipTitle: {
    fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  discoverTipSubtext: {
    fontSize: 12, fontWeight: "400", color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
  discoverTipClose: {
    position: "absolute" as const, top: 10, right: 10,
  },
  activeCuisineRow: {
    flexDirection: "row" as const, alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 4, paddingVertical: 6, marginBottom: 4,
  },
  activeCuisineChip: {
    flexDirection: "row" as const, alignItems: "center", gap: 6,
    backgroundColor: "rgba(196, 154, 26, 0.12)", paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 14, borderWidth: 1, borderColor: "rgba(196, 154, 26, 0.3)",
  },
  activeCuisineText: {
    fontSize: 12, fontWeight: "600" as const, color: "#8B6914", fontFamily: "DMSans_600SemiBold",
  },
  activeCuisineCount: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
});

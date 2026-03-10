/**
 * Sprint 383: Extracted & enhanced discover empty state.
 * Contextual messaging, "Be the first" CTA, nearby city suggestions.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { BRAND, getCategoryDisplay } from "@/constants/brand";
import { CUISINE_DISPLAY, CUISINE_DISH_MAP } from "@/shared/best-in-categories";
import { SUPPORTED_CITIES } from "@/lib/city-context";

const AMBER = BRAND.colors.amber;

interface PopularCategory {
  category: string;
  count: number;
}

export interface DiscoverEmptyStateProps {
  variant: "list" | "map";
  query: string;
  selectedCuisine: string | null;
  city: string;
  activeFilter: string;
  popularCategories: PopularCategory[];
  onClearCuisine: () => void;
  onSearchCategory: (category: string) => void;
  onCityChange: (city: string) => void;
}

export function DiscoverEmptyState({
  variant,
  query,
  selectedCuisine,
  city,
  activeFilter,
  popularCategories,
  onClearCuisine,
  onSearchCategory,
  onCityChange,
}: DiscoverEmptyStateProps) {
  const hasActiveSearch = query.trim().length > 0;
  const hasActiveFilter = activeFilter !== "All";
  const cityDisplay = city.replace(/_/g, " ");

  // Contextual icon based on state
  const icon = variant === "map"
    ? "map-outline"
    : hasActiveSearch
      ? "search-outline"
      : hasActiveFilter
        ? "filter-outline"
        : "restaurant-outline";

  // Contextual message
  const message = selectedCuisine && CUISINE_DISPLAY[selectedCuisine]
    ? `No ${CUISINE_DISPLAY[selectedCuisine].label.toLowerCase()} places found`
    : hasActiveSearch
      ? `No results for "${query.trim()}"`
      : hasActiveFilter
        ? `No ${activeFilter.toLowerCase()} places found`
        : "No results";

  const subtitle = hasActiveSearch
    ? "Try a different spelling or search term"
    : hasActiveFilter
      ? "Try removing some filters"
      : "Try a different search or filter";

  // Nearby city suggestions (show 2 cities that aren't the current one)
  const otherCities = SUPPORTED_CITIES
    .filter(c => c.key !== city)
    .slice(0, 2);

  return (
    <View style={s.container}>
      <View style={s.iconCircle}>
        <Ionicons name={icon as any} size={28} color={Colors.textTertiary} />
      </View>
      <Text style={s.message}>{message}</Text>
      <Text style={s.subtitle}>{subtitle}</Text>

      {/* Be the first CTA */}
      <TouchableOpacity
        style={s.beFirstBtn}
        onPress={() => router.push("/(tabs)/")}
        accessibilityRole="button"
        accessibilityLabel="Be the first to rate a restaurant"
      >
        <Ionicons name="star-outline" size={16} color={AMBER} />
        <Text style={s.beFirstText}>Be the first to rate in {cityDisplay}</Text>
      </TouchableOpacity>

      {/* Cuisine-aware dish suggestions */}
      {selectedCuisine && CUISINE_DISH_MAP[selectedCuisine] && !query.trim() && (
        <View style={s.dishSuggestions}>
          <Text style={s.dishTitle}>
            Explore {CUISINE_DISPLAY[selectedCuisine]?.label || selectedCuisine} dish rankings:
          </Text>
          {CUISINE_DISH_MAP[selectedCuisine].map((dish) => (
            <TouchableOpacity
              key={dish.slug}
              style={s.dishChip}
              onPress={() => router.push({ pathname: "/dish/[slug]", params: { slug: dish.slug } })}
            >
              <Text style={s.dishChipText}>
                {dish.emoji} Best {dish.name}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={AMBER} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Clear cuisine filter */}
      {selectedCuisine && !query.trim() && (
        <TouchableOpacity style={s.clearFilter} onPress={onClearCuisine}>
          <Text style={s.clearFilterText}>Show all cuisines</Text>
        </TouchableOpacity>
      )}

      {/* Popular categories (when no cuisine filter) */}
      {!selectedCuisine && variant === "list" && (
        <View style={s.suggestionsSection}>
          <Text style={s.suggestionsLabel}>Popular in {cityDisplay}</Text>
          <View style={s.suggestionsRow}>
            {(popularCategories.length > 0
              ? popularCategories.slice(0, 6)
              : [{ category: "Tacos", count: 0 }, { category: "Italian", count: 0 }, { category: "Brunch", count: 0 }, { category: "Sushi", count: 0 }]
            ).map(c => (
              <TouchableOpacity
                key={c.category}
                style={s.suggestionChip}
                onPress={() => onSearchCategory(c.category)}
                accessibilityRole="button"
                accessibilityLabel={`Search for ${c.category}`}
              >
                <Text style={s.chipEmoji}>
                  {getCategoryDisplay(c.category).emoji}
                </Text>
                <View style={s.chipInfo}>
                  <Text style={s.chipText}>
                    {getCategoryDisplay(c.category).label || c.category}
                  </Text>
                  {c.count > 0 && (
                    <Text style={s.chipCount}>{c.count} places</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Nearby city suggestions */}
      {otherCities.length > 0 && (
        <View style={s.citySection}>
          <Text style={s.cityLabel}>Try another city</Text>
          <View style={s.cityRow}>
            {otherCities.map(c => (
              <TouchableOpacity
                key={c.key}
                style={s.cityChip}
                onPress={() => onCityChange(c.key)}
                accessibilityRole="button"
                accessibilityLabel={`Switch to ${c.label}`}
              >
                <Text style={s.cityChipText}>{c.label}</Text>
                <Ionicons name="chevron-forward" size={12} color={AMBER} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { alignItems: "center", paddingTop: 48, gap: 8, paddingHorizontal: 24 },
  iconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.surfaceRaised, alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  message: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold", textAlign: "center" },
  subtitle: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", textAlign: "center" },
  beFirstBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 12, paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: `${AMBER}10`, borderRadius: 10,
    borderWidth: 1, borderColor: `${AMBER}25`,
  },
  beFirstText: { fontSize: 13, fontWeight: "600", color: AMBER, fontFamily: "DMSans_600SemiBold" },
  dishSuggestions: { marginTop: 16, width: "100%" as any },
  dishTitle: { fontSize: 12, fontWeight: "600", color: Colors.textTertiary, fontFamily: "DMSans_600SemiBold", marginBottom: 8 },
  dishChip: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 10, paddingHorizontal: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  dishChipText: { fontSize: 14, color: Colors.text, fontFamily: "DMSans_500Medium" },
  clearFilter: { marginTop: 8, paddingVertical: 8 },
  clearFilterText: { fontSize: 13, color: AMBER, fontFamily: "DMSans_600SemiBold" },
  suggestionsSection: { marginTop: 20, width: "100%" as any, gap: 10 },
  suggestionsLabel: {
    fontSize: 12, fontWeight: "600", color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold", textTransform: "uppercase" as any, letterSpacing: 0.8,
  },
  suggestionsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  suggestionChip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 9,
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    borderLeftWidth: 3, borderLeftColor: AMBER,
  },
  chipEmoji: { fontSize: 16 },
  chipInfo: { gap: 1 },
  chipText: { fontSize: 13, color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  chipCount: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  citySection: { marginTop: 20, width: "100%" as any, gap: 8 },
  cityLabel: {
    fontSize: 12, fontWeight: "600", color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold", textTransform: "uppercase" as any, letterSpacing: 0.8,
  },
  cityRow: { flexDirection: "row", gap: 8 },
  cityChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: Colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  cityChipText: { fontSize: 13, color: Colors.text, fontFamily: "DMSans_500Medium" },
});

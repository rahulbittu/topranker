/**
 * Sprint 383: Extracted & enhanced discover empty state.
 * Sprint 408: Search suggestions, filter reset, activity pulse, quick search pills.
 * Contextual messaging, "Be the first" CTA, nearby city suggestions.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];
import Colors from "@/constants/colors";
import { BRAND, getCategoryDisplay } from "@/constants/brand";
import { CUISINE_DISPLAY, CUISINE_DISH_MAP } from "@/shared/best-in-categories";
import { SUPPORTED_CITIES } from "@/lib/city-context";
import { pct } from "@/lib/style-helpers";
import { GooglePlacesFallback } from "@/components/search/GooglePlacesFallback";

const AMBER = BRAND.colors.amber;

// Sprint 408: Common quick-search terms by context
const QUICK_SEARCHES = [
  { label: "Biryani", emoji: "🍚" },
  { label: "Tacos", emoji: "🌮" },
  { label: "Pizza", emoji: "🍕" },
  { label: "Sushi", emoji: "🍣" },
  { label: "Brunch", emoji: "🥞" },
  { label: "BBQ", emoji: "🍖" },
];

// Sprint 408: Generate search suggestions based on the failed query
function getSearchSuggestions(query: string): string[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  const suggestions: string[] = [];
  // Suggest cuisine-based alternatives
  const cuisineKeys = Object.keys(CUISINE_DISPLAY);
  for (const key of cuisineKeys) {
    const label = CUISINE_DISPLAY[key].label.toLowerCase();
    if (label.includes(q.slice(0, 3)) || q.includes(label.slice(0, 3))) {
      suggestions.push(CUISINE_DISPLAY[key].label);
    }
  }
  // Suggest common terms
  const common = ["biryani", "tacos", "pizza", "sushi", "brunch", "curry", "ramen", "pho", "thai", "italian"];
  for (const term of common) {
    if (term.includes(q.slice(0, 3)) && !suggestions.map(s => s.toLowerCase()).includes(term)) {
      suggestions.push(term.charAt(0).toUpperCase() + term.slice(1));
    }
  }
  return suggestions.slice(0, 3);
}

// Sprint 408: Get filter-specific action text
function getFilterAction(activeFilter: string): { text: string; icon: string } | null {
  if (activeFilter === "All") return null;
  const map: Record<string, { text: string; icon: string }> = {
    "Top 10": { text: "Remove Top 10 filter to see all places", icon: "trophy-outline" },
    "Challenging": { text: "Remove Challenger filter to see all places", icon: "flash-outline" },
    "Trending": { text: "Remove Trending filter — no movers this week", icon: "trending-up-outline" },
    "Open Now": { text: "Remove Open Now filter — some places may be closed", icon: "time-outline" },
    "Near Me": { text: "Remove Near Me filter to see all places", icon: "navigate-outline" },
  };
  return map[activeFilter] || { text: `Remove ${activeFilter} filter`, icon: "close-circle-outline" };
}

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
  onClearFilter?: () => void;
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
  onClearFilter,
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

  // Sprint 408: Search suggestions
  const searchSuggestions = hasActiveSearch ? getSearchSuggestions(query) : [];

  // Sprint 408: Filter action
  const filterAction = getFilterAction(activeFilter);

  // Nearby city suggestions (show 2 cities that aren't the current one)
  const otherCities = SUPPORTED_CITIES
    .filter(c => c.key !== city)
    .slice(0, 2);

  return (
    <View style={s.container}>
      <View style={s.iconCircle}>
        <Ionicons name={icon as IoniconsName} size={28} color={Colors.textTertiary} />
      </View>
      <Text style={s.message}>{message}</Text>
      <Text style={s.subtitle}>{subtitle}</Text>

      {/* Sprint 408: Search suggestions when query has no results */}
      {searchSuggestions.length > 0 && (
        <View style={s.suggestSection}>
          <Text style={s.suggestLabel}>Did you mean?</Text>
          <View style={s.suggestRow}>
            {searchSuggestions.map(term => (
              <TouchableOpacity
                key={term}
                style={s.suggestChip}
                onPress={() => onSearchCategory(term)}
                accessibilityRole="button"
                accessibilityLabel={`Search for ${term}`}
              >
                <Ionicons name="search" size={12} color={AMBER} />
                <Text style={s.suggestChipText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Sprint 408: Filter-specific reset action */}
      {hasActiveFilter && filterAction && onClearFilter && (
        <TouchableOpacity
          style={s.filterResetBtn}
          onPress={onClearFilter}
          accessibilityRole="button"
          accessibilityLabel={filterAction.text}
        >
          <Ionicons name={filterAction.icon as IoniconsName} size={14} color={AMBER} />
          <Text style={s.filterResetText}>{filterAction.text}</Text>
        </TouchableOpacity>
      )}

      {/* Sprint 408: Quick search pills when no query and no cuisine filter */}
      {!hasActiveSearch && !selectedCuisine && variant === "list" && popularCategories.length === 0 && (
        <View style={s.quickSearchSection}>
          <Text style={s.quickSearchLabel}>Quick search</Text>
          <View style={s.quickSearchRow}>
            {QUICK_SEARCHES.map(qs => (
              <TouchableOpacity
                key={qs.label}
                style={s.quickSearchPill}
                onPress={() => onSearchCategory(qs.label)}
                accessibilityRole="button"
                accessibilityLabel={`Search for ${qs.label}`}
              >
                <Text style={s.quickSearchEmoji}>{qs.emoji}</Text>
                <Text style={s.quickSearchText}>{qs.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

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

      {/* Sprint 623: Google Places fallback for empty results */}
      {!hasActiveSearch && variant === "list" && (
        <GooglePlacesFallback city={city} />
      )}

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

  // Sprint 408: Search suggestions
  suggestSection: { marginTop: 12, width: pct(100), gap: 6 },
  suggestLabel: {
    fontSize: 12, fontWeight: "600", color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold",
  },
  suggestRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: `${AMBER}08`, borderRadius: 10,
    borderWidth: 1, borderColor: `${AMBER}20`,
  },
  suggestChipText: {
    fontSize: 13, color: Colors.text, fontFamily: "DMSans_500Medium",
  },

  // Sprint 408: Filter reset
  filterResetBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 8, paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: Colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterResetText: {
    fontSize: 12, color: AMBER, fontFamily: "DMSans_500Medium",
  },

  // Sprint 408: Quick search pills
  quickSearchSection: { marginTop: 16, width: pct(100), gap: 8 },
  quickSearchLabel: {
    fontSize: 12, fontWeight: "600", color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold", textTransform: "uppercase" as const, letterSpacing: 0.8,
  },
  quickSearchRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  quickSearchPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: Colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  quickSearchEmoji: { fontSize: 14 },
  quickSearchText: { fontSize: 13, color: Colors.text, fontFamily: "DMSans_500Medium" },

  dishSuggestions: { marginTop: 16, width: pct(100) },
  dishTitle: { fontSize: 12, fontWeight: "600", color: Colors.textTertiary, fontFamily: "DMSans_600SemiBold", marginBottom: 8 },
  dishChip: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 10, paddingHorizontal: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  dishChipText: { fontSize: 14, color: Colors.text, fontFamily: "DMSans_500Medium" },
  clearFilter: { marginTop: 8, paddingVertical: 8 },
  clearFilterText: { fontSize: 13, color: AMBER, fontFamily: "DMSans_600SemiBold" },
  suggestionsSection: { marginTop: 20, width: pct(100), gap: 10 },
  suggestionsLabel: {
    fontSize: 12, fontWeight: "600", color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold", textTransform: "uppercase" as const, letterSpacing: 0.8,
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
  citySection: { marginTop: 20, width: pct(100), gap: 8 },
  cityLabel: {
    fontSize: 12, fontWeight: "600", color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold", textTransform: "uppercase" as const, letterSpacing: 0.8,
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

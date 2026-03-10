/**
 * Sprint 193: Extracted from search.tsx to reduce file size.
 *
 * SearchOverlays renders:
 * - Autocomplete dropdown (typeahead results)
 * - Recent searches panel (when focused with empty query)
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { getCategoryDisplay, BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import type { AutocompleteSuggestion } from "@/lib/api";
import { Analytics } from "@/lib/analytics";
import { CUISINE_DISPLAY } from "@/shared/best-in-categories";

const AMBER = BRAND.colors.amber;

export interface DishMatch {
  slug: string;
  name: string;
  emoji: string;
  entryCount: number;
}

// Sprint 399: Highlight matching text in autocomplete results
function HighlightedName({ name, query }: { name: string; query: string }) {
  if (!query || query.length < 2) return <Text style={styles.autocompleteName} numberOfLines={1}>{name}</Text>;
  const idx = name.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <Text style={styles.autocompleteName} numberOfLines={1}>{name}</Text>;
  return (
    <Text style={styles.autocompleteName} numberOfLines={1}>
      {name.slice(0, idx)}
      <Text style={styles.highlightMatch}>{name.slice(idx, idx + query.length)}</Text>
      {name.slice(idx + query.length)}
    </Text>
  );
}

// Sprint 399: Match cuisine categories against search query
function matchCuisineCategories(query: string): { key: string; label: string; emoji: string }[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().trim();
  return Object.entries(CUISINE_DISPLAY)
    .filter(([key, val]) => key.includes(q) || val.label.toLowerCase().includes(q))
    .slice(0, 3)
    .map(([key, val]) => ({ key, label: val.label, emoji: val.emoji }));
}

export interface CuisineMatch {
  key: string;
  label: string;
  emoji: string;
}

interface AutocompleteDropdownProps {
  results: AutocompleteSuggestion[];
  dishMatches?: DishMatch[];
  query?: string;
  onCuisineSelect?: (cuisine: string) => void;
  onDismiss: () => void;
}

export function AutocompleteDropdown({ results, dishMatches = [], query = "", onCuisineSelect, onDismiss }: AutocompleteDropdownProps) {
  const cuisineMatches = matchCuisineCategories(query);
  if (results.length === 0 && dishMatches.length === 0 && cuisineMatches.length === 0) return null;
  const totalResults = results.length + dishMatches.length;
  return (
    <View style={styles.autocompleteDropdown}>
      {/* Sprint 399: Cuisine category suggestions */}
      {cuisineMatches.length > 0 && onCuisineSelect && (
        <View style={styles.cuisineMatchRow}>
          {cuisineMatches.map((cm) => (
            <TouchableOpacity
              key={cm.key}
              style={styles.cuisineMatchChip}
              onPress={() => { onCuisineSelect(cm.key); onDismiss(); }}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${cm.label} cuisine`}
            >
              <Text style={styles.cuisineMatchEmoji}>{cm.emoji}</Text>
              <Text style={styles.cuisineMatchText}>{cm.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {/* Sprint 313: Dish leaderboard matches */}
      {dishMatches.map((dish) => (
        <TouchableOpacity
          key={`dish-${dish.slug}`}
          style={styles.autocompleteRow}
          onPress={() => {
            Analytics.dishSearchMatchTap(dish.slug);
            router.push({ pathname: "/dish/[slug]", params: { slug: dish.slug } });
            onDismiss();
          }}
          accessibilityRole="button"
          accessibilityLabel={`Best ${dish.name} leaderboard`}
        >
          <Text style={{ fontSize: 16 }}>{dish.emoji}</Text>
          <View style={styles.autocompleteInfo}>
            <HighlightedName name={`Best ${dish.name}`} query={query} />
            <Text style={styles.autocompleteMeta} numberOfLines={1}>
              {dish.entryCount > 0 ? `${dish.entryCount} spots ranked` : "Dish leaderboard"}
            </Text>
          </View>
          <View style={styles.dishBadge}>
            <Text style={styles.dishBadgeText}>Ranking</Text>
          </View>
        </TouchableOpacity>
      ))}
      {results.map((item) => {
        const displayCat = getCategoryDisplay(item.cuisine || item.category);
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.autocompleteRow}
            onPress={() => {
              router.push({ pathname: "/business/[id]", params: { id: item.slug } });
              onDismiss();
            }}
            accessibilityRole="button"
            accessibilityLabel={`Go to ${item.name}`}
          >
            <Text style={styles.autocompleteEmoji}>{displayCat.emoji || "🍽"}</Text>
            <View style={styles.autocompleteInfo}>
              <HighlightedName name={item.name} query={query} />
              <Text style={styles.autocompleteMeta} numberOfLines={1}>
                {getCategoryDisplay(item.category).label}
                {item.neighborhood ? ` · ${item.neighborhood}` : ""}
              </Text>
            </View>
            {item.weightedScore != null && item.weightedScore > 0 && (
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreBadgeText}>{item.weightedScore.toFixed(1)}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
          </TouchableOpacity>
        );
      })}
      {/* Sprint 399: Result count footer */}
      {totalResults > 0 && (
        <View style={styles.resultCountFooter}>
          <Text style={styles.resultCountText}>{totalResults} result{totalResults !== 1 ? "s" : ""}</Text>
        </View>
      )}
    </View>
  );
}

interface RecentSearchesPanelProps {
  searches: string[];
  onSelect: (term: string) => void;
  onClear: () => void;
}

export function RecentSearchesPanel({ searches, onSelect, onClear }: RecentSearchesPanelProps) {
  if (searches.length === 0) return null;
  return (
    <View style={styles.recentSearchesContainer}>
      <View style={styles.recentSearchesHeader}>
        <Text style={styles.recentSearchesTitle}>Recent</Text>
        <TouchableOpacity onPress={onClear} accessibilityRole="button" accessibilityLabel="Clear recent searches">
          <Text style={styles.recentSearchesClear}>Clear</Text>
        </TouchableOpacity>
      </View>
      {searches.slice(0, 5).map((term) => (
        <TouchableOpacity
          key={term}
          style={styles.recentSearchRow}
          onPress={() => onSelect(term)}
          accessibilityRole="button"
          accessibilityLabel={`Search for ${term}`}
        >
          <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.recentSearchText}>{term}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  autocompleteDropdown: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    overflow: "hidden",
    ...Colors.cardShadow,
  },
  autocompleteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  autocompleteEmoji: { fontSize: 18 },
  autocompleteInfo: { flex: 1, gap: 1 },
  scoreBadge: {
    backgroundColor: "rgba(196,154,26,0.12)", borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2, marginRight: 2,
  },
  scoreBadgeText: { fontSize: 11, fontWeight: "700", color: AMBER },
  autocompleteName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  autocompleteMeta: {
    ...TYPOGRAPHY.ui.caption,
    color: Colors.textSecondary,
  },
  dishBadge: {
    backgroundColor: "rgba(196,154,26,0.12)", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  dishBadgeText: { fontSize: 10, fontWeight: "700", color: AMBER },
  // Sprint 399: Highlight matching text
  highlightMatch: {
    fontWeight: "700" as const,
    color: AMBER,
    fontFamily: "DMSans_700Bold",
  },
  // Sprint 399: Cuisine category suggestions
  cuisineMatchRow: {
    flexDirection: "row" as const, flexWrap: "wrap" as const,
    gap: 6, paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  cuisineMatchChip: {
    flexDirection: "row" as const, alignItems: "center" as const, gap: 4,
    backgroundColor: "rgba(196,154,26,0.08)", paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 14,
  },
  cuisineMatchEmoji: { fontSize: 12 },
  cuisineMatchText: {
    fontSize: 12, fontWeight: "600" as const, color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  // Sprint 399: Result count footer
  resultCountFooter: {
    paddingVertical: 6, alignItems: "center" as const,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  resultCountText: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  recentSearchesContainer: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    overflow: "hidden",
  },
  recentSearchesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recentSearchesTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold",
  },
  recentSearchesClear: {
    fontSize: 12,
    color: AMBER,
    fontFamily: "DMSans_500Medium",
  },
  recentSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recentSearchText: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: "DMSans_400Regular",
  },
});

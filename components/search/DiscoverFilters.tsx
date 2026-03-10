/**
 * Sprint 332: Extracted filter/price/sort chips from search.tsx
 * Reduces search.tsx LOC while keeping all filter functionality.
 */
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

const AMBER = BRAND.colors.amber;

type FilterType = "All" | "Top 10" | "Challenging" | "Trending" | "Open Now" | "Near Me";
const FILTERS: FilterType[] = ["All", "Top 10", "Challenging", "Trending", "Open Now", "Near Me"];

interface FilterChipsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  locationLoading: boolean;
  onNearMe: () => void;
}

export const FilterChips = React.memo(function FilterChips({
  activeFilter, onFilterChange, locationLoading, onNearMe,
}: FilterChipsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={styles.filterScrollRow}>
      {FILTERS.map(f => (
        <TouchableOpacity
          key={f}
          onPress={() => {
            Haptics.selectionAsync();
            onFilterChange(f);
            if (f === "Near Me") onNearMe();
          }}
          style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
          accessibilityRole="button"
          accessibilityLabel={`${f} filter`}
          accessibilityState={{ selected: activeFilter === f }}
        >
          {f === "Near Me" && <Ionicons name="navigate-outline" size={12} color={activeFilter === f ? "#fff" : Colors.textSecondary} style={{ marginRight: 3 }} />}
          <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
            {f === "Near Me" && locationLoading ? "Locating..." : f}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
});

interface PriceChipsProps {
  priceFilter: string | null;
  onPriceChange: (price: string | null) => void;
}

export const PriceChips = React.memo(function PriceChips({
  priceFilter, onPriceChange,
}: PriceChipsProps) {
  return (
    <View style={styles.priceRow}>
      {["$", "$$", "$$$", "$$$$"].map(p => (
        <TouchableOpacity
          key={p}
          onPress={() => { Haptics.selectionAsync(); onPriceChange(priceFilter === p ? null : p); }}
          style={[styles.priceChip, priceFilter === p && styles.priceChipActive]}
          accessibilityRole="button"
          accessibilityLabel={`Price ${p}${priceFilter === p ? ", selected" : ""}`}
          accessibilityHint="Double tap to filter by this price range"
          accessibilityState={{ selected: priceFilter === p }}
        >
          <Text style={[styles.priceChipText, priceFilter === p && styles.priceChipTextActive]}>{p}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

interface SortChipsProps {
  sortBy: "ranked" | "rated" | "trending" | "relevant";
  onSortChange: (sort: "ranked" | "rated" | "trending" | "relevant") => void;
  showRelevant?: boolean;
}

export const SortChips = React.memo(function SortChips({
  sortBy, onSortChange, showRelevant,
}: SortChipsProps) {
  type SortKey = "ranked" | "rated" | "trending" | "relevant";
  const options: [SortKey, string, string][] = [
    ...(showRelevant ? [["relevant", "Relevant", "search-outline"] as [SortKey, string, string]] : []),
    ["ranked", "Ranked", "trophy-outline"],
    ["rated", "Most Rated", "star-outline"],
    ["trending", "Trending", "trending-up-outline"],
  ];
  return (
    <View style={styles.sortRow}>
      <Text style={styles.sortLabel}>Sort:</Text>
      {options.map(([key, label, icon]) => (
        <TouchableOpacity
          key={key}
          onPress={() => { Haptics.selectionAsync(); onSortChange(key); }}
          style={[styles.sortChip, sortBy === key && styles.sortChipActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: sortBy === key }}
          accessibilityLabel={`Sort by ${label}`}
        >
          {sortBy === key && <Ionicons name={icon as IoniconsName} size={10} color="#fff" style={{ marginRight: 3 }} />}
          <Text style={[styles.sortChipText, sortBy === key && styles.sortChipTextActive]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

// Sprint 456: Extracted to FilterChipsExtended.tsx — re-export for backward compatibility
export { DietaryTagChips, getDietaryTags, DistanceChips, getDistanceOptions, HoursFilterChips, getHoursFilters } from "./FilterChipsExtended";
export type { DietaryTag, DistanceOption, HoursFilter } from "./FilterChipsExtended";

// Sprint 412: Sort-aware results header
const SORT_DESCRIPTIONS: Record<string, { label: string; icon: string; hint: string }> = {
  ranked: { label: "By Rank", icon: "trophy-outline", hint: "Sorted by leaderboard position" },
  rated: { label: "Most Rated", icon: "star-outline", hint: "Sorted by total rating count" },
  trending: { label: "Trending", icon: "trending-up-outline", hint: "Sorted by rank movement this week" },
  relevant: { label: "Relevant", icon: "search-outline", hint: "Sorted by name match, category, and rating volume" },
};

interface SortResultsHeaderProps {
  count: number;
  sortBy: string;
  activeFilter: string;
}

export function SortResultsHeader({ count, sortBy, activeFilter }: SortResultsHeaderProps) {
  const sortInfo = SORT_DESCRIPTIONS[sortBy] || SORT_DESCRIPTIONS.ranked;
  const filterLabel = activeFilter !== "All" ? ` · ${activeFilter}` : "";
  return (
    <View style={styles.sortResultsHeader}>
      <View style={styles.sortResultsLeft}>
        <Text style={styles.sortResultsCount}>{count} result{count !== 1 ? "s" : ""}</Text>
        <View style={styles.sortIndicator}>
          <Ionicons name={sortInfo.icon as IoniconsName} size={10} color={AMBER} />
          <Text style={styles.sortIndicatorText}>{sortInfo.label}{filterLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: { gap: 6, flexDirection: "row", alignItems: "center" },
  filterScrollRow: { marginBottom: 6 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: AMBER, borderColor: AMBER },
  filterText: { fontSize: 12, fontWeight: "500", color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  filterTextActive: { color: "#fff", fontWeight: "600" },

  priceRow: {
    flexDirection: "row", paddingHorizontal: 0, gap: 8, paddingBottom: 10,
  },
  priceChip: {
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 16,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  priceChipActive: { backgroundColor: AMBER, borderColor: AMBER },
  priceChipText: {
    fontSize: 12, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold",
  },
  priceChipTextActive: { color: "#fff" },

  sortRow: {
    flexDirection: "row", alignItems: "center", gap: 6, paddingBottom: 10,
  },
  sortLabel: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_500Medium", marginRight: 2,
  },
  sortChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  sortChipActive: {
    backgroundColor: BRAND.colors.navy, borderColor: BRAND.colors.navy,
  },
  sortChipText: {
    fontSize: 11, fontWeight: "500", color: Colors.textSecondary, fontFamily: "DMSans_500Medium",
  },
  sortChipTextActive: { color: "#fff", fontWeight: "600" },

  // Sprint 412: Sort results header
  sortResultsHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingBottom: 4,
  },
  sortResultsLeft: {
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  sortResultsCount: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  sortIndicator: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: `${AMBER}10`, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6,
  },
  sortIndicatorText: {
    fontSize: 10, color: AMBER, fontFamily: "DMSans_500Medium",
  },

});

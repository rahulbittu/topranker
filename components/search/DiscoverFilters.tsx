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

// Sprint 442: Dietary tag filter chips
export type DietaryTag = "vegetarian" | "vegan" | "halal" | "gluten_free";
const DIETARY_TAGS: { key: DietaryTag; label: string; icon: IoniconsName }[] = [
  { key: "vegetarian", label: "Vegetarian", icon: "leaf-outline" },
  { key: "vegan", label: "Vegan", icon: "nutrition-outline" },
  { key: "halal", label: "Halal", icon: "checkmark-circle-outline" },
  { key: "gluten_free", label: "Gluten-Free", icon: "ban-outline" },
];

interface DietaryTagChipsProps {
  activeTags: DietaryTag[];
  onTagToggle: (tag: DietaryTag) => void;
}

export const DietaryTagChips = React.memo(function DietaryTagChips({
  activeTags, onTagToggle,
}: DietaryTagChipsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={styles.dietaryScrollRow}>
      {DIETARY_TAGS.map(({ key, label, icon }) => {
        const active = activeTags.includes(key);
        return (
          <TouchableOpacity
            key={key}
            onPress={() => { Haptics.selectionAsync(); onTagToggle(key); }}
            style={[styles.dietaryChip, active && styles.dietaryChipActive]}
            accessibilityRole="button"
            accessibilityLabel={`${label} filter${active ? ", selected" : ""}`}
            accessibilityState={{ selected: active }}
          >
            <Ionicons name={icon} size={12} color={active ? "#fff" : Colors.textSecondary} style={{ marginRight: 3 }} />
            <Text style={[styles.dietaryText, active && styles.dietaryTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

export function getDietaryTags(): typeof DIETARY_TAGS { return DIETARY_TAGS; }

// Sprint 442: Distance filter chips
export type DistanceOption = 1 | 3 | 5 | 10 | null;
const DISTANCE_OPTIONS: { value: DistanceOption; label: string }[] = [
  { value: 1, label: "1 km" },
  { value: 3, label: "3 km" },
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
];

interface DistanceChipsProps {
  activeDistance: DistanceOption;
  onDistanceChange: (distance: DistanceOption) => void;
  hasLocation: boolean;
}

export const DistanceChips = React.memo(function DistanceChips({
  activeDistance, onDistanceChange, hasLocation,
}: DistanceChipsProps) {
  if (!hasLocation) return null; // Only show when location is available
  return (
    <View style={styles.distanceRow}>
      <Ionicons name="location-outline" size={12} color={Colors.textTertiary} style={{ marginRight: 4 }} />
      <Text style={styles.distanceLabel}>Distance:</Text>
      {DISTANCE_OPTIONS.map(({ value, label }) => {
        const active = activeDistance === value;
        return (
          <TouchableOpacity
            key={value}
            onPress={() => { Haptics.selectionAsync(); onDistanceChange(active ? null : value); }}
            style={[styles.distanceChip, active && styles.distanceChipActive]}
            accessibilityRole="button"
            accessibilityLabel={`Within ${label}${active ? ", selected" : ""}`}
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.distanceChipText, active && styles.distanceChipTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

export function getDistanceOptions(): typeof DISTANCE_OPTIONS { return DISTANCE_OPTIONS; }

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

  // Sprint 442: Dietary tag chips
  dietaryScrollRow: { marginBottom: 6 },
  dietaryChip: {
    flexDirection: "row" as const, alignItems: "center" as const,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  dietaryChipActive: { backgroundColor: "#2D8F4E", borderColor: "#2D8F4E" },
  dietaryText: { fontSize: 11, fontWeight: "500" as const, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  dietaryTextActive: { color: "#fff", fontWeight: "600" as const },

  // Sprint 442: Distance chips
  distanceRow: {
    flexDirection: "row" as const, alignItems: "center" as const, gap: 6, paddingBottom: 10,
  },
  distanceLabel: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_500Medium", marginRight: 2,
  },
  distanceChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  distanceChipActive: { backgroundColor: BRAND.colors.navy, borderColor: BRAND.colors.navy },
  distanceChipText: {
    fontSize: 11, fontWeight: "500" as const, color: Colors.textSecondary, fontFamily: "DMSans_500Medium",
  },
  distanceChipTextActive: { color: "#fff", fontWeight: "600" as const },
});

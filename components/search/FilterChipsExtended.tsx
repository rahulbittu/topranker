/**
 * Sprint 456: Extracted from DiscoverFilters.tsx
 * Contains DietaryTagChips, DistanceChips, HoursFilterChips.
 * Extracted to keep DiscoverFilters under 400 LOC threshold.
 */
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

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
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow} style={s.dietaryScrollRow}>
      {DIETARY_TAGS.map(({ key, label, icon }) => {
        const active = activeTags.includes(key);
        return (
          <TouchableOpacity
            key={key}
            onPress={() => { Haptics.selectionAsync(); onTagToggle(key); }}
            style={[s.dietaryChip, active && s.dietaryChipActive]}
            accessibilityRole="button"
            accessibilityLabel={`${label} filter${active ? ", selected" : ""}`}
            accessibilityState={{ selected: active }}
          >
            <Ionicons name={icon} size={12} color={active ? "#fff" : Colors.textSecondary} style={{ marginRight: 3 }} />
            <Text style={[s.dietaryText, active && s.dietaryTextActive]}>{label}</Text>
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
  if (!hasLocation) return null;
  return (
    <View style={s.distanceRow}>
      <Ionicons name="location-outline" size={12} color={Colors.textTertiary} style={{ marginRight: 4 }} />
      <Text style={s.distanceLabel}>Distance:</Text>
      {DISTANCE_OPTIONS.map(({ value, label }) => {
        const active = activeDistance === value;
        return (
          <TouchableOpacity
            key={value}
            onPress={() => { Haptics.selectionAsync(); onDistanceChange(active ? null : value); }}
            style={[s.distanceChip, active && s.distanceChipActive]}
            accessibilityRole="button"
            accessibilityLabel={`Within ${label}${active ? ", selected" : ""}`}
            accessibilityState={{ selected: active }}
          >
            <Text style={[s.distanceChipText, active && s.distanceChipTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

export function getDistanceOptions(): typeof DISTANCE_OPTIONS { return DISTANCE_OPTIONS; }

// Sprint 447: Hours-based filter chips
export type HoursFilter = "openNow" | "openLate" | "openWeekends";
const HOURS_FILTERS: { key: HoursFilter; label: string; icon: IoniconsName }[] = [
  { key: "openNow", label: "Open Now", icon: "time-outline" },
  { key: "openLate", label: "Open Late", icon: "moon-outline" },
  { key: "openWeekends", label: "Weekends", icon: "calendar-outline" },
];

interface HoursFilterChipsProps {
  activeFilters: HoursFilter[];
  onFilterToggle: (filter: HoursFilter) => void;
}

export const HoursFilterChips = React.memo(function HoursFilterChips({
  activeFilters, onFilterToggle,
}: HoursFilterChipsProps) {
  return (
    <View style={s.hoursRow}>
      <Ionicons name="time-outline" size={12} color={Colors.textTertiary} style={{ marginRight: 4 }} />
      <Text style={s.hoursLabel}>Hours:</Text>
      {HOURS_FILTERS.map(({ key, label, icon }) => {
        const active = activeFilters.includes(key);
        return (
          <TouchableOpacity
            key={key}
            onPress={() => { Haptics.selectionAsync(); onFilterToggle(key); }}
            style={[s.hoursChip, active && s.hoursChipActive]}
            accessibilityRole="button"
            accessibilityLabel={`${label} filter${active ? ", selected" : ""}`}
            accessibilityState={{ selected: active }}
          >
            <Ionicons name={icon} size={10} color={active ? "#fff" : Colors.textSecondary} style={{ marginRight: 3 }} />
            <Text style={[s.hoursChipText, active && s.hoursChipTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

export function getHoursFilters(): typeof HOURS_FILTERS { return HOURS_FILTERS; }

const s = StyleSheet.create({
  filterRow: { gap: 6, flexDirection: "row" as const, alignItems: "center" as const, paddingHorizontal: 16 },

  // Dietary
  dietaryScrollRow: { marginBottom: 2, marginHorizontal: -16 },
  dietaryChip: {
    flexDirection: "row" as const, alignItems: "center" as const,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  dietaryChipActive: { backgroundColor: "#2D8F4E", borderColor: "#2D8F4E" },
  dietaryText: { fontSize: 11, fontWeight: "500" as const, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  dietaryTextActive: { color: "#fff", fontWeight: "600" as const },

  // Distance
  distanceRow: {
    flexDirection: "row" as const, alignItems: "center" as const, gap: 6, paddingBottom: 2,
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

  // Hours
  hoursRow: {
    flexDirection: "row" as const, alignItems: "center" as const, gap: 6, paddingBottom: 2,
  },
  hoursLabel: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_500Medium", marginRight: 2,
  },
  hoursChip: {
    flexDirection: "row" as const, alignItems: "center" as const,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  hoursChipActive: { backgroundColor: "#6B4EAA", borderColor: "#6B4EAA" },
  hoursChipText: {
    fontSize: 11, fontWeight: "500" as const, color: Colors.textSecondary, fontFamily: "DMSans_500Medium",
  },
  hoursChipTextActive: { color: "#fff", fontWeight: "600" as const },
});

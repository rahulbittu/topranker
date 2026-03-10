/**
 * Sprint 331: Extracted CuisineChipRow — shared between sticky bar and in-scroll.
 * Reduces duplication in index.tsx.
 */
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { CUISINE_DISPLAY } from "@/shared/best-in-categories";
import { Analytics } from "@/lib/analytics";

const AMBER = BRAND.colors.amber;

interface CuisineChipRowProps {
  cuisines: string[];
  selectedCuisine: string | null;
  onSelect: (cuisine: string | null) => void;
  analyticsSource: string;
  variant?: "default" | "sticky";
}

export const CuisineChipRow = React.memo(function CuisineChipRow({
  cuisines,
  selectedCuisine,
  onSelect,
  analyticsSource,
  variant = "default",
}: CuisineChipRowProps) {
  const isSticky = variant === "sticky";
  const chipStyle = isSticky ? styles.stickyChip : styles.chip;
  const chipActiveStyle = isSticky ? styles.stickyChipActive : styles.chipActive;
  const textStyle = isSticky ? styles.stickyText : styles.text;
  const textActiveStyle = isSticky ? styles.stickyTextActive : styles.textActive;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={isSticky ? styles.stickyContainer : styles.container}
      style={isSticky ? undefined : styles.row}
    >
      <TouchableOpacity
        onPress={() => { Haptics.selectionAsync(); onSelect(null); Analytics.cuisineFilterClear(analyticsSource); }}
        style={[chipStyle, selectedCuisine === null && chipActiveStyle]}
        accessibilityRole="button"
        accessibilityLabel={`All cuisines${selectedCuisine === null ? ", selected" : ""}`}
        accessibilityState={{ selected: selectedCuisine === null }}
      >
        <Text style={[textStyle, selectedCuisine === null && textActiveStyle]}>All</Text>
      </TouchableOpacity>
      {cuisines.filter(c => c !== "universal").map((cuisine) => {
        const display = CUISINE_DISPLAY[cuisine] || { label: cuisine, emoji: "" };
        const isSelected = selectedCuisine === cuisine;
        return (
          <TouchableOpacity
            key={cuisine}
            onPress={() => { Haptics.selectionAsync(); onSelect(cuisine); Analytics.cuisineFilterSelect(cuisine, analyticsSource); }}
            style={[chipStyle, isSelected && chipActiveStyle]}
            accessibilityRole="button"
            accessibilityLabel={`${display.label} cuisine${isSelected ? ", selected" : ""}`}
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={[textStyle, isSelected && textActiveStyle]}>
              {display.emoji} {display.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  // Default (in-scroll) variant
  row: { flexGrow: 0, minHeight: 44, marginBottom: 4 },
  container: { paddingHorizontal: 16, flexDirection: "row", paddingVertical: 4 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    marginRight: 6, backgroundColor: "rgba(13, 27, 42, 0.06)",
    borderWidth: 1, borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: "rgba(13, 27, 42, 0.12)", borderColor: BRAND.colors.navy,
  },
  text: {
    fontSize: 12, fontFamily: "DMSans_500Medium", color: Colors.textSecondary,
  },
  textActive: {
    color: BRAND.colors.navy, fontFamily: "DMSans_700Bold",
  },
  // Sticky variant
  stickyContainer: {
    paddingHorizontal: 16, flexDirection: "row", paddingVertical: 6, gap: 6,
  },
  stickyChip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16,
    backgroundColor: "rgba(13, 27, 42, 0.06)",
    borderWidth: 1, borderColor: "transparent",
  },
  stickyChipActive: {
    backgroundColor: "rgba(13, 27, 42, 0.12)", borderColor: BRAND.colors.navy,
  },
  stickyText: {
    fontSize: 12, fontFamily: "DMSans_500Medium", color: Colors.textSecondary,
  },
  stickyTextActive: {
    color: BRAND.colors.navy, fontFamily: "DMSans_700Bold",
  },
});

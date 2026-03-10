// Sprint 553: Extracted from app/(tabs)/index.tsx — neighborhood + price filter chips
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

const AMBER = BRAND.colors.amber;
const PRICE_OPTIONS = ["$", "$$", "$$$", "$$$$"] as const;

interface LeaderboardFilterChipsProps {
  neighborhoods: string[];
  neighborhoodFilter: string | null;
  setNeighborhoodFilter: (v: string | null) => void;
  priceFilter: string | null;
  setPriceFilter: (v: string | null) => void;
}

export function LeaderboardFilterChips({
  neighborhoods, neighborhoodFilter, setNeighborhoodFilter,
  priceFilter, setPriceFilter,
}: LeaderboardFilterChipsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.row} contentContainerStyle={s.content}>
      {neighborhoods.length > 0 && neighborhoods.slice(0, 8).map((n) => (
        <TouchableOpacity
          key={n}
          style={[s.chip, neighborhoodFilter === n && s.chipActive]}
          onPress={() => { Haptics.selectionAsync(); setNeighborhoodFilter(neighborhoodFilter === n ? null : n); }}
          accessibilityRole="button"
          accessibilityLabel={`Filter by ${n}`}
        >
          <Ionicons name="location-outline" size={11} color={neighborhoodFilter === n ? "#fff" : Colors.textSecondary} />
          <Text style={[s.chipText, neighborhoodFilter === n && s.chipTextActive]}>{n}</Text>
        </TouchableOpacity>
      ))}
      {PRICE_OPTIONS.map((p) => (
        <TouchableOpacity
          key={p}
          style={[s.chip, priceFilter === p && s.chipActive]}
          onPress={() => { Haptics.selectionAsync(); setPriceFilter(priceFilter === p ? null : p); }}
          accessibilityRole="button"
          accessibilityLabel={`Filter by price ${p}`}
        >
          <Text style={[s.chipText, priceFilter === p && s.chipTextActive]}>{p}</Text>
        </TouchableOpacity>
      ))}
      {(neighborhoodFilter || priceFilter) && (
        <TouchableOpacity
          style={s.clearChip}
          onPress={() => { setNeighborhoodFilter(null); setPriceFilter(null); }}
          accessibilityRole="button"
          accessibilityLabel="Clear all filters"
        >
          <Ionicons name="close-circle" size={12} color={Colors.textTertiary} />
          <Text style={s.clearText}>Clear</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { maxHeight: 36, marginBottom: 4 },
  content: { paddingHorizontal: 16, gap: 6, alignItems: "center" as const },
  chip: {
    flexDirection: "row" as const, alignItems: "center" as const, gap: 3,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: AMBER, borderColor: AMBER },
  chipText: { fontSize: 11, fontWeight: "600" as const, color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  chipTextActive: { color: "#fff" },
  clearChip: {
    flexDirection: "row" as const, alignItems: "center" as const, gap: 3,
    paddingHorizontal: 8, paddingVertical: 6, borderRadius: 16,
  },
  clearText: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_500Medium" },
});

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

const AMBER = BRAND.colors.amber;

interface AutocompleteDropdownProps {
  results: AutocompleteSuggestion[];
  onDismiss: () => void;
}

export function AutocompleteDropdown({ results, onDismiss }: AutocompleteDropdownProps) {
  if (results.length === 0) return null;
  return (
    <View style={styles.autocompleteDropdown}>
      {results.map((item) => (
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
          <Ionicons name="restaurant-outline" size={14} color={AMBER} />
          <View style={styles.autocompleteInfo}>
            <Text style={styles.autocompleteName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.autocompleteMeta} numberOfLines={1}>
              {getCategoryDisplay(item.category).emoji} {getCategoryDisplay(item.category).label}
              {item.neighborhood ? ` · ${item.neighborhood}` : ""}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
      ))}
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
  autocompleteInfo: { flex: 1, gap: 1 },
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

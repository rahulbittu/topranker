/**
 * Sprint 377: Extracted SavedPlacesSection from profile.tsx
 * Contains saved places header, summary stats, saved list, and empty state.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { SavedRow } from "./SavedRow";
import type { BookmarkEntry } from "@/lib/bookmarks-context";

const AMBER = BRAND.colors.amber;

export interface SavedPlacesSectionProps {
  savedList: BookmarkEntry[];
  bookmarkCount: number;
}

export function SavedPlacesSection({ savedList, bookmarkCount }: SavedPlacesSectionProps) {
  return (
    <>
      {/* Header */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Saved Places</Text>
        <Text style={s.sectionCount}>{bookmarkCount}</Text>
        {bookmarkCount > 0 && (
          <TouchableOpacity
            onPress={() => router.push("/saved")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="View all saved places"
          >
            <Text style={s.viewAllLink}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Summary stats */}
      {savedList.length > 0 && (
        <View style={s.savedSummary}>
          <View style={s.savedSummaryItem}>
            <Text style={s.savedSummaryValue}>{bookmarkCount}</Text>
            <Text style={s.savedSummaryLabel}>Places</Text>
          </View>
          <View style={s.savedSummaryDivider} />
          <View style={s.savedSummaryItem}>
            <Text style={s.savedSummaryValue}>
              {new Set(savedList.map(e => e.category)).size}
            </Text>
            <Text style={s.savedSummaryLabel}>Categories</Text>
          </View>
          <View style={s.savedSummaryDivider} />
          <View style={s.savedSummaryItem}>
            <Text style={s.savedSummaryValue}>
              {savedList.length > 0
                ? new Date(Math.max(...savedList.map(e => e.savedAt))).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "—"
              }
            </Text>
            <Text style={s.savedSummaryLabel}>Last Saved</Text>
          </View>
        </View>
      )}

      {/* List or empty state */}
      {savedList.length > 0 ? (
        savedList.slice(0, 10).map(entry => (
          <SavedRow key={entry.id} entry={entry} />
        ))
      ) : (
        <View style={s.emptyState}>
          <Ionicons name="bookmark-outline" size={28} color={Colors.textTertiary} />
          <Text style={s.emptyText}>No saved places yet</Text>
          <Text style={s.emptySubtext}>Tap the bookmark icon on any business to save it</Text>
          <TouchableOpacity
            style={s.savedCtaButton}
            onPress={() => router.push("/(tabs)/search")}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Discover places to save"
          >
            <Ionicons name="search-outline" size={14} color={AMBER} />
            <Text style={s.savedCtaText}>Discover Places</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const s = StyleSheet.create({
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  sectionCount: { fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  viewAllLink: { fontSize: 12, color: AMBER, fontFamily: "DMSans_600SemiBold" },
  savedSummary: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-around",
    backgroundColor: Colors.surface, borderRadius: 12, padding: 12,
    marginHorizontal: 16, ...Colors.cardShadow,
  },
  savedSummaryItem: { alignItems: "center", gap: 2 },
  savedSummaryValue: { fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  savedSummaryLabel: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  savedSummaryDivider: { width: 1, height: 24, backgroundColor: Colors.border },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  emptySubtext: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  savedCtaButton: {
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: AMBER,
  },
  savedCtaText: { fontSize: 12, fontWeight: "600", color: AMBER, fontFamily: "DMSans_600SemiBold" },
});

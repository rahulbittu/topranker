/**
 * Sprint 443: Rating History Section — extracted from profile.tsx
 * Sprint 474: Added date range filter UI with preset chips + custom range
 * Sprint 477: Extracted date filter to DateRangeFilter.tsx
 * Displays paginated rating history with show more/less, export, and empty state.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { SlideUpView } from "@/components/animations/SlideUpView";
import { HistoryRow } from "@/components/profile/SubComponents";
import { RatingExportButton } from "@/components/profile/RatingExport";
// Sprint 477: Extracted date filter
import { DateRangeFilter, applyDateFilter, type DateRangePreset } from "@/components/profile/DateRangeFilter";

// Re-exports for backward compatibility
export { DateRangeFilter, applyDateFilter, type DateRangePreset } from "@/components/profile/DateRangeFilter";
export { getPresetDates, DATE_RANGE_PRESETS } from "@/components/profile/DateRangeFilter";

const AMBER = BRAND.colors.amber;

export interface RatingHistorySectionProps {
  ratingHistory: any[];
  username: string;
  onDelete: (ratingId: string) => void;
}

export function RatingHistorySection({ ratingHistory, username, onDelete }: RatingHistorySectionProps) {
  const [historyPageSize, setHistoryPageSize] = useState(10);
  // Sprint 474: Date range filter
  const [datePreset, setDatePreset] = useState<DateRangePreset>("all");
  const [customStart, setCustomStart] = useState<string | undefined>();
  const [customEnd, setCustomEnd] = useState<string | undefined>();

  const filteredHistory = useMemo(() => {
    return applyDateFilter(ratingHistory, datePreset, customStart, customEnd);
  }, [ratingHistory, datePreset, customStart, customEnd]);

  const handlePresetChange = (preset: DateRangePreset) => {
    setDatePreset(preset);
    setHistoryPageSize(10);
  };

  return (
    <SlideUpView delay={200} distance={24}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Rating History</Text>
        <Text style={s.sectionCount}>
          {filteredHistory.length}{datePreset !== "all" ? ` / ${ratingHistory.length}` : ""}
        </Text>
      </View>

      {/* Sprint 477: Extracted DateRangeFilter component */}
      {ratingHistory.length > 0 && (
        <DateRangeFilter
          activePreset={datePreset}
          onPresetChange={handlePresetChange}
          customStart={customStart}
          customEnd={customEnd}
          onCustomRangeSet={(start, end) => { setCustomStart(start); setCustomEnd(end); }}
        />
      )}

      {/* Sprint 433: Rating history CSV export */}
      {filteredHistory.length > 0 && (
        <RatingExportButton ratings={filteredHistory} username={username} />
      )}

      {filteredHistory.slice(0, historyPageSize).map((r: any) => (
        <HistoryRow key={r.id} r={r} onDelete={onDelete} />
      ))}

      {filteredHistory.length > historyPageSize && (
        <TouchableOpacity
          style={s.showMoreBtn}
          onPress={() => setHistoryPageSize(prev => prev + 10)}
          accessibilityRole="button"
          accessibilityLabel={`Show more ratings (${filteredHistory.length - historyPageSize} remaining)`}
        >
          <Text style={s.showMoreText}>
            Show More ({filteredHistory.length - historyPageSize} remaining)
          </Text>
          <Ionicons name="chevron-down" size={14} color={AMBER} />
        </TouchableOpacity>
      )}

      {historyPageSize > 10 && filteredHistory.length > 10 && (
        <TouchableOpacity
          style={s.showLessBtn}
          onPress={() => setHistoryPageSize(10)}
          accessibilityRole="button"
          accessibilityLabel="Show fewer ratings"
        >
          <Text style={s.showLessText}>Show Less</Text>
          <Ionicons name="chevron-up" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
      )}

      {ratingHistory.length === 0 && (
        <TouchableOpacity
          style={s.emptyHistory}
          onPress={() => router.push("/(tabs)/search")}
          activeOpacity={0.7}
        >
          <Ionicons name="star-outline" size={32} color={AMBER} />
          <Text style={s.emptyText}>No ratings yet</Text>
          <Text style={s.emptySubtext}>
            Your first rating builds your credibility and shapes the rankings
          </Text>
          <View style={s.emptyCtaRow}>
            <Text style={s.emptyCtaText}>Find a place to rate</Text>
            <Ionicons name="arrow-forward" size={14} color={AMBER} />
          </View>
        </TouchableOpacity>
      )}
    </SlideUpView>
  );
}

const s = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },
  sectionCount: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  showMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    backgroundColor: `${AMBER}10`,
  },
  showMoreText: {
    fontSize: 13,
    color: AMBER,
    fontWeight: "600",
    fontFamily: "DMSans_600SemiBold",
  },
  showLessBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 4,
  },
  showLessText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  emptyHistory: {
    alignItems: "center",
    padding: 24,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    fontFamily: "DMSans_400Regular",
    lineHeight: 18,
  },
  emptyCtaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  emptyCtaText: {
    fontSize: 13,
    color: AMBER,
    fontWeight: "600",
    fontFamily: "DMSans_600SemiBold",
  },
});

/**
 * Sprint 443: Rating History Section — extracted from profile.tsx
 * Sprint 474: Added date range filter UI with preset chips + custom range
 * Displays paginated rating history with show more/less, export, and empty state.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { SlideUpView } from "@/components/animations/SlideUpView";
import { HistoryRow } from "@/components/profile/SubComponents";
import { RatingExportButton } from "@/components/profile/RatingExport";
import { filterByDateRange } from "@/lib/rating-export-utils";

const AMBER = BRAND.colors.amber;

// Sprint 474: Date range presets
type DateRangePreset = "all" | "7d" | "30d" | "90d" | "custom";
const DATE_RANGE_PRESETS: { key: DateRangePreset; label: string }[] = [
  { key: "all", label: "All Time" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
];

function getPresetDates(preset: DateRangePreset): { start?: string; end?: string } {
  if (preset === "all") return {};
  const now = new Date();
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  const start = new Date(now.getTime() - days * 86400000);
  return { start: start.toISOString().split("T")[0] };
}

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
    if (datePreset === "all") return ratingHistory;
    if (datePreset === "custom") {
      return filterByDateRange(ratingHistory, customStart, customEnd);
    }
    const { start } = getPresetDates(datePreset);
    return filterByDateRange(ratingHistory, start);
  }, [ratingHistory, datePreset, customStart, customEnd]);

  const handleCustomRange = () => {
    if (Platform.OS === "web") {
      const start = prompt("Start date (YYYY-MM-DD):");
      const end = prompt("End date (YYYY-MM-DD):");
      if (start) {
        setCustomStart(start);
        setCustomEnd(end || undefined);
        setDatePreset("custom");
      }
    } else {
      Alert.prompt("Start Date", "Enter start date (YYYY-MM-DD):", [
        { text: "Cancel", style: "cancel" },
        { text: "Set", onPress: (start?: string) => {
          if (start) {
            setCustomStart(start);
            setCustomEnd(undefined);
            setDatePreset("custom");
          }
        }},
      ], "plain-text");
    }
  };

  return (
    <SlideUpView delay={200} distance={24}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Rating History</Text>
        <Text style={s.sectionCount}>
          {filteredHistory.length}{datePreset !== "all" ? ` / ${ratingHistory.length}` : ""}
        </Text>
      </View>

      {/* Sprint 474: Date range filter chips */}
      {ratingHistory.length > 0 && (
        <View style={s.dateFilterRow}>
          {DATE_RANGE_PRESETS.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[s.dateChip, datePreset === key && s.dateChipActive]}
              onPress={() => { setDatePreset(key); setHistoryPageSize(10); }}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${label}`}
              accessibilityState={{ selected: datePreset === key }}
            >
              <Text style={[s.dateChipText, datePreset === key && s.dateChipTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[s.dateChip, datePreset === "custom" && s.dateChipActive]}
            onPress={handleCustomRange}
            accessibilityRole="button"
            accessibilityLabel="Custom date range"
          >
            <Ionicons name="calendar-outline" size={11} color={datePreset === "custom" ? "#fff" : Colors.textSecondary} />
            <Text style={[s.dateChipText, datePreset === "custom" && s.dateChipTextActive]}>Custom</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sprint 474: Show custom range indicator */}
      {datePreset === "custom" && customStart && (
        <View style={s.customRangeIndicator}>
          <Ionicons name="calendar" size={12} color={AMBER} />
          <Text style={s.customRangeText}>
            {customStart}{customEnd ? ` to ${customEnd}` : " onwards"}
          </Text>
          <TouchableOpacity onPress={() => setDatePreset("all")} hitSlop={8}>
            <Ionicons name="close-circle" size={14} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
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
  // Sprint 474: Date range filter styles
  dateFilterRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateChipActive: {
    backgroundColor: AMBER,
    borderColor: AMBER,
  },
  dateChipText: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.textSecondary,
    fontFamily: "DMSans_500Medium",
  },
  dateChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  customRangeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  customRangeText: {
    flex: 1,
    fontSize: 11,
    color: AMBER,
    fontFamily: "DMSans_500Medium",
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

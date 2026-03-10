/**
 * Sprint 423: Weekly summary card for Rankings tab.
 * Shows weekly leaderboard movement: movers, new entries, top climber.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { MappedBusiness } from "@/types/business";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

const AMBER = BRAND.colors.amber;

export interface WeeklySummary {
  totalRanked: number;
  moversUp: number;
  moversDown: number;
  newEntries: number;
  topClimber: { name: string; delta: number } | null;
  biggestDrop: { name: string; delta: number } | null;
}

export function computeWeeklySummary(businesses: MappedBusiness[]): WeeklySummary {
  let moversUp = 0;
  let moversDown = 0;
  let newEntries = 0;
  let topClimber: { name: string; delta: number } | null = null;
  let biggestDrop: { name: string; delta: number } | null = null;

  for (const b of businesses) {
    const d = b.rankDelta;
    if (d > 0) {
      moversUp++;
      if (!topClimber || d > topClimber.delta) {
        topClimber = { name: b.name, delta: d };
      }
    } else if (d < 0) {
      moversDown++;
      if (!biggestDrop || d < biggestDrop.delta) {
        biggestDrop = { name: b.name, delta: d };
      }
    }
    if ((b.ratingCount ?? 0) <= 1 && d === 0) {
      newEntries++;
    }
  }

  return { totalRanked: businesses.length, moversUp, moversDown, newEntries, topClimber, biggestDrop };
}

function StatPill({ icon, label, value, color }: { icon: IoniconsName; label: string; value: number; color: string }) {
  return (
    <View style={s.statPill}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

export function WeeklySummaryCard({ businesses, city }: { businesses: MappedBusiness[]; city: string }) {
  const summary = computeWeeklySummary(businesses);

  if (summary.totalRanked === 0) return null;
  if (summary.moversUp === 0 && summary.moversDown === 0 && summary.newEntries === 0) return null;

  return (
    <View style={s.card} accessibilityRole="summary" accessibilityLabel="Weekly rankings summary">
      <View style={s.headerRow}>
        <Ionicons name="trending-up" size={16} color={AMBER} />
        <Text style={s.headerText}>This Week in {city}</Text>
      </View>

      <View style={s.statsRow}>
        {summary.moversUp > 0 && (
          <StatPill icon="arrow-up-circle" label="climbed" value={summary.moversUp} color={Colors.green} />
        )}
        {summary.moversDown > 0 && (
          <StatPill icon="arrow-down-circle" label="dropped" value={summary.moversDown} color={Colors.red} />
        )}
        {summary.newEntries > 0 && (
          <StatPill icon="star-outline" label="new" value={summary.newEntries} color={AMBER} />
        )}
      </View>

      {summary.topClimber && (
        <View style={s.highlightRow}>
          <Ionicons name="flame" size={13} color={AMBER} />
          <Text style={s.highlightText} numberOfLines={1}>
            <Text style={s.highlightName}>{summary.topClimber.name}</Text>
            {" "}climbed {summary.topClimber.delta} {summary.topClimber.delta === 1 ? "spot" : "spots"}
          </Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 12,
    marginBottom: 8, gap: 8,
    borderWidth: 1, borderColor: `${AMBER}15`,
    ...Colors.cardShadow,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerText: { fontSize: 13, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  statsRow: { flexDirection: "row", gap: 12 },
  statPill: { flexDirection: "row", alignItems: "center", gap: 4 },
  statValue: { fontSize: 14, fontWeight: "700", fontFamily: "DMSans_700Bold" },
  statLabel: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  highlightRow: { flexDirection: "row", alignItems: "center", gap: 5, paddingTop: 2 },
  highlightText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", flex: 1 },
  highlightName: { fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
});

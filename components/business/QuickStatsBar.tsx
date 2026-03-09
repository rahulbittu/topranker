import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { TYPOGRAPHY } from "@/constants/typography";
import { formatReturnRate } from "@/lib/style-helpers";
import { getRankDisplay } from "@/lib/data";
import RankMovementPulse from "@/components/animations/RankMovementPulse";
import type { MappedRating } from "./types";

export interface QuickStatsBarProps {
  rank: number;
  rankDelta?: number | null;
  ratingCount: number;
  ratings: MappedRating[];
}

export function QuickStatsBar({ rank, rankDelta, ratingCount, ratings }: QuickStatsBarProps) {
  return (
    <View style={s.statsBar}>
      <View style={s.statItem}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text style={s.statValue}>{getRankDisplay(rank)}</Text>
          <RankMovementPulse delta={rankDelta ?? 0} size={24} />
        </View>
        <Text style={s.statLabel}>Rank</Text>
      </View>
      <View style={s.statDivider} />
      <View style={s.statItem}>
        <Text style={s.statValue}>{ratingCount.toLocaleString()}</Text>
        <Text style={s.statLabel}>Ratings</Text>
      </View>
      <View style={s.statDivider} />
      <View style={s.statItem}>
        <Text style={s.statValue}>
          {formatReturnRate(ratings.filter(r => r.wouldReturn).length, ratings.length)}
        </Text>
        <Text style={s.statLabel}>Would Return</Text>
      </View>
      {ratings.length > 0 && (
        <>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>{ratings.length}</Text>
            <Text style={s.statLabel}>Reviews</Text>
          </View>
        </>
      )}
    </View>
  );
}

export default QuickStatsBar;

const s = StyleSheet.create({
  statsBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-around",
    backgroundColor: Colors.surface, marginHorizontal: 16, marginTop: -8,
    paddingVertical: 14, borderRadius: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statItem: { alignItems: "center", gap: 2 },
  statValue: {
    fontSize: 18, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5,
  },
  statLabel: {
    ...TYPOGRAPHY.ui.small, color: Colors.textTertiary,
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.border },
});

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import type { RankHistoryPoint } from "./types";

export const RankHistoryChart = React.memo(function RankHistoryChart({ points }: { points: RankHistoryPoint[] }) {
  const maxRank = Math.max(...points.map(p => p.rank));
  const minRank = Math.min(...points.map(p => p.rank));
  const range = Math.max(maxRank - minRank, 1);
  const chartW = 280;
  const chartH = 60;

  return (
    <View style={s.rhCard}>
      <View style={s.rhHeader}>
        <Ionicons name="trending-up" size={14} color={BRAND.colors.amber} />
        <Text style={s.rhTitle}>30-Day Rank Trend</Text>
      </View>
      <View style={s.rhChart}>
        {points.map((p, i) => {
          const x = (i / (points.length - 1)) * chartW;
          const y = chartH - ((maxRank - p.rank) / range) * chartH;
          return (
            <View
              key={i}
              style={[s.rhDot, { left: x - 3, top: y - 3 }]}
            />
          );
        })}
        <View style={[s.rhLine, { width: chartW }]} />
      </View>
      <View style={s.rhLabels}>
        <Text style={s.rhLabel}>#{maxRank}</Text>
        <Text style={s.rhLabel}>#{minRank}</Text>
      </View>
    </View>
  );
});

export default RankHistoryChart;

const s = StyleSheet.create({
  rhCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 10,
    ...Colors.cardShadow,
  },
  rhHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  rhTitle: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  rhChart: { height: 66, position: "relative" },
  rhDot: {
    position: "absolute", width: 6, height: 6, borderRadius: 3,
    backgroundColor: BRAND.colors.amber,
  },
  rhLine: { position: "absolute", top: "50%", left: 0, height: 1, backgroundColor: Colors.border },
  rhLabels: { flexDirection: "row", justifyContent: "space-between" },
  rhLabel: { ...TYPOGRAPHY.ui.small, color: Colors.textTertiary },
});

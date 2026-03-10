/**
 * Sprint 276: Score Trend Sparkline
 * Shows weighted score history as a mini line chart on the business page.
 * Uses rank_history table data.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { apiFetch } from "@/lib/query-client";

interface ScorePoint {
  date: string;
  score: number;
}

interface ScoreTrendSparklineProps {
  businessId: string;
}

export function ScoreTrendSparkline({ businessId }: ScoreTrendSparklineProps) {
  const { data: points } = useQuery({
    queryKey: ["score-trend", businessId],
    queryFn: async () => {
      const res = await apiFetch(`/api/businesses/${businessId}/score-trend`);
      const json = await res.json();
      return json.data as ScorePoint[];
    },
    enabled: !!businessId,
  });

  if (!points || points.length < 2) return null;

  const scores = points.map(p => p.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const range = maxScore - minScore || 1;
  const latest = scores[scores.length - 1];
  const previous = scores[scores.length - 2];
  const trend = latest - previous;
  const trendUp = trend > 0;
  const trendFlat = Math.abs(trend) < 0.05;

  // SVG sparkline dimensions
  const width = 120;
  const height = 32;
  const padding = 2;

  const pathData = scores.map((s, i) => {
    const x = padding + (i / (scores.length - 1)) * (width - padding * 2);
    const y = height - padding - ((s - minScore) / range) * (height - padding * 2);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <View style={s.container}>
      <View style={s.labelRow}>
        <Text style={s.label}>SCORE TREND</Text>
        <View style={s.trendPill}>
          {!trendFlat && (
            <Ionicons
              name={trendUp ? "trending-up" : "trending-down"}
              size={12}
              color={trendUp ? Colors.green : Colors.red}
            />
          )}
          <Text style={[
            s.trendText,
            trendUp && { color: Colors.green },
            !trendUp && !trendFlat && { color: Colors.red },
          ]}>
            {trendFlat ? "Stable" : `${trendUp ? "+" : ""}${trend.toFixed(2)}`}
          </Text>
        </View>
      </View>
      <View style={s.sparkRow}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <path
            d={pathData}
            fill="none"
            stroke={BRAND.colors.amber}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Latest point dot */}
          <circle
            cx={width - padding}
            cy={height - padding - ((latest - minScore) / range) * (height - padding * 2)}
            r={3}
            fill={BRAND.colors.amber}
          />
        </svg>
        <View style={s.scoreCol}>
          <Text style={s.currentScore}>{latest.toFixed(1)}</Text>
          <Text style={s.periodLabel}>{points.length} snapshots</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    ...Colors.cardShadow,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold",
    letterSpacing: 1.5,
  },
  trendPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surfaceRaised,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold",
  },
  sparkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scoreCol: {
    alignItems: "flex-end",
  },
  currentScore: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.gold,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  periodLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
});

/**
 * Sprint 482: Sparkline Chart for Dashboard
 *
 * Lightweight sparkline visualization for rating scores.
 * Renders a mini line chart from an array of numeric scores.
 * Used in the business owner dashboard to show recent rating trajectory.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

const AMBER = BRAND.colors.amber;

export interface SparklineChartProps {
  scores: number[];
  width?: number;
  height?: number;
  label?: string;
  showEndpoints?: boolean;
}

export function SparklineChart({
  scores,
  width = 240,
  height = 48,
  label,
  showEndpoints = true,
}: SparklineChartProps) {
  if (scores.length < 2) {
    return (
      <View style={[s.container, { width, height: height + 20 }]}>
        {label && <Text style={s.label}>{label}</Text>}
        <Text style={s.emptyText}>Not enough data</Text>
      </View>
    );
  }

  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const range = Math.max(maxScore - minScore, 0.1);
  const padding = 4;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  // Compute dot positions
  const points = scores.map((score, i) => ({
    x: padding + (i / (scores.length - 1)) * chartW,
    y: padding + chartH - ((score - minScore) / range) * chartH,
    score,
  }));

  // Determine trend color
  const trendUp = scores[scores.length - 1] >= scores[0];
  const trendColor = trendUp ? BRAND.colors.green || "#22C55E" : Colors.red || "#EF4444";

  return (
    <View style={[s.container, { width, height: height + (label ? 20 : 0) + (showEndpoints ? 16 : 0) }]}>
      {label && <Text style={s.label}>{label}</Text>}
      <View style={[s.chartArea, { width, height }]}>
        {/* Dots */}
        {points.map((p, i) => (
          <View
            key={i}
            style={[
              s.dot,
              {
                left: p.x - 2,
                top: p.y - 2,
                backgroundColor: i === points.length - 1 ? trendColor : `${AMBER}80`,
                width: i === points.length - 1 ? 6 : 4,
                height: i === points.length - 1 ? 6 : 4,
                borderRadius: i === points.length - 1 ? 3 : 2,
              },
            ]}
          />
        ))}
        {/* Connecting lines (simplified: vertical bars at each position) */}
        {points.map((p, i) => (
          <View
            key={`line-${i}`}
            style={[
              s.lineSegment,
              {
                left: p.x - 0.5,
                top: p.y,
                height: chartH + padding - p.y,
                backgroundColor: `${AMBER}15`,
              },
            ]}
          />
        ))}
      </View>
      {showEndpoints && (
        <View style={s.endpointRow}>
          <Text style={s.endpointText}>{scores[0].toFixed(1)}</Text>
          <Text style={[s.endpointText, { color: trendColor }]}>
            {scores[scores.length - 1].toFixed(1)}
          </Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { alignItems: "center" },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  chartArea: { position: "relative" },
  dot: { position: "absolute" },
  lineSegment: { position: "absolute", width: 1 },
  endpointRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 4,
    marginTop: 2,
  },
  endpointText: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    marginTop: 8,
  },
});

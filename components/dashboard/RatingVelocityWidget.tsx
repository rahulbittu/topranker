/**
 * Sprint 567: Rating velocity dashboard widget
 * Shows weekly rating velocity with mini chart, peak indicator, and trend
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

export interface WeeklyVelocity {
  week: string;    // "W1", "W2", etc.
  count: number;   // ratings that week
  avgScore: number; // average score that week
}

export interface RatingVelocityWidgetProps {
  weeklyData: WeeklyVelocity[];
  velocityChange: number; // percentage change vs previous period
  delay?: number;
}

export function RatingVelocityWidget({ weeklyData, velocityChange, delay = 0 }: RatingVelocityWidgetProps) {
  if (weeklyData.length === 0) return null;

  const totalRatings = weeklyData.reduce((sum, w) => sum + w.count, 0);
  const avgPerWeek = Math.round(totalRatings / weeklyData.length * 10) / 10;
  const peakWeek = weeklyData.reduce((max, w) => w.count > max.count ? w : max, weeklyData[0]);
  const maxCount = Math.max(...weeklyData.map(w => w.count), 1);
  const isPositive = velocityChange > 0;
  const isNeutral = velocityChange === 0;

  const trendColor = isNeutral
    ? Colors.textTertiary
    : isPositive ? "#22C55E" : "#EF4444";

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={s.card}>
      <View style={s.header}>
        <Ionicons name="speedometer-outline" size={16} color={BRAND.colors.amber} />
        <Text style={s.title}>Rating Velocity</Text>
        <View style={[s.trendBadge, { backgroundColor: `${trendColor}15` }]}>
          <Ionicons
            name={isNeutral ? "remove-outline" : isPositive ? "arrow-up" : "arrow-down"}
            size={10}
            color={trendColor}
          />
          <Text style={[s.trendText, { color: trendColor }]}>
            {isNeutral ? "0%" : `${isPositive ? "+" : ""}${velocityChange}%`}
          </Text>
        </View>
      </View>

      {/* Mini bar chart */}
      <View style={s.chartRow}>
        {weeklyData.map((w, i) => {
          const height = Math.max((w.count / maxCount) * 40, 4);
          const isPeak = w === peakWeek;
          return (
            <View key={i} style={s.barContainer}>
              <View
                style={[
                  s.bar,
                  { height, backgroundColor: isPeak ? BRAND.colors.amber : `${BRAND.colors.amber}40` },
                ]}
              />
              <Text style={s.barLabel}>{w.week}</Text>
            </View>
          );
        })}
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
        <View style={s.stat}>
          <Text style={s.statValue}>{totalRatings}</Text>
          <Text style={s.statLabel}>Total</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statValue}>{avgPerWeek}</Text>
          <Text style={s.statLabel}>Avg/week</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statValue}>{peakWeek.count}</Text>
          <Text style={s.statLabel}>Peak ({peakWeek.week})</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "DMSans_700Bold",
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 56,
    paddingTop: 4,
  },
  barContainer: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  bar: {
    width: 16,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 9,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  stat: {
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
});

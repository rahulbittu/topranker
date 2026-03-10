/**
 * Sprint 568: City comparison overlay for discover/search
 * Compact card showing current city stats vs a comparison city
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { fetchCityStats, type CityStats } from "@/lib/api";
import { SUPPORTED_CITIES } from "@/lib/city-context";
import Animated, { FadeInDown } from "react-native-reanimated";

const AMBER = BRAND.colors.amber;

export interface CityComparisonOverlayProps {
  currentCity: string;
  delay?: number;
}

function StatCompare({ label, current, compare, format }: {
  label: string; current: number; compare: number; format: "score" | "count" | "pct";
}) {
  const delta = current - compare;
  const isPositive = delta > 0;
  const isNeutral = Math.abs(delta) < 0.05;
  const color = isNeutral ? Colors.textTertiary : isPositive ? "#22C55E" : "#EF4444";

  const fmt = (v: number) => {
    if (format === "score") return v.toFixed(1);
    if (format === "pct") return `${Math.round(v)}%`;
    return String(Math.round(v));
  };

  return (
    <View style={s.statCol}>
      <Text style={s.statValue}>{fmt(current)}</Text>
      <View style={s.deltaRow}>
        <Ionicons
          name={isNeutral ? "remove-outline" : isPositive ? "arrow-up" : "arrow-down"}
          size={9}
          color={color}
        />
        <Text style={[s.deltaText, { color }]}>{fmt(Math.abs(delta))}</Text>
      </View>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

export function CityComparisonOverlay({ currentCity, delay = 0 }: CityComparisonOverlayProps) {
  const otherCities = SUPPORTED_CITIES.filter(c => c !== currentCity);
  const [compareIdx, setCompareIdx] = useState(0);
  const compareCity = otherCities[compareIdx % otherCities.length] || currentCity;

  const { data: currentStats } = useQuery<CityStats>({
    queryKey: ["city-stats", currentCity],
    queryFn: () => fetchCityStats(currentCity),
    staleTime: 300000,
  });

  const { data: compareStats } = useQuery<CityStats>({
    queryKey: ["city-stats", compareCity],
    queryFn: () => fetchCityStats(compareCity),
    staleTime: 300000,
  });

  if (!currentStats || !compareStats) return null;
  if (currentStats.totalBusinesses === 0 && compareStats.totalBusinesses === 0) return null;

  const cycleCity = () => setCompareIdx(i => (i + 1) % otherCities.length);

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={s.card}>
      <View style={s.header}>
        <Ionicons name="globe-outline" size={15} color={AMBER} />
        <Text style={s.headerTitle}>{currentCity} vs</Text>
        <TouchableOpacity onPress={cycleCity} style={s.cityChip} activeOpacity={0.7}>
          <Text style={s.cityChipText}>{compareCity}</Text>
          <Ionicons name="swap-horizontal" size={11} color={AMBER} />
        </TouchableOpacity>
      </View>

      <View style={s.statsRow}>
        <StatCompare
          label="Avg Score"
          current={currentStats.avgWeightedScore}
          compare={compareStats.avgWeightedScore}
          format="score"
        />
        <View style={s.divider} />
        <StatCompare
          label="Restaurants"
          current={currentStats.totalBusinesses}
          compare={compareStats.totalBusinesses}
          format="count"
        />
        <View style={s.divider} />
        <StatCompare
          label="Return %"
          current={currentStats.avgWouldReturnPct}
          compare={compareStats.avgWouldReturnPct}
          format="pct"
        />
      </View>

      <Text style={s.footer}>
        {currentStats.recentRatingsCount} ratings this month in {currentCity}
      </Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  cityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${AMBER}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  cityChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: AMBER,
    fontFamily: "DMSans_600SemiBold",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statCol: {
    alignItems: "center",
    gap: 2,
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },
  deltaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  deltaText: {
    fontSize: 9,
    fontWeight: "600",
    fontFamily: "DMSans_600SemiBold",
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  footer: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
  },
});

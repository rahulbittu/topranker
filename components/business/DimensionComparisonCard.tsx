/**
 * Sprint 578: Dimension Comparison Card
 *
 * Self-fetching card that shows business dimension scores vs city averages.
 * Dual horizontal bars per dimension — amber for business, gray for city.
 * Fetches /api/businesses/:id/dimension-breakdown and /api/cities/:city/dimension-averages.
 */
import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { apiFetch } from "@/lib/query-client";
import { pct } from "@/lib/style-helpers";
import { DIMENSION_CONFIGS } from "./DimensionScoreCard";

const AMBER = BRAND.colors.amber;

interface DimensionData { food: number; service?: number; vibe?: number; packaging?: number; waitTime?: number; value?: number; }
interface CityAvgs { food: number; service: number; vibe: number; packaging: number; waitTime: number; value: number; totalRatings: number; totalBusinesses: number; }

export interface DimensionComparisonCardProps {
  businessId: string;
  city: string;
}

type DimKey = "food" | "service" | "vibe" | "packaging" | "waitTime" | "value";

function getDeltaColor(d: number): string {
  if (d > 0.2) return "#2D8F4E";
  if (d < -0.2) return "#D44040";
  return Colors.textTertiary;
}

export function DimensionComparisonCard({ businessId, city }: DimensionComparisonCardProps) {
  const bizQ = useQuery({ queryKey: ["dimension-breakdown", businessId], queryFn: () => apiFetch(`/api/businesses/${businessId}/dimension-breakdown`), staleTime: 60_000 });
  const cityQ = useQuery({ queryKey: ["city-dim-avg", city], queryFn: () => apiFetch(`/api/cities/${encodeURIComponent(city)}/dimension-averages`), staleTime: 120_000, enabled: !!city });

  if (bizQ.isLoading || cityQ.isLoading) return <ActivityIndicator style={{ marginTop: 12 }} color={AMBER} />;
  const bizDims = (bizQ.data as any)?.dimensions as DimensionData | undefined;
  const cityAvgs = cityQ.data as CityAvgs | undefined;
  if (!bizDims || !cityAvgs) return null;

  const primaryType = (bizQ.data as any)?.primaryVisitType as keyof typeof DIMENSION_CONFIGS || "dineIn";
  const configs = DIMENSION_CONFIGS[primaryType];

  const rows = configs.map(c => {
    const key = c.key as DimKey;
    const biz = (bizDims as any)[key] ?? 0;
    const avg = (cityAvgs as any)[key] ?? 0;
    return { label: c.label, icon: c.icon, weight: c.weight, biz: Number(biz), avg: Number(avg) };
  }).filter(r => r.biz > 0 || r.avg > 0);

  if (rows.length === 0) return null;

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Ionicons name="bar-chart-outline" size={18} color={AMBER} />
        <Text style={s.headerText}>vs {city} Averages</Text>
        <Text style={s.headerSub}>{cityAvgs.totalBusinesses} places</Text>
      </View>
      {rows.map(r => {
        const delta = r.biz - r.avg;
        const maxVal = Math.max(r.biz, r.avg, 3);
        const bizW = Math.max(5, (r.biz / maxVal) * 100);
        const avgW = Math.max(5, (r.avg / maxVal) * 100);
        return (
          <View key={r.label} style={s.row}>
            <View style={s.labelCol}>
              <Ionicons name={r.icon as any} size={13} color={Colors.textTertiary} />
              <Text style={s.label}>{r.label}</Text>
              <Text style={s.weight}>{Math.round(r.weight * 100)}%</Text>
            </View>
            <View style={s.barsCol}>
              <View style={s.barOuter}><View style={[s.barBiz, { width: pct(bizW) }]} /></View>
              <View style={s.barOuter}><View style={[s.barCity, { width: pct(avgW) }]} /></View>
            </View>
            <View style={s.valCol}>
              <Text style={[s.valBiz, { color: getDeltaColor(delta) }]}>{r.biz.toFixed(1)}</Text>
              <Text style={s.valCity}>{r.avg.toFixed(1)}</Text>
            </View>
          </View>
        );
      })}
      <View style={s.legend}>
        <View style={[s.dot, { backgroundColor: AMBER }]} /><Text style={s.legendText}>This place</Text>
        <View style={[s.dot, { backgroundColor: Colors.border }]} /><Text style={s.legendText}>{city} avg</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginHorizontal: 16, marginTop: 12, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerText: { fontSize: 15, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold", flex: 1 },
  headerSub: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  labelCol: { flexDirection: "row", alignItems: "center", gap: 4, width: 110 },
  label: { fontSize: 12, color: Colors.text, fontFamily: "DMSans_500Medium" },
  weight: { fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  barsCol: { flex: 1, gap: 2 },
  barOuter: { height: 5, backgroundColor: Colors.background, borderRadius: 3, overflow: "hidden" },
  barBiz: { height: 5, borderRadius: 3, backgroundColor: AMBER },
  barCity: { height: 5, borderRadius: 3, backgroundColor: Colors.border, opacity: 0.7 },
  valCol: { width: 32, alignItems: "flex-end" },
  valBiz: { fontSize: 12, fontWeight: "700", fontFamily: "DMSans_700Bold" },
  valCity: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  legend: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", marginRight: 8 },
});

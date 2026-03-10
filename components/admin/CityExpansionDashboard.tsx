/**
 * Sprint 543: City Expansion Dashboard — admin tool for beta city health
 *
 * Shows all cities with status badges, engagement metrics, promotion progress,
 * and health indicators. Surfaces data from city-health, city-engagement,
 * city-promotion, and expansion-pipeline APIs.
 *
 * Owner: Sarah Nakamura (Lead Eng)
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import {
  fetchCityHealthSummary,
  fetchAllCityEngagement,
  fetchBetaPromotionStatuses,
  type CityHealthSummary,
  type CityEngagementData,
  type BetaPromotionStatus,
} from "@/lib/api-admin";

const AMBER = BRAND.colors.amber;

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    active: { bg: "#10B981", text: "#FFFFFF" },
    beta: { bg: "#F59E0B", text: "#FFFFFF" },
    planned: { bg: "#6B7280", text: "#FFFFFF" },
    healthy: { bg: "#10B981", text: "#FFFFFF" },
    degraded: { bg: "#F59E0B", text: "#FFFFFF" },
    critical: { bg: "#EF4444", text: "#FFFFFF" },
  };
  const c = colors[status] || colors.planned;
  return (
    <View style={[s.badge, { backgroundColor: c.bg }]}>
      <Text style={[s.badgeText, { color: c.text }]}>{status.toUpperCase()}</Text>
    </View>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return (
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      <Text style={s.progressLabel}>{pct}%</Text>
    </View>
  );
}

function HealthSummaryCard({ data }: { data: CityHealthSummary }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>City Health Summary</Text>
      <View style={s.healthGrid}>
        <View style={s.healthItem}>
          <Text style={[s.healthValue, { color: "#10B981" }]}>{data.healthy}</Text>
          <Text style={s.healthLabel}>Healthy</Text>
        </View>
        <View style={s.healthItem}>
          <Text style={[s.healthValue, { color: "#F59E0B" }]}>{data.degraded}</Text>
          <Text style={s.healthLabel}>Degraded</Text>
        </View>
        <View style={s.healthItem}>
          <Text style={[s.healthValue, { color: "#EF4444" }]}>{data.critical}</Text>
          <Text style={s.healthLabel}>Critical</Text>
        </View>
        <View style={s.healthItem}>
          <Text style={[s.healthValue, { color: Colors.text }]}>{data.total}</Text>
          <Text style={s.healthLabel}>Total</Text>
        </View>
      </View>
    </View>
  );
}

function CityEngagementRow({ city }: { city: CityEngagementData }) {
  return (
    <View style={s.cityRow}>
      <View style={s.cityHeader}>
        <Text style={s.cityName}>{city.city}</Text>
        <StatusBadge status={city.status} />
      </View>
      <View style={s.metricsRow}>
        <View style={s.metric}>
          <Ionicons name="storefront-outline" size={12} color={Colors.textTertiary} />
          <Text style={s.metricValue}>{city.totalBusinesses}</Text>
          <Text style={s.metricLabel}>biz</Text>
        </View>
        <View style={s.metric}>
          <Ionicons name="people-outline" size={12} color={Colors.textTertiary} />
          <Text style={s.metricValue}>{city.totalMembers}</Text>
          <Text style={s.metricLabel}>members</Text>
        </View>
        <View style={s.metric}>
          <Ionicons name="star-outline" size={12} color={Colors.textTertiary} />
          <Text style={s.metricValue}>{city.totalRatings}</Text>
          <Text style={s.metricLabel}>ratings</Text>
        </View>
        <View style={s.metric}>
          <Ionicons name="trending-up-outline" size={12} color={Colors.textTertiary} />
          <Text style={s.metricValue}>{city.avgRatingsPerMember.toFixed(1)}</Text>
          <Text style={s.metricLabel}>avg/user</Text>
        </View>
      </View>
    </View>
  );
}

function PromotionCard({ promo }: { promo: BetaPromotionStatus }) {
  return (
    <View style={s.promoCard}>
      <View style={s.promoHeader}>
        <Text style={s.promoCity}>{promo.city}</Text>
        <Text style={[s.promoEligible, { color: promo.eligible ? "#10B981" : "#F59E0B" }]}>
          {promo.eligible ? "ELIGIBLE" : "IN PROGRESS"}
        </Text>
      </View>
      <View style={s.promoMetrics}>
        <View style={s.promoRow}>
          <Text style={s.promoLabel}>Businesses ({promo.currentMetrics.businesses}/50)</Text>
          <ProgressBar value={promo.currentMetrics.businesses} max={50} color={AMBER} />
        </View>
        <View style={s.promoRow}>
          <Text style={s.promoLabel}>Members ({promo.currentMetrics.members}/100)</Text>
          <ProgressBar value={promo.currentMetrics.members} max={100} color="#6366F1" />
        </View>
        <View style={s.promoRow}>
          <Text style={s.promoLabel}>Ratings ({promo.currentMetrics.ratings}/200)</Text>
          <ProgressBar value={promo.currentMetrics.ratings} max={200} color="#10B981" />
        </View>
      </View>
      {promo.missingCriteria.length > 0 && (
        <View style={s.missingWrap}>
          <Text style={s.missingTitle}>Missing:</Text>
          {promo.missingCriteria.map((c, i) => (
            <Text key={i} style={s.missingItem}>{c}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

export function CityExpansionDashboard() {
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ["admin", "cityHealth"],
    queryFn: fetchCityHealthSummary,
    staleTime: 30000,
  });

  const { data: engagementData, isLoading: engagementLoading } = useQuery({
    queryKey: ["admin", "cityEngagement"],
    queryFn: fetchAllCityEngagement,
    staleTime: 30000,
  });

  const { data: promotionData, isLoading: promotionLoading } = useQuery({
    queryKey: ["admin", "betaPromotions"],
    queryFn: fetchBetaPromotionStatuses,
    staleTime: 30000,
  });

  const isLoading = healthLoading || engagementLoading || promotionLoading;

  if (isLoading) {
    return (
      <View style={s.loadingWrap}>
        <ActivityIndicator size="small" color={AMBER} />
        <Text style={s.loadingText}>Loading city data...</Text>
      </View>
    );
  }

  const activeCities = (engagementData || []).filter(c => c.status === "active");
  const betaCities = (engagementData || []).filter(c => c.status === "beta");

  return (
    <View style={s.container}>
      {/* Health Summary */}
      {healthData && <HealthSummaryCard data={healthData} />}

      {/* Active Cities */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Active Cities ({activeCities.length})</Text>
        {activeCities.map(c => <CityEngagementRow key={c.city} city={c} />)}
      </View>

      {/* Beta Cities + Promotion Progress */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Beta Cities ({betaCities.length})</Text>
        {betaCities.map(c => <CityEngagementRow key={c.city} city={c} />)}
      </View>

      {/* Promotion Status */}
      {promotionData && promotionData.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Promotion Progress</Text>
          {promotionData.map(p => <PromotionCard key={p.city} promo={p} />)}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: 16 },
  loadingWrap: { alignItems: "center", padding: 40, gap: 8 },
  loadingText: { fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  card: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 12, padding: 16, gap: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  healthGrid: { flexDirection: "row", justifyContent: "space-around" },
  healthItem: { alignItems: "center", gap: 4 },
  healthValue: { fontSize: 24, fontWeight: "700", fontFamily: "DMSans_700Bold" },
  healthLabel: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  section: { gap: 8 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  cityRow: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 10, padding: 12, gap: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  cityHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cityName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 9, fontWeight: "700", fontFamily: "DMSans_700Bold" },
  metricsRow: { flexDirection: "row", justifyContent: "space-between" },
  metric: { flexDirection: "row", alignItems: "center", gap: 3 },
  metricValue: { fontSize: 12, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  metricLabel: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  promoCard: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 10, padding: 12, gap: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  promoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  promoCity: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  promoEligible: { fontSize: 10, fontWeight: "700", fontFamily: "DMSans_700Bold" },
  promoMetrics: { gap: 6 },
  promoRow: { gap: 4 },
  promoLabel: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  progressTrack: {
    height: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 3,
    flexDirection: "row", alignItems: "center", overflow: "hidden",
  },
  progressFill: { height: "100%" as any, borderRadius: 3 },
  progressLabel: {
    position: "absolute", right: 4, fontSize: 8, color: Colors.textTertiary,
    fontFamily: "DMSans_500Medium",
  },
  missingWrap: { gap: 2, paddingTop: 4, borderTopWidth: 1, borderTopColor: Colors.border },
  missingTitle: { fontSize: 11, fontWeight: "600", color: "#F59E0B", fontFamily: "DMSans_600SemiBold" },
  missingItem: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", paddingLeft: 8 },
});

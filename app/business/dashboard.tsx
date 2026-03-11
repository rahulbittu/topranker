import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { PRICING } from "@/shared/pricing";
import { TypedIcon } from "@/components/TypedIcon";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/query-client";
import { SparklineChart } from "@/components/dashboard/SparklineChart";
import { VolumeBarChart } from "@/components/dashboard/VolumeBarChart";
import { VelocityIndicator } from "@/components/dashboard/VelocityIndicator";
import { DimensionBreakdownCard } from "@/components/dashboard/DimensionBreakdownCard";
import { HoursEditor } from "@/components/dashboard/HoursEditor";
import { RatingVelocityWidget } from "@/components/dashboard/RatingVelocityWidget";
import { ReviewCard } from "@/components/dashboard/ReviewCard";

const { width: SCREEN_W } = Dimensions.get("window");

interface VolumePoint {
  period: string;
  count: number;
  avgScore: number;
}

interface DashboardData {
  totalRatings: number;
  avgScore: number;
  rankPosition: number;
  rankDelta: number;
  wouldReturnPct: number;
  topDish: { name: string; votes: number } | null;
  ratingTrend: number[];
  recentRatings: { id: string; user: string; score: number; tier: string; note: string | null; date: string }[];
  weeklyVolume: VolumePoint[];
  monthlyVolume: VolumePoint[];
  velocityChange: number;
  sparklineScores: number[];
}

function StatCard({ label, value, delta, icon, color, delay }: {
  label: string; value: string; delta?: number; icon: string; color: string; delay: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: `${color}15` }]}>
        <TypedIcon name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.statBottom}>
        <Text style={styles.statLabel}>{label}</Text>
        {delta !== undefined && delta !== 0 && (
          <View style={[styles.deltaBadge, { backgroundColor: delta > 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)" }]}>
            <Ionicons name={delta > 0 ? "arrow-up" : "arrow-down"} size={10} color={delta > 0 ? Colors.green : Colors.red} />
            <Text style={[styles.deltaText, { color: delta > 0 ? Colors.green : Colors.red }]}>
              {Math.abs(delta)}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

export default function BusinessDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { name, slug } = useLocalSearchParams<{ name: string; slug: string }>();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [activeTab, setActiveTab] = useState<"overview" | "reviews" | "insights">("overview");

  const { data: dashData, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard", slug],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/businesses/${slug}/dashboard`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load dashboard");
      const json = await res.json();
      return json.data;
    },
    enabled: !!slug,
  });

  const { data: dimensionData } = useQuery<{
    dimensions: { food: number; service: number; vibe: number; packaging: number; waitTime: number; value: number };
    visitTypeDistribution: { dineIn: number; delivery: number; takeaway: number };
    totalRatings: number;
    primaryVisitType: "dineIn" | "delivery" | "takeaway";
  }>({
    queryKey: ["dimension-breakdown", slug],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/businesses/${slug}/dimension-breakdown`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load dimensions");
      const json = await res.json();
      return json.data;
    },
    enabled: !!slug && activeTab === "insights",
  });

  const a = dashData || {
    totalRatings: 0,
    avgScore: 0,
    rankPosition: 0,
    rankDelta: 0,
    wouldReturnPct: 0,
    topDish: null,
    ratingTrend: [],
    recentRatings: [],
    weeklyVolume: [],
    monthlyVolume: [],
    velocityChange: 0,
    sparklineScores: [],
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{name || "Dashboard"}</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={10} color="#FFFFFF" />
            <Text style={styles.verifiedText}>VERIFIED OWNER</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/business/qr", params: { name: name || "", slug: slug || "" } })}
          style={styles.qrBtn}
          hitSlop={8}
        >
          <Ionicons name="qr-code-outline" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(["overview", "reviews", "insights"] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "overview" && (
          <>
            <View style={styles.statsGrid}>
              <StatCard label="Total Ratings" value={String(a.totalRatings)} icon="star-outline" color={BRAND.colors.amber} delay={100} />
              <StatCard label="Avg Score" value={a.avgScore.toFixed(1)} icon="analytics-outline" color="#6366F1" delay={200} />
              <StatCard label="Rank" value={`#${a.rankPosition}`} delta={a.rankDelta} icon="trophy-outline" color={Colors.green} delay={300} />
              <StatCard label="Would Return" value={`${a.wouldReturnPct}%`} icon="thumbs-up-outline" color="#3B82F6" delay={400} />
            </View>

            {a.sparklineScores.length > 1 && (
              <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.chartCard}>
                <Text style={styles.chartTitle}>Score Trend</Text>
                <SparklineChart scores={a.sparklineScores} width={SCREEN_W - 64} label="RECENT SCORES" />
              </Animated.View>
            )}

            {a.weeklyVolume.length > 0 && (
              <Animated.View entering={FadeInDown.delay(550).duration(400)} style={styles.chartCard}>
                <Text style={styles.chartTitle}>Weekly Rating Volume</Text>
                <VolumeBarChart data={a.weeklyVolume} width={SCREEN_W - 64} label="LAST 8 WEEKS" />
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(580).duration(400)}>
              <VelocityIndicator velocityChange={a.velocityChange} />
            </Animated.View>

            {a.weeklyVolume.length > 0 && (
              <RatingVelocityWidget
                weeklyData={a.weeklyVolume.map((w, i) => ({ week: `W${i + 1}`, count: w.count, avgScore: w.avgScore }))}
                velocityChange={a.velocityChange}
                delay={600}
              />
            )}

            {a.topDish && (
              <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.highlightRow}>
                <View style={styles.highlightCard}>
                  <Ionicons name="restaurant-outline" size={20} color={BRAND.colors.amber} />
                  <Text style={styles.highlightValue}>{a.topDish.name}</Text>
                  <Text style={styles.highlightLabel}>{a.topDish.votes} votes</Text>
                </View>
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(700).duration(400)} style={styles.proCard}>
              <View style={styles.proCardInner}>
                <Ionicons name="diamond-outline" size={24} color={BRAND.colors.amber} />
                <View style={styles.proCardInfo}>
                  <Text style={styles.proCardTitle}>Upgrade to Pro</Text>
                  <Text style={styles.proCardSub}>Respond to reviews, advanced analytics, verified badge</Text>
                </View>
                <Text style={styles.proCardPrice}>{PRICING.dashboardPro.displayAmount}</Text>
              </View>
            </Animated.View>

            {slug && <HoursEditor businessId={slug} delay={800} />}
          </>
        )}

        {activeTab === "reviews" && (
          <>
            <Text style={styles.sectionTitle}>{a.recentRatings.length} Recent Ratings</Text>
            {a.recentRatings.map((r, i) => (
              <ReviewCard key={r.id} rating={r} delay={100 + i * 100} />
            ))}
          </>
        )}

        {activeTab === "insights" && (
          <>
            {dimensionData && dimensionData.totalRatings > 0 && (
              <DimensionBreakdownCard
                dimensions={dimensionData.dimensions}
                visitTypeDistribution={dimensionData.visitTypeDistribution}
                totalRatings={dimensionData.totalRatings}
                primaryVisitType={dimensionData.primaryVisitType}
                delay={50}
              />
            )}

            {a.rankDelta > 0 && (
              <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.insightCard}>
                <Ionicons name="trending-up" size={20} color={Colors.green} />
                <View style={styles.insightInfo}>
                  <Text style={styles.insightTitle}>Ranking is climbing</Text>
                  <Text style={styles.insightDesc}>You moved up {a.rankDelta} position{a.rankDelta > 1 ? "s" : ""} recently. Current average: {a.avgScore.toFixed(1)}.</Text>
                </View>
              </Animated.View>
            )}
            {a.rankDelta < 0 && (
              <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.insightCard}>
                <Ionicons name="trending-down" size={20} color={Colors.red} />
                <View style={styles.insightInfo}>
                  <Text style={styles.insightTitle}>Ranking slipped</Text>
                  <Text style={styles.insightDesc}>You dropped {Math.abs(a.rankDelta)} position{Math.abs(a.rankDelta) > 1 ? "s" : ""}. Focus on consistent quality to bounce back.</Text>
                </View>
              </Animated.View>
            )}

            {a.wouldReturnPct > 0 && (
              <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.insightCard}>
                <Ionicons name="people" size={20} color="#6366F1" />
                <View style={styles.insightInfo}>
                  <Text style={styles.insightTitle}>{a.wouldReturnPct >= 80 ? "Customers love coming back" : "Room to improve loyalty"}</Text>
                  <Text style={styles.insightDesc}>{a.wouldReturnPct}% of reviewers say they would return. {a.wouldReturnPct >= 80 ? "Their weighted votes are driving your rank up." : "Focus on consistency to improve retention."}</Text>
                </View>
              </Animated.View>
            )}

            {a.topDish && (
              <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.insightCard}>
                <Ionicons name="restaurant" size={20} color={BRAND.colors.amber} />
                <View style={styles.insightInfo}>
                  <Text style={styles.insightTitle}>{a.topDish.name} is your star</Text>
                  <Text style={styles.insightDesc}>{a.topDish.votes} dish vote{a.topDish.votes !== 1 ? "s" : ""} for {a.topDish.name}. Consider featuring it prominently.</Text>
                </View>
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.insightCard}>
              <Ionicons name="stats-chart" size={20} color="#3B82F6" />
              <View style={styles.insightInfo}>
                <Text style={styles.insightTitle}>Rating summary</Text>
                <Text style={styles.insightDesc}>{a.totalRatings} total ratings with a {a.avgScore.toFixed(1)} average. Currently ranked #{a.rankPosition}.</Text>
              </View>
            </Animated.View>

            {a.monthlyVolume.length > 0 && (
              <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.chartCard}>
                <Text style={styles.chartTitle}>Monthly Volume</Text>
                <VolumeBarChart data={a.monthlyVolume} width={SCREEN_W - 64} label="LAST 6 MONTHS" barColor="#6366F1" />
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 8, gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceRaised, alignItems: "center", justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center", gap: 4 },
  headerTitle: {
    fontSize: 18, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5,
  },
  verifiedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.green, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2,
  },
  verifiedText: {
    fontSize: 8, fontWeight: "800", color: "#FFFFFF",
    fontFamily: "DMSans_800ExtraBold", letterSpacing: 0.5,
  },
  qrBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceRaised, alignItems: "center", justifyContent: "center",
  },

  tabBar: {
    flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 8,
  },
  tab: {
    flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10,
    backgroundColor: Colors.surfaceRaised,
  },
  tabActive: { backgroundColor: BRAND.colors.navy },
  tabText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  tabTextActive: { color: "#FFFFFF", fontWeight: "600" },

  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 14 },

  // Stats
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    flex: 1, minWidth: "45%", backgroundColor: Colors.surfaceRaised,
    borderRadius: 14, padding: 14, gap: 6,
  },
  statIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 24, fontWeight: "800", color: Colors.text, fontFamily: "DMSans_800ExtraBold" },
  statBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statLabel: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  deltaBadge: {
    flexDirection: "row", alignItems: "center", gap: 2,
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  deltaText: { fontSize: 10, fontWeight: "700", fontFamily: "DMSans_700Bold" },

  // Chart
  chartCard: { backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 16 },
  chartTitle: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold", marginBottom: 12 },
  chartContainer: { gap: 6 },
  chartBars: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", height: 68 },
  chartBar: { borderRadius: 4 },
  chartLabels: { flexDirection: "row", justifyContent: "space-around" },
  chartLabel: { fontSize: 9, color: Colors.textTertiary, textAlign: "center", fontFamily: "DMSans_400Regular" },

  // Highlights
  highlightRow: { flexDirection: "row", gap: 10 },
  highlightCard: {
    flex: 1, backgroundColor: Colors.surfaceRaised, borderRadius: 14,
    padding: 14, alignItems: "center", gap: 6,
  },
  highlightValue: { fontSize: 18, fontWeight: "800", color: Colors.text, fontFamily: "DMSans_800ExtraBold" },
  highlightLabel: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  // Pro upsell
  proCard: { backgroundColor: "rgba(196,154,26,0.06)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(196,154,26,0.2)" },
  proCardInner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  proCardInfo: { flex: 1 },
  proCardTitle: { fontSize: 14, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  proCardSub: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", marginTop: 2 },
  proCardPrice: { fontSize: 16, fontWeight: "800", color: BRAND.colors.amber, fontFamily: "DMSans_800ExtraBold" },

  sectionTitle: { fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },

  // Insights
  insightCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 14,
  },
  insightInfo: { flex: 1, gap: 4 },
  insightTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  insightDesc: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 18 },
});

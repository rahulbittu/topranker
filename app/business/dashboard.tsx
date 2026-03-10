import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Dimensions, TextInput, Alert,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/query-client";
import { updateBusinessHours, type HoursUpdate } from "@/lib/api";
import { SparklineChart } from "@/components/dashboard/SparklineChart";
import { VolumeBarChart } from "@/components/dashboard/VolumeBarChart";
import { VelocityIndicator } from "@/components/dashboard/VelocityIndicator";
import { DimensionBreakdownCard } from "@/components/dashboard/DimensionBreakdownCard";

const { width: SCREEN_W } = Dimensions.get("window");

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

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

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const chartH = 60;
  const barW = (SCREEN_W - 80) / data.length - 4;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartBars}>
        {data.map((val, i) => {
          const height = ((val - min) / range) * chartH + 8;
          const isLast = i === data.length - 1;
          return (
            <Animated.View
              key={i}
              entering={FadeInDown.delay(600 + i * 80).duration(300)}
              style={[styles.chartBar, { height, width: barW, backgroundColor: isLast ? color : `${color}40` }]}
            />
          );
        })}
      </View>
      <View style={styles.chartLabels}>
        {data.map((_, i) => (
          <Text key={i} style={[styles.chartLabel, { width: barW + 4 }]}>W{i + 1}</Text>
        ))}
      </View>
    </View>
  );
}

// Sprint 554: Business hours editor for claimed owners
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function HoursEditor({ businessId, delay }: { businessId: string; delay: number }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [hours, setHours] = useState<string[]>(
    DAY_NAMES.map(() => "11:00 AM – 10:00 PM"),
  );
  const [initialized, setInitialized] = useState(false);

  // Sprint 556: Fetch existing hours from business data
  const { data: existingHours } = useQuery<{ weekday_text?: string[] }>({
    queryKey: ["business-hours", businessId],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/businesses/${businessId}`, { credentials: "include" });
      if (!res.ok) return {};
      const json = await res.json();
      return json.data?.openingHours || json.openingHours || {};
    },
    staleTime: 300000,
  });

  // Pre-populate hours from existing data on first load
  if (existingHours?.weekday_text && existingHours.weekday_text.length === 7 && !initialized) {
    setHours(existingHours.weekday_text);
    setInitialized(true);
  }

  const mutation = useMutation({
    mutationFn: () => {
      const hoursUpdate: HoursUpdate = { weekday_text: hours };
      return updateBusinessHours(businessId, hoursUpdate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", businessId] });
      setEditing(false);
      Alert.alert("Hours Updated", "Your operating hours have been saved.");
    },
    onError: () => Alert.alert("Error", "Failed to update hours. Please try again."),
  });

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.hoursCard}>
      <View style={styles.hoursHeader}>
        <View style={styles.hoursHeaderLeft}>
          <Ionicons name="time-outline" size={18} color={BRAND.colors.amber} />
          <View>
            <Text style={styles.hoursTitle}>Operating Hours</Text>
            <Text style={styles.hoursSource}>{initialized ? "From your listing" : "Default hours — tap Edit to update"}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => editing ? mutation.mutate() : setEditing(true)} style={styles.hoursEditBtn}>
          <Ionicons name={editing ? "checkmark" : "create-outline"} size={16} color={BRAND.colors.amber} />
          <Text style={styles.hoursEditText}>{editing ? "Save" : "Edit"}</Text>
        </TouchableOpacity>
      </View>
      {DAY_NAMES.map((day, i) => (
        <View key={day} style={styles.hoursRow}>
          <Text style={styles.hoursDayLabel}>{day.slice(0, 3)}</Text>
          {editing ? (
            <TextInput
              style={styles.hoursInput}
              value={hours[i]}
              onChangeText={(t) => {
                const next = [...hours];
                next[i] = t;
                setHours(next);
              }}
              placeholder="e.g. 11:00 AM – 10:00 PM"
              placeholderTextColor={Colors.textTertiary}
            />
          ) : (
            <Text style={styles.hoursValue}>{hours[i]}</Text>
          )}
        </View>
      ))}
      {editing && (
        <TouchableOpacity onPress={() => setEditing(false)} style={styles.hoursCancelBtn}>
          <Text style={styles.hoursCancelText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

function ReviewCard({ rating, delay }: { rating: DashboardData["recentRatings"][0]; delay: number }) {
  const tierColors: Record<string, string> = {
    community: "#94A3B8", city: "#3B82F6", trusted: "#8B5CF6", top: "#F59E0B",
  };
  const tierNames: Record<string, string> = {
    community: "Community", city: "City", trusted: "Trusted", top: "Top",
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          <View style={[styles.reviewAvatar, { backgroundColor: tierColors[rating.tier] || Colors.textTertiary }]}>
            <Text style={styles.reviewAvatarText}>{rating.user.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.reviewUserName}>{rating.user}</Text>
            <Text style={[styles.reviewTier, { color: tierColors[rating.tier] }]}>{tierNames[rating.tier]} Reviewer</Text>
          </View>
        </View>
        <View style={styles.reviewScoreWrap}>
          <Text style={styles.reviewScore}>{rating.score.toFixed(1)}</Text>
          <Text style={styles.reviewDate}>{timeAgo(rating.date)}</Text>
        </View>
      </View>
      {rating.note && <Text style={styles.reviewNote}>"{rating.note}"</Text>}
      <View style={styles.reviewActions}>
        <TouchableOpacity style={styles.reviewActionBtn} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.reviewActionText}>Reply</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reviewActionBtn} activeOpacity={0.7}>
          <Ionicons name="flag-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.reviewActionText}>Flag</Text>
        </TouchableOpacity>
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

  // Sprint 532: Dimension breakdown for insights tab
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

            {/* Sprint 554: Hours editor for claimed owners */}
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
            {/* Sprint 532: Dimension breakdown card */}
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

  // Reviews
  sectionTitle: { fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  reviewCard: { backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 14, gap: 10 },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewUser: { flexDirection: "row", alignItems: "center", gap: 10 },
  reviewAvatar: {
    width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center",
  },
  reviewAvatarText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", fontFamily: "DMSans_700Bold" },
  reviewUserName: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  reviewTier: { fontSize: 10, fontFamily: "DMSans_400Regular" },
  reviewScoreWrap: { alignItems: "flex-end" },
  reviewScore: { fontSize: 18, fontWeight: "800", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold" },
  reviewDate: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  reviewNote: {
    fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    fontStyle: "italic", lineHeight: 19,
  },
  reviewActions: { flexDirection: "row", gap: 16 },
  reviewActionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  reviewActionText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },

  // Insights
  insightCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 14,
  },
  insightInfo: { flex: 1, gap: 4 },
  insightTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  insightDesc: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 18 },
  // Sprint 554: Hours editor
  hoursCard: { backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 14, gap: 8 },
  hoursHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  hoursHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  hoursTitle: { fontSize: 14, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  hoursSource: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", marginTop: 1 },
  hoursEditBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: `${BRAND.colors.amber}12` },
  hoursEditText: { fontSize: 12, fontWeight: "600", color: BRAND.colors.amber, fontFamily: "DMSans_600SemiBold" },
  hoursRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 4 },
  hoursDayLabel: { fontSize: 12, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold", width: 36 },
  hoursValue: { fontSize: 12, color: Colors.text, fontFamily: "DMSans_400Regular" },
  hoursInput: { flex: 1, marginLeft: 8, fontSize: 12, color: Colors.text, fontFamily: "DMSans_400Regular", borderWidth: 1, borderColor: Colors.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  hoursCancelBtn: { alignSelf: "center", paddingVertical: 6, paddingHorizontal: 16 },
  hoursCancelText: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_500Medium" },
});

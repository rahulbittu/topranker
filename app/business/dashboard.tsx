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
import { TypedIcon } from "@/components/TypedIcon";
import { useAuth } from "@/lib/auth-context";

const { width: SCREEN_W } = Dimensions.get("window");

// Mock analytics data
const MOCK_ANALYTICS = {
  totalRatings: 87,
  avgScore: 4.2,
  rankPosition: 3,
  rankDelta: 1,
  weeklyViews: 342,
  weeklyViewsDelta: 12,
  wouldReturnPct: 89,
  topDish: "Brisket Plate",
  topDishVotes: 34,
  ratingTrend: [3.8, 3.9, 4.0, 4.1, 4.0, 4.2, 4.2],
  weekLabels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7"],
  recentRatings: [
    { id: "1", user: "Sarah M.", score: 4.5, tier: "trusted", note: "Best brisket in Dallas, hands down.", date: "2h ago" },
    { id: "2", user: "Mike R.", score: 3.8, tier: "city", note: "Good food, wait was a bit long.", date: "5h ago" },
    { id: "3", user: "Jessica L.", score: 5.0, tier: "top", note: "Perfect experience every single time.", date: "1d ago" },
    { id: "4", user: "David K.", score: 4.0, tier: "community", note: null, date: "2d ago" },
  ],
};

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
        {MOCK_ANALYTICS.weekLabels.map((l, i) => (
          <Text key={i} style={[styles.chartLabel, { width: barW + 4 }]}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

function ReviewCard({ rating, delay }: { rating: typeof MOCK_ANALYTICS.recentRatings[0]; delay: number }) {
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
          <Text style={styles.reviewDate}>{rating.date}</Text>
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

  const a = MOCK_ANALYTICS;

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
              <StatCard label="Weekly Views" value={String(a.weeklyViews)} delta={a.weeklyViewsDelta} icon="eye-outline" color="#3B82F6" delay={400} />
            </View>

            <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.chartCard}>
              <Text style={styles.chartTitle}>Rating Trend (7 weeks)</Text>
              <MiniChart data={a.ratingTrend} color={BRAND.colors.amber} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.highlightRow}>
              <View style={styles.highlightCard}>
                <Ionicons name="thumbs-up" size={20} color={Colors.green} />
                <Text style={styles.highlightValue}>{a.wouldReturnPct}%</Text>
                <Text style={styles.highlightLabel}>Would Return</Text>
              </View>
              <View style={styles.highlightCard}>
                <Ionicons name="restaurant-outline" size={20} color={BRAND.colors.amber} />
                <Text style={styles.highlightValue}>{a.topDish}</Text>
                <Text style={styles.highlightLabel}>{a.topDishVotes} votes</Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(700).duration(400)} style={styles.proCard}>
              <View style={styles.proCardInner}>
                <Ionicons name="diamond-outline" size={24} color={BRAND.colors.amber} />
                <View style={styles.proCardInfo}>
                  <Text style={styles.proCardTitle}>Upgrade to Pro</Text>
                  <Text style={styles.proCardSub}>Respond to reviews, advanced analytics, verified badge</Text>
                </View>
                <Text style={styles.proCardPrice}>$49/mo</Text>
              </View>
            </Animated.View>
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
            <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.insightCard}>
              <Ionicons name="trending-up" size={20} color={Colors.green} />
              <View style={styles.insightInfo}>
                <Text style={styles.insightTitle}>Ranking is climbing</Text>
                <Text style={styles.insightDesc}>You moved up 1 position this week. Your average score increased from 4.0 to 4.2.</Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.insightCard}>
              <Ionicons name="people" size={20} color="#6366F1" />
              <View style={styles.insightInfo}>
                <Text style={styles.insightTitle}>Trusted reviewers love you</Text>
                <Text style={styles.insightDesc}>89% of Trusted and Top tier reviewers would return. Their weighted votes are driving your rank up.</Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.insightCard}>
              <Ionicons name="restaurant" size={20} color={BRAND.colors.amber} />
              <View style={styles.insightInfo}>
                <Text style={styles.insightTitle}>Brisket Plate is your star</Text>
                <Text style={styles.insightDesc}>34 dish votes for Brisket Plate — 2x more than any other item. Consider featuring it prominently.</Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.insightCard}>
              <Ionicons name="time" size={20} color={Colors.red} />
              <View style={styles.insightInfo}>
                <Text style={styles.insightTitle}>Wait times mentioned</Text>
                <Text style={styles.insightDesc}>3 recent reviews mention long wait times. Consider addressing peak hour capacity.</Text>
              </View>
            </Animated.View>
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
});

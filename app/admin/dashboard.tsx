/**
 * Admin Analytics Dashboard — Sprint 121
 * Foundation for admin-facing analytics UI.
 * Owner: Leo Hernandez (Frontend)
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Colors from "../../constants/colors";
import { BRAND } from "../../constants/brand";
import { TYPOGRAPHY } from "../../constants/typography";
import { getApiUrl } from "../../lib/query-client";
import { pct } from "@/lib/style-helpers";

interface StatCard {
  label: string;
  value: string;
  key: string;
}

const STAT_CARDS: StatCard[] = [
  { key: "totalEvents", label: "Total Events", value: "12,847" },
  { key: "activeUsers", label: "Active Users", value: "1,204" },
  { key: "signupRate", label: "Signup Rate", value: "8.3%" },
  { key: "ratingRate", label: "Rating Rate", value: "24.1%" },
];

interface FunnelStage {
  label: string;
  count: number;
  conversionRate: string | null;
}

interface DashboardData {
  overview: { totalEvents: number; activeUsers: number };
  funnel: {
    signupRate: number;
    ratingRate: number;
    pageViews?: number;
    signups?: number;
    firstRatings?: number;
    challengerEntries?: number;
    dashboardSubs?: number;
  };
}

// Sprint 203: Beta funnel data
interface BetaFunnelData {
  invitesSent: number;
  joinPageViews: number;
  signups: number;
  firstRatings: number;
  referralsShared: number;
  conversionRates: {
    inviteToView: string;
    viewToSignup: string;
    signupToRating: string;
    overallInviteToRating: string;
  };
  inviteTracking: { total: number; joined: number; pending: number };
}

interface ActiveUserData {
  last1h: number;
  last24h: number;
  last7d: number;
  last30d: number;
}

function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(getApiUrl() + "/api/admin/analytics/dashboard", {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Silently fail — stat cards will show defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return { data, loading, refetch: fetchDashboard };
}

// Sprint 203: Beta funnel + active users hooks
function useBetaFunnel() {
  const [data, setData] = useState<BetaFunnelData | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(getApiUrl() + "/api/admin/analytics/beta-funnel", { credentials: "include" });
        if (res.ok) { const json = await res.json(); setData(json.data); }
      } catch {}
    })();
  }, []);
  return data;
}

function useActiveUsers() {
  const [data, setData] = useState<ActiveUserData | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(getApiUrl() + "/api/admin/analytics/active-users", { credentials: "include" });
        if (res.ok) { const json = await res.json(); setData(json.data); }
      } catch {}
    })();
  }, []);
  return data;
}

const RECENT_ACTIVITY = [
  { id: "1", text: "New user registered — member #1205", time: "2m ago" },
  { id: "2", text: "Rating submitted for Sakura Ramen", time: "5m ago" },
  { id: "3", text: "Challenge created: Pizza Wars", time: "12m ago" },
  { id: "4", text: "Business claimed: Blue Bottle Coffee", time: "18m ago" },
  { id: "5", text: "Featured placement purchased — $49", time: "31m ago" },
];

// Sprint 207: Auto-refresh interval (60s)
const AUTO_REFRESH_INTERVAL_MS = 60_000;

export default function AdminDashboard() {
  const [lastRefresh, setLastRefresh] = useState<string>(
    new Date().toLocaleTimeString()
  );
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { data, loading, refetch } = useDashboardData();
  const betaFunnel = useBetaFunnel();
  const activeUsers = useActiveUsers();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleRefresh = () => {
    setLastRefresh(new Date().toLocaleTimeString());
    refetch();
  };

  // Sprint 207: Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        handleRefresh();
      }, AUTO_REFRESH_INTERVAL_MS);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh]);

  // Build live stat cards from API data when available
  const liveCards: StatCard[] = data
    ? [
        { key: "totalEvents", label: "Total Events", value: String(data.overview.totalEvents) },
        { key: "activeUsers", label: "Active Users", value: String(data.overview.activeUsers) },
        { key: "signupRate", label: "Signup Rate", value: `${data.funnel.signupRate}%` },
        { key: "ratingRate", label: "Rating Rate", value: `${data.funnel.ratingRate}%` },
      ]
    : STAT_CARDS;

  if (loading && !data) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={BRAND.colors.amber} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        <Text style={styles.subtitle}>Last updated: {lastRefresh}{autoRefresh ? " (auto)" : ""}</Text>
        <TouchableOpacity
          onPress={() => setAutoRefresh(!autoRefresh)}
          accessibilityRole="button"
          accessibilityLabel={autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"}
        >
          <Text style={styles.autoRefreshToggle}>
            Auto-refresh: {autoRefresh ? "ON" : "OFF"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        {liveCards.map((card) => (
          <View key={card.key} style={styles.statCard}>
            <Text style={styles.statValue}>{card.value}</Text>
            <Text style={styles.statLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
        accessibilityRole="button"
        accessibilityLabel="Refresh dashboard data"
      >
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>

      {/* Conversion Funnel — Sprint 123 */}
      <View style={styles.funnelSection}>
        <Text style={styles.funnelSectionHeader}>CONVERSION FUNNEL</Text>
        {(() => {
          const pv = data?.funnel?.pageViews ?? 10000;
          const su = data?.funnel?.signups ?? 830;
          const fr = data?.funnel?.firstRatings ?? 200;
          const ce = data?.funnel?.challengerEntries ?? 45;
          const ds = data?.funnel?.dashboardSubs ?? 12;
          const stages: FunnelStage[] = [
            { label: "Page Views", count: pv, conversionRate: null },
            { label: "Signups", count: su, conversionRate: pv > 0 ? `${((su / pv) * 100).toFixed(1)}%` : "N/A" },
            { label: "First Ratings", count: fr, conversionRate: su > 0 ? `${((fr / su) * 100).toFixed(1)}%` : "N/A" },
            { label: "Challenger Entries", count: ce, conversionRate: fr > 0 ? `${((ce / fr) * 100).toFixed(1)}%` : "N/A" },
            { label: "Dashboard Subs", count: ds, conversionRate: ce > 0 ? `${((ds / ce) * 100).toFixed(1)}%` : "N/A" },
          ];
          const maxCount = Math.max(...stages.map(s => s.count), 1);
          return stages.map((stage, idx) => (
            <View key={stage.label} style={styles.funnelRow}>
              <View style={styles.funnelLabelRow}>
                <Text style={styles.funnelLabel}>{stage.label}</Text>
                <Text style={styles.funnelCount}>{stage.count.toLocaleString()}</Text>
              </View>
              <View style={styles.funnelBarTrack}>
                <View
                  style={[
                    styles.funnelBarFill,
                    { width: pct(Math.max(2, (stage.count / maxCount) * 100)) },
                  ]}
                />
              </View>
              {stage.conversionRate && (
                <Text style={styles.funnelConversion}>↓ {stage.conversionRate} conversion</Text>
              )}
            </View>
          ));
        })()}
      </View>

      {/* Sprint 203: Beta Conversion Funnel */}
      {betaFunnel && (
        <View style={styles.funnelSection}>
          <Text style={styles.funnelSectionHeader}>BETA CONVERSION FUNNEL</Text>
          {[
            { label: "Invites Sent", count: betaFunnel.invitesSent, rate: null },
            { label: "Join Page Views", count: betaFunnel.joinPageViews, rate: betaFunnel.conversionRates.inviteToView },
            { label: "Signups", count: betaFunnel.signups, rate: betaFunnel.conversionRates.viewToSignup },
            { label: "First Ratings", count: betaFunnel.firstRatings, rate: betaFunnel.conversionRates.signupToRating },
            { label: "Referrals Shared", count: betaFunnel.referralsShared, rate: null },
          ].map((stage) => (
            <View key={stage.label} style={styles.funnelRow}>
              <View style={styles.funnelLabelRow}>
                <Text style={styles.funnelLabel}>{stage.label}</Text>
                <Text style={styles.funnelCount}>{stage.count}</Text>
              </View>
              <View style={styles.funnelBarTrack}>
                <View style={[styles.funnelBarFill, { width: pct(Math.max(2, (stage.count / Math.max(betaFunnel.invitesSent, 1)) * 100)) }]} />
              </View>
              {stage.rate && stage.rate !== "N/A" && (
                <Text style={styles.funnelConversion}>↓ {stage.rate} conversion</Text>
              )}
            </View>
          ))}
          <View style={styles.betaInviteStats}>
            <Text style={styles.betaInviteLabel}>Overall: {betaFunnel.conversionRates.overallInviteToRating} invite→rating</Text>
            <Text style={styles.betaInviteLabel}>Invites: {betaFunnel.inviteTracking.joined}/{betaFunnel.inviteTracking.total} joined</Text>
          </View>
        </View>
      )}

      {/* Sprint 203: Active Users */}
      {activeUsers && (
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Active Users</Text>
          <View style={styles.statsGrid}>
            {[
              { label: "Last Hour", value: activeUsers.last1h },
              { label: "Last 24h", value: activeUsers.last24h },
              { label: "Last 7d", value: activeUsers.last7d },
              { label: "Last 30d", value: activeUsers.last30d },
            ].map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {RECENT_ACTIVITY.map((item) => (
          <View key={item.id} style={styles.activityRow}>
            <Text style={styles.activityText}>{item.text}</Text>
            <Text style={styles.activityTime}>{item.time}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: BRAND.colors.navy,
  },
  title: {
    fontSize: TYPOGRAPHY.display.heading.fontSize,
    fontWeight: TYPOGRAPHY.display.heading.fontWeight,
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: TYPOGRAPHY.ui.caption.fontSize,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
  },
  statCard: {
    width: pct(48),
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    margin: pct(1),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: TYPOGRAPHY.display.score.fontSize,
    fontWeight: TYPOGRAPHY.display.score.fontWeight,
    color: BRAND.colors.amber,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.ui.label.fontSize,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  refreshButton: {
    backgroundColor: BRAND.colors.amber,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  refreshButtonText: {
    fontSize: TYPOGRAPHY.ui.button.fontSize,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  activitySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.display.small.fontSize,
    fontWeight: TYPOGRAPHY.display.small.fontWeight,
    color: Colors.text,
    marginBottom: 12,
  },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityText: {
    fontSize: TYPOGRAPHY.ui.body.fontSize,
    color: Colors.text,
    flex: 1,
  },
  activityTime: {
    fontSize: TYPOGRAPHY.ui.caption.fontSize,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  funnelSection: {
    padding: 16,
  },
  funnelSectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textTertiary,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  funnelRow: {
    marginBottom: 12,
  },
  funnelLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  funnelLabel: {
    fontSize: TYPOGRAPHY.ui.body.fontSize,
    fontWeight: "600",
    color: Colors.text,
  },
  funnelCount: {
    fontSize: TYPOGRAPHY.ui.body.fontSize,
    fontWeight: "700",
    color: BRAND.colors.amber,
  },
  funnelBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    overflow: "hidden",
  },
  funnelBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND.colors.amber,
  },
  funnelConversion: {
    fontSize: TYPOGRAPHY.ui.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  autoRefreshToggle: {
    fontSize: TYPOGRAPHY.ui.caption.fontSize,
    fontWeight: "600",
    color: BRAND.colors.amber,
    marginTop: 4,
  },
  betaInviteStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  betaInviteLabel: {
    fontSize: TYPOGRAPHY.ui.caption.fontSize,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
});

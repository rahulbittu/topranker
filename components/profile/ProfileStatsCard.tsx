/**
 * Sprint 401: Profile Stats Dashboard
 *
 * Extracted component showing rating activity heatmap,
 * score distribution, and most-rated businesses.
 * Computes all stats client-side from ratingHistory.
 */
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { pct } from "@/lib/style-helpers";

const AMBER = BRAND.colors.amber;

interface RatingHistoryItem {
  id: string;
  rawScore: string;
  createdAt: string;
  businessName: string;
  businessId: string;
}

export interface ProfileStatsCardProps {
  ratingHistory: RatingHistoryItem[];
  totalRatings: number;
  daysActive: number;
}

// ── Activity heatmap (last 30 days) ────────────────────────────────

function ActivityHeatmap({ ratingHistory }: { ratingHistory: RatingHistoryItem[] }) {
  const dayMap = useMemo(() => {
    const map: Record<string, number> = {};
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    for (const r of ratingHistory) {
      const ts = new Date(r.createdAt).getTime();
      if (ts >= thirtyDaysAgo) {
        const key = new Date(r.createdAt).toISOString().slice(0, 10);
        map[key] = (map[key] || 0) + 1;
      }
    }
    return map;
  }, [ratingHistory]);

  const days = useMemo(() => {
    const result: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, count: dayMap[key] || 0 });
    }
    return result;
  }, [dayMap]);

  const activeDays = days.filter(d => d.count > 0).length;

  return (
    <View style={styles.heatmapContainer}>
      <View style={styles.heatmapHeader}>
        <Text style={styles.heatmapTitle}>Last 30 Days</Text>
        <Text style={styles.heatmapActive}>{activeDays} active day{activeDays !== 1 ? "s" : ""}</Text>
      </View>
      <View style={styles.heatmapGrid}>
        {days.map((d) => (
          <View
            key={d.date}
            style={[
              styles.heatmapDot,
              d.count === 0 && styles.heatmapDotEmpty,
              d.count === 1 && styles.heatmapDotLow,
              d.count === 2 && styles.heatmapDotMedium,
              d.count >= 3 && styles.heatmapDotHigh,
            ]}
          />
        ))}
      </View>
      <View style={styles.heatmapLegend}>
        <Text style={styles.heatmapLegendText}>Less</Text>
        <View style={[styles.heatmapDot, styles.heatmapDotEmpty, styles.heatmapLegendDot]} />
        <View style={[styles.heatmapDot, styles.heatmapDotLow, styles.heatmapLegendDot]} />
        <View style={[styles.heatmapDot, styles.heatmapDotMedium, styles.heatmapLegendDot]} />
        <View style={[styles.heatmapDot, styles.heatmapDotHigh, styles.heatmapLegendDot]} />
        <Text style={styles.heatmapLegendText}>More</Text>
      </View>
    </View>
  );
}

// ── Score distribution ─────────────────────────────────────────────

function ScoreDistribution({ ratingHistory }: { ratingHistory: RatingHistoryItem[] }) {
  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // indices 0-4 for scores 1-5
    for (const r of ratingHistory) {
      const score = Math.round(parseFloat(r.rawScore));
      if (score >= 1 && score <= 5) counts[score - 1]++;
    }
    return counts;
  }, [ratingHistory]);

  const maxCount = Math.max(...distribution, 1);
  const labels = ["1", "2", "3", "4", "5"];

  return (
    <View style={styles.distContainer}>
      <Text style={styles.distTitle}>Score Distribution</Text>
      <View style={styles.distBars}>
        {distribution.map((count, i) => (
          <View key={i} style={styles.distBarCol}>
            <Text style={styles.distBarCount}>{count}</Text>
            <View style={styles.distBarTrack}>
              <View
                style={[
                  styles.distBarFill,
                  { height: pct(Math.max((count / maxCount) * 100, 4)) },
                  i === 4 && styles.distBarFillTop,
                ]}
              />
            </View>
            <Text style={styles.distBarLabel}>{labels[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Most-rated businesses ──────────────────────────────────────────

function MostRatedBusinesses({ ratingHistory }: { ratingHistory: RatingHistoryItem[] }) {
  const topBusinesses = useMemo(() => {
    const counts: Record<string, { name: string; count: number; avgScore: number; totalScore: number }> = {};
    for (const r of ratingHistory) {
      const key = r.businessId;
      if (!counts[key]) counts[key] = { name: r.businessName, count: 0, avgScore: 0, totalScore: 0 };
      counts[key].count++;
      counts[key].totalScore += parseFloat(r.rawScore);
    }
    return Object.values(counts)
      .map(b => ({ ...b, avgScore: b.totalScore / b.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [ratingHistory]);

  if (topBusinesses.length === 0) return null;

  return (
    <View style={styles.topBizContainer}>
      <Text style={styles.topBizTitle}>Most Rated</Text>
      {topBusinesses.map((biz, i) => (
        <View key={i} style={styles.topBizRow}>
          <Text style={styles.topBizRank}>#{i + 1}</Text>
          <View style={styles.topBizInfo}>
            <Text style={styles.topBizName} numberOfLines={1}>{biz.name}</Text>
            <Text style={styles.topBizMeta}>{biz.count} rating{biz.count !== 1 ? "s" : ""} · avg {biz.avgScore.toFixed(1)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Main component ─────────────────────────────────────────────────

export function ProfileStatsCard({ ratingHistory, totalRatings, daysActive }: ProfileStatsCardProps) {
  if (totalRatings < 3) return null; // Need minimum data for meaningful stats

  const avgRatingsPerDay = daysActive > 0 ? (totalRatings / daysActive).toFixed(1) : "0";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="stats-chart" size={16} color={AMBER} />
        <Text style={styles.cardTitle}>Rating Stats</Text>
        <Text style={styles.cardSubtitle}>{avgRatingsPerDay}/day avg</Text>
      </View>

      <ActivityHeatmap ratingHistory={ratingHistory} />
      <ScoreDistribution ratingHistory={ratingHistory} />
      <MostRatedBusinesses ratingHistory={ratingHistory} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    gap: 16,
    ...Colors.cardShadow,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },

  // Heatmap
  heatmapContainer: { gap: 8 },
  heatmapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heatmapTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold",
  },
  heatmapActive: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  heatmapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
  },
  heatmapDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  heatmapDotEmpty: {
    backgroundColor: Colors.border,
  },
  heatmapDotLow: {
    backgroundColor: "rgba(196,154,26,0.3)",
  },
  heatmapDotMedium: {
    backgroundColor: "rgba(196,154,26,0.6)",
  },
  heatmapDotHigh: {
    backgroundColor: AMBER,
  },
  heatmapLegend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 3,
  },
  heatmapLegendDot: {
    width: 10,
    height: 10,
  },
  heatmapLegendText: {
    fontSize: 9,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },

  // Score distribution
  distContainer: { gap: 8 },
  distTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold",
  },
  distBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    height: 80,
  },
  distBarCol: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  distBarCount: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "DMSans_500Medium",
  },
  distBarTrack: {
    width: pct(100),
    height: 50,
    backgroundColor: Colors.border,
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  distBarFill: {
    width: "100%",
    backgroundColor: "rgba(196,154,26,0.4)",
    borderRadius: 4,
  },
  distBarFillTop: {
    backgroundColor: AMBER,
  },
  distBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },

  // Most rated
  topBizContainer: { gap: 8 },
  topBizTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold",
  },
  topBizRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  topBizRank: {
    fontSize: 13,
    fontWeight: "700",
    color: AMBER,
    fontFamily: "PlayfairDisplay_700Bold",
    width: 24,
  },
  topBizInfo: { flex: 1, gap: 1 },
  topBizName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  topBizMeta: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
});

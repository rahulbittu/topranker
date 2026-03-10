/**
 * Sprint 268: Score Breakdown Card
 * Shows visit-type score separation, food-only score, verified %, would-return %.
 * Rating Integrity Part 9: "Show the breakdown, not just the number."
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { apiFetch } from "@/lib/query-client";
import { getRankConfidence, RANK_CONFIDENCE_LABELS, type RankConfidence } from "@/lib/data";

interface VisitTypeBreakdown {
  count: number;
  overallScore: number;
  foodScore: number;
}

interface BreakdownData {
  totalRatings: number;
  overallScore: number;
  foodScoreOnly: number;
  dineIn: VisitTypeBreakdown | null;
  delivery: VisitTypeBreakdown | null;
  takeaway: VisitTypeBreakdown | null;
  verifiedPercentage: number;
  wouldReturnPercentage: number;
  raterDistribution: {
    dineIn: number;
    delivery: number;
    takeaway: number;
  };
}

interface ScoreBreakdownProps {
  businessId: string;
  category?: string;
}

export function ScoreBreakdown({ businessId, category }: ScoreBreakdownProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["score-breakdown", businessId],
    queryFn: async () => {
      const res = await apiFetch(`/api/businesses/${businessId}/score-breakdown`);
      const json = await res.json();
      return json.data as BreakdownData;
    },
    enabled: !!businessId,
  });

  if (isLoading || !data) return null;

  // Sprint 269: Low-data honesty — show different state for few ratings
  const confidence = getRankConfidence(data.totalRatings, category);
  const confLabel = RANK_CONFIDENCE_LABELS[confidence];

  if (data.totalRatings === 0) {
    return (
      <View style={s.card}>
        <Text style={s.cardTitle}>SCORE BREAKDOWN</Text>
        <View style={s.lowDataBanner}>
          <Ionicons name="hourglass-outline" size={18} color={BRAND.colors.amber} />
          <View style={s.lowDataTextWrap}>
            <Text style={s.lowDataTitle}>Not enough ratings yet</Text>
            <Text style={s.lowDataDesc}>Be one of the first to rate this restaurant.</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.cardTitle}>SCORE BREAKDOWN</Text>
        {confidence !== "strong" && (
          <View style={[
            s.confBadge,
            confidence === "provisional" && s.confBadgeProvisional,
            confidence === "early" && s.confBadgeEarly,
            confidence === "established" && s.confBadgeEstablished,
          ]}>
            <Ionicons
              name={confidence === "provisional" ? "hourglass-outline" : confidence === "early" ? "trending-up" : "shield-checkmark"}
              size={10}
              color={confidence === "provisional" ? Colors.textTertiary : confidence === "early" ? BRAND.colors.amber : Colors.green}
            />
            <Text style={[
              s.confBadgeText,
              confidence === "provisional" && { color: Colors.textTertiary },
              confidence === "early" && { color: BRAND.colors.amber },
              confidence === "established" && { color: Colors.green },
            ]}>
              {confLabel.label}
            </Text>
          </View>
        )}
      </View>

      {/* Visit type scores */}
      <View style={s.visitTypes}>
        {data.dineIn && (
          <VisitTypeRow
            icon="restaurant-outline"
            label="Dine-in"
            count={data.dineIn.count}
            score={data.dineIn.overallScore}
          />
        )}
        {data.delivery && (
          <VisitTypeRow
            icon="bicycle-outline"
            label="Delivery"
            count={data.delivery.count}
            score={data.delivery.overallScore}
          />
        )}
        {data.takeaway && (
          <VisitTypeRow
            icon="bag-handle-outline"
            label="Takeaway"
            count={data.takeaway.count}
            score={data.takeaway.overallScore}
          />
        )}
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statValue}>{data.foodScoreOnly.toFixed(1)}</Text>
          <Text style={s.statLabel}>Food Only</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statValue}>{data.verifiedPercentage}%</Text>
          <Text style={s.statLabel}>Verified</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statValue}>{data.wouldReturnPercentage}%</Text>
          <Text style={s.statLabel}>Return</Text>
        </View>
      </View>
    </View>
  );
}

function VisitTypeRow({ icon, label, count, score }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  count: number;
  score: number;
}) {
  return (
    <View style={s.visitRow}>
      <View style={s.visitLeft}>
        <Ionicons name={icon} size={16} color={Colors.textSecondary} />
        <Text style={s.visitLabel}>{label}</Text>
        <Text style={s.visitCount}>{count}</Text>
      </View>
      <Text style={s.visitScore}>{score.toFixed(1)}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    ...Colors.cardShadow,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold",
    letterSpacing: 1.5,
  },
  confBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: Colors.surfaceRaised,
  },
  confBadgeProvisional: { backgroundColor: `${Colors.textTertiary}10` },
  confBadgeEarly: { backgroundColor: "rgba(196,154,26,0.10)" },
  confBadgeEstablished: { backgroundColor: "rgba(34,139,34,0.10)" },
  confBadgeText: {
    fontSize: 9,
    fontWeight: "600",
    fontFamily: "DMSans_600SemiBold",
    letterSpacing: 0.5,
  },
  lowDataBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  lowDataTextWrap: { flex: 1 },
  lowDataTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  lowDataDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    marginTop: 2,
  },
  visitTypes: { gap: 8 },
  visitRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  visitLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  visitLabel: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: "DMSans_500Medium",
  },
  visitCount: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  visitScore: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: { alignItems: "center", gap: 2 },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gold,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
});

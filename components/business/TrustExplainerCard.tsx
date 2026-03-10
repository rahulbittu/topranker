import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { getRankConfidence } from "@/lib/data";
import { formatReturnRate } from "@/lib/style-helpers";
import { SlideUpView } from "@/components/animations/SlideUpView";
import { useExperiment } from "@/lib/use-experiment";
import type { MappedRating } from "./types";

export interface TrustExplainerCardProps {
  ratingCount: number;
  weightedScore: number;
  category: string;
  ratings: MappedRating[];
  // Sprint 348: Trust card refresh — trusted rater count and freshness
  trustedRaterCount?: number;
  lastRatedDate?: string;
}

export function TrustExplainerCard({ ratingCount, weightedScore, category, ratings, trustedRaterCount, lastRatedDate }: TrustExplainerCardProps) {
  const conf = getRankConfidence(ratingCount, category);
  const { isTreatment: showTrustLabels } = useExperiment("trust_signal_style");
  const bodyText = (conf === "provisional" || conf === "early")
    ? `Based on ${ratingCount} rating${ratingCount !== 1 ? "s" : ""} so far. This ranking will stabilize as more community members contribute. Each rating is weighted by the rater's credibility.`
    : `Calculated from ${ratingCount.toLocaleString()} community ratings, weighted by each rater's credibility. Higher-credibility members have more influence, making this ranking resistant to spam and manipulation.`;

  const trustSignals: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; color: string }[] = [];
  if (showTrustLabels) {
    if (conf === "established" || conf === "strong") {
      trustSignals.push({ icon: "shield-checkmark", label: "Established", color: Colors.green });
    }
    if (ratingCount >= 10) {
      trustSignals.push({ icon: "checkmark-circle", label: "Verified", color: Colors.blue });
    }
  }

  return (
    <SlideUpView delay={100} distance={20}>
      <View style={s.trustCard}>
        <View style={s.trustCardHeader}>
          <Ionicons name="shield-checkmark" size={16} color={Colors.green} />
          <Text style={s.trustCardTitle}>About This Ranking</Text>
          {showTrustLabels && trustSignals.map((sig, i) => (
            <View key={i} style={s.trustSignalBadge}>
              <Ionicons name={sig.icon} size={12} color={sig.color} />
              <Text style={[s.trustSignalLabel, { color: sig.color }]}>{sig.label}</Text>
            </View>
          ))}
        </View>
        <Text style={s.trustCardBody}>{bodyText}</Text>
        {/* Sprint 348: Confidence badge */}
        <View style={s.confidenceBadgeRow}>
          <View style={[s.confidenceBadge, conf === "strong" && s.confidenceBadgeStrong, conf === "established" && s.confidenceBadgeEstablished]}>
            <Ionicons name={conf === "strong" || conf === "established" ? "shield-checkmark" : "hourglass-outline"} size={12} color={conf === "strong" ? Colors.green : conf === "established" ? Colors.blue : BRAND.colors.amber} />
            <Text style={[s.confidenceBadgeText, { color: conf === "strong" ? Colors.green : conf === "established" ? Colors.blue : BRAND.colors.amber }]}>
              {conf === "strong" ? "High Confidence" : conf === "established" ? "Established" : conf === "early" ? "Early" : "Provisional"}
            </Text>
          </View>
          {lastRatedDate && (
            <Text style={s.lastRatedText}>Last rated {lastRatedDate}</Text>
          )}
        </View>
        <View style={s.trustCardStats}>
          <View style={s.trustStat}>
            <Text style={s.trustStatValue}>{ratingCount.toLocaleString()}</Text>
            <Text style={s.trustStatLabel}>Weighted Ratings</Text>
          </View>
          <View style={s.trustStat}>
            <Text style={s.trustStatValue}>{weightedScore.toFixed(1)}</Text>
            <Text style={s.trustStatLabel}>Community Score</Text>
          </View>
          {ratings.length > 0 && (
            <View style={s.trustStat}>
              <Text style={s.trustStatValue}>
                {formatReturnRate(ratings.filter(r => r.wouldReturn).length, ratings.length)}
              </Text>
              <Text style={s.trustStatLabel}>Would Return</Text>
            </View>
          )}
          {(trustedRaterCount ?? 0) > 0 && (
            <View style={s.trustStat}>
              <Text style={s.trustStatValue}>{trustedRaterCount}</Text>
              <Text style={s.trustStatLabel}>Trusted Raters</Text>
            </View>
          )}
        </View>
      </View>
    </SlideUpView>
  );
}

export default TrustExplainerCard;

const s = StyleSheet.create({
  trustCard: {
    backgroundColor: `${Colors.green}08`, borderRadius: 14, padding: 16,
    gap: 10, borderWidth: 1, borderColor: `${Colors.green}20`,
  },
  trustCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" as const },
  trustCardTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  trustSignalBadge: {
    flexDirection: "row" as const, alignItems: "center" as const, gap: 3,
    backgroundColor: `${Colors.green}12`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  trustSignalLabel: {
    fontSize: 10, fontWeight: "600" as const, fontFamily: "DMSans_600SemiBold",
  },
  trustCardBody: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 18 },
  trustCardStats: {
    flexDirection: "row", justifyContent: "space-around",
    paddingTop: 8, borderTopWidth: 1, borderTopColor: `${Colors.green}15`,
  },
  trustStat: { alignItems: "center", gap: 2 },
  trustStatValue: { fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold" },
  trustStatLabel: {
    fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textTransform: "uppercase" as const, letterSpacing: 0.5,
  },
  // Sprint 348: Confidence badge + freshness
  confidenceBadgeRow: {
    flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const,
  },
  confidenceBadge: {
    flexDirection: "row" as const, alignItems: "center" as const, gap: 4,
    backgroundColor: `${BRAND.colors.amber}15`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  confidenceBadgeStrong: { backgroundColor: `${Colors.green}15` },
  confidenceBadgeEstablished: { backgroundColor: `${Colors.blue}15` },
  confidenceBadgeText: {
    fontSize: 11, fontWeight: "600" as const, fontFamily: "DMSans_600SemiBold",
  },
  lastRatedText: {
    fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
});

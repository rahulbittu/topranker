/**
 * Sprint 523: Push Experiment Results Dashboard
 *
 * Deep analysis card for completed or running push experiments.
 * Shows confidence interval bars, winner detection with statistical
 * significance status, lift calculations, and recommended actions.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import type { PushExperimentData, PushExperimentDashboard } from "./PushExperimentsCard";

interface ExperimentResultsCardProps {
  experiments: PushExperimentData[];
}

function ConfidenceBar({ lower, center, upper }: { lower: number; center: number; upper: number }) {
  const barWidth = Math.max(upper - lower, 1);
  const leftOffset = Math.max(lower, 0);
  return (
    <View style={styles.ciContainer}>
      <View style={styles.ciTrack}>
        <View
          style={[
            styles.ciBar,
            { left: `${leftOffset}%`, width: `${barWidth}%` },
          ]}
        />
        <View style={[styles.ciCenter, { left: `${center}%` }]} />
      </View>
      <View style={styles.ciLabels}>
        <Text style={styles.ciLabel}>{lower.toFixed(1)}%</Text>
        <Text style={styles.ciCenter_text}>{center.toFixed(1)}%</Text>
        <Text style={styles.ciLabel}>{upper.toFixed(1)}%</Text>
      </View>
    </View>
  );
}

function WinnerBadge({ variant, lift }: { variant: string; lift: number }) {
  return (
    <View style={styles.winnerBadge}>
      <Ionicons name="trophy" size={14} color={BRAND.colors.amber} />
      <Text style={styles.winnerText}>
        {variant} wins (+{lift.toFixed(1)}% lift)
      </Text>
    </View>
  );
}

function SignificanceMeter({ confidence }: { confidence: string }) {
  const isSufficient = confidence === "sufficient_data";
  return (
    <View style={styles.sigRow}>
      <View style={[styles.sigDot, { backgroundColor: isSufficient ? Colors.green : Colors.red }]} />
      <Text style={styles.sigText}>
        {isSufficient ? "Statistically significant" : "Insufficient data — keep running"}
      </Text>
    </View>
  );
}

function ActionRecommendation({ recommendation, hasWinner }: { recommendation: string; hasWinner: boolean }) {
  const actions: Record<string, string> = {
    treatment_winning: "Consider adopting the treatment variant as the new default.",
    control_winning: "Control performs better. Keep current copy or test new treatment.",
    promising: "Promising early results. Continue running for more data.",
    inconclusive: "No clear winner yet. Consider extending the experiment duration.",
    insufficient_data: "Need more exposures. Keep the experiment active.",
  };
  const action = actions[recommendation] || "Monitor experiment progress.";
  return (
    <View style={styles.actionRow}>
      <Ionicons name="bulb-outline" size={14} color={BRAND.colors.amber} />
      <Text style={styles.actionText}>{action}</Text>
    </View>
  );
}

function ExperimentResult({ experiment }: { experiment: PushExperimentData }) {
  const { dashboard } = experiment;
  if (!dashboard || dashboard.variants.length === 0) return null;

  // Find winner (highest conversion rate with sufficient data)
  const sorted = [...dashboard.variants].sort((a, b) => b.conversionRate - a.conversionRate);
  const best = sorted[0];
  const second = sorted.length > 1 ? sorted[1] : null;
  const hasWinner = dashboard.confidence === "sufficient_data" && best && second && best.conversionRate > second.conversionRate;
  const lift = hasWinner && second ? best.conversionRate - second.conversionRate : 0;

  return (
    <View style={styles.resultBlock}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultName}>{experiment.description}</Text>
        <Text style={styles.resultMeta}>
          {experiment.category} • {dashboard.totalExposures} exposures
        </Text>
      </View>

      <SignificanceMeter confidence={dashboard.confidence} />

      {hasWinner && <WinnerBadge variant={best.variant} lift={lift} />}

      <Text style={styles.sectionLabel}>Confidence Intervals</Text>
      {dashboard.variants.map((v) => (
        <View key={v.variant} style={styles.ciRow}>
          <Text style={styles.ciVariantName}>{v.variant}</Text>
          <ConfidenceBar lower={v.confidence.lower} center={v.confidence.center} upper={v.confidence.upper} />
        </View>
      ))}

      <Text style={styles.sectionLabel}>Variant Comparison</Text>
      {dashboard.variants.map((v) => (
        <View key={v.variant} style={styles.compRow}>
          <Text style={styles.compName}>{v.variant}</Text>
          <Text style={styles.compStat}>{v.exposures} sent</Text>
          <Text style={styles.compStat}>{v.outcomes} opened</Text>
          <Text style={[styles.compRate, v === best ? styles.compBest : null]}>
            {v.conversionRate.toFixed(1)}%
          </Text>
        </View>
      ))}

      <ActionRecommendation recommendation={dashboard.recommendation} hasWinner={hasWinner} />
    </View>
  );
}

export function ExperimentResultsCard({ experiments }: ExperimentResultsCardProps) {
  if (experiments.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="bar-chart-outline" size={18} color={BRAND.colors.amber} />
        <Text style={styles.cardTitle}>Experiment Results</Text>
      </View>
      {experiments.map((exp) => (
        <ExperimentResult key={exp.id} experiment={exp} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Colors.cardShadow,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  resultBlock: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border, paddingTop: 12, marginTop: 8 },
  resultHeader: { marginBottom: 8 },
  resultName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  resultMeta: { fontSize: 11, color: Colors.subtext, fontFamily: "DMSans_400Regular", marginTop: 2 },
  sigRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  sigDot: { width: 8, height: 8, borderRadius: 4 },
  sigText: { fontSize: 12, color: Colors.text, fontFamily: "DMSans_500Medium" },
  winnerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: `${BRAND.colors.amber}15`,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  winnerText: { fontSize: 12, fontWeight: "600", color: BRAND.colors.amber, fontFamily: "DMSans_600SemiBold" },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: Colors.textTertiary, fontFamily: "DMSans_700Bold", letterSpacing: 0.5, marginTop: 10, marginBottom: 6 },
  ciRow: { marginBottom: 8 },
  ciVariantName: { fontSize: 12, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold", marginBottom: 2 },
  ciContainer: {},
  ciTrack: { height: 8, backgroundColor: Colors.border, borderRadius: 4, position: "relative", overflow: "hidden" },
  ciBar: { position: "absolute", top: 0, height: 8, backgroundColor: `${BRAND.colors.amber}40`, borderRadius: 4 },
  ciCenter: { position: "absolute", top: -1, width: 3, height: 10, backgroundColor: BRAND.colors.amber, borderRadius: 1 },
  ciLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  ciLabel: { fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  ciCenter_text: { fontSize: 9, fontWeight: "600", color: BRAND.colors.amber, fontFamily: "DMSans_600SemiBold" },
  compRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 4 },
  compName: { fontSize: 12, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold", width: 80 },
  compStat: { fontSize: 11, color: Colors.subtext, fontFamily: "DMSans_400Regular", width: 70, textAlign: "center" },
  compRate: { fontSize: 12, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold", width: 50, textAlign: "right" },
  compBest: { color: Colors.green },
  actionRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 10, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  actionText: { fontSize: 12, color: Colors.text, fontFamily: "DMSans_400Regular", flex: 1 },
});

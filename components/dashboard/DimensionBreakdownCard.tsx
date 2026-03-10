/**
 * Sprint 532: Dimension breakdown card for business owner dashboard.
 * Shows per-dimension average scores and visit type distribution.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { pct } from "@/lib/style-helpers";

interface DimensionData {
  food: number;
  service: number;
  vibe: number;
  packaging: number;
  waitTime: number;
  value: number;
}

interface VisitTypeDistribution {
  dineIn: number;
  delivery: number;
  takeaway: number;
}

interface DimensionBreakdownCardProps {
  dimensions: DimensionData;
  visitTypeDistribution: VisitTypeDistribution;
  totalRatings: number;
  primaryVisitType: "dineIn" | "delivery" | "takeaway";
  delay?: number;
}

const VISIT_TYPE_META: Record<string, { icon: string; label: string; color: string }> = {
  dineIn: { icon: "🍽️", label: "Dine-in", color: BRAND.colors.amber },
  delivery: { icon: "🛵", label: "Delivery", color: "#3B82F6" },
  takeaway: { icon: "📦", label: "Takeaway", color: "#8B5CF6" },
};

function ScoreBar({ label, score, maxScore = 5 }: { label: string; score: number; maxScore?: number }) {
  const pct = score > 0 ? (score / maxScore) * 100 : 0;
  const color = score >= 4 ? Colors.green : score >= 3 ? BRAND.colors.amber : score >= 2 ? "#F97316" : Colors.red;

  return (
    <View style={s.scoreRow}>
      <Text style={s.scoreLabel}>{label}</Text>
      <View style={s.barOuter}>
        <View style={[s.barInner, { width: pct(score > 0 ? (score / maxScore) * 100 : 0), backgroundColor: color }]} />
      </View>
      <Text style={[s.scoreValue, { color }]}>{score > 0 ? score.toFixed(1) : "—"}</Text>
    </View>
  );
}

export function DimensionBreakdownCard({
  dimensions,
  visitTypeDistribution,
  totalRatings,
  primaryVisitType,
  delay = 0,
}: DimensionBreakdownCardProps) {
  const total = visitTypeDistribution.dineIn + visitTypeDistribution.delivery + visitTypeDistribution.takeaway;

  // Show relevant dimensions based on primary visit type
  const dineInDimensions = [
    { label: "Food", score: dimensions.food },
    { label: "Service", score: dimensions.service },
    { label: "Vibe", score: dimensions.vibe },
  ];

  const deliveryDimensions = [
    { label: "Food", score: dimensions.food },
    { label: "Packaging", score: dimensions.packaging },
    { label: "Value", score: dimensions.value },
  ];

  const takeawayDimensions = [
    { label: "Food", score: dimensions.food },
    { label: "Wait Time", score: dimensions.waitTime },
    { label: "Value", score: dimensions.value },
  ];

  // Show all non-zero dimensions
  const allDimensions = [
    { label: "Food", score: dimensions.food },
    ...(dimensions.service > 0 ? [{ label: "Service", score: dimensions.service }] : []),
    ...(dimensions.vibe > 0 ? [{ label: "Vibe", score: dimensions.vibe }] : []),
    ...(dimensions.packaging > 0 ? [{ label: "Packaging", score: dimensions.packaging }] : []),
    ...(dimensions.waitTime > 0 ? [{ label: "Wait Time", score: dimensions.waitTime }] : []),
    ...(dimensions.value > 0 ? [{ label: "Value", score: dimensions.value }] : []),
  ];

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={s.card}>
      <View style={s.header}>
        <Ionicons name="bar-chart" size={16} color={BRAND.colors.amber} />
        <Text style={s.title}>Dimension Breakdown</Text>
      </View>

      {/* Score bars */}
      <View style={s.scoresSection}>
        {allDimensions.map((dim) => (
          <ScoreBar key={dim.label} label={dim.label} score={dim.score} />
        ))}
      </View>

      {/* Visit type distribution */}
      {total > 0 && (
        <View style={s.visitSection}>
          <Text style={s.visitTitle}>VISIT TYPES</Text>
          <View style={s.visitBarOuter}>
            {visitTypeDistribution.dineIn > 0 && (
              <View style={[s.visitBarSegment, { flex: visitTypeDistribution.dineIn, backgroundColor: VISIT_TYPE_META.dineIn.color }]} />
            )}
            {visitTypeDistribution.delivery > 0 && (
              <View style={[s.visitBarSegment, { flex: visitTypeDistribution.delivery, backgroundColor: VISIT_TYPE_META.delivery.color }]} />
            )}
            {visitTypeDistribution.takeaway > 0 && (
              <View style={[s.visitBarSegment, { flex: visitTypeDistribution.takeaway, backgroundColor: VISIT_TYPE_META.takeaway.color }]} />
            )}
          </View>
          <View style={s.visitLegend}>
            {Object.entries(visitTypeDistribution).map(([key, count]) => {
              if (count === 0) return null;
              const meta = VISIT_TYPE_META[key];
              const pct = Math.round((count / total) * 100);
              return (
                <View key={key} style={s.visitLegendItem}>
                  <Text style={s.visitLegendIcon}>{meta.icon}</Text>
                  <Text style={s.visitLegendLabel}>{meta.label}</Text>
                  <Text style={[s.visitLegendPct, { color: meta.color }]}>{pct}%</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 16, gap: 14,
  },
  header: {
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  title: {
    fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  scoresSection: { gap: 10 },
  scoreRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  scoreLabel: {
    width: 70, fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_500Medium",
  },
  barOuter: {
    flex: 1, height: 8, borderRadius: 4, backgroundColor: Colors.border, overflow: "hidden",
  },
  barInner: {
    height: "100%", borderRadius: 4,
  },
  scoreValue: {
    width: 30, fontSize: 13, fontWeight: "700", fontFamily: "DMSans_700Bold", textAlign: "right",
  },
  visitSection: { gap: 8, paddingTop: 4, borderTopWidth: 1, borderTopColor: Colors.border },
  visitTitle: {
    fontSize: 10, fontWeight: "700", color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold", letterSpacing: 1.5,
  },
  visitBarOuter: {
    flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden", gap: 2,
  },
  visitBarSegment: {
    height: "100%", borderRadius: 2,
  },
  visitLegend: {
    flexDirection: "row", gap: 16,
  },
  visitLegendItem: {
    flexDirection: "row", alignItems: "center", gap: 4,
  },
  visitLegendIcon: { fontSize: 12 },
  visitLegendLabel: {
    fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
  visitLegendPct: {
    fontSize: 11, fontWeight: "700", fontFamily: "DMSans_700Bold",
  },
});

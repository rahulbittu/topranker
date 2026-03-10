/**
 * Sprint 569: Credibility breakdown tooltip
 * Expandable panel showing how each factor contributes to the credibility score
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import Animated, { FadeInDown } from "react-native-reanimated";

const AMBER = BRAND.colors.amber;

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export interface CredibilityBreakdown {
  base: number;
  volume: number;
  diversity: number;
  age: number;
  variance: number;
  helpfulness: number;
  penalties: number;
}

export interface CredibilityBreakdownTooltipProps {
  breakdown: CredibilityBreakdown;
  totalScore: number;
  visible: boolean;
}

interface FactorConfig {
  key: keyof CredibilityBreakdown;
  label: string;
  icon: IoniconsName;
  description: string;
}

const FACTORS: FactorConfig[] = [
  { key: "base", label: "Base", icon: "shield-checkmark-outline", description: "Account foundation" },
  { key: "volume", label: "Volume", icon: "stats-chart-outline", description: "Number of ratings" },
  { key: "diversity", label: "Diversity", icon: "grid-outline", description: "Unique places rated" },
  { key: "age", label: "Account Age", icon: "time-outline", description: "Time on platform" },
  { key: "variance", label: "Consistency", icon: "analytics-outline", description: "Rating pattern quality" },
  { key: "helpfulness", label: "Detail", icon: "document-text-outline", description: "Photos, dish tags, extras" },
  { key: "penalties", label: "Penalties", icon: "warning-outline", description: "Spam or pattern flags" },
];

function FactorRow({ factor, value, maxValue }: { factor: FactorConfig; value: number; maxValue: number }) {
  const isPenalty = factor.key === "penalties";
  const barWidth = maxValue > 0 ? Math.min((Math.abs(value) / maxValue) * 100, 100) : 0;
  const barColor = isPenalty ? "#EF4444" : AMBER;

  return (
    <View style={s.factorRow}>
      <View style={s.factorLeft}>
        <Ionicons name={factor.icon} size={14} color={isPenalty ? "#EF4444" : Colors.textTertiary} />
        <View style={s.factorTextCol}>
          <Text style={s.factorLabel}>{factor.label}</Text>
          <Text style={s.factorDesc}>{factor.description}</Text>
        </View>
      </View>
      <View style={s.factorRight}>
        <View style={s.barBg}>
          <View style={[s.barFill, { width: `${barWidth}%` as any, backgroundColor: barColor }]} />
        </View>
        <Text style={[s.factorValue, isPenalty && value > 0 && { color: "#EF4444" }]}>
          {isPenalty && value > 0 ? `-${value}` : `+${value}`}
        </Text>
      </View>
    </View>
  );
}

export function CredibilityBreakdownTooltip({ breakdown, totalScore, visible }: CredibilityBreakdownTooltipProps) {
  if (!visible) return null;

  const maxFactor = Math.max(
    breakdown.base, breakdown.volume, breakdown.diversity,
    breakdown.age, breakdown.variance, breakdown.helpfulness, 1
  );

  const computedTotal = breakdown.base + breakdown.volume + breakdown.diversity
    + breakdown.age + breakdown.variance + breakdown.helpfulness - breakdown.penalties;

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={s.container}>
      <View style={s.header}>
        <Ionicons name="information-circle-outline" size={14} color={AMBER} />
        <Text style={s.headerText}>Score Breakdown</Text>
        <Text style={s.headerTotal}>{computedTotal} pts</Text>
      </View>

      <View style={s.factorList}>
        {FACTORS.map(f => (
          <FactorRow key={f.key} factor={f} value={breakdown[f.key]} maxValue={maxFactor} />
        ))}
      </View>

      <View style={s.footer}>
        <Text style={s.footerText}>
          Your score updates after each rating. Rate more places, add photos, and stay consistent to grow.
        </Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  headerTotal: {
    fontSize: 12,
    fontWeight: "700",
    color: AMBER,
    fontFamily: "DMSans_700Bold",
  },
  factorList: {
    gap: 8,
  },
  factorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  factorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  factorTextCol: {
    gap: 1,
  },
  factorLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  factorDesc: {
    fontSize: 9,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  factorRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: 100,
  },
  barBg: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  factorValue: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
    width: 28,
    textAlign: "right",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    lineHeight: 14,
  },
});

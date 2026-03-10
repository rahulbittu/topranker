/**
 * Sprint 512: Push Notification A/B Experiments Card for admin dashboard
 *
 * Displays active push experiments with variant details, exposure counts,
 * and Wilson CI recommendation badges. Fetches from admin push-experiments API.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

export interface PushExperimentVariant {
  name: string;
  title: string;
  body: string;
}

export interface PushExperimentDashboard {
  experimentId: string;
  totalExposures: number;
  variants: {
    variant: string;
    exposures: number;
    outcomes: number;
    conversionRate: number;
    confidence: { lower: number; upper: number; center: number };
  }[];
  confidence: "sufficient_data" | "insufficient_data";
  recommendation: string;
}

export interface PushExperimentData {
  id: string;
  description: string;
  category: string;
  variants: PushExperimentVariant[];
  active: boolean;
  createdAt: number;
  dashboard: PushExperimentDashboard;
}

function RecommendationBadge({ recommendation }: { recommendation: string }) {
  const colorMap: Record<string, string> = {
    treatment_winning: Colors.green,
    control_winning: "#3b82f6",
    promising: BRAND.colors.amber,
    inconclusive: Colors.subtext,
    insufficient_data: Colors.subtext,
  };
  const color = colorMap[recommendation] || Colors.subtext;
  const label = recommendation.replace(/_/g, " ").toUpperCase();

  return (
    <View style={[styles.recBadge, { backgroundColor: `${color}15` }]}>
      <Text style={[styles.recBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

function VariantRow({ variant, exposures, outcomes, conversionRate }: {
  variant: string; exposures: number; outcomes: number; conversionRate: number;
}) {
  return (
    <View style={styles.variantRow}>
      <Text style={styles.variantName}>{variant}</Text>
      <Text style={styles.variantStat}>{exposures} sent</Text>
      <Text style={styles.variantStat}>{outcomes} opened</Text>
      <Text style={[styles.variantRate, conversionRate >= 20 ? styles.rateGood : styles.rateLow]}>
        {conversionRate.toFixed(1)}%
      </Text>
    </View>
  );
}

export function PushExperimentsCard({ experiments }: { experiments: PushExperimentData[] }) {
  if (experiments.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Push A/B Experiments</Text>
        <Text style={styles.emptyText}>No active experiments. Create one via POST /api/admin/push-experiments.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Push A/B Experiments</Text>
      {experiments.map((exp) => (
        <View key={exp.id} style={styles.experimentBlock}>
          <View style={styles.expHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.expName}>{exp.description}</Text>
              <Text style={styles.expCategory}>{exp.category} • {exp.active ? "Active" : "Ended"}</Text>
            </View>
            <RecommendationBadge recommendation={exp.dashboard.recommendation} />
          </View>

          <Text style={styles.exposureCount}>
            {exp.dashboard.totalExposures} total exposures
          </Text>

          {exp.dashboard.variants.map((v) => (
            <VariantRow
              key={v.variant}
              variant={v.variant}
              exposures={v.exposures}
              outcomes={v.outcomes}
              conversionRate={v.conversionRate}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.subtext,
    fontFamily: "DMSans_400Regular",
  },
  experimentBlock: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 4,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  expName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  expCategory: {
    fontSize: 12,
    color: Colors.subtext,
    fontFamily: "DMSans_400Regular",
    marginTop: 2,
  },
  recBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    fontFamily: "DMSans_700Bold",
    letterSpacing: 0.5,
  },
  exposureCount: {
    fontSize: 12,
    color: Colors.subtext,
    fontFamily: "DMSans_400Regular",
    marginBottom: 8,
  },
  variantRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  variantName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
    width: 80,
  },
  variantStat: {
    fontSize: 12,
    color: Colors.subtext,
    fontFamily: "DMSans_400Regular",
    width: 70,
    textAlign: "center",
  },
  variantRate: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "DMSans_700Bold",
    width: 50,
    textAlign: "right",
  },
  rateGood: {
    color: Colors.green,
  },
  rateLow: {
    color: Colors.red,
  },
});

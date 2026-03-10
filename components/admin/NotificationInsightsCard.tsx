/**
 * Sprint 503: Admin Notification Insights Card
 *
 * Displays push notification delivery + open analytics from
 * GET /api/notifications/insights. Shows key metrics:
 * total sent, open rate, category breakdown, recent opens.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

const AMBER = BRAND.colors.amber;

export interface NotificationInsightsData {
  delivery: {
    totalSent: number;
    totalSuccess: number;
    totalError: number;
    successRate: number;
    byCategory: Record<string, { sent: number; success: number; error: number }>;
  };
  opens: {
    totalOpens: number;
    byCategory: Record<string, number>;
    uniqueMembers: number;
  };
  openRate: number;
}

interface Props {
  data: NotificationInsightsData;
}

function MetricBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.metricBox}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function CategoryRow({ category, sent, opens }: { category: string; sent: number; opens: number }) {
  const rate = sent > 0 ? Math.round((opens / sent) * 100) : 0;
  return (
    <View style={styles.categoryRow}>
      <Text style={styles.categoryName}>{category}</Text>
      <Text style={styles.categoryStat}>{sent} sent</Text>
      <Text style={styles.categoryStat}>{opens} opens</Text>
      <View style={[styles.rateBadge, rate >= 20 ? styles.rateBadgeGood : styles.rateBadgeLow]}>
        <Text style={[styles.rateBadgeText, rate >= 20 ? styles.rateBadgeTextGood : styles.rateBadgeTextLow]}>
          {rate}%
        </Text>
      </View>
    </View>
  );
}

export function NotificationInsightsCard({ data }: Props) {
  const categories = Object.keys(data.delivery.byCategory);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="notifications-outline" size={18} color={AMBER} />
        <Text style={styles.title}>Push Notification Insights</Text>
      </View>

      {/* Key metrics row */}
      <View style={styles.metricsRow}>
        <MetricBox label="Total Sent" value={data.delivery.totalSent.toLocaleString()} color={Colors.text} />
        <MetricBox label="Open Rate" value={`${data.openRate}%`} color={AMBER} />
        <MetricBox label="Unique Openers" value={data.opens.uniqueMembers.toLocaleString()} color={Colors.textSecondary} />
        <MetricBox label="Delivery Rate" value={`${data.delivery.successRate}%`} color="#22C55E" />
      </View>

      {/* Category breakdown */}
      {categories.length > 0 && (
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>By Category</Text>
          <View style={styles.categoryHeader}>
            <Text style={[styles.categoryName, styles.categoryHeaderText]}>Type</Text>
            <Text style={[styles.categoryStat, styles.categoryHeaderText]}>Sent</Text>
            <Text style={[styles.categoryStat, styles.categoryHeaderText]}>Opens</Text>
            <Text style={[styles.categoryStat, styles.categoryHeaderText]}>Rate</Text>
          </View>
          {categories.map((cat) => (
            <CategoryRow
              key={cat}
              category={cat}
              sent={data.delivery.byCategory[cat]?.sent || 0}
              opens={data.opens.byCategory[cat] || 0}
            />
          ))}
        </View>
      )}

      {/* Error summary */}
      {data.delivery.totalError > 0 && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
          <Text style={styles.errorText}>
            {data.delivery.totalError} delivery error{data.delivery.totalError !== 1 ? "s" : ""}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
    ...Colors.cardShadow,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },
  metricsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 16,
  },
  metricBox: {
    alignItems: "center" as const,
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    fontFamily: "DMSans_700Bold",
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    marginTop: 2,
  },
  categorySection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold",
    marginBottom: 8,
  },
  categoryHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 4,
  },
  categoryHeaderText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.textTertiary,
  },
  categoryRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 6,
  },
  categoryName: {
    flex: 2,
    fontSize: 12,
    color: Colors.text,
    fontFamily: "DMSans_500Medium",
    textTransform: "capitalize" as const,
  },
  categoryStat: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center" as const,
  },
  rateBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 36,
    alignItems: "center" as const,
  },
  rateBadgeGood: {
    backgroundColor: "rgba(34, 197, 94, 0.10)",
  },
  rateBadgeLow: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
  },
  rateBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  rateBadgeTextGood: {
    color: "#22C55E",
  },
  rateBadgeTextLow: {
    color: "#EF4444",
  },
  errorRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    fontFamily: "DMSans_500Medium",
  },
});

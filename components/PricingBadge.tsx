/**
 * PricingBadge — Sprint 108
 * Reusable pricing display component that reads from centralized PRICING.
 * Owner: Rachel Wei (CFO)
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PRICING, type PricingTier } from "@/shared/pricing";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

interface PricingBadgeProps {
  tier: PricingTier;
  variant?: "compact" | "full";
}

export function PricingBadge({ tier, variant = "compact" }: PricingBadgeProps) {
  const pricing = PRICING[tier];

  if (variant === "compact") {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactAmount}>{pricing.displayAmount}</Text>
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <Text style={styles.fullLabel}>{pricing.label}</Text>
      <Text style={styles.fullAmount}>{pricing.displayAmount}</Text>
      <Text style={styles.fullDescription}>{pricing.description}</Text>
      {pricing.type === "recurring" && (
        <Text style={styles.recurring}>Recurring {pricing.interval}ly</Text>
      )}
      {!pricing.refundable && (
        <Text style={styles.noRefund}>Non-refundable once started</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    backgroundColor: "rgba(196, 154, 26, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start" as any,
  },
  compactAmount: {
    fontSize: 13,
    fontFamily: "DMSans_700Bold",
    color: BRAND.colors.amber,
  },
  fullContainer: {
    backgroundColor: Colors.surface || "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
  },
  fullLabel: {
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: "uppercase" as any,
    letterSpacing: 0.5,
  },
  fullAmount: {
    fontSize: 28,
    fontFamily: "PlayfairDisplay_900Black",
    color: Colors.text,
    marginBottom: 6,
  },
  fullDescription: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  recurring: {
    fontSize: 11,
    fontFamily: "DMSans_400Regular",
    color: Colors.textTertiary,
  },
  noRefund: {
    fontSize: 11,
    fontFamily: "DMSans_500Medium",
    color: "#FF3B30",
    marginTop: 4,
  },
});

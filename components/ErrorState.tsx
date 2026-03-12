/**
 * Sprint 697: Extracted from NetworkBanner.tsx.
 * General-purpose error and empty state components.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TypedIcon } from "@/components/TypedIcon";

/**
 * Full-screen error state with retry action.
 */
export function ErrorState({
  title = "Something went wrong",
  subtitle = "Check your connection and try again",
  onRetry,
  icon = "cloud-offline-outline",
}: {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
  icon?: string;
}) {
  return (
    <View style={styles.errorContainer}>
      <TypedIcon name={icon} size={48} color={Colors.textTertiary} />
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorSubtitle}>{subtitle}</Text>
      {onRetry && (
        <View style={styles.retryBtn}>
          <Text
            style={styles.retryText}
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry"
          >
            Retry
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Empty state for lists with no data.
 */
export function EmptyState({
  icon = "search-outline",
  title,
  subtitle,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.emptyContainer}>
      <TypedIcon name={icon} size={40} color={Colors.textTertiary} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 8,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 12,
    backgroundColor: BRAND.colors.amber,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "DMSans_700Bold",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
  },
});

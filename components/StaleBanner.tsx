/**
 * Sprint 734 — Stale Data Banner
 * Shows when cached data is displayed during network issues.
 * Dismissible, compact, non-intrusive.
 *
 * Owner: Derek Liu (Mobile)
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface StaleBannerProps {
  label: string;
}

export function StaleBanner({ label }: StaleBannerProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
      <Text style={styles.text}>{label} — showing cached data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: `${Colors.textTertiary}15`,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
});

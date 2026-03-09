import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

const AMBER = BRAND.colors.amber;

export function NotificationSettingsLink() {
  return (
    <TouchableOpacity
      style={s.notifLinkCard}
      onPress={() => router.push("/settings")}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Manage notification preferences"
    >
      <Ionicons name="notifications-outline" size={14} color={AMBER} />
      <Text style={s.notifLinkText}>Notification Preferences</Text>
      <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  notifLinkCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(196,154,26,0.06)", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, marginHorizontal: 20, marginBottom: 12,
  },
  notifLinkText: {
    flex: 1, fontSize: 14, fontWeight: "600", color: AMBER,
    fontFamily: "DMSans_600SemiBold",
  },
});

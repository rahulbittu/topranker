import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

export function BreakdownRow({ label, value, icon }: { label: string; value: string; icon: React.ComponentProps<typeof Ionicons>["name"] }) {
  return (
    <View style={s.breakdownRow}>
      <Ionicons name={icon} size={14} color={Colors.textTertiary} />
      <Text style={s.breakdownLabel}>{label}</Text>
      <Text style={s.breakdownValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  breakdownRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  breakdownLabel: { flex: 1, fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  breakdownValue: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
});

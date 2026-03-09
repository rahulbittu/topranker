import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";

const AMBER = BRAND.colors.amber;

export const PaymentHistoryRow = React.memo(function PaymentHistoryRow({ p }: { p: any }) {
  return (
    <View style={s.paymentRow}>
      <View style={s.paymentIconWrap}>
        <Ionicons
          name={p.type === "challenger_entry" ? "flash" : p.type === "featured_placement" ? "megaphone" : "speedometer"}
          size={16}
          color={p.status === "succeeded" ? AMBER : p.status === "failed" ? "#E53E3E" : Colors.textTertiary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.paymentType}>
          {p.type === "challenger_entry" ? "Challenger Entry" : p.type === "dashboard_pro" ? "Dashboard Pro" : "Featured Placement"}
        </Text>
        <Text style={s.paymentDate}>
          {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={s.paymentAmount}>${(p.amount / 100).toFixed(2)}</Text>
        <Text style={[s.paymentStatus, {
          color: p.status === "succeeded" ? Colors.green : p.status === "failed" ? "#E53E3E" : Colors.textTertiary,
        }]}>
          {p.status}
        </Text>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  paymentRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.surfaceRaised, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  paymentIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(196,154,26,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  paymentType: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  paymentDate: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary, marginTop: 2 },
  paymentAmount: { ...TYPOGRAPHY.ui.bodyBold, fontWeight: "700", color: Colors.text },
  paymentStatus: {
    fontSize: 10, fontFamily: "DMSans_500Medium", marginTop: 2,
    textTransform: "capitalize" as const,
  },
});

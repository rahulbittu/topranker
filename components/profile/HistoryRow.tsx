import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { formatTimeAgo } from "@/lib/data";

export const HistoryRow = React.memo(function HistoryRow({ r }: { r: any }) {
  return (
    <TouchableOpacity
      style={s.historyRow}
      activeOpacity={0.7}
      onPress={() => r.businessSlug && router.push({ pathname: "/business/[id]", params: { id: r.businessSlug } })}
      accessibilityRole="link"
      accessibilityLabel={`${r.businessName || "Business"}, score ${parseFloat(r.rawScore).toFixed(1)}`}
    >
      <View style={s.historyLeft}>
        <Text style={s.historyName}>{r.businessName || "Business"}</Text>
        <Text style={s.historyDate}>{formatTimeAgo(new Date(r.createdAt).getTime())}</Text>
      </View>
      <View style={s.historyRight}>
        <Text style={s.historyScore}>{parseFloat(r.rawScore).toFixed(1)}</Text>
        <Text style={s.historyWeight}>{parseFloat(r.weight).toFixed(2)}x weight</Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
});

const s = StyleSheet.create({
  historyRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, ...Colors.cardShadow,
  },
  historyLeft: { gap: 2 },
  historyName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  historyDate: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  historyRight: { alignItems: "flex-end", gap: 2 },
  historyScore: { fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold" },
  historyWeight: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
});

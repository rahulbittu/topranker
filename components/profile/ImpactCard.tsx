import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import type { ApiMemberImpact } from "@/lib/api";

export function ImpactCard({ impact, city }: { impact: ApiMemberImpact; city: string }) {
  return (
    <View style={s.prideCard}>
      <View style={s.prideHeader}>
        <Ionicons name="trending-up" size={18} color={Colors.green} />
        <Text style={s.prideTitle}>Your Impact</Text>
      </View>
      <Text style={s.prideText}>
        Your ratings contributed to {impact.businessesMovedUp} business{impact.businessesMovedUp !== 1 ? "es" : ""} moving up in the {city} rankings.
      </Text>
      {impact.topContributions.length > 0 && (
        <View style={s.prideList}>
          {impact.topContributions.map(c => (
            <TouchableOpacity
              key={c.slug}
              style={s.prideItem}
              onPress={() => router.push({ pathname: "/business/[id]", params: { id: c.slug } })}
              activeOpacity={0.7}
              accessibilityRole="link"
              accessibilityLabel={`${c.name}, moved up ${c.rankChange}`}
            >
              <Text style={s.prideItemName} numberOfLines={1}>{c.name}</Text>
              <View style={s.prideItemDelta}>
                <Ionicons name="arrow-up" size={10} color={Colors.green} />
                <Text style={s.prideItemDeltaText}>{c.rankChange}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  prideCard: {
    backgroundColor: `${Colors.green}08`, borderRadius: 14, padding: 16,
    gap: 10, borderWidth: 1, borderColor: `${Colors.green}20`,
  },
  prideHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  prideTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  prideText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 18 },
  prideList: { gap: 6, marginTop: 4 },
  prideItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 6, paddingHorizontal: 10,
    backgroundColor: Colors.surface, borderRadius: 8,
  },
  prideItemName: {
    fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold", flex: 1, marginRight: 8,
  },
  prideItemDelta: {
    flexDirection: "row", alignItems: "center", gap: 2,
    backgroundColor: `${Colors.green}15`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  prideItemDeltaText: { fontSize: 11, fontWeight: "700", color: Colors.green, fontFamily: "DMSans_700Bold" },
});

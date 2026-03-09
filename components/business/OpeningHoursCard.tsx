import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, LayoutAnimation,
  Platform, UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function OpeningHoursCard({ hours }: { hours: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const todayLine = hours.find(h => h.toLowerCase().startsWith(todayName));
  return (
    <View style={s.hoursCard}>
      <TouchableOpacity
        onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpanded(!expanded); }}
        activeOpacity={0.7}
        style={s.hoursHeader}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse hours" : "Expand hours"}
      >
        <Text style={s.sectionTitle}>Hours</Text>
        <View style={s.hoursTodayRow}>
          <Text style={s.hoursTodaySummary} numberOfLines={1}>{todayLine || hours[0] || "\u2014"}</Text>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={Colors.textSecondary} />
        </View>
      </TouchableOpacity>
      {expanded && hours.map((line: string, i: number) => {
        const isToday = line.toLowerCase().startsWith(todayName);
        return (
          <View key={i} style={[s.hoursRow, isToday && s.hoursRowToday]}>
            <Text style={[s.hoursText, isToday && s.hoursTextToday]}>{line}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default OpeningHoursCard;

const s = StyleSheet.create({
  hoursCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 4,
    ...Colors.cardShadow,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold", marginBottom: 8,
  },
  hoursHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hoursTodayRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1, marginLeft: 12 },
  hoursTodaySummary: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", flex: 1, textAlign: "right" },
  hoursRow: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginTop: 2 },
  hoursRowToday: { backgroundColor: `${BRAND.colors.amber}10` },
  hoursText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  hoursTextToday: { color: Colors.text, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
});

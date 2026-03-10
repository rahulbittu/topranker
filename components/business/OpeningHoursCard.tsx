import React, { useState, useMemo } from "react";
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

// Sprint 359: Parse "HH:MM AM/PM" to minutes since midnight
function parseTime(timeStr: string): number | null {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// Sprint 359: Extract open/close status from today's hours line
function getTodayStatus(todayLine: string | undefined): { isOpen: boolean; closingSoon: boolean; statusText: string } {
  if (!todayLine) return { isOpen: false, closingSoon: false, statusText: "" };
  const lower = todayLine.toLowerCase();
  if (lower.includes("closed")) return { isOpen: false, closingSoon: false, statusText: "Closed today" };

  // Try to extract time range like "9:00 AM – 9:00 PM"
  const rangeMatch = todayLine.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[\u2013\u2014–-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
  if (!rangeMatch) return { isOpen: false, closingSoon: false, statusText: "" };

  const openMin = parseTime(rangeMatch[1]);
  const closeMin = parseTime(rangeMatch[2]);
  if (openMin === null || closeMin === null) return { isOpen: false, closingSoon: false, statusText: "" };

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const isOpen = nowMin >= openMin && nowMin < closeMin;
  const minutesUntilClose = closeMin - nowMin;
  const closingSoon = isOpen && minutesUntilClose > 0 && minutesUntilClose <= 60;

  if (isOpen && closingSoon) {
    return { isOpen: true, closingSoon: true, statusText: `Closes in ${minutesUntilClose}min` };
  }
  if (isOpen) {
    return { isOpen: true, closingSoon: false, statusText: `Open until ${rangeMatch[2].trim()}` };
  }
  if (nowMin < openMin) {
    return { isOpen: false, closingSoon: false, statusText: `Opens at ${rangeMatch[1].trim()}` };
  }
  return { isOpen: false, closingSoon: false, statusText: "Closed now" };
}

interface OpeningHoursCardProps {
  hours: string[];
  isOpenNow?: boolean;
}

export function OpeningHoursCard({ hours, isOpenNow }: OpeningHoursCardProps) {
  const [expanded, setExpanded] = useState(false);
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const todayLine = hours.find(h => h.toLowerCase().startsWith(todayName));

  const status = useMemo(() => getTodayStatus(todayLine), [todayLine]);
  // Use API isOpenNow if available, fall back to parsed status
  const effectiveOpen = isOpenNow ?? status.isOpen;

  return (
    <View style={s.hoursCard}>
      <TouchableOpacity
        onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpanded(!expanded); }}
        activeOpacity={0.7}
        style={s.hoursHeader}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse hours" : "Expand hours"}
      >
        <View style={s.headerLeft}>
          <Text style={s.sectionTitle}>Hours</Text>
          {/* Sprint 359: Open/closed status dot */}
          <View style={[s.statusDot, effectiveOpen ? s.statusDotOpen : s.statusDotClosed]} />
          {status.closingSoon && (
            <View style={s.closingSoonBadge}>
              <Ionicons name="time-outline" size={10} color={BRAND.colors.amber} />
              <Text style={s.closingSoonText}>Closing soon</Text>
            </View>
          )}
        </View>
        <View style={s.hoursTodayRow}>
          {status.statusText ? (
            <Text style={[s.statusText, effectiveOpen ? s.statusTextOpen : s.statusTextClosed]} numberOfLines={1}>
              {status.statusText}
            </Text>
          ) : (
            <Text style={s.hoursTodaySummary} numberOfLines={1}>{todayLine || hours[0] || "\u2014"}</Text>
          )}
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
    fontFamily: "DMSans_600SemiBold",
  },
  hoursHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusDotOpen: { backgroundColor: Colors.green },
  statusDotClosed: { backgroundColor: Colors.red },
  closingSoonBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: `${BRAND.colors.amber}15`, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  closingSoonText: {
    fontSize: 9, fontWeight: "600", color: BRAND.colors.amber, fontFamily: "DMSans_600SemiBold",
  },
  hoursTodayRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1, marginLeft: 12 },
  hoursTodaySummary: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", flex: 1, textAlign: "right" },
  statusText: { fontSize: 12, fontFamily: "DMSans_600SemiBold", flex: 1, textAlign: "right" },
  statusTextOpen: { color: Colors.green },
  statusTextClosed: { color: Colors.red },
  hoursRow: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginTop: 2 },
  hoursRowToday: { backgroundColor: `${BRAND.colors.amber}10` },
  hoursText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  hoursTextToday: { color: Colors.text, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
});

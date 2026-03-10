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

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_ABBREVS = ["S", "M", "T", "W", "T", "F", "S"];

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

// Sprint 407: Check if a day's hours line indicates open
function isDayOpen(line: string | undefined): boolean {
  if (!line) return false;
  return !line.toLowerCase().includes("closed");
}

// Sprint 407: Get opening time from a hours line
function getOpeningTime(line: string | undefined): string | null {
  if (!line) return null;
  const rangeMatch = line.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[\u2013\u2014–-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
  return rangeMatch ? rangeMatch[1].trim() : null;
}

// Sprint 407: Find next opening day+time when currently closed
function getNextOpenInfo(hours: string[], todayIdx: number): string | null {
  for (let offset = 1; offset <= 7; offset++) {
    const idx = (todayIdx + offset) % 7;
    const dayName = DAY_NAMES[idx];
    const line = hours.find(h => h.toLowerCase().startsWith(dayName));
    if (line && isDayOpen(line)) {
      const openTime = getOpeningTime(line);
      if (!openTime) continue;
      const dayLabel = offset === 1 ? "tomorrow" : DAY_NAMES[idx].charAt(0).toUpperCase() + DAY_NAMES[idx].slice(1);
      return `Opens ${dayLabel} at ${openTime}`;
    }
  }
  return null;
}

// Sprint 407: Compute hours duration from time range
function getHoursDuration(line: string | undefined): string | null {
  if (!line) return null;
  const rangeMatch = line.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[\u2013\u2014–-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
  if (!rangeMatch) return null;
  const openMin = parseTime(rangeMatch[1]);
  const closeMin = parseTime(rangeMatch[2]);
  if (openMin === null || closeMin === null) return null;
  const duration = closeMin > openMin ? closeMin - openMin : (1440 - openMin) + closeMin;
  const hrs = Math.floor(duration / 60);
  const mins = duration % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

// Sprint 359: Extract open/close status from today's hours line
function getTodayStatus(todayLine: string | undefined, hours: string[], todayIdx: number): { isOpen: boolean; closingSoon: boolean; statusText: string } {
  if (!todayLine) return { isOpen: false, closingSoon: false, statusText: "" };
  const lower = todayLine.toLowerCase();
  if (lower.includes("closed")) {
    // Sprint 407: Show next opening time
    const nextOpen = getNextOpenInfo(hours, todayIdx);
    return { isOpen: false, closingSoon: false, statusText: nextOpen || "Closed today" };
  }

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
    // Sprint 407: Show relative time if opening within 2 hours
    const minsUntilOpen = openMin - nowMin;
    if (minsUntilOpen <= 120) {
      const h = Math.floor(minsUntilOpen / 60);
      const m = minsUntilOpen % 60;
      const rel = h > 0 ? `${h}h ${m}m` : `${m}min`;
      return { isOpen: false, closingSoon: false, statusText: `Opens in ${rel}` };
    }
    return { isOpen: false, closingSoon: false, statusText: `Opens at ${rangeMatch[1].trim()}` };
  }
  // After closing time — show next opening
  const nextOpen = getNextOpenInfo(hours, todayIdx);
  return { isOpen: false, closingSoon: false, statusText: nextOpen || "Closed now" };
}

// Sprint 407: Week overview dot component
function WeekOverviewDots({ hours }: { hours: string[] }) {
  const todayIdx = new Date().getDay();

  return (
    <View style={s.weekDots}>
      {DAY_ABBREVS.map((abbr, i) => {
        const dayName = DAY_NAMES[i];
        const line = hours.find(h => h.toLowerCase().startsWith(dayName));
        const open = isDayOpen(line);
        const isToday = i === todayIdx;
        return (
          <View key={i} style={s.weekDotCol}>
            <Text style={[s.weekDotLabel, isToday && s.weekDotLabelToday]}>{abbr}</Text>
            <View style={[s.weekDot, open ? s.weekDotOpen : s.weekDotClosed, isToday && s.weekDotToday]} />
          </View>
        );
      })}
    </View>
  );
}

interface OpeningHoursCardProps {
  hours: string[];
  isOpenNow?: boolean;
  closingTime?: string | null;   // Sprint 453: server-computed "21:00"
  nextOpenTime?: string | null;  // Sprint 453: server-computed "09:00" or "Mon 09:00"
  todayHours?: string | null;    // Sprint 453: server-computed "11:00 AM – 10:00 PM"
}

export function OpeningHoursCard({ hours, isOpenNow, closingTime, nextOpenTime, todayHours }: OpeningHoursCardProps) {
  const [expanded, setExpanded] = useState(false);
  const today = new Date();
  const todayIdx = today.getDay();
  const todayName = DAY_NAMES[todayIdx];
  const todayLine = hours.find(h => h.toLowerCase().startsWith(todayName));

  const status = useMemo(() => getTodayStatus(todayLine, hours, todayIdx), [todayLine, hours.length]);
  // Use API isOpenNow if available, fall back to parsed status
  const effectiveOpen = isOpenNow ?? status.isOpen;
  // Sprint 453: Prefer server-computed status text when available
  const effectiveStatusText = useMemo(() => {
    if (effectiveOpen && closingTime) return `Open until ${closingTime}`;
    if (!effectiveOpen && nextOpenTime) return `Opens ${nextOpenTime}`;
    return status.statusText;
  }, [effectiveOpen, closingTime, nextOpenTime, status.statusText]);
  const duration = useMemo(() => getHoursDuration(todayLine), [todayLine]);

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
          {effectiveStatusText ? (
            <Text style={[s.statusText, effectiveOpen ? s.statusTextOpen : s.statusTextClosed]} numberOfLines={1}>
              {effectiveStatusText}
            </Text>
          ) : (
            <Text style={s.hoursTodaySummary} numberOfLines={1}>{todayLine || hours[0] || "\u2014"}</Text>
          )}
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={Colors.textSecondary} />
        </View>
      </TouchableOpacity>

      {/* Sprint 407: Week overview dots — compact open/closed per day */}
      {!expanded && <WeekOverviewDots hours={hours} />}

      {/* Sprint 407: Duration badge when open */}
      {!expanded && effectiveOpen && duration && (
        <View style={s.durationRow}>
          <Ionicons name="hourglass-outline" size={11} color={Colors.textTertiary} />
          <Text style={s.durationText}>{duration} today</Text>
        </View>
      )}

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

  // Sprint 407: Week overview dots
  weekDots: {
    flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: 4, paddingVertical: 6, marginTop: 4,
  },
  weekDotCol: { alignItems: "center", gap: 3 },
  weekDotLabel: { fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  weekDotLabelToday: { color: BRAND.colors.amber, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
  weekDot: { width: 6, height: 6, borderRadius: 3 },
  weekDotOpen: { backgroundColor: `${Colors.green}60` },
  weekDotClosed: { backgroundColor: `${Colors.red}40` },
  weekDotToday: { width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: BRAND.colors.amber },

  // Sprint 407: Duration display
  durationRow: {
    flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2,
    paddingHorizontal: 4,
  },
  durationText: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
});

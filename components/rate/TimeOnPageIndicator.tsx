/**
 * Sprint 616: Time-on-page indicator for rating flow
 * Shows elapsed time and progress toward the 30-second time plausibility boost.
 */
import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const BOOST_THRESHOLD_S = 30; // UI threshold for +5% time plausibility boost

interface TimeOnPageIndicatorProps {
  startedAt: number; // Date.now() from when rating flow started
}

export function TimeOnPageIndicator({ startedAt }: TimeOnPageIndicatorProps) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startedAt]);

  const earned = elapsed >= BOOST_THRESHOLD_S;
  const progress = Math.min(elapsed / BOOST_THRESHOLD_S, 1);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeText = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  return (
    <View style={[s.container, earned && s.containerEarned]}>
      <View style={s.row}>
        <Ionicons
          name={earned ? "shield-checkmark" : "time-outline"}
          size={14}
          color={earned ? Colors.green : Colors.textTertiary}
        />
        <Text style={[s.label, earned && s.labelEarned]}>
          {earned ? "Time boost earned" : "Time on rating"}
        </Text>
        <Text style={[s.time, earned && s.timeEarned]}>{timeText}</Text>
        {earned && <Text style={s.boost}>+5%</Text>}
      </View>
      {!earned && (
        <View style={s.barOuter}>
          <View style={[s.barInner, { width: `${Math.round(progress * 100)}%` as any }]} />
        </View>
      )}
      {!earned && (
        <Text style={s.hint}>
          Spend 30s+ for a time plausibility boost
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 10, padding: 10, gap: 6,
  },
  containerEarned: {
    backgroundColor: "rgba(34,197,94,0.06)",
    borderWidth: 1, borderColor: "rgba(34,197,94,0.15)",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", flex: 1 },
  labelEarned: { color: Colors.green, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
  time: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  timeEarned: { color: Colors.green, fontWeight: "600" },
  boost: {
    fontSize: 10, fontWeight: "700", color: Colors.green, fontFamily: "DMSans_700Bold",
    backgroundColor: "rgba(34,197,94,0.12)", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4,
  },
  barOuter: { height: 3, borderRadius: 2, backgroundColor: Colors.border, overflow: "hidden" },
  barInner: { height: "100%", borderRadius: 2, backgroundColor: Colors.gold },
  hint: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
});

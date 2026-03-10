/**
 * Sprint 428: Challenger vote animation enhancements.
 * Animated vote bar fill, vote celebration burst, and vote count ticker.
 */
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

const AMBER = BRAND.colors.amber;

export interface AnimatedVoteBarProps {
  defenderPct: number;
  challengerPct: number;
  animate?: boolean;
}

export function AnimatedVoteBar({ defenderPct, challengerPct, animate = true }: AnimatedVoteBarProps) {
  const defenderWidth = useRef(new Animated.Value(animate ? 50 : defenderPct)).current;
  const challengerWidth = useRef(new Animated.Value(animate ? 50 : challengerPct)).current;
  const defenderLeading = defenderPct >= challengerPct;

  useEffect(() => {
    if (!animate) return;
    Animated.parallel([
      Animated.spring(defenderWidth, { toValue: defenderPct, useNativeDriver: false, tension: 40, friction: 8 }),
      Animated.spring(challengerWidth, { toValue: challengerPct, useNativeDriver: false, tension: 40, friction: 8 }),
    ]).start();
  }, [defenderPct, challengerPct]);

  return (
    <View style={s.voteBarContainer}>
      <View style={s.voteBarLabels}>
        <Text style={[s.voteBarPct, defenderLeading && s.voteBarPctLeading]}>
          {defenderPct.toFixed(0)}%
        </Text>
        <Text style={[s.voteBarPct, !defenderLeading && s.voteBarPctLeading]}>
          {challengerPct.toFixed(0)}%
        </Text>
      </View>
      <View style={s.voteBar}>
        <Animated.View
          style={[s.voteBarDefender, {
            width: defenderWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
          }]}
        />
        <Animated.View
          style={[s.voteBarChallenger, {
            width: challengerWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
          }]}
        />
      </View>
    </View>
  );
}

export interface VoteCelebrationProps {
  visible: boolean;
  side: "defender" | "challenger";
}

export function VoteCelebration({ visible, side }: VoteCelebrationProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0);
    opacity.setValue(1);
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.2, useNativeDriver: true, tension: 60, friction: 5 }),
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        s.celebration,
        side === "defender" ? s.celebrationLeft : s.celebrationRight,
        { transform: [{ scale }], opacity },
      ]}
      accessibilityLabel="Vote recorded"
    >
      <Ionicons name="checkmark-circle" size={20} color="#fff" />
      <Text style={s.celebrationText}>Vote cast!</Text>
    </Animated.View>
  );
}

export function VoteCountTicker({ count, label }: { count: number; label: string }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count === 0) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }),
    ]).start();
  }, [count]);

  return (
    <Animated.View style={[s.tickerWrap, { transform: [{ scale: scaleAnim }] }]}>
      <Text style={s.tickerCount}>{count}</Text>
      <Text style={s.tickerLabel}>{label}</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  voteBarContainer: { marginBottom: 12, gap: 6 },
  voteBarLabels: { flexDirection: "row", justifyContent: "space-between" },
  voteBarPct: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  voteBarPctLeading: { color: AMBER, fontWeight: "700" },
  voteBar: {
    height: 8, borderRadius: 4, flexDirection: "row", overflow: "hidden",
    backgroundColor: `${Colors.border}40`,
  },
  voteBarDefender: { height: 8, backgroundColor: "#4A90D9", borderRadius: 4 },
  voteBarChallenger: { height: 8, backgroundColor: AMBER, borderRadius: 4 },
  celebration: {
    position: "absolute", top: -30,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(34,139,34,0.9)", paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 16,
  },
  celebrationLeft: { left: 10 },
  celebrationRight: { right: 10 },
  celebrationText: { fontSize: 12, fontWeight: "700", color: "#fff", fontFamily: "DMSans_700Bold" },
  tickerWrap: { alignItems: "center", gap: 2 },
  tickerCount: { fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold" },
  tickerLabel: { fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
});

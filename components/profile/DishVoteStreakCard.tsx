/**
 * Sprint 574: Dish Vote Streak Tracking
 * Shows dish voting streak with milestones, progress, tips.
 * Self-contained: calculates from props, no new API calls.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { pct } from "@/lib/style-helpers";

const AMBER = BRAND.colors.amber;

export interface DishVoteStreakCardProps {
  currentStreak: number;
  longestStreak: number;
  totalDishVotes: number;
  topDish?: string;
  delay?: number;
  onRatePress?: () => void;
}

const MILESTONES = [
  { days: 3, label: "3 days", icon: "flame-outline" as const, color: "#FF9500" },
  { days: 7, label: "1 week", icon: "flame" as const, color: "#FF6B00" },
  { days: 14, label: "2 weeks", icon: "bonfire-outline" as const, color: "#FF3B30" },
  { days: 30, label: "1 month", icon: "infinite-outline" as const, color: "#AF52DE" },
] as const;

const STREAK_TIPS = [
  "Add a specific dish when rating to build your streak",
  "Dish-level ratings create the best leaderboards",
  "Your dish votes power 'Best biryani in Irving' rankings",
  "Rate the signature dish — it helps others decide what to order",
  "Specific dish ratings carry higher credibility weight",
] as const;

function getNextMilestone(current: number) {
  return MILESTONES.find(m => m.days > current) || null;
}

function getCurrentMilestoneColor(current: number): string {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (current >= MILESTONES[i].days) return MILESTONES[i].color;
  }
  return AMBER;
}

export function DishVoteStreakCard({ currentStreak, longestStreak, totalDishVotes, topDish, delay = 0, onRatePress }: DishVoteStreakCardProps) {
  if (totalDishVotes === 0) return null;
  const nextMilestone = getNextMilestone(currentStreak);
  const streakColor = getCurrentMilestoneColor(currentStreak);
  const progress = nextMilestone ? Math.min((currentStreak / nextMilestone.days) * 100, 100) : 100;
  const tipIdx = totalDishVotes % STREAK_TIPS.length;
  const isActive = currentStreak > 0;

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400).springify()} style={s.card}
      accessibilityRole="summary" accessibilityLabel={`Dish vote streak: ${currentStreak} ${currentStreak === 1 ? "day" : "days"}`}>
      <View style={s.headerRow}>
        <View style={[s.iconCircle, { backgroundColor: `${streakColor}15` }]}>
          <Ionicons name={isActive ? "flame" : "flame-outline"} size={18} color={streakColor} />
        </View>
        <View style={s.headerText}>
          <Text style={s.title}>Dish Vote Streak</Text>
          <Text style={s.subtitle}>{isActive ? `${currentStreak} ${currentStreak === 1 ? "day" : "days"} in a row` : "Start a new streak today"}</Text>
        </View>
        <View style={[s.streakBadge, { backgroundColor: `${streakColor}15` }]}>
          <Ionicons name="flame" size={14} color={streakColor} />
          <Text style={[s.streakBadgeText, { color: streakColor }]}>{currentStreak}</Text>
        </View>
      </View>

      {nextMilestone && (
        <View style={s.progressSection}>
          <View style={s.progressBarOuter}>
            <View style={[s.progressBarFill, { width: pct(progress), backgroundColor: streakColor }]} />
          </View>
          <View style={s.progressLabels}>
            <Text style={s.progressLabel}>{currentStreak}d</Text>
            <Text style={s.progressLabel}><Ionicons name={nextMilestone.icon} size={10} color={nextMilestone.color} /> {nextMilestone.label}</Text>
          </View>
        </View>
      )}

      <View style={s.milestoneRow}>
        {MILESTONES.map((m) => {
          const achieved = currentStreak >= m.days;
          return (
            <View key={m.days} style={s.milestoneItem}>
              <View style={[s.milestoneCircle, achieved && { backgroundColor: `${m.color}20`, borderColor: m.color }]}>
                <Ionicons name={m.icon} size={14} color={achieved ? m.color : Colors.textTertiary} />
              </View>
              <Text style={[s.milestoneLabel, achieved && { color: m.color, fontWeight: "600" as const }]}>{m.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={s.statsRow}>
        <View style={s.statItem}><Text style={s.statValue}>{totalDishVotes}</Text><Text style={s.statLabel}>dish votes</Text></View>
        <View style={s.statDivider} />
        <View style={s.statItem}><Text style={s.statValue}>{longestStreak}</Text><Text style={s.statLabel}>best streak</Text></View>
        {topDish && (<><View style={s.statDivider} /><View style={s.statItem}><Text style={s.statValue} numberOfLines={1}>{topDish}</Text><Text style={s.statLabel}>top dish</Text></View></>)}
      </View>

      <View style={s.tipRow}>
        <Ionicons name="bulb-outline" size={13} color={AMBER} />
        <Text style={s.tipText}>{STREAK_TIPS[tipIdx]}</Text>
      </View>

      {!isActive && onRatePress && (
        <TouchableOpacity style={s.ctaButton} onPress={onRatePress} activeOpacity={0.8}
          accessibilityRole="button" accessibilityLabel="Rate a dish to start your streak">
          <Ionicons name="restaurant-outline" size={14} color="#fff" />
          <Text style={s.ctaText}>Rate a Dish to Start Your Streak</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: "rgba(255,149,0,0.12)", ...Colors.cardShadow },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1, gap: 1 },
  title: { fontSize: 14, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  subtitle: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 },
  streakBadgeText: { fontSize: 16, fontWeight: "900", fontFamily: "PlayfairDisplay_900Black" },
  progressSection: { marginBottom: 12, gap: 4 },
  progressBarOuter: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: 6, borderRadius: 3 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_500Medium" },
  milestoneRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12, paddingHorizontal: 4 },
  milestoneItem: { alignItems: "center", gap: 3 },
  milestoneCircle: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: `${Colors.textTertiary}10`, borderWidth: 1.5, borderColor: Colors.border },
  milestoneLabel: { fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_500Medium" },
  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: `${AMBER}06`, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 10 },
  statItem: { flex: 1, alignItems: "center", gap: 1 },
  statValue: { fontSize: 14, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  statLabel: { fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", textTransform: "uppercase", letterSpacing: 0.3 },
  statDivider: { width: 1, height: 24, backgroundColor: Colors.border, marginHorizontal: 4 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 4 },
  tipText: { fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", flex: 1, lineHeight: 14 },
  ctaButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10, paddingVertical: 10, borderRadius: 10, backgroundColor: AMBER },
  ctaText: { fontSize: 13, fontWeight: "600", color: "#fff", fontFamily: "DMSans_600SemiBold" },
});

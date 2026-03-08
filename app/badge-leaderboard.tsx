import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TIER_COLORS, type CredibilityTier } from "@/lib/data";
import { fetchBadgeLeaderboard, type BadgeLeaderboardEntry } from "@/lib/api";
import { TypedIcon } from "@/components/TypedIcon";

const AMBER = BRAND.colors.amber;

function MedalIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Text style={styles.medal}>{"\u{1F947}"}</Text>;
  if (rank === 2) return <Text style={styles.medal}>{"\u{1F948}"}</Text>;
  if (rank === 3) return <Text style={styles.medal}>{"\u{1F949}"}</Text>;
  return <Text style={styles.rankNum}>#{rank}</Text>;
}

function LeaderboardRow({ entry, rank }: { entry: BadgeLeaderboardEntry; rank: number }) {
  const tierColor = TIER_COLORS[entry.credibilityTier as CredibilityTier] || Colors.textTertiary;
  const isTop3 = rank <= 3;

  return (
    <View style={[styles.row, isTop3 && styles.rowHighlight]}>
      <View style={styles.rankCol}>
        <MedalIcon rank={rank} />
      </View>
      <View style={styles.avatarCol}>
        {entry.avatarUrl ? (
          <Image source={{ uri: entry.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: `${tierColor}20` }]}>
            <Ionicons name="person" size={16} color={tierColor} />
          </View>
        )}
      </View>
      <View style={styles.infoCol}>
        <Text style={styles.displayName} numberOfLines={1}>{entry.displayName}</Text>
        <Text style={[styles.tierText, { color: tierColor }]}>
          @{entry.username}
        </Text>
      </View>
      <View style={styles.badgeCol}>
        <Text style={[styles.badgeCount, isTop3 && { color: AMBER }]}>{entry.badgeCount}</Text>
        <TypedIcon name="ribbon-outline" size={14} color={isTop3 ? AMBER : Colors.textTertiary} />
      </View>
    </View>
  );
}

export default function BadgeLeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["badge-leaderboard"],
    queryFn: () => fetchBadgeLeaderboard(20),
  });

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Badge Leaderboard</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.heroCard}>
        <TypedIcon name="trophy-outline" size={28} color={AMBER} />
        <Text style={styles.heroTitle}>Top Badge Collectors</Text>
        <Text style={styles.heroSub}>Members ranked by total badges earned</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={AMBER} />
        </View>
      ) : leaderboard.length === 0 ? (
        <View style={styles.emptyState}>
          <TypedIcon name="ribbon-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Badges Yet</Text>
          <Text style={styles.emptySub}>Be the first to earn badges and claim the top spot!</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {leaderboard.map((entry, i) => (
            <LeaderboardRow key={entry.memberId} entry={entry} rank={i + 1} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5,
  },
  heroCard: {
    alignItems: "center", gap: 6, paddingVertical: 20, paddingHorizontal: 24,
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: Colors.surfaceRaised, borderRadius: 16,
  },
  heroTitle: {
    fontSize: 18, fontWeight: "800", color: Colors.text,
    fontFamily: "DMSans_800ExtraBold",
  },
  heroSub: {
    fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyState: { alignItems: "center", gap: 8, paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  emptySub: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 8 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 14,
  },
  rowHighlight: {
    backgroundColor: Colors.goldFaint,
    borderWidth: 1, borderColor: `${AMBER}30`,
  },
  rankCol: { width: 32, alignItems: "center" },
  medal: { fontSize: 22 },
  rankNum: {
    fontSize: 14, fontWeight: "700", color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold",
  },
  avatarCol: {},
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarPlaceholder: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  infoCol: { flex: 1, gap: 2 },
  displayName: {
    fontSize: 14, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  tierText: { fontSize: 11, fontFamily: "DMSans_400Regular" },
  badgeCol: { flexDirection: "row", alignItems: "center", gap: 4 },
  badgeCount: {
    fontSize: 18, fontWeight: "800", color: Colors.text,
    fontFamily: "DMSans_800ExtraBold",
  },
});

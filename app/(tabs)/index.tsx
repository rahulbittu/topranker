import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, Platform, Animated, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { CATEGORIES, type Category } from "@/lib/data";
import { fetchLeaderboard } from "@/lib/api";

interface MappedBusiness {
  id: string;
  name: string;
  slug: string;
  neighborhood: string;
  city: string;
  category: string;
  weightedScore: number;
  rank: number;
  rankDelta: number;
  ratingCount: number;
  isChallenger: boolean;
  isVerified: boolean;
  priceRange: string | null;
  image: any;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <View style={styles.rankBadge1}>
        <Text style={styles.rankNum1}>#1</Text>
      </View>
    );
  }
  if (rank === 2) {
    return (
      <View style={styles.rankBadge2}>
        <Text style={styles.rankNum2}>#{rank}</Text>
      </View>
    );
  }
  if (rank === 3) {
    return (
      <View style={styles.rankBadge3}>
        <Text style={styles.rankNum3}>#{rank}</Text>
      </View>
    );
  }
  return (
    <View style={styles.rankBadgeN}>
      <Text style={styles.rankNumN}>#{rank}</Text>
    </View>
  );
}

function MovementIndicator({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <View style={[styles.moveBadge, { backgroundColor: Colors.greenFaint }]}>
        <Ionicons name="arrow-up" size={9} color={Colors.rankUp} />
        <Text style={[styles.moveText, { color: Colors.rankUp }]}>{delta}</Text>
      </View>
    );
  }
  if (delta < 0) {
    return (
      <View style={[styles.moveBadge, { backgroundColor: Colors.redFaint }]}>
        <Ionicons name="arrow-down" size={9} color={Colors.rankDown} />
        <Text style={[styles.moveText, { color: Colors.rankDown }]}>{Math.abs(delta)}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.moveBadge, { backgroundColor: "rgba(255,255,255,0.04)" }]}>
      <Text style={[styles.moveText, { color: Colors.rankStable }]}>—</Text>
    </View>
  );
}

function BusinessRow({ item }: { item: MappedBusiness }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  const isTop = item.rank <= 3;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
        style={[styles.row, isTop && styles.rowTop, item.rank === 1 && styles.rowFirst]}
        testID={`leaderboard-row-${item.rank}`}
      >
        <View style={styles.rowLeft}>
          <RankBadge rank={item.rank} />
          <View style={styles.rowInfo}>
            <View style={styles.rowTitleRow}>
              <Text style={[styles.rowName, item.rank === 1 && styles.rowNameFirst]} numberOfLines={1}>
                {item.name}
              </Text>
              {item.isChallenger && (
                <View style={styles.challengerBadge}>
                  <Ionicons name="flash" size={8} color={Colors.gold} />
                </View>
              )}
              {item.isVerified && (
                <Ionicons name="checkmark-circle" size={12} color={Colors.blue} />
              )}
            </View>
            <Text style={styles.rowNeighborhood}>{item.neighborhood}</Text>
            <View style={styles.rowMeta}>
              <Text style={[styles.rowScore, item.rank === 1 && styles.rowScoreFirst]}>
                {item.weightedScore.toFixed(2)}
              </Text>
              <MovementIndicator delta={item.rankDelta} />
              {item.priceRange && (
                <Text style={styles.priceRange}>{item.priceRange}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <Ionicons name="restaurant-outline" size={18} color={Colors.textTertiary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<Category>("Restaurants");

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["leaderboard", "Dallas", activeCategory],
    queryFn: () => fetchLeaderboard("Dallas", activeCategory, 20),
    staleTime: 30000,
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.city}>Dallas</Text>
          <Text style={styles.subtitle}>Community-ranked · Updated live</Text>
        </View>
        <Ionicons name="trophy" size={26} color={Colors.gold} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
        style={styles.tabs}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[styles.tab, activeCategory === cat && styles.tabActive]}
            testID={`category-tab-${cat}`}
          >
            <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      ) : (
        <FlatList
          data={businesses}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <BusinessRow item={item} />}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 }
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.loadingContainer}>
              <Text style={styles.emptyText}>No businesses found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const THUMB_W = 76;
const THUMB_H = 68;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  city: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  tabs: { flexGrow: 0 },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 7,
    flexDirection: "row",
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tabActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  tabText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Inter_500Medium" },
  tabTextActive: { color: "#000" },
  list: { paddingHorizontal: 14, gap: 8 },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  emptyText: { fontSize: 15, color: Colors.textSecondary, fontFamily: "Inter_500Medium" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingLeft: 12,
    paddingRight: 0,
    paddingVertical: 0,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  rowTop: { borderColor: Colors.borderLight },
  rowFirst: { backgroundColor: "#1A2840", borderColor: Colors.goldDim },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 11,
    paddingVertical: 12,
  },

  rankBadge1: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNum1: { fontSize: 17, fontWeight: "800", color: "#000", fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  rankBadge2: {
    width: 46,
    height: 46,
    borderRadius: 11,
    backgroundColor: "rgba(154,170,187,0.12)",
    borderWidth: 1,
    borderColor: Colors.silver,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNum2: { fontSize: 15, fontWeight: "700", color: Colors.silver, fontFamily: "Inter_700Bold" },
  rankBadge3: {
    width: 46,
    height: 46,
    borderRadius: 11,
    backgroundColor: "rgba(205,127,50,0.12)",
    borderWidth: 1,
    borderColor: Colors.bronze,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNum3: { fontSize: 15, fontWeight: "700", color: Colors.bronze, fontFamily: "Inter_700Bold" },
  rankBadgeN: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: Colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNumN: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary, fontFamily: "Inter_600SemiBold" },

  rowInfo: { flex: 1, gap: 2 },
  rowTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  rowName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  rowNameFirst: { color: Colors.gold, fontSize: 15 },
  challengerBadge: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: Colors.goldFaint,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.25)",
  },
  rowNeighborhood: { fontSize: 11, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 2 },
  rowScore: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  rowScoreFirst: { color: Colors.gold, fontSize: 20 },
  moveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  moveText: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  priceRange: { fontSize: 11, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },

  thumbnail: {
    width: THUMB_W,
    height: THUMB_H + 16,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  thumbnailPlaceholder: {
    backgroundColor: Colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
});

import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, Platform, Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import {
  CATEGORIES, Category, Business,
  getBusinessesByCategory,
} from "@/lib/data";

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

function MovementIndicator({ current, prev }: { current: number; prev: number }) {
  const diff = prev - current;
  if (diff > 0) {
    return (
      <View style={[styles.moveBadge, { backgroundColor: Colors.greenFaint }]}>
        <Ionicons name="arrow-up" size={10} color={Colors.green} />
        <Text style={[styles.moveText, { color: Colors.green }]}>{diff}</Text>
      </View>
    );
  }
  if (diff < 0) {
    return (
      <View style={[styles.moveBadge, { backgroundColor: Colors.redFaint }]}>
        <Ionicons name="arrow-down" size={10} color={Colors.red} />
        <Text style={[styles.moveText, { color: Colors.red }]}>{Math.abs(diff)}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.moveBadge, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
      <Text style={[styles.moveText, { color: Colors.textTertiary }]}>—</Text>
    </View>
  );
}

function BusinessRow({ item, index }: { item: Business; index: number }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  const isTop = item.rank <= 3;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.id } })}
        style={[styles.row, isTop && styles.rowTop, item.rank === 1 && styles.rowFirst]}
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
                  <Ionicons name="flash" size={9} color={Colors.gold} />
                  <Text style={styles.challengerText}>CHALLENGE</Text>
                </View>
              )}
            </View>
            <Text style={styles.rowNeighborhood}>{item.neighborhood}</Text>
          </View>
        </View>
        <View style={styles.rowRight}>
          <Text style={[styles.rowScore, item.rank === 1 && styles.rowScoreFirst]}>
            {item.score.toFixed(1)}
          </Text>
          <MovementIndicator current={item.rank} prev={item.prevRank} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<Category>("Restaurants");

  const businesses = getBusinessesByCategory(activeCategory);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.city}>Dallas</Text>
          <Text style={styles.subtitle}>Rankings last updated: 4 minutes ago</Text>
        </View>
        <View style={styles.crownContainer}>
          <Ionicons name="trophy" size={28} color={Colors.gold} />
        </View>
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
          >
            <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={businesses}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => <BusinessRow item={item} index={index} />}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 }
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 12,
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
  crownContainer: {
    marginTop: 4,
  },
  tabs: {
    flexGrow: 0,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    flexDirection: "row",
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tabActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  tabText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  tabTextActive: {
    color: "#000",
  },
  list: {
    paddingHorizontal: 16,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowTop: {
    borderColor: Colors.borderLight,
  },
  rowFirst: {
    backgroundColor: "#1A1600",
    borderColor: Colors.goldDim,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  rankBadge1: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNum1: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  rankBadge2: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(176,176,176,0.15)",
    borderWidth: 1,
    borderColor: Colors.silver,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNum2: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.silver,
    fontFamily: "Inter_700Bold",
  },
  rankBadge3: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(205,127,50,0.15)",
    borderWidth: 1,
    borderColor: Colors.bronze,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNum3: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.bronze,
    fontFamily: "Inter_700Bold",
  },
  rankBadgeN: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNumN: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "Inter_600SemiBold",
  },
  rowInfo: {
    flex: 1,
  },
  rowTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  rowName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  rowNameFirst: {
    color: Colors.gold,
    fontSize: 16,
  },
  challengerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.goldFaint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(245,197,24,0.3)",
  },
  challengerText: {
    fontSize: 8,
    fontWeight: "700",
    color: Colors.gold,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  rowNeighborhood: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  rowRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  rowScore: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  rowScoreFirst: {
    color: Colors.gold,
    fontSize: 22,
  },
  moveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  moveText: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});

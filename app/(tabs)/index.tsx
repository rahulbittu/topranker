import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, Platform, Animated, ActivityIndicator, Image,
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
  isOpenNow?: boolean;
  priceRange?: string;
  photoUrl?: string;
  image?: any;
}

function RankBadge({ rank }: { rank: number }) {
  const isGold = rank === 1;
  const isSilver = rank === 2;
  const isBronze = rank === 3;
  const isTop3 = rank <= 3;

  const badgeStyle = isGold
    ? styles.rankOverlayGold
    : isSilver
    ? styles.rankOverlaySilver
    : isBronze
    ? styles.rankOverlayBronze
    : styles.rankOverlayDefault;

  const textStyle = isGold
    ? styles.rankTextGold
    : isSilver
    ? styles.rankTextSilver
    : isBronze
    ? styles.rankTextBronze
    : styles.rankTextDefault;

  return (
    <View style={[styles.rankOverlay, badgeStyle]}>
      <Text style={textStyle}>{rank}</Text>
    </View>
  );
}

function OpenStatusDot({ isOpen }: { isOpen?: boolean }) {
  if (isOpen === undefined || isOpen === null) return null;
  return (
    <View style={styles.statusRow}>
      <View style={[styles.statusDot, isOpen ? styles.statusOpen : styles.statusClosed]} />
      <Text style={[styles.statusText, isOpen ? styles.statusTextOpen : styles.statusTextClosed]}>
        {isOpen ? "Open" : "Closed"}
      </Text>
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
  return null;
}

function BusinessRow({ item }: { item: MappedBusiness }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  const isFirst = item.rank === 1;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
        style={[styles.row, isFirst && styles.rowFirst]}
        testID={`leaderboard-row-${item.rank}`}
      >
        <View style={styles.photoContainer}>
          {item.photoUrl ? (
            <Image source={{ uri: item.photoUrl }} style={styles.photoImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="restaurant-outline" size={22} color={Colors.textTertiary} />
            </View>
          )}
          <RankBadge rank={item.rank} />
        </View>

        <View style={styles.rowInfo}>
          <View style={styles.rowTitleRow}>
            <Text style={[styles.rowName, isFirst && styles.rowNameFirst]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.isChallenger && (
              <View style={styles.challengerBadge}>
                <Ionicons name="flash" size={8} color={Colors.gold} />
              </View>
            )}
          </View>
          <Text style={styles.rowNeighborhood} numberOfLines={1}>{item.neighborhood}</Text>
          <View style={styles.rowMetaLeft}>
            <OpenStatusDot isOpen={item.isOpenNow} />
            {item.priceRange ? (
              <Text style={styles.priceRange}>{item.priceRange}</Text>
            ) : null}
            <MovementIndicator delta={item.rankDelta} />
          </View>
        </View>

        <View style={styles.scoreBlock}>
          <Text style={[styles.scoreValue, isFirst && styles.scoreValueFirst]}>
            {item.weightedScore.toFixed(1)}
          </Text>
          <Text style={styles.ratingCount}>{item.ratingCount} ratings</Text>
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
        <Text style={styles.brandTitle}>TOP RANKER</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="map-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.citySelector}>
            <Ionicons name="location-sharp" size={14} color={Colors.gold} />
            <Text style={styles.citySelectorText}>Dallas</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
        style={styles.tabs}
      >
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.tab, isActive && styles.tabActive]}
              testID={`category-tab-${cat}`}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {cat}
              </Text>
              {isActive && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.tabDivider} />

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
              <Ionicons name="search-outline" size={36} color={Colors.textTertiary} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>No businesses found</Text>
              <Text style={styles.emptySubtext}>Try a different category</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const PHOTO_SIZE = 64;
const ROW_HEIGHT = 88;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    paddingTop: 4,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.gold,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  citySelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  citySelectorText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },

  tabs: { flexGrow: 0 },
  tabsContainer: {
    paddingHorizontal: 20,
    gap: 20,
    flexDirection: "row",
  },
  tab: {
    paddingBottom: 10,
    position: "relative" as const,
  },
  tabActive: {},
  tabText: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontFamily: "Inter_500Medium",
  },
  tabTextActive: {
    color: Colors.gold,
    fontFamily: "Inter_600SemiBold",
  },
  tabUnderline: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.gold,
    borderRadius: 1,
  },
  tabDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 6,
  },

  list: { paddingHorizontal: 14, gap: 6, paddingTop: 6 },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyText: { fontSize: 16, color: Colors.textSecondary, fontFamily: "Inter_600SemiBold" },
  emptySubtext: { fontSize: 13, color: Colors.textTertiary, fontFamily: "Inter_400Regular", marginTop: 4 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    height: ROW_HEIGHT,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  rowFirst: {
    backgroundColor: "#1A2840",
    borderColor: Colors.goldDim,
  },

  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    position: "relative" as const,
  },
  photoImage: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 12,
  },
  photoPlaceholder: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 12,
    backgroundColor: Colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  rankOverlay: {
    position: "absolute" as const,
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  rankOverlayGold: {
    backgroundColor: Colors.gold,
  },
  rankOverlaySilver: {
    backgroundColor: Colors.silver,
  },
  rankOverlayBronze: {
    backgroundColor: Colors.bronze,
  },
  rankOverlayDefault: {
    backgroundColor: Colors.surfaceRaised,
    borderColor: Colors.border,
  },
  rankTextGold: {
    fontSize: 11,
    fontWeight: "800",
    color: "#000",
    fontFamily: "Inter_700Bold",
  },
  rankTextSilver: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1B2A4A",
    fontFamily: "Inter_700Bold",
  },
  rankTextBronze: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
  rankTextDefault: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "Inter_600SemiBold",
  },

  rowInfo: { flex: 1, justifyContent: "center", gap: 2 },
  rowTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  rowName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  rowNameFirst: { color: Colors.gold },
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
  rowNeighborhood: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  rowMetaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusOpen: {
    backgroundColor: Colors.greenBright,
  },
  statusClosed: {
    backgroundColor: Colors.redBright,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  statusTextOpen: {
    color: Colors.greenBright,
  },
  statusTextClosed: {
    color: Colors.redBright,
  },

  priceRange: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
  },

  moveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  moveText: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },

  scoreBlock: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 56,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  scoreValueFirst: {
    color: Colors.gold,
    fontSize: 24,
  },
  ratingCount: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
});

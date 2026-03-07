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
import { formatCategoryLabel } from "@/lib/data";
import { fetchLeaderboard, fetchCategories } from "@/lib/api";

const AMBER = "#B8860B";

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

function OpenStatusText({ isOpen }: { isOpen?: boolean }) {
  if (isOpen === undefined || isOpen === null) return null;
  return (
    <Text style={[
      styles.statusText,
      { color: isOpen ? Colors.green : Colors.red, textTransform: "uppercase" as const }
    ]}>
      {isOpen ? "Open" : "Closed"}
    </Text>
  );
}

function MovementIndicator({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <Text style={styles.moveUp}>↑{delta}</Text>
    );
  }
  if (delta < 0) {
    return (
      <Text style={styles.moveDown}>↓{Math.abs(delta)}</Text>
    );
  }
  return null;
}

function BusinessRow({ item }: { item: MappedBusiness }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  const isFirst = item.rank === 1;
  const rankColor = isFirst ? Colors.gold : item.rank <= 3 ? "#AAAAAA" : "#CCCCCC";

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
        style={styles.row}
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
        </View>

        <Text style={[styles.rankNum, { color: rankColor }]}>
          {item.rank}
        </Text>

        <View style={styles.rowInfo}>
          <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.rowMeta}>
            <Text style={styles.rowNeighborhood} numberOfLines={1}>
              {item.neighborhood}{item.priceRange ? ` · ${item.priceRange}` : ""}
            </Text>
          </View>
          <View style={styles.rowMetaLeft}>
            <OpenStatusText isOpen={item.isOpenNow} />
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
  const [activeCategory, setActiveCategory] = useState<string>("restaurant");

  // Fetch available categories from database (Fix 3)
  const { data: availableCategories = [] } = useQuery({
    queryKey: ["categories", "Dallas"],
    queryFn: () => fetchCategories("Dallas"),
    staleTime: 60000,
  });

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["leaderboard", "Dallas", activeCategory],
    queryFn: () => {
      // Pass the raw category slug directly since we're now using API slugs
      const apiUrl = `/api/leaderboard?city=Dallas&category=${encodeURIComponent(activeCategory)}&limit=20`;
      return fetchLeaderboard("Dallas", activeCategory, 20);
    },
    staleTime: 30000,
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // Build tabs from available categories
  const categoryTabs = availableCategories.length > 0
    ? availableCategories.map((cat: string) => ({
        slug: cat,
        label: formatCategoryLabel(cat),
      }))
    : [{ slug: "restaurant", label: "Restaurants" }];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>TOP RANKER</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.citySelector}>
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
        {categoryTabs.map((cat: { slug: string; label: string }) => {
          const isActive = activeCategory === cat.slug;
          return (
            <TouchableOpacity
              key={cat.slug}
              onPress={() => setActiveCategory(cat.slug)}
              style={[styles.tab, isActive && styles.tabActive]}
              testID={`category-tab-${cat.slug}`}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {cat.label}
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

const PHOTO_SIZE = 56;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

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
    fontWeight: "700",
    color: Colors.gold,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  citySelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  citySelectorText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },

  tabs: { flexGrow: 0 },
  tabsContainer: {
    paddingHorizontal: 20,
    gap: 24,
    flexDirection: "row",
  },
  tab: {
    paddingBottom: 10,
    position: "relative" as const,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  tabTextActive: {
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
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

  list: { paddingHorizontal: 14, gap: 8, paddingTop: 6 },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyText: { fontSize: 16, color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  emptySubtext: { fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", marginTop: 4 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
    ...Colors.cardShadow,
  },

  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
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

  rankNum: {
    fontSize: 28,
    fontFamily: "PlayfairDisplay_700Bold",
    minWidth: 30,
    textAlign: "center",
  },

  rowInfo: { flex: 1, justifyContent: "center", gap: 2 },
  rowName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowNeighborhood: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
  },
  rowMetaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },

  statusText: {
    fontSize: 11,
    fontFamily: "DMSans_600SemiBold",
    letterSpacing: 0.5,
  },

  moveUp: {
    fontSize: 11,
    color: Colors.green,
    fontFamily: "DMSans_500Medium",
  },
  moveDown: {
    fontSize: 11,
    color: Colors.red,
    fontFamily: "DMSans_500Medium",
  },

  scoreBlock: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 56,
  },
  scoreValue: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -0.5,
  },
  scoreValueFirst: {
    color: Colors.gold,
  },
  ratingCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    marginTop: 1,
  },
});

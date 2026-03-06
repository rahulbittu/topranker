import React, { useState, useMemo } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Platform, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { CATEGORIES, type Category } from "@/lib/data";
import { fetchBusinessSearch } from "@/lib/api";

type FilterType = "All" | "Top 10" | "Challenging" | "Trending";
const FILTERS: FilterType[] = ["All", "Top 10", "Challenging", "Trending"];
const CITIES = ["Dallas", "Austin", "Houston", "San Antonio", "Fort Worth"];

interface MappedBusiness {
  id: string;
  name: string;
  slug: string;
  neighborhood: string;
  category: string;
  weightedScore: number;
  rank: number;
  rankDelta: number;
  isChallenger: boolean;
  priceRange: string | null;
  featuredDish: string | null;
}

function SearchResultRow({ item }: { item: MappedBusiness }) {
  return (
    <TouchableOpacity
      style={styles.resultRow}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
      activeOpacity={0.75}
    >
      <View style={styles.resultThumb}>
        <Ionicons name="restaurant-outline" size={16} color={Colors.textTertiary} />
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.resultMeta}>
          <Text style={styles.resultCat}>{item.category}</Text>
          <Text style={styles.resultDot}>·</Text>
          <Text style={styles.resultNeighborhood}>{item.neighborhood}</Text>
          {item.priceRange && (
            <>
              <Text style={styles.resultDot}>·</Text>
              <Text style={styles.resultPrice}>{item.priceRange}</Text>
            </>
          )}
        </View>
        {item.featuredDish && (
          <Text style={styles.resultDish} numberOfLines={1}>{item.featuredDish}</Text>
        )}
      </View>
      <View style={styles.resultRight}>
        <Text style={[styles.resultRank, item.rank === 1 && { color: Colors.gold }]}>#{item.rank}</Text>
        <Text style={styles.resultScore}>{item.weightedScore.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

function TrendingCard({ item }: { item: MappedBusiness }) {
  return (
    <TouchableOpacity
      style={styles.trendCard}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
      activeOpacity={0.75}
    >
      <View style={styles.trendTop}>
        <Text style={styles.trendGain}>↑{item.rankDelta}</Text>
        <Text style={styles.trendScore}>{item.weightedScore.toFixed(2)}</Text>
      </View>
      <Text style={styles.trendName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.trendCat}>{item.category}</Text>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [city, setCity] = useState("Dallas");
  const [showCityPicker, setShowCityPicker] = useState(false);

  const { data: allBusinesses = [], isLoading } = useQuery({
    queryKey: ["search", city, query],
    queryFn: () => fetchBusinessSearch(query, city),
    staleTime: 15000,
  });

  const filtered = useMemo(() => {
    let list = allBusinesses;
    if (activeCategory !== "All") list = list.filter((b: MappedBusiness) => b.category === activeCategory);
    if (activeFilter === "Top 10") list = list.filter((b: MappedBusiness) => b.rank <= 10);
    else if (activeFilter === "Challenging") list = list.filter((b: MappedBusiness) => b.isChallenger);
    else if (activeFilter === "Trending") list = list.filter((b: MappedBusiness) => b.rankDelta > 0);
    return list.sort((a: MappedBusiness, b: MappedBusiness) => (a.rank || 999) - (b.rank || 999));
  }, [allBusinesses, activeFilter, activeCategory]);

  const trending = useMemo(() => {
    return allBusinesses
      .filter((b: MappedBusiness) => b.rankDelta > 0)
      .sort((a: MappedBusiness, b: MappedBusiness) => b.rankDelta - a.rankDelta)
      .slice(0, 5);
  }, [allBusinesses]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const showTrending = !query.trim() && activeFilter === "All";

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Discover</Text>
        <TouchableOpacity style={styles.cityButton} onPress={() => setShowCityPicker(!showCityPicker)} activeOpacity={0.7}>
          <Text style={styles.cityButtonText}>{city}</Text>
          <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {showCityPicker && (
        <View style={styles.cityPickerDropdown}>
          {CITIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.cityOption, city === c && styles.cityOptionActive]}
              onPress={() => { setCity(c); setShowCityPicker(false); }}
            >
              <Text style={[styles.cityOptionText, city === c && styles.cityOptionTextActive]}>{c}</Text>
              {city === c && <Ionicons name="checkmark" size={13} color={Colors.gold} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.searchBox}>
        <Ionicons name="search" size={15} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Restaurants, neighborhoods, dishes..."
          placeholderTextColor={Colors.textTertiary}
          value={query}
          onChangeText={setQuery}
        />
        {!!query && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={15} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} style={styles.filterTab}>
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            {activeFilter === f && <View style={styles.filterUnderline} />}
          </TouchableOpacity>
        ))}
        <View style={styles.dividerV} />
        {(["All", ...CATEGORIES] as (Category | "All")[]).map(cat => (
          <TouchableOpacity key={cat} onPress={() => setActiveCategory(cat)} style={styles.filterTab}>
            <Text style={[styles.filterText, activeCategory === cat && styles.filterTextActive]}>{cat}</Text>
            {activeCategory === cat && <View style={styles.filterUnderline} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {showTrending && trending.length > 0 && (
        <View style={styles.trendingSection}>
          <Text style={styles.sectionLabel}>Trending This Week</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingRow}>
            {trending.map((item: MappedBusiness) => <TrendingCard key={item.id} item={item} />)}
          </ScrollView>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: MappedBusiness) => item.id}
          renderItem={({ item }: { item: MappedBusiness }) => <SearchResultRow item={item} />}
          contentContainerStyle={[
            styles.resultList,
            { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 }
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={32} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No results</Text>
              <Text style={styles.emptySubtext}>Try a different search or filter</Text>
            </View>
          }
          ListHeaderComponent={
            !showTrending ? (
              <Text style={styles.resultsCount}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  headerRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 10,
  },
  title: { fontSize: 28, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5 },
  cityButton: {
    flexDirection: "row", alignItems: "center", gap: 4,
  },
  cityButtonText: { fontSize: 14, color: Colors.text, fontFamily: "DMSans_500Medium" },

  cityPickerDropdown: {
    marginHorizontal: 16, backgroundColor: "#FFFFFF", borderRadius: 12,
    marginBottom: 8, overflow: "hidden", ...Colors.cardShadow,
  },
  cityOption: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  cityOptionActive: { backgroundColor: Colors.goldFaint },
  cityOptionText: { fontSize: 13, color: Colors.text, fontFamily: "DMSans_400Regular" },
  cityOptionTextActive: { color: Colors.gold, fontFamily: "DMSans_600SemiBold" },

  searchBox: {
    flexDirection: "row", alignItems: "center", marginHorizontal: 16,
    backgroundColor: Colors.surfaceRaised, borderRadius: 12, paddingHorizontal: 12,
    paddingVertical: 10, gap: 8, marginBottom: 9,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text, fontFamily: "DMSans_400Regular" },

  filterRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 16, flexDirection: "row", alignItems: "center" },
  filterTab: { paddingBottom: 4, position: "relative" as const },
  filterText: { fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  filterTextActive: { color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  filterUnderline: {
    position: "absolute" as const, bottom: 0, left: 0, right: 0,
    height: 2, backgroundColor: Colors.gold, borderRadius: 1,
  },
  dividerV: { width: 1, height: 18, backgroundColor: Colors.border, marginHorizontal: 2 },

  trendingSection: { marginBottom: 6 },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold", paddingHorizontal: 20, marginBottom: 10 },
  trendingRow: { paddingHorizontal: 16, gap: 10, paddingBottom: 2 },
  trendCard: {
    width: 148, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 12, gap: 6,
    ...Colors.cardShadow,
  },
  trendTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  trendGain: { fontSize: 12, fontWeight: "600", color: Colors.green, fontFamily: "DMSans_600SemiBold" },
  trendScore: { fontSize: 15, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold" },
  trendName: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold", lineHeight: 18 },
  trendCat: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },

  resultList: { paddingHorizontal: 14, gap: 8, paddingTop: 4 },
  resultsCount: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", paddingBottom: 4 },

  resultRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", borderRadius: 14,
    paddingVertical: 10, paddingHorizontal: 12,
    ...Colors.cardShadow,
  },
  resultThumb: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: Colors.surfaceRaised, alignItems: "center", justifyContent: "center",
  },
  resultInfo: { flex: 1, paddingHorizontal: 10, gap: 3 },
  resultName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  resultMeta: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
  resultCat: { fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  resultDot: { fontSize: 10, color: Colors.textTertiary },
  resultNeighborhood: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  resultPrice: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  resultDish: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", marginTop: 1 },

  resultRight: { alignItems: "center", paddingRight: 4, gap: 3 },
  resultRank: { fontSize: 14, fontWeight: "700", color: Colors.textTertiary, fontFamily: "PlayfairDisplay_700Bold" },
  resultScore: { fontSize: 15, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold" },

  emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  emptySubtext: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
});

import React, { useState, useMemo } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { MOCK_BUSINESSES, Business, getTrendingBusinesses, CATEGORIES, Category } from "@/lib/data";

type FilterType = "All" | "Top 10" | "Challenging" | "Trending";
const FILTERS: FilterType[] = ["All", "Top 10", "Challenging", "Trending"];

const CITIES = ["Dallas", "Austin", "Houston", "San Antonio", "Fort Worth"];

function SearchResultRow({ item }: { item: Business }) {
  return (
    <TouchableOpacity
      style={styles.resultRow}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.id } })}
      activeOpacity={0.7}
    >
      <View style={styles.resultRankBadge}>
        <Text style={[styles.resultRank, item.rank === 1 && { color: Colors.gold }]}>
          #{item.rank}
        </Text>
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.resultMeta}>
          <Text style={styles.resultCat}>{item.category}</Text>
          <Text style={styles.resultDot}>·</Text>
          <Text style={styles.resultNeighborhood}>{item.neighborhood}</Text>
        </View>
      </View>
      <View style={styles.resultRight}>
        <Text style={styles.resultScore}>{item.score.toFixed(1)}</Text>
        {item.isChallenger && (
          <Ionicons name="flash" size={12} color={Colors.gold} />
        )}
      </View>
    </TouchableOpacity>
  );
}

function TrendingCard({ item }: { item: Business }) {
  const gain = item.prevRank - item.rank;
  return (
    <TouchableOpacity
      style={styles.trendCard}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.id } })}
      activeOpacity={0.7}
    >
      <View style={styles.trendTop}>
        <View style={styles.trendGainBadge}>
          <Ionicons name="arrow-up" size={10} color={Colors.green} />
          <Text style={styles.trendGain}>+{gain}</Text>
        </View>
        <Text style={styles.trendScore}>{item.score.toFixed(1)}</Text>
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

  const trending = getTrendingBusinesses();

  const filtered = useMemo(() => {
    let list = MOCK_BUSINESSES.filter(b => b.city === city);

    if (activeCategory !== "All") {
      list = list.filter(b => b.category === activeCategory);
    }

    if (activeFilter === "Top 10") {
      list = list.filter(b => b.rank <= 10);
    } else if (activeFilter === "Challenging") {
      list = list.filter(b => b.isChallenger);
    } else if (activeFilter === "Trending") {
      list = list.filter(b => b.prevRank > b.rank);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.neighborhood.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => a.rank - b.rank);
  }, [query, activeFilter, activeCategory, city]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const showTrending = !query.trim() && activeFilter === "All";

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Discover</Text>
        <TouchableOpacity
          style={styles.cityButton}
          onPress={() => setShowCityPicker(!showCityPicker)}
          activeOpacity={0.7}
        >
          <Ionicons name="location-sharp" size={13} color={Colors.gold} />
          <Text style={styles.cityButtonText}>{city}</Text>
          <Ionicons name="chevron-down" size={13} color={Colors.textSecondary} />
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
              <Text style={[styles.cityOptionText, city === c && styles.cityOptionTextActive]}>
                {c}
              </Text>
              {city === c && <Ionicons name="checkmark" size={14} color={Colors.gold} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses, neighborhoods..."
          placeholderTextColor={Colors.textTertiary}
          value={query}
          onChangeText={setQuery}
        />
        {!!query && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.dividerV} />
        {(["All", ...CATEGORIES] as (Category | "All")[]).map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[styles.filterChip, activeCategory === cat && styles.filterChipCat]}
          >
            <Text style={[styles.filterText, activeCategory === cat && styles.filterTextCat]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {showTrending && (
        <View style={styles.trendingSection}>
          <Text style={styles.sectionLabel}>Trending This Week</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingRow}
          >
            {trending.map(item => (
              <TrendingCard key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <SearchResultRow item={item} />}
        contentContainerStyle={[
          styles.resultList,
          { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 }
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={36} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubtext}>Try a different search or filter</Text>
          </View>
        }
        ListHeaderComponent={
          !showTrending ? (
            <Text style={styles.resultsCount}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  cityButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cityButtonText: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: "Inter_500Medium",
  },
  cityPickerDropdown: {
    marginHorizontal: 20,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    overflow: "hidden",
  },
  cityOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cityOptionActive: {
    backgroundColor: Colors.goldFaint,
  },
  cityOptionText: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: "Inter_400Regular",
  },
  cityOptionTextActive: {
    color: Colors.gold,
    fontFamily: "Inter_600SemiBold",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontFamily: "Inter_400Regular",
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  filterChipCat: {
    backgroundColor: Colors.blueFaint,
    borderColor: Colors.blue,
  },
  filterText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  filterTextActive: {
    color: "#000",
    fontFamily: "Inter_600SemiBold",
  },
  filterTextCat: {
    color: Colors.blue,
  },
  dividerV: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  trendingSection: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 20,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  trendingRow: {
    paddingHorizontal: 16,
    gap: 10,
  },
  trendCard: {
    width: 140,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trendTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  trendGainBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: Colors.greenFaint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendGain: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.green,
    fontFamily: "Inter_700Bold",
  },
  trendScore: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
  },
  trendName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 18,
  },
  trendCat: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  resultList: {
    paddingHorizontal: 16,
    gap: 8,
    paddingTop: 4,
  },
  resultsCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    paddingBottom: 4,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultRankBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  resultRank: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
    fontFamily: "Inter_700Bold",
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  resultCat: {
    fontSize: 11,
    color: Colors.gold,
    fontFamily: "Inter_500Medium",
  },
  resultDot: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  resultNeighborhood: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  resultRight: {
    alignItems: "flex-end",
    gap: 3,
  },
  resultScore: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "Inter_600SemiBold",
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
  },
});

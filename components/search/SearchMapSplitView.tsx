/**
 * Sprint 527: Map split view extracted from search.tsx
 *
 * Renders the Yelp-like split map/list layout with selected business
 * card overlay, cuisine indicator, and list of MapBusinessCards.
 */
import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { getCategoryDisplay, getRankDisplay, BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import { SafeImage } from "@/components/SafeImage";
import { MapBusinessCard, MapView } from "./SubComponents";
import { DiscoverEmptyState } from "./DiscoverEmptyState";
import { CUISINE_DISPLAY } from "@/shared/best-in-categories";
import { MappedBusiness } from "@/types/business";
import * as Haptics from "expo-haptics";

const AMBER = BRAND.colors.amber;

interface SearchMapSplitViewProps {
  filtered: MappedBusiness[];
  city: string;
  selectedMapBiz: MappedBusiness | null;
  onSelectMapBiz: (biz: MappedBusiness | null) => void;
  onSearchArea: (lat: number, lng: number) => void;
  selectedCuisine: string | null;
  onClearCuisine: () => void;
  query: string;
  activeFilter: string;
  popularCategories: string[];
  onSearchCategory: (cat: string) => void;
  onCityChange: (city: string) => void;
  onClearFilter: () => void;
  bottomInset: number;
  onMyLocation?: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

export function SearchMapSplitView({
  filtered, city, selectedMapBiz, onSelectMapBiz, onSearchArea,
  selectedCuisine, onClearCuisine, query, activeFilter,
  popularCategories, onSearchCategory, onCityChange, onClearFilter, bottomInset,
  onMyLocation, userLocation,
}: SearchMapSplitViewProps) {
  return (
    <View style={styles.splitContainer}>
      <View style={styles.splitMapSection}>
        <MapView businesses={filtered} city={city} onSelectBiz={onSelectMapBiz} onSearchArea={onSearchArea} onMyLocation={onMyLocation} userLocation={userLocation} />
        {selectedMapBiz && (
          <TouchableOpacity
            style={styles.mapSelectedCard}
            onPress={() => router.push({ pathname: "/business/[id]", params: { id: selectedMapBiz.slug } })}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`View ${selectedMapBiz.name}`}
          >
            {selectedMapBiz.photoUrls && selectedMapBiz.photoUrls.length > 0 ? (
              <SafeImage uri={selectedMapBiz.photoUrls[0]} style={styles.mapSelectedPhoto} contentFit="cover" category={selectedMapBiz.category} />
            ) : (
              <LinearGradient colors={[AMBER, BRAND.colors.amberDark]} style={[styles.mapSelectedPhoto, styles.mapSelectedPhotoFallback]}>
                <Text style={styles.mapSelectedInitial}>{selectedMapBiz.name.charAt(0)}</Text>
              </LinearGradient>
            )}
            <View style={styles.mapSelectedInfo}>
              <Text style={styles.mapSelectedName} numberOfLines={1}>{selectedMapBiz.name}</Text>
              <View style={styles.mapSelectedMetaRow}>
                <Text style={styles.mapSelectedScore}>{"\u2B50"} {selectedMapBiz.weightedScore.toFixed(1)}</Text>
                <Text style={styles.mapSelectedMeta}>{getRankDisplay(selectedMapBiz.rank)}</Text>
                {selectedMapBiz.isOpenNow !== undefined && (
                  <View style={[styles.mapSelectedStatusPill, selectedMapBiz.isOpenNow ? styles.statusPillOpen : styles.statusPillClosed]}>
                    <Text style={styles.mapSelectedStatusText}>{selectedMapBiz.isOpenNow ? "OPEN" : "CLOSED"}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.mapSelectedCategory} numberOfLines={1}>
                {getCategoryDisplay(selectedMapBiz.category).emoji} {getCategoryDisplay(selectedMapBiz.category).label}
                {selectedMapBiz.cuisine && CUISINE_DISPLAY[selectedMapBiz.cuisine] ? ` · ${CUISINE_DISPLAY[selectedMapBiz.cuisine].emoji} ${CUISINE_DISPLAY[selectedMapBiz.cuisine].label}` : ""}
                {selectedMapBiz.neighborhood ? ` \u00B7 ${selectedMapBiz.neighborhood}` : ""}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.splitListSection}>
        {selectedCuisine && (
          <View style={[styles.activeCuisineRow, { paddingHorizontal: 12 }]}>
            <View style={styles.activeCuisineChip}>
              <Text style={styles.activeCuisineText}>
                {CUISINE_DISPLAY[selectedCuisine]?.emoji || ""} {CUISINE_DISPLAY[selectedCuisine]?.label || selectedCuisine}
              </Text>
              <TouchableOpacity
                onPress={() => { Haptics.selectionAsync(); onClearCuisine(); }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Clear ${selectedCuisine} filter`}
              >
                <Ionicons name="close-circle" size={14} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={styles.splitListHeader}>
          <Ionicons name="list" size={14} color={AMBER} />
          <Text style={styles.splitListHeaderText}>{filtered.length} result{filtered.length !== 1 ? "s" : ""} nearby</Text>
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item: MappedBusiness) => item.id}
          renderItem={({ item }: { item: MappedBusiness }) => <MapBusinessCard item={item} />}
          contentContainerStyle={[styles.splitListContent, { paddingBottom: Platform.OS === "web" ? 34 + 84 : bottomInset + 90 }]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          ListEmptyComponent={
            <DiscoverEmptyState
              variant="map"
              query={query}
              selectedCuisine={selectedCuisine}
              city={city}
              activeFilter={activeFilter}
              popularCategories={popularCategories}
              onClearCuisine={onClearCuisine}
              onSearchCategory={onSearchCategory}
              onCityChange={onCityChange}
              onClearFilter={onClearFilter}
            />
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splitContainer: { flex: 1 },
  splitMapSection: { height: "45%", position: "relative" as const },
  splitListSection: {
    flex: 1, backgroundColor: Colors.background,
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    marginTop: -12,
    ...Colors.cardShadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  splitListHeader: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  splitListHeaderText: {
    fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  splitListContent: { paddingHorizontal: 12, gap: 6 },
  activeCuisineRow: {
    flexDirection: "row" as const, alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 4, paddingVertical: 6, marginBottom: 4,
  },
  activeCuisineChip: {
    flexDirection: "row" as const, alignItems: "center", gap: 6,
    backgroundColor: "rgba(196, 154, 26, 0.12)", paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 14, borderWidth: 1, borderColor: "rgba(196, 154, 26, 0.3)",
  },
  activeCuisineText: {
    fontSize: 12, fontWeight: "600" as const, color: "#8B6914", fontFamily: "DMSans_600SemiBold",
  },
  mapSelectedCard: {
    position: "absolute" as const, bottom: 20, left: 12, right: 12,
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 14, padding: 10, gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  mapSelectedPhoto: { width: 52, height: 52, borderRadius: 10 },
  mapSelectedPhotoFallback: { alignItems: "center", justifyContent: "center" },
  mapSelectedInitial: {
    color: "#fff", fontWeight: "700", fontSize: 18, fontFamily: "PlayfairDisplay_700Bold",
  },
  mapSelectedInfo: { flex: 1, gap: 2 },
  mapSelectedName: {
    fontSize: 15, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold",
  },
  mapSelectedMetaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  mapSelectedScore: {
    fontSize: 13, fontWeight: "800", color: AMBER, fontFamily: "PlayfairDisplay_900Black",
  },
  mapSelectedMeta: { ...TYPOGRAPHY.ui.caption, color: Colors.textSecondary },
  mapSelectedStatusPill: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 99 },
  mapSelectedStatusText: {
    fontSize: 8, fontWeight: "700", color: "#fff", fontFamily: "DMSans_700Bold",
  },
  mapSelectedCategory: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary },
  statusPillOpen: {
    backgroundColor: Colors.green,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  statusPillClosed: { backgroundColor: Colors.red },
});

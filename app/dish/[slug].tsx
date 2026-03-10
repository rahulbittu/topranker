/**
 * Dish Leaderboard Page — SEO-optimized dedicated page for dish rankings
 * Sprint 174: Standalone URL for each dish leaderboard (e.g., /dish/best-pizza-dallas)
 *
 * Provides unique meta tags, JSON-LD structured data, and shareable URLs
 * for each dish leaderboard to improve search engine visibility.
 */
import React, { useMemo, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform,
} from "react-native";
import { Head } from "expo-router/head";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { pct } from "@/lib/style-helpers";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { SafeImage } from "@/components/SafeImage";
import { BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import Colors from "@/constants/colors";
import { getApiUrl } from "@/lib/query-client";

const AMBER = BRAND.colors.amber;
const SITE_URL = "https://topranker.com";

interface DishEntry {
  id: string;
  businessId: string;
  dishScore: string;
  dishRatingCount: number;
  rankPosition: number;
  photoUrl: string | null;
  businessName: string;
  businessSlug: string;
  neighborhood: string | null;
}

interface DishBoardDetail {
  id: string;
  city: string;
  dishName: string;
  dishSlug: string;
  dishEmoji: string | null;
  status: string;
  entryCount: number;
  entries: DishEntry[];
  isProvisional: boolean;
  minRatingsNeeded: number;
}

export default function DishLeaderboardPage() {
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data: board, isLoading, error } = useQuery<DishBoardDetail | null>({
    queryKey: ["dish-leaderboard-page", slug],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/dish-leaderboards/${slug}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    },
    staleTime: 60000,
  });

  const cityTitle = useMemo(() => {
    if (!board?.city) return "";
    return board.city.charAt(0).toUpperCase() + board.city.slice(1);
  }, [board?.city]);

  const pageTitle = board
    ? `Best ${board.dishName} in ${cityTitle} — Top ${board.entryCount} Ranked`
    : "Dish Leaderboard — TopRanker";

  const pageDescription = board
    ? `Community-ranked best ${board.dishName.toLowerCase()} in ${cityTitle}. ${board.entryCount} spots rated by credibility-weighted reviews. See who's #1.`
    : "Trust-weighted dish leaderboard rankings on TopRanker.";

  const canonicalUrl = board
    ? `${SITE_URL}/dish/${board.dishSlug}`
    : `${SITE_URL}/dish/${slug}`;

  const topEntry = board?.entries?.[0];
  const ogImage = topEntry?.photoUrl || `${SITE_URL}/assets/images/og-default.png`;

  // JSON-LD structured data for SEO
  const jsonLd = useMemo(() => {
    if (!board || !board.entries?.length) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Best ${board.dishName} in ${cityTitle}`,
      description: pageDescription,
      url: canonicalUrl,
      numberOfItems: board.entries.length,
      itemListElement: board.entries.slice(0, 10).map((entry, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: entry.businessName,
        url: `${SITE_URL}/business/${entry.businessSlug}`,
      })),
    };
  }, [board, cityTitle, pageDescription, canonicalUrl]);

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + 60 }]}>
        <ActivityIndicator color={AMBER} size="large" />
      </View>
    );
  }

  if (!board || error) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.errorEmoji}>🍽️</Text>
        <Text style={styles.errorTitle}>Leaderboard not found</Text>
        <Text style={styles.errorSubtitle}>This dish ranking may not exist yet</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const PAGE_SIZE = 10;
  const allEntries = board.entries || [];
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const entries = allEntries.slice(0, visibleCount);
  const hasMore = allEntries.length > visibleCount;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* SEO Head — dynamic meta per dish leaderboard */}
      {Platform.OS === "web" && (
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content={ogImage} />
          <meta property="og:site_name" content="TopRanker" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={pageDescription} />
          <meta name="twitter:image" content={ogImage} />
          {jsonLd && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
          )}
        </Head>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {board.dishEmoji ? `${board.dishEmoji} ` : ""}Best {board.dishName}
          </Text>
          <Text style={styles.headerSubtitle}>in {cityTitle}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroEmoji}>{board.dishEmoji || "🍽️"}</Text>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>
              Best {board.dishName} in {cityTitle}
            </Text>
            <Text style={styles.heroCount}>
              {board.entryCount} spot{board.entryCount !== 1 ? "s" : ""} ranked
            </Text>
          </View>
          {board.isProvisional && (
            <View style={styles.provisionalBadge}>
              <Text style={styles.provisionalText}>Early Rankings</Text>
            </View>
          )}
        </View>

        {/* Building state */}
        {entries.length < 5 && board.minRatingsNeeded > 0 && (
          <View style={styles.buildingCard}>
            <Text style={styles.buildingEmoji}>🔨</Text>
            <Text style={styles.buildingTitle}>
              Best {board.dishName} is building...
            </Text>
            <Text style={styles.buildingSubtext}>
              We need {board.minRatingsNeeded} more reviews to publish this ranking
            </Text>
          </View>
        )}

        {/* Ranked Entries */}
        {entries.map((entry) => (
          <TouchableOpacity
            key={entry.id}
            style={styles.entryCard}
            onPress={() => router.push({ pathname: "/business/[id]", params: { id: entry.businessSlug } })}
            activeOpacity={0.7}
          >
            <View style={styles.entryPhoto}>
              <SafeImage
                source={{ uri: entry.photoUrl || undefined }}
                style={styles.entryPhotoImg}
                fallbackGradient
              />
              <View style={styles.rankBadge}>
                <Text style={styles.rankBadgeText}>{entry.rankPosition}</Text>
              </View>
            </View>
            <View style={styles.entryInfo}>
              <View style={styles.entryRow}>
                <Text style={styles.entryName} numberOfLines={1}>{entry.businessName}</Text>
                {entry.neighborhood && (
                  <Text style={styles.entryNeighborhood}>{entry.neighborhood}</Text>
                )}
              </View>
              <View style={styles.entryRow}>
                <Text style={styles.entryScore}>
                  {parseFloat(entry.dishScore).toFixed(1)}
                </Text>
                <Text style={styles.entryScoreLabel}>
                  {board.dishName} score
                </Text>
              </View>
              <Text style={styles.entryRaterCount}>
                Based on {entry.dishRatingCount} {board.dishName.toLowerCase()} ratings
              </Text>
              {entry.dishRatingCount < 5 && (
                <View style={styles.earlyDataBadge}>
                  <Text style={styles.earlyDataText}>Early data</Text>
                </View>
              )}
              {/* Sprint 309: Rate dish at this business */}
              <TouchableOpacity
                style={styles.rateEntryButton}
                onPress={() => router.push({ pathname: "/rate/[id]", params: { id: entry.businessSlug, dish: board.dishName } })}
                accessibilityRole="button"
                accessibilityLabel={`Rate ${board.dishName} at ${entry.businessName}`}
              >
                <Ionicons name="star-outline" size={14} color={AMBER} />
                <Text style={styles.rateEntryText}>Rate {board.dishName}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* Show More — Sprint 307 pagination */}
        {hasMore && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            accessibilityRole="button"
            accessibilityLabel={`Show more entries. Showing ${visibleCount} of ${allEntries.length}`}
          >
            <Text style={styles.showMoreText}>
              Show more ({allEntries.length - visibleCount} remaining)
            </Text>
            <Ionicons name="chevron-down" size={16} color={AMBER} />
          </TouchableOpacity>
        )}

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaText}>
            Know a great {board.dishName.toLowerCase()} spot?
          </Text>
          <Text style={styles.ctaSubtext}>
            Rate it to help build this leaderboard
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push("/(tabs)/search")}
          >
            <Ionicons name="search" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.ctaButtonText}>Find & Rate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F6F3" },
  center: { flex: 1, backgroundColor: "#F7F6F3", alignItems: "center", justifyContent: "center" },

  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingVertical: 12, backgroundColor: "#fff",
    borderBottomWidth: 1, borderBottomColor: "#E8E6E1",
  },
  headerBack: { width: 32 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  headerSubtitle: { fontSize: 12, color: "#636366" },

  scrollContent: { paddingBottom: 40 },

  heroBanner: {
    margin: 16, padding: 14, borderRadius: 14,
    backgroundColor: "rgba(196,154,26,0.08)", flexDirection: "row",
    alignItems: "center", gap: 10,
  },
  heroEmoji: { fontSize: 36 },
  heroTextWrap: { flex: 1 },
  heroTitle: {
    fontSize: 18, fontWeight: "700", color: "#111",
    fontFamily: TYPOGRAPHY.display.fontFamily,
  },
  heroCount: { fontSize: 12, color: "#636366", marginTop: 2 },
  provisionalBadge: {
    backgroundColor: AMBER, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  provisionalText: { fontSize: 10, color: "#fff", fontWeight: "700" },

  buildingCard: {
    margin: 16, padding: 20, backgroundColor: "#FFF8E7",
    borderRadius: 14, borderWidth: 1, borderColor: "#F0C84A",
    alignItems: "center",
  },
  buildingEmoji: { fontSize: 24, marginBottom: 8 },
  buildingTitle: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 4 },
  buildingSubtext: { fontSize: 13, color: "#636366", textAlign: "center" },

  entryCard: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 14,
    backgroundColor: "#fff", overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  entryPhoto: { height: 150, width: pct(100) },
  entryPhotoImg: { width: pct(100), height: pct(100) },
  rankBadge: {
    position: "absolute", bottom: 8, left: 8, width: 32, height: 32,
    borderRadius: 16, backgroundColor: AMBER,
    alignItems: "center", justifyContent: "center",
  },
  rankBadgeText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  entryInfo: { padding: 12 },
  entryRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 2 },
  entryName: { fontSize: 16, fontWeight: "700", color: "#111", flex: 1 },
  entryNeighborhood: { fontSize: 12, color: "#636366" },
  entryScore: {
    fontSize: 28, fontWeight: "700", color: AMBER,
    fontFamily: TYPOGRAPHY.score?.fontFamily || "System",
  },
  entryScoreLabel: { fontSize: 11, color: "#636366" },
  entryRaterCount: { fontSize: 12, color: "#999", marginTop: 4 },
  earlyDataBadge: {
    backgroundColor: "rgba(196,154,26,0.12)", borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2, alignSelf: "flex-start", marginTop: 6,
  },
  earlyDataText: { fontSize: 10, color: AMBER, fontWeight: "600" },

  ctaSection: {
    margin: 16, padding: 20, backgroundColor: "#fff", borderRadius: 14,
    alignItems: "center",
  },
  ctaText: { fontSize: 15, color: "#555", marginBottom: 12 },
  ctaButton: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: AMBER, borderRadius: 22, paddingHorizontal: 24, paddingVertical: 12,
  },
  ctaButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorTitle: { fontSize: 20, fontWeight: "700", color: "#111", marginBottom: 4 },
  errorSubtitle: { fontSize: 14, color: "#636366", marginBottom: 20 },
  backButton: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
    backgroundColor: AMBER,
  },
  backButtonText: { color: "#fff", fontWeight: "700" },
  rateEntryButton: {
    flexDirection: "row", alignItems: "center", gap: 4,
    marginTop: 8, alignSelf: "flex-start",
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
    backgroundColor: "rgba(196,154,26,0.08)",
    borderWidth: 1, borderColor: "rgba(196,154,26,0.2)",
  },
  rateEntryText: { fontSize: 12, fontWeight: "600", color: AMBER },
  ctaSubtext: { fontSize: 13, color: "#999", marginBottom: 12 },
  showMoreButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    marginHorizontal: 16, marginBottom: 12, paddingVertical: 12,
    borderRadius: 12, backgroundColor: "rgba(196,154,26,0.08)",
    borderWidth: 1, borderColor: "rgba(196,154,26,0.2)",
  },
  showMoreText: { fontSize: 14, fontWeight: "600", color: AMBER },
});

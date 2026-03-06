import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { fetchBusinessBySlug } from "@/lib/api";
import {
  formatTimeAgo, TIER_COLORS, TIER_DISPLAY_NAMES, type CredibilityTier,
} from "@/lib/data";
import { useAuth } from "@/lib/auth-context";

interface MappedRating {
  id: string;
  userName: string;
  userTier: CredibilityTier;
  rawScore: number;
  weight: number;
  food: number;
  value: number;
  service: number;
  wouldReturn: boolean;
  comment: string | null;
  createdAt: number;
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.ratingBarRow}>
      <Text style={styles.ratingBarLabel}>{label}</Text>
      <View style={styles.ratingBarTrack}>
        <View style={[styles.ratingBarFill, { width: `${(value / 5) * 100}%` as any }]} />
      </View>
      <Text style={styles.ratingBarValue}>{value.toFixed(1)}</Text>
    </View>
  );
}

function DistributionChart({ ratings }: { ratings: MappedRating[] }) {
  const counts = [5, 4, 3, 2, 1].map(n => ({
    star: n,
    count: ratings.filter(r => Math.round(r.rawScore) === n).length
  }));
  const maxCount = Math.max(...counts.map(c => c.count), 1);

  return (
    <View style={styles.distChart}>
      {counts.map(({ star, count }) => (
        <View key={star} style={styles.distRow}>
          <Text style={styles.distStar}>{star}</Text>
          <View style={styles.distBarTrack}>
            <View
              style={[styles.distBarFill, {
                width: `${(count / maxCount) * 100}%` as any,
                backgroundColor: count === maxCount && count > 0 ? Colors.gold : Colors.borderLight,
              }]}
            />
          </View>
          <Text style={styles.distCount}>{count}</Text>
        </View>
      ))}
    </View>
  );
}

function RatingRow({ rating }: { rating: MappedRating }) {
  const tierColor = TIER_COLORS[rating.userTier];
  const tierName = TIER_DISPLAY_NAMES[rating.userTier];
  return (
    <View style={styles.ratingRow}>
      <View style={styles.ratingTop}>
        <View style={styles.ratingUser}>
          <Text style={styles.ratingName}>{rating.userName}</Text>
          <View style={[styles.tierBadge, { borderColor: tierColor, backgroundColor: `${tierColor}18` }]}>
            <Text style={[styles.tierBadgeText, { color: tierColor }]}>{tierName}</Text>
          </View>
        </View>
        <View style={styles.ratingScoreBox}>
          <Text style={styles.ratingScore}>{rating.rawScore.toFixed(1)}</Text>
          <Text style={styles.ratingWeight}>{rating.weight.toFixed(2)}x</Text>
          <Text style={styles.ratingTime}>{formatTimeAgo(rating.createdAt)}</Text>
        </View>
      </View>
      <View style={styles.ratingSubScores}>
        <View style={styles.ratingSubItem}>
          <Text style={styles.ratingSubLabel}>Food</Text>
          <Text style={styles.ratingSubVal}>{rating.food}</Text>
        </View>
        <View style={styles.ratingSubItem}>
          <Text style={styles.ratingSubLabel}>Value</Text>
          <Text style={styles.ratingSubVal}>{rating.value}</Text>
        </View>
        <View style={styles.ratingSubItem}>
          <Text style={styles.ratingSubLabel}>Service</Text>
          <Text style={styles.ratingSubVal}>{rating.service}</Text>
        </View>
        <View style={styles.ratingSubItem}>
          <Text style={styles.ratingSubLabel}>Return</Text>
          <Ionicons
            name={rating.wouldReturn ? "checkmark-circle" : "close-circle"}
            size={14}
            color={rating.wouldReturn ? Colors.greenBright : Colors.redBright}
          />
        </View>
      </View>
      {rating.comment && (
        <Text style={styles.ratingComment}>"{rating.comment}"</Text>
      )}
    </View>
  );
}

export default function BusinessProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id: slug } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["business", slug],
    queryFn: () => fetchBusinessBySlug(slug),
    enabled: !!slug,
    staleTime: 30000,
  });

  const business = data?.business;
  const ratings = data?.ratings || [];

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (isLoading) {
    return (
      <View style={[styles.notFound, { paddingTop: topPad }]}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  if (!business) {
    return (
      <View style={[styles.notFound, { paddingTop: topPad }]}>
        <Text style={styles.notFoundText}>Business not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 32 }
        ]}
      >
        <View style={styles.heroImageContainer}>
          <View style={[styles.heroImage, styles.heroImagePlaceholder]}>
            <Ionicons name="restaurant-outline" size={48} color={Colors.textTertiary} />
          </View>
          <View style={styles.heroImageOverlay} />

          <View style={[styles.navBar, { paddingTop: topPad + 8 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn}>
              <Ionicons name="flag-outline" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.heroRankOverlay}>
            <View style={styles.heroRankRow}>
              <View style={[styles.heroRankBadge, business.rank === 1 && styles.heroRankBadgeGold]}>
                <Text style={[styles.heroRankText, business.rank === 1 && styles.heroRankTextGold]}>
                  #{business.rank}
                </Text>
              </View>
              {business.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#fff" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            <Text style={styles.heroNameOverlay}>{business.name}</Text>
            <Text style={styles.heroCatOverlay}>{business.category} · {business.city}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.scoreCard}>
            <View style={styles.scoreMain}>
              <Text style={styles.scoreNumber}>{business.weightedScore.toFixed(2)}</Text>
              <Text style={styles.scoreLabel}>Weighted Score</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreStats}>
              <Text style={styles.scoreStatNum}>{business.ratingCount}</Text>
              <Text style={styles.scoreStatLabel}>Ratings</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreStats}>
              <Text style={styles.scoreStatNum}>{business.priceRange ?? "—"}</Text>
              <Text style={styles.scoreStatLabel}>Price</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreStats}>
              <Text style={[styles.scoreStatNum, { fontSize: 11 }]}>{business.neighborhood}</Text>
              <Text style={styles.scoreStatLabel}>Area</Text>
            </View>
          </View>

          {business.description ? (
            <View style={styles.descCard}>
              <Text style={styles.descText}>{business.description}</Text>
              {business.featuredDish && (
                <View style={styles.featuredDish}>
                  <Ionicons name="star" size={12} color={Colors.gold} />
                  <Text style={styles.featuredDishText}>{business.featuredDish}</Text>
                </View>
              )}
            </View>
          ) : null}

          <View style={styles.infoRow}>
            {business.hours && (
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={13} color={Colors.textTertiary} />
                <Text style={styles.infoText}>{business.hours}</Text>
              </View>
            )}
            {business.address && (
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={13} color={Colors.textTertiary} />
                <Text style={styles.infoText}>{business.address}</Text>
              </View>
            )}
          </View>

          {business.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {business.tags.map((tag: string) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {user ? (
            <TouchableOpacity
              style={styles.rateButton}
              onPress={() => router.push({ pathname: "/rate/[id]", params: { id: business.slug } })}
              activeOpacity={0.85}
              testID="rate-this-place"
            >
              <Ionicons name="star" size={17} color="#000" />
              <Text style={styles.rateButtonText}>Rate This Place</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.rateButton}
              onPress={() => router.push("/auth/login")}
              activeOpacity={0.85}
            >
              <Ionicons name="log-in-outline" size={17} color="#000" />
              <Text style={styles.rateButtonText}>Sign In to Rate</Text>
            </TouchableOpacity>
          )}

          {ratings.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Rating Breakdown</Text>
              <View style={styles.card}>
                <RatingBar label="Food Quality" value={ratings.reduce((a: number, r: MappedRating) => a + r.food, 0) / ratings.length} />
                <RatingBar label="Value" value={ratings.reduce((a: number, r: MappedRating) => a + r.value, 0) / ratings.length} />
                <RatingBar label="Service" value={ratings.reduce((a: number, r: MappedRating) => a + r.service, 0) / ratings.length} />
              </View>

              <Text style={styles.sectionTitle}>Distribution</Text>
              <View style={styles.card}>
                <DistributionChart ratings={ratings} />
              </View>

              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Community Ratings</Text>
                <Text style={styles.sectionCount}>{ratings.length} reviews</Text>
              </View>
              {ratings.map((rating: MappedRating) => (
                <RatingRow key={rating.id} rating={rating} />
              ))}
            </>
          )}

          <TouchableOpacity style={styles.reportLink}>
            <Ionicons name="flag-outline" size={12} color={Colors.textTertiary} />
            <Text style={styles.reportLinkText}>Report Suspicious Activity</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const HERO_HEIGHT = 260;

const styles = StyleSheet.create({
  notFound: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: "center", justifyContent: "center", gap: 12,
  },
  notFoundText: { fontSize: 18, color: Colors.text, fontFamily: "Inter_600SemiBold" },
  backLink: { fontSize: 14, color: Colors.gold, fontFamily: "Inter_500Medium" },

  content: { gap: 0 },
  body: { paddingHorizontal: 14, gap: 10, paddingTop: 14 },

  heroImageContainer: { height: HERO_HEIGHT, position: "relative" },
  heroImage: { width: "100%", height: HERO_HEIGHT },
  heroImagePlaceholder: {
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  heroImageOverlay: {
    position: "absolute",
    bottom: 0, left: 0, right: 0, height: HERO_HEIGHT,
    backgroundColor: "rgba(13,27,42,0.55)",
  },

  navBar: {
    position: "absolute", top: 0, left: 0, right: 0,
    flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: 14, zIndex: 10,
  },
  navBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(13,27,42,0.6)",
    alignItems: "center", justifyContent: "center",
  },

  heroRankOverlay: {
    position: "absolute", bottom: 16, left: 16, right: 16, gap: 4,
  },
  heroRankRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  heroRankBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  heroRankBadgeGold: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  heroRankText: {
    fontSize: 14, fontWeight: "800", color: "#fff",
    fontFamily: "Inter_700Bold", letterSpacing: 0.5,
  },
  heroRankTextGold: { color: "#000" },
  verifiedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(74,127,187,0.3)",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  verifiedText: { fontSize: 10, color: "#fff", fontFamily: "Inter_500Medium" },
  heroNameOverlay: {
    fontSize: 26, fontWeight: "700", color: "#fff",
    fontFamily: "Inter_700Bold", letterSpacing: -0.7,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroCatOverlay: {
    fontSize: 13, color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_400Regular",
  },

  scoreCard: {
    backgroundColor: Colors.surface, borderRadius: 14,
    paddingVertical: 14, flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: Colors.border,
  },
  scoreMain: { flex: 1.2, alignItems: "center" },
  scoreNumber: {
    fontSize: 36, fontWeight: "800", color: Colors.gold,
    fontFamily: "Inter_700Bold", letterSpacing: -1.5,
  },
  scoreLabel: { fontSize: 10, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },
  scoreDivider: { width: 1, height: 34, backgroundColor: Colors.border },
  scoreStats: { flex: 1, alignItems: "center", gap: 3 },
  scoreStatNum: { fontSize: 13, fontWeight: "700", color: Colors.text, fontFamily: "Inter_700Bold", textAlign: "center" },
  scoreStatLabel: { fontSize: 9, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },

  descCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  descText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Inter_400Regular", lineHeight: 20 },
  featuredDish: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingTop: 6, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  featuredDishText: { fontSize: 12, color: Colors.gold, fontFamily: "Inter_500Medium", flex: 1 },

  infoRow: { gap: 6 },
  infoItem: { flexDirection: "row", alignItems: "flex-start", gap: 7 },
  infoText: { fontSize: 12, color: Colors.textTertiary, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    backgroundColor: Colors.surface, borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  tagText: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Inter_500Medium" },

  rateButton: {
    backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  rateButtonText: { fontSize: 16, fontWeight: "700", color: "#000", fontFamily: "Inter_700Bold" },

  sectionTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Inter_600SemiBold", marginTop: 6 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
  sectionCount: { fontSize: 11, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },

  card: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border, gap: 10,
  },

  ratingBarRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ratingBarLabel: { width: 78, fontSize: 11, color: Colors.textSecondary, fontFamily: "Inter_400Regular" },
  ratingBarTrack: { flex: 1, height: 5, backgroundColor: Colors.surfaceRaised, borderRadius: 3, overflow: "hidden" },
  ratingBarFill: { height: "100%", backgroundColor: Colors.gold, borderRadius: 3 },
  ratingBarValue: { width: 28, fontSize: 12, fontWeight: "600", color: Colors.text, fontFamily: "Inter_600SemiBold", textAlign: "right" },

  distChart: { gap: 7 },
  distRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  distStar: { width: 12, fontSize: 11, color: Colors.textSecondary, fontFamily: "Inter_500Medium" },
  distBarTrack: { flex: 1, height: 6, backgroundColor: Colors.surfaceRaised, borderRadius: 3, overflow: "hidden" },
  distBarFill: { height: "100%", borderRadius: 3 },
  distCount: { width: 16, fontSize: 10, color: Colors.textTertiary, fontFamily: "Inter_400Regular", textAlign: "right" },

  ratingRow: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 13,
    gap: 8, borderWidth: 1, borderColor: Colors.border,
  },
  ratingTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  ratingUser: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  ratingName: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "Inter_600SemiBold" },
  tierBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  tierBadgeText: { fontSize: 9, fontWeight: "600", fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  ratingScoreBox: { alignItems: "flex-end", gap: 1 },
  ratingScore: { fontSize: 17, fontWeight: "700", color: Colors.text, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  ratingWeight: { fontSize: 10, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },
  ratingTime: { fontSize: 9, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },
  ratingSubScores: { flexDirection: "row", gap: 14 },
  ratingSubItem: { alignItems: "center", gap: 2 },
  ratingSubLabel: { fontSize: 9, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },
  ratingSubVal: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "Inter_600SemiBold" },
  ratingComment: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontStyle: "italic", lineHeight: 17 },

  reportLink: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 16, marginTop: 8,
  },
  reportLinkText: { fontSize: 11, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },
});

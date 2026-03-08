import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Linking, Share, useWindowDimensions,
  NativeScrollEvent, NativeSyntheticEvent, RefreshControl, Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeImage } from "@/components/SafeImage";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { fetchBusinessBySlug, fetchRankHistory, fetchMemberProfile, type ApiDish } from "@/lib/api";
import {
  getCategoryDisplay, getRankDisplay,
} from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { useBookmarks } from "@/lib/bookmarks-context";
import * as Haptics from "expo-haptics";
import { BRAND } from "@/constants/brand";
import { BusinessDetailSkeleton } from "@/components/Skeleton";
import {
  SubScoreBar, DistributionChart, RatingRow, ActionButton,
  CollapsibleReviews, AnimatedScore, DishPill,
  RatingDistribution, RankHistoryChart,
  OpeningHoursCard, LocationCard,
  type MappedRating, type RankHistoryPoint,
} from "@/components/business/SubComponents";
import { evaluateBusinessBadges, getBusinessBadgeCount, type BusinessBadgeContext } from "@/lib/badges";
import { BadgeRowCompact, BadgeSummary } from "@/components/profile/BadgeGrid";

const HERO_HEIGHT = 280;

export default function BusinessProfileScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { id: slug } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["business", slug],
    queryFn: () => fetchBusinessBySlug(slug),
    enabled: !!slug,
    staleTime: 30000,
  });

  const business = data?.business;
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const saved = business ? isBookmarked(business.id) : false;
  const ratings = (data?.ratings || []) as MappedRating[];
  const dishes = data?.dishes || [];

  const { data: rankHistoryData } = useQuery({
    queryKey: ["rankHistory", business?.id],
    queryFn: () => fetchRankHistory(business!.id, 30),
    enabled: !!business?.id,
    staleTime: 60000,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: fetchMemberProfile,
    enabled: !!user,
    staleTime: 60000,
  });
  const photoUrls: string[] = business?.photoUrls || (business?.photoUrl ? [business.photoUrl] : []);
  const [heroPhotoIdx, setHeroPhotoIdx] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const onHeroScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setHeroPhotoIdx(idx);
  }, []);

  const topPad = Platform.OS === "web" ? 20 : insets.top;

  if (isLoading) {
    return (
      <View style={[styles.screenContainer, { paddingTop: topPad }]}>
        <BusinessDetailSkeleton />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.notFound, { paddingTop: topPad }]}>
        <Ionicons name="cloud-offline-outline" size={36} color={Colors.textTertiary} />
        <Text style={[styles.notFoundText, styles.notFoundTextSpaced]}>Couldn't load this business</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Retry loading business">
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLinkButton} accessibilityRole="button" accessibilityLabel="Go back">
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!business) {
    return (
      <View style={[styles.notFound, { paddingTop: topPad }]}>
        <Text style={styles.notFoundText}>Business not found</Text>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const avgQ1 = ratings.length > 0 ? ratings.reduce((a, r) => a + r.q1, 0) / ratings.length : 0;
  const avgQ2 = ratings.length > 0 ? ratings.reduce((a, r) => a + r.q2, 0) / ratings.length : 0;
  const avgQ3 = ratings.length > 0 ? ratings.reduce((a, r) => a + r.q3, 0) / ratings.length : 0;

  const handleCall = () => {
    if (business.phone) { Haptics.selectionAsync(); Linking.openURL(`tel:${business.phone}`); }
  };
  const handleWebsite = () => {
    if (business.website) { Haptics.selectionAsync(); Linking.openURL(business.website); }
  };
  const handleMaps = () => {
    if (business.googleMapsUrl) {
      Linking.openURL(business.googleMapsUrl);
    } else if (business.address) {
      const q = encodeURIComponent(business.address);
      if (Platform.OS === "web") {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
      } else {
        Linking.openURL(Platform.OS === "ios" ? `maps:?q=${q}` : `geo:0,0?q=${q}`);
      }
    }
  };
  const handleShare = async () => {
    Haptics.selectionAsync();
    try {
      const shareUrl = Platform.OS === "web" ? window.location.href : "";
      await Share.share({
        message: `Check out ${business.name} on Top Ranker! Ranked ${getRankDisplay(business.rank)} with a ${business.weightedScore.toFixed(2)} score.${shareUrl ? ` ${shareUrl}` : ""}`,
      });
    } catch {}
  };

  const openingHoursText = business.openingHours?.weekday_text;

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND.colors.amber} />
        }
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 32 }
        ]}
      >
        {/* Hero Image Carousel */}
        <View style={styles.heroImageContainer}>
          {photoUrls.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onHeroScroll}
              scrollEventThrottle={16}
            >
              {photoUrls.map((url, i) => (
                  <SafeImage
                    key={i}
                    uri={url}
                    style={[styles.heroImage, { width: screenWidth }]}
                    contentFit="cover"
                    category={business.category}
                    fallbackText={business.name.charAt(0).toUpperCase()}
                  />
              ))}
            </ScrollView>
          ) : (
            <LinearGradient colors={[BRAND.colors.amber, BRAND.colors.amberDark]} style={[styles.heroImage, styles.heroImagePlaceholder, { width: screenWidth }]}>
              <Text style={styles.heroPlaceholderInitial}>
                {business.name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          )}

          {photoUrls.length > 1 && (
            <View style={styles.heroDotContainer}>
              {photoUrls.map((_, i) => (
                <View key={i} style={[styles.heroDot, i === heroPhotoIdx ? styles.heroDotActive : styles.heroDotInactive]} />
              ))}
            </View>
          )}

          <View style={[styles.navBar, { paddingTop: topPad + 8 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.navBtn} hitSlop={8} accessibilityRole="button" accessibilityLabel="Go back">
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.navBtnGroup}>
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => { if (business) { toggleBookmark(business.id, { name: business.name, slug: business.slug, category: business.category }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={saved ? "Remove from saved" : "Save this business"}
              >
                <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={16} color={saved ? BRAND.colors.amber : "#fff"} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} onPress={handleShare} hitSlop={8} accessibilityRole="button" accessibilityLabel="Share this business">
                <Ionicons name="share-outline" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Business Name Card */}
        <View style={styles.nameCard}>
          <View style={styles.nameRow}>
            <Text style={styles.businessName}>{business.name}</Text>
            {business.isClaimed && (
              <Ionicons name="checkmark-circle" size={18} color={Colors.blue} />
            )}
          </View>
          <Text style={styles.businessMeta}>
            {getCategoryDisplay(business.category).emoji} {getCategoryDisplay(business.category).label}{business.neighborhood ? ` \u00B7 ${business.neighborhood}` : ""} {"\u00B7"} {business.city}
          </Text>
          <View style={styles.nameCardRow}>
            {business.isOpenNow !== undefined && (
              <View style={[
                styles.openBadge,
                business.isOpenNow ? styles.openBadgeOpen : styles.openBadgeClosed,
              ]}>
                <View style={[styles.openDot, { backgroundColor: business.isOpenNow ? Colors.green : Colors.red }]} />
                <Text style={[styles.openBadgeText, { color: business.isOpenNow ? Colors.green : Colors.red }]}>
                  {business.isOpenNow ? "OPEN NOW" : "CLOSED"}
                </Text>
              </View>
            )}
            {business.priceRange && <Text style={styles.priceText}>{business.priceRange}</Text>}
          </View>
        </View>

        {/* Quick Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getRankDisplay(business.rank)}</Text>
            <Text style={styles.statLabel}>Rank</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{business.ratingCount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Ratings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {ratings.length > 0 ? `${Math.round((ratings.filter(r => r.wouldReturn).length / ratings.length) * 100)}%` : "--"}
            </Text>
            <Text style={styles.statLabel}>Would Return</Text>
          </View>
          {ratings.length > 0 && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{ratings.length}</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
            </>
          )}
        </View>

        {/* Business Badges — CVO owned */}
        {(() => {
          const badgeCtx: BusinessBadgeContext = {
            totalRatings: business.ratingCount,
            averageScore: business.weightedScore,
            categoryRank: business.rank,
            trustedRaterCount: ratings.filter(r => r.userTier === "trusted" || r.userTier === "top").length,
            topJudgeHighRatings: ratings.filter(r => r.userTier === "top" && r.rawScore >= 4).length,
            consecutiveWeeksImproved: 0,
            isVerified: business.isClaimed,
            challengerWins: 0,
            isNew: business.ratingCount <= 3,
          };
          const badges = evaluateBusinessBadges(badgeCtx);
          const earned = badges.filter(b => b.earnedAt > 0);
          if (earned.length === 0) return null;
          return (
            <View style={styles.badgeSection}>
              <Text style={styles.badgeSectionTitle}>Achievements</Text>
              <BadgeRowCompact badges={badges} />
            </View>
          );
        })()}

        <View style={styles.body}>
          {/* Description */}
          {business.description && (
            <Text style={styles.descriptionText}>{business.description}</Text>
          )}

          <View style={styles.sectionDivider} />

          {/* Score */}
          <View style={styles.scoreCard}>
            <AnimatedScore value={business.weightedScore} style={styles.scoreNumber} />
            <Text style={styles.scoreLabel}>Weighted Score</Text>
            <View style={styles.scoreMetaRow}>
              <Text style={styles.scoreMetaItem}>{business.ratingCount.toLocaleString()} ratings</Text>
              <Text style={styles.scoreMetaItem}>{getRankDisplay(business.rank)}</Text>
              {business.googleRating && (
                <View style={styles.googleRow}>
                  <MaterialCommunityIcons name="google" size={10} color={Colors.textTertiary} />
                  <Text style={styles.scoreMetaItem}>{business.googleRating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Trust Explainer */}
          <View style={styles.trustCard}>
            <View style={styles.trustCardHeader}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.green} />
              <Text style={styles.trustCardTitle}>About This Ranking</Text>
            </View>
            <Text style={styles.trustCardBody}>
              This score is calculated from {business.ratingCount.toLocaleString()} community ratings, weighted by each rater's credibility tier. Higher-credibility members have more influence, making this ranking resistant to spam and manipulation.
            </Text>
            <View style={styles.trustCardStats}>
              <View style={styles.trustStat}>
                <Text style={styles.trustStatValue}>{business.ratingCount.toLocaleString()}</Text>
                <Text style={styles.trustStatLabel}>Weighted Ratings</Text>
              </View>
              <View style={styles.trustStat}>
                <Text style={styles.trustStatValue}>{business.weightedScore.toFixed(1)}</Text>
                <Text style={styles.trustStatLabel}>Community Score</Text>
              </View>
              {ratings.length > 0 && (
                <View style={styles.trustStat}>
                  <Text style={styles.trustStatValue}>
                    {Math.round((ratings.filter(r => r.wouldReturn).length / ratings.length) * 100)}%
                  </Text>
                  <Text style={styles.trustStatLabel}>Would Return</Text>
                </View>
              )}
            </View>
          </View>

          {/* Sub-scores */}
          {ratings.length > 0 && (
            <View style={styles.subScoresCard}>
              <SubScoreBar label="Quality" value={avgQ1} />
              <SubScoreBar label="Value" value={avgQ2} />
              <SubScoreBar label="Service" value={avgQ3} />
              <View style={styles.returnRateRow}>
                <Ionicons
                  name="refresh-circle"
                  size={14}
                  color={Colors.green}
                />
                <Text style={styles.returnRateText}>
                  {Math.round((ratings.filter(r => r.wouldReturn).length / ratings.length) * 100)}% would return
                </Text>
              </View>
            </View>
          )}

          {/* Rating Distribution — Anti-fraud transparency */}
          {ratings.length >= 3 && <RatingDistribution ratings={ratings} />}

          {/* Rank History Chart — 30-day trend */}
          {rankHistoryData && rankHistoryData.length >= 2 && (
            <RankHistoryChart points={rankHistoryData as RankHistoryPoint[]} />
          )}

          <View style={styles.sectionDivider} />

          {/* Action Bar */}
          <View style={styles.actionBar}>
            <ActionButton icon="call-outline" label="Call" onPress={handleCall} disabled={!business.phone} />
            <ActionButton icon="globe-outline" label="Website" onPress={handleWebsite} disabled={!business.website} />
            <ActionButton icon="navigate-outline" label="Maps" onPress={handleMaps} disabled={!business.address} />
            <ActionButton icon="share-outline" label="Share" onPress={handleShare} />
          </View>

          <View style={styles.sectionDivider} />

          {/* Top Dishes */}
          {dishes.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Top Dishes</Text>
              <View style={styles.dishesGrid}>
                {dishes.slice(0, 8).map((dish: ApiDish) => (
                  <DishPill key={dish.id} dish={dish} />
                ))}
              </View>
            </View>
          )}

          {/* Rate Button — gated: active after 3+ days */}
          {user ? (() => {
            const memberDays = profile?.daysActive ?? 0;
            const canRate = memberDays >= 3;
            return canRate ? (
              <TouchableOpacity
                style={styles.rateButton}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push({ pathname: "/rate/[id]", params: { id: business.slug } }); }}
                activeOpacity={0.85}
                testID="rate-this-place"
                accessibilityRole="button"
                accessibilityLabel={`Rate ${business.name}`}
              >
                <Ionicons name="star" size={18} color="#FFFFFF" />
                <Text style={styles.rateButtonText}>Rate This Place</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.rateGated}>
                <Ionicons name="shield-checkmark-outline" size={16} color={Colors.textTertiary} />
                <Text style={styles.rateGatedText}>Build your reviewer credibility to rate this business.</Text>
                <Text style={styles.rateGatedSubtext}>{3 - memberDays} more days active to unlock rating.</Text>
              </View>
            );
          })() : (
            <TouchableOpacity
              style={styles.rateButton}
              onPress={() => router.push("/auth/login")}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Sign in to rate this place"
            >
              <Text style={styles.rateButtonText}>Sign In to Rate</Text>
            </TouchableOpacity>
          )}

          {/* Opening Hours */}
          {openingHoursText && openingHoursText.length > 0 && (
            <OpeningHoursCard hours={openingHoursText} />
          )}

          {business.address && (
            <LocationCard
              address={business.address}
              lat={business.lat != null ? String(business.lat) : null}
              lng={business.lng != null ? String(business.lng) : null}
              onDirections={handleMaps}
            />
          )}

          {/* Community Ratings — collapsible */}
          {ratings.length > 0 && (
            <CollapsibleReviews ratings={ratings} />
          )}

          {/* Photo Grid - only show if multiple photos exist beyond hero */}
          {photoUrls.length > 3 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>All Photos ({photoUrls.length})</Text>
              <View style={styles.photoGrid}>
                {photoUrls.map((url, i) => (
                  <SafeImage
                    key={i}
                    uri={url}
                    style={styles.photoGridImage}
                    contentFit="cover"
                    category={business.category}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Claim Listing */}
          {!business.isClaimed && (
            <View style={styles.claimCard}>
              <Text style={styles.claimTitle}>Own this business?</Text>
              <Text style={styles.claimDesc}>Claim your listing to respond to reviews and update your info</Text>
              <TouchableOpacity
                style={styles.claimBtn}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Claim this business listing"
                onPress={() => {
                  if (Platform.OS === "web") {
                    window.alert("Business claiming will be available soon. Contact us to get started.");
                  } else {
                    Alert.alert("Coming Soon", "Business claiming will be available in a future update. Contact us to get started.");
                  }
                }}
              >
                <Text style={styles.claimBtnText}>Claim Listing</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.reportLink}
            accessibilityRole="button"
            accessibilityLabel="Report suspicious activity"
            onPress={() => {
              if (Platform.OS === "web") {
                window.alert("Thank you. Our team will review this listing.");
              } else {
                Alert.alert("Report Submitted", "Thank you. Our team will review this listing.");
              }
            }}
          >
            <Ionicons name="flag-outline" size={12} color={Colors.textTertiary} />
            <Text style={styles.reportLinkText}>Report Suspicious Activity</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.claimLink}
            onPress={() => router.push({ pathname: "/business/claim", params: { name: business.name, slug: business.slug } })}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Claim ${business.name} as your business`}
          >
            <Ionicons name="shield-checkmark-outline" size={12} color={BRAND.colors.amber} />
            <Text style={styles.claimLinkText}>Own this business? Claim it</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: Colors.background },
  badgeSection: {
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
  },
  badgeSectionTitle: {
    fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  notFound: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: "center", justifyContent: "center", gap: 12,
  },
  notFoundText: { fontSize: 18, color: Colors.text, fontWeight: "600" },
  notFoundTextSpaced: { marginTop: 12 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  backLink: { fontSize: 14, color: Colors.gold, fontWeight: "500" },
  backLinkButton: { marginTop: 8 },
  retryButton: {
    marginTop: 12, paddingHorizontal: 24, paddingVertical: 10,
    backgroundColor: BRAND.colors.amber, borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 14, fontWeight: "600", color: "#fff", fontFamily: "DMSans_600SemiBold",
  },

  content: { gap: 0 },
  body: { paddingHorizontal: 14, gap: 12, paddingTop: 14 },
  descriptionText: {
    fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    lineHeight: 20,
  },

  heroImageContainer: { height: HERO_HEIGHT, position: "relative" },
  heroImage: { height: HERO_HEIGHT },
  heroDotContainer: {
    flexDirection: "row", justifyContent: "center", gap: 5,
    position: "absolute", bottom: 10, left: 0, right: 0, zIndex: 5,
  },
  heroDot: { width: 7, height: 7, borderRadius: 4 },
  heroDotActive: { backgroundColor: BRAND.colors.amber },
  heroDotInactive: { backgroundColor: "rgba(255,255,255,0.6)" },
  heroImagePlaceholder: {
    backgroundColor: BRAND.colors.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  heroPlaceholderInitial: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "PlayfairDisplay_700Bold",
  },

  navBar: {
    position: "absolute", top: 0, left: 0, right: 0,
    flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: 14, zIndex: 10,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  navBtnGroup: {
    flexDirection: "row", gap: 8,
  },

  nameCard: {
    backgroundColor: Colors.surface, marginHorizontal: 14, marginTop: -24,
    borderRadius: 16, padding: 16, gap: 4,
    ...Colors.cardShadow,
  },
  businessName: {
    fontSize: 24, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5,
  },
  businessMeta: {
    fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
  nameCardRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  openBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
  },
  openBadgeOpen: {
    backgroundColor: `${Colors.green}12`,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  openBadgeClosed: {
    backgroundColor: `${Colors.red}12`,
  },
  openDot: {
    width: 6, height: 6, borderRadius: 3,
  },
  openBadgeText: {
    fontSize: 10, fontWeight: "700", fontFamily: "DMSans_700Bold", letterSpacing: 0.5,
  },
  priceText: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: -8,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { alignItems: "center", gap: 2 },
  statValue: {
    fontSize: 18, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10, color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular", textTransform: "uppercase", letterSpacing: 0.5,
  },
  statDivider: {
    width: 1, height: 30, backgroundColor: Colors.border,
  },

  scoreCard: {
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 20, alignItems: "center", gap: 4,
    ...Colors.cardShadow,
  },
  scoreNumber: {
    fontSize: 48, fontWeight: "900", color: Colors.gold,
    fontFamily: "PlayfairDisplay_900Black", letterSpacing: -1.5,
  },
  scoreLabel: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  scoreMetaRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  scoreMetaItem: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  googleRow: { flexDirection: "row", alignItems: "center", gap: 3 },

  trustCard: {
    backgroundColor: `${Colors.green}08`,
    borderRadius: 14,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: `${Colors.green}20`,
  },
  trustCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  trustCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  trustCardBody: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    lineHeight: 18,
  },
  trustCardStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: `${Colors.green}15`,
  },
  trustStat: {
    alignItems: "center",
    gap: 2,
  },
  trustStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  trustStatLabel: {
    fontSize: 9,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },

  subScoresCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 10,
    ...Colors.cardShadow,
  },
  returnRateRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingTop: 6, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  returnRateText: {
    fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_500Medium",
  },

  actionBar: {
    flexDirection: "row", justifyContent: "space-around",
    paddingVertical: 12,
  },

  sectionContainer: { gap: 10 },
  sectionDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },

  dishesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  rateButton: {
    backgroundColor: BRAND.colors.amber, borderRadius: 14, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    shadowColor: "rgba(196,154,26,0.4)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  rateButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "DMSans_700Bold" },
  rateGated: {
    backgroundColor: Colors.surface, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16,
    alignItems: "center", gap: 4, borderWidth: 1, borderColor: Colors.border,
  },
  rateGatedText: {
    fontSize: 13, fontWeight: "500", color: Colors.textSecondary, fontFamily: "DMSans_500Medium", textAlign: "center",
  },
  rateGatedSubtext: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },

  photoGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 4, borderRadius: 12, overflow: "hidden",
  },
  photoGridImage: {
    width: "31%", aspectRatio: 1,
    backgroundColor: Colors.surfaceRaised,
  },

  claimCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 8,
    ...Colors.cardShadow,
  },
  claimTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  claimDesc: { fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 16 },
  claimBtn: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 10,
    paddingVertical: 10, alignItems: "center",
  },
  claimBtnText: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },


  reportLink: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 16, marginTop: 4,
  },
  reportLinkText: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  claimLink: {
    flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center",
    paddingVertical: 8,
  },
  claimLinkText: { fontSize: 11, color: BRAND.colors.amber, fontFamily: "DMSans_500Medium" },
});

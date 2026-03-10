import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Linking, Share, useWindowDimensions,
  NativeScrollEvent, NativeSyntheticEvent, RefreshControl, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeImage } from "@/components/SafeImage";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { fetchBusinessBySlug, fetchRankHistory, fetchMemberProfile, type ApiDish } from "@/lib/api";
import { type CredibilityTier } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { useBookmarks } from "@/lib/bookmarks-context";
import * as Haptics from "expo-haptics";
import { BRAND } from "@/constants/brand";
import { Analytics } from "@/lib/analytics";
import { getRatingImpact, clearRatingImpact } from "@/lib/rating-impact";
import { getShareUrl, getShareText, copyShareLink } from "@/lib/sharing";
import { TYPOGRAPHY } from "@/constants/typography";
import { BusinessDetailSkeleton } from "@/components/Skeleton";
import {
  ActionButton, CollapsibleReviews, DishPill,
  RatingDistribution, RankHistoryChart,
  OpeningHoursCard, LocationCard,
  HeroCarousel, BusinessNameCard, QuickStatsBar,
  RankConfidenceIndicator, ScoreCard, TrustExplainerCard,
  SubScoresCard, YourRatingCard,
  type MappedRating, type RankHistoryPoint,
} from "@/components/business/SubComponents";
import { evaluateBusinessBadges, type BusinessBadgeContext } from "@/lib/badges";
import { BadgeRowCompact } from "@/components/profile/BadgeGrid";
import { SlideUpView } from "@/components/animations/SlideUpView";
import { ScoreBreakdown } from "@/components/business/ScoreBreakdown";
import { ScoreTrendSparkline } from "@/components/business/ScoreTrendSparkline";
import { TopDishes } from "@/components/business/TopDishes";
import { DishRankings } from "@/components/business/DishRankings";
import { PhotoGallery } from "@/components/business/PhotoGallery";

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

  // Track view_business when business detail loads — Sprint 115 (Rachel Wei)
  React.useEffect(() => {
    if (business && slug) {
      Analytics.viewBusiness(slug, business.category);
    }
  }, [business?.id]);

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
  const [ratingImpact, setRatingImpactState] = useState<{ prevRank: number; newRank: number } | null>(null);

  // Check for recent rating impact (60s TTL)
  React.useEffect(() => {
    if (slug) {
      const impact = getRatingImpact(slug);
      if (impact && impact.prevRank !== impact.newRank) {
        setRatingImpactState({ prevRank: impact.prevRank, newRank: impact.newRank });
        clearRatingImpact(slug);
        // Auto-dismiss after 10 seconds
        const timer = setTimeout(() => setRatingImpactState(null), 10000);
        return () => clearTimeout(timer);
      }
    }
  }, [slug, data]);
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
      await Share.share({
        message: getShareText(business.name, business.weightedScore),
        url: getShareUrl("business", business.slug),
      });
      Analytics.shareBusiness(business.slug, "share_sheet");
    } catch {}
  };
  const handleCopyLink = async () => {
    Haptics.selectionAsync();
    const url = getShareUrl("business", business.slug);
    const copied = await copyShareLink(url, business.name);
    if (copied) Analytics.shareBusiness(business.slug, "copy_link");
  };
  const handleToggleBookmark = () => {
    if (business) {
      toggleBookmark(business.id, { name: business.name, slug: business.slug, category: business.category, cuisine: business.cuisine ?? undefined });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const openingHoursText = business.openingHours?.weekday_text;

  // Compute user's own rating if logged in
  const myRating = user && profile ? ratings.find(r => r.memberId === user.id) : undefined;
  const myTier = (profile?.credibilityTier || "community") as CredibilityTier;

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
        <HeroCarousel
          photoUrls={photoUrls}
          heroPhotoIdx={heroPhotoIdx}
          screenWidth={screenWidth}
          businessName={business.name}
          category={business.category}
          saved={saved}
          topPad={topPad}
          onHeroScroll={onHeroScroll}
          onBack={() => router.back()}
          onToggleBookmark={handleToggleBookmark}
          onShare={handleShare}
        />

        {/* Business Name Card */}
        <BusinessNameCard
          name={business.name}
          isClaimed={business.isClaimed}
          category={business.category}
          neighborhood={business.neighborhood}
          city={business.city}
          isOpenNow={business.isOpenNow}
          priceRange={business.priceRange}
        />

        {/* Quick Stats Bar */}
        <QuickStatsBar
          rank={business.rank}
          rankDelta={business.rankDelta}
          ratingCount={business.ratingCount}
          ratings={ratings}
        />

        {/* Your Rating Impact Banner — 10s auto-dismiss */}
        {ratingImpact && (
          <View style={styles.impactBanner}>
            <Ionicons name={ratingImpact.newRank < ratingImpact.prevRank ? "trending-up" : "trending-down"} size={18} color="#fff" />
            <Text style={styles.impactBannerText}>
              Your rating moved this from #{ratingImpact.prevRank} to #{ratingImpact.newRank}
            </Text>
          </View>
        )}

        {/* Ranking Confidence Indicator */}
        <RankConfidenceIndicator ratingCount={business.ratingCount} category={business.category} />

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
          <ScoreCard
            weightedScore={business.weightedScore}
            ratingCount={business.ratingCount}
            rank={business.rank}
            googleRating={business.googleRating}
          />

          {/* Trust Explainer */}
          <TrustExplainerCard
            ratingCount={business.ratingCount}
            weightedScore={business.weightedScore}
            category={business.category}
            ratings={ratings}
            trustedRaterCount={ratings.filter(r => r.userTier === "trusted" || r.userTier === "top").length}
            lastRatedDate={ratings.length > 0 ? new Date(ratings[0].createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : undefined}
          />

          {/* Sub-scores */}
          {ratings.length > 0 && (
            <SubScoresCard avgQ1={avgQ1} avgQ2={avgQ2} avgQ3={avgQ3} ratings={ratings} />
          )}

          {/* Sprint 268: Score Breakdown — visit-type separation */}
          {business?.id && <ScoreBreakdown businessId={business.id} category={business.category} />}
          {business?.id && <ScoreTrendSparkline businessId={business.id} />}
          {business?.id && <DishRankings businessId={business.id} />}
          {business?.id && <TopDishes businessId={business.id} businessName={business.name} />}

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
            <ActionButton icon="copy-outline" label="Copy Link" onPress={handleCopyLink} />
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

          {/* Your Previous Rating — Sprint 129 */}
          {myRating && <YourRatingCard myRating={myRating} tier={myTier} />}

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
                <Text style={styles.rateButtonText}>
                  {ratings.some(r => r.memberId === user?.id) ? "Update Your Rating" : "Rate This Place"}
                </Text>
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
            <OpeningHoursCard hours={openingHoursText} isOpenNow={business.isOpenNow} />
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
            <SlideUpView delay={300} distance={20}>
              <CollapsibleReviews ratings={ratings} />
            </SlideUpView>
          )}

          {/* Photo Gallery — extracted component (Sprint 366) */}
          <PhotoGallery photoUrls={photoUrls} category={business.category} />

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
                  Analytics.dashboardUpgradeTap(business.slug);
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
  impactBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#1B5E20", marginHorizontal: 16, marginTop: 8,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10,
  },
  impactBannerText: {
    color: "#fff", fontSize: 14, fontWeight: "600", fontFamily: "DMSans_600SemiBold",
  },
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
    ...TYPOGRAPHY.ui.body, color: Colors.textSecondary,
    lineHeight: 20,
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
    ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary,
  },


  claimCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 8,
    ...Colors.cardShadow,
  },
  claimTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  claimDesc: { ...TYPOGRAPHY.ui.caption, color: Colors.textSecondary, lineHeight: 16 },
  claimBtn: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 10,
    paddingVertical: 10, alignItems: "center",
  },
  claimBtnText: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },

  reportLink: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 16, marginTop: 4,
  },
  reportLinkText: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary },
  claimLink: {
    flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center",
    paddingVertical: 8,
  },
  claimLinkText: { fontSize: 11, color: BRAND.colors.amber, fontFamily: "DMSans_500Medium" },
});

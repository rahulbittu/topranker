import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Linking, Share, useWindowDimensions,
  NativeScrollEvent, NativeSyntheticEvent, RefreshControl,
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
import { BRAND, getCategoryDisplay } from "@/constants/brand";
import { Analytics } from "@/lib/analytics";
import { getRatingImpact, clearRatingImpact } from "@/lib/rating-impact";
import { getShareUrl, getShareText, copyShareLink } from "@/lib/sharing";
import { TYPOGRAPHY } from "@/constants/typography";
import { BusinessDetailSkeleton } from "@/components/Skeleton";
import {
  CollapsibleReviews, DishPill,
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
import { PhotoLightbox } from "@/components/business/PhotoLightbox";
import { SharePreviewCard } from "@/components/business/SharePreviewCard";
import { BusinessActionBar } from "@/components/business/BusinessActionBar";
import { BusinessBottomSection } from "@/components/business/BusinessBottomSection";
import { PhotoUploadSheet } from "@/components/business/PhotoUploadSheet";

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
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [uploadSheetVisible, setUploadSheetVisible] = useState(false);
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

  const openLightbox = useCallback((index: number) => {
    setLightboxIdx(index);
    setLightboxVisible(true);
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

  const handleMaps = () => {
    if (business.googleMapsUrl) {
      Linking.openURL(business.googleMapsUrl);
    } else if (business.address) {
      const q = encodeURIComponent(business.address);
      Linking.openURL(Platform.OS === "web"
        ? `https://www.google.com/maps/search/?api=1&query=${q}`
        : Platform.OS === "ios" ? `maps:?q=${q}` : `geo:0,0?q=${q}`);
    }
  };
  // Share handlers for SharePreviewCard (action bar is self-contained)
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
          onPhotoPress={openLightbox}
        />

        {/* Breadcrumb Navigation */}
        <View style={styles.breadcrumb}>
          <TouchableOpacity onPress={() => router.push("/")} accessibilityRole="link" accessibilityLabel="Go to Rankings">
            <Text style={styles.breadcrumbLink}>Rankings</Text>
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={10} color={Colors.textTertiary} />
          <TouchableOpacity onPress={() => router.push({ pathname: "/(tabs)/search", params: { category: business.category } })} accessibilityRole="link" accessibilityLabel={`View ${getCategoryDisplay(business.category).label}`}>
            <Text style={styles.breadcrumbLink}>{getCategoryDisplay(business.category).label}</Text>
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={10} color={Colors.textTertiary} />
          <Text style={styles.breadcrumbCurrent} numberOfLines={1}>{business.name}</Text>
        </View>

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

          {/* Action Bar — extracted component (Sprint 381) */}
          <BusinessActionBar
            name={business.name}
            slug={business.slug}
            weightedScore={business.weightedScore}
            phone={business.phone}
            website={business.website}
            address={business.address}
            googleMapsUrl={business.googleMapsUrl}
          />

          {/* Share Preview Card — Sprint 378 */}
          <SharePreviewCard
            businessName={business.name}
            slug={business.slug}
            weightedScore={business.weightedScore}
            category={business.category}
            neighborhood={business.neighborhood}
            city={business.city}
            photoUrl={photoUrls[0]}
            rank={business.rank}
            onShare={handleShare}
            onCopyLink={handleCopyLink}
          />

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

          {/* Bottom Section — extracted Sprint 396 */}
          <BusinessBottomSection
            businessName={business.name}
            businessSlug={business.slug}
            isClaimed={business.isClaimed}
            isLoggedIn={!!user}
            hasExistingRating={!!myRating}
            memberDaysActive={profile?.daysActive ?? 0}
          />

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
          <PhotoGallery photoUrls={photoUrls} category={business.category} onAddPhoto={user ? () => setUploadSheetVisible(true) : undefined} onPhotoPress={openLightbox} />

        </View>
      </ScrollView>

      {/* Sprint 413: Photo lightbox */}
      <PhotoLightbox
        visible={lightboxVisible}
        photoUrls={photoUrls}
        initialIndex={lightboxIdx}
        category={business.category}
        onClose={() => setLightboxVisible(false)}
      />
      {/* Sprint 438: Community photo upload */}
      <PhotoUploadSheet
        visible={uploadSheetVisible}
        onClose={() => setUploadSheetVisible(false)}
        businessId={business.id}
        businessName={business.name}
        onUploadSuccess={() => refetch()}
      />
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

  breadcrumb: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4,
  },
  breadcrumbLink: {
    fontSize: 12, color: BRAND.colors.amber, fontFamily: "DMSans_500Medium",
  },
  breadcrumbCurrent: {
    fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    flexShrink: 1,
  },
  content: { gap: 0 },
  body: { paddingHorizontal: 14, gap: 12, paddingTop: 14 },
  descriptionText: {
    ...TYPOGRAPHY.ui.body, color: Colors.textSecondary,
    lineHeight: 20,
  },


  sectionContainer: { gap: 10 },
  sectionDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },

  dishesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

});

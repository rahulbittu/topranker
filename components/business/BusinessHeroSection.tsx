/**
 * Sprint 589: Extracted from app/business/[id].tsx
 * Hero section: carousel → breadcrumb → name card → quick stats → impact banner → confidence → badges
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND, getCategoryDisplay } from "@/constants/brand";
import {
  HeroCarousel, BusinessNameCard, QuickStatsBar,
  RankConfidenceIndicator, type MappedRating,
} from "@/components/business/SubComponents";
import { evaluateBusinessBadges, type BusinessBadgeContext } from "@/lib/badges";
import { BadgeRowCompact } from "@/components/profile/BadgeGrid";
import type { NativeSyntheticEvent, NativeScrollEvent } from "react-native";

interface Props {
  photoUrls: string[];
  heroPhotoIdx: number;
  screenWidth: number;
  business: {
    name: string;
    category: string;
    neighborhood?: string | null;
    city: string;
    isClaimed: boolean;
    isOpenNow: boolean;
    priceRange?: string | null;
    rank: number;
    rankDelta: number;
    ratingCount: number;
    weightedScore: number;
    slug: string;
  };
  ratings: MappedRating[];
  saved: boolean;
  topPad: number;
  ratingImpact: { prevRank: number; newRank: number } | null;
  onHeroScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onToggleBookmark: () => void;
  onShare: () => void;
  onPhotoPress: (index: number) => void;
}

export function BusinessHeroSection({
  photoUrls, heroPhotoIdx, screenWidth, business, ratings,
  saved, topPad, ratingImpact, onHeroScroll, onToggleBookmark, onShare, onPhotoPress,
}: Props) {
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

  return (
    <>
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
        onToggleBookmark={onToggleBookmark}
        onShare={onShare}
        onPhotoPress={onPhotoPress}
      />

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

      <BusinessNameCard
        name={business.name}
        isClaimed={business.isClaimed}
        category={business.category}
        neighborhood={business.neighborhood}
        city={business.city}
        isOpenNow={business.isOpenNow}
        priceRange={business.priceRange}
      />

      <QuickStatsBar
        rank={business.rank}
        rankDelta={business.rankDelta}
        ratingCount={business.ratingCount}
        ratings={ratings}
      />

      {ratingImpact && (
        <View style={styles.impactBanner}>
          <Ionicons name={ratingImpact.newRank < ratingImpact.prevRank ? "trending-up" : "trending-down"} size={18} color="#fff" />
          <Text style={styles.impactBannerText}>
            Your rating moved this from #{ratingImpact.prevRank} to #{ratingImpact.newRank}
          </Text>
        </View>
      )}

      <RankConfidenceIndicator ratingCount={business.ratingCount} category={business.category} />

      {earned.length > 0 && (
        <View style={styles.badgeSection}>
          <Text style={styles.badgeSectionTitle}>Achievements</Text>
          <BadgeRowCompact badges={badges} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
});

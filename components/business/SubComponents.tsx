/**
 * Extracted sub-components from app/business/[id].tsx
 * These are presentational components that don't depend on screen state.
 * Extracted per Audit N1 to reduce the main screen file from 1210 LOC.
 */
import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Easing,
  LayoutAnimation, Platform, UIManager, ScrollView,
  NativeSyntheticEvent, NativeScrollEvent,
} from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import { pct as pctDim, formatReturnRate } from "@/lib/style-helpers";
import {
  formatTimeAgo, TIER_COLORS, TIER_DISPLAY_NAMES, type CredibilityTier,
  getCategoryDisplay, getRankDisplay, getRankConfidence, RANK_CONFIDENCE_LABELS,
  TIER_INFLUENCE_LABELS,
} from "@/lib/data";
import type { ApiDish } from "@/lib/api";
import { SafeImage } from "@/components/SafeImage";
import RankMovementPulse from "@/components/animations/RankMovementPulse";
import ScoreCountUp from "@/components/animations/ScoreCountUp";
import { SlideUpView } from "@/components/animations/SlideUpView";

export interface MappedRating {
  id: string;
  memberId: string;
  userName: string;
  userTier: CredibilityTier;
  userAvatarUrl?: string;
  rawScore: number;
  weight: number;
  q1: number;
  q2: number;
  q3: number;
  wouldReturn: boolean;
  comment: string | null;
  createdAt: number;
}

export function SubScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min((value / 5) * 100, 100);
  return (
    <View style={s.subScoreRow}>
      <Text style={s.subScoreLabel}>{label}</Text>
      <View style={s.subScoreTrack}>
        <View style={[s.subScoreFill, { width: pctDim(pct) }]} />
      </View>
      <Text style={s.subScoreValue}>{value.toFixed(1)}</Text>
    </View>
  );
}

export const DistributionChart = React.memo(function DistributionChart({ ratings }: { ratings: MappedRating[] }) {
  const counts = [5, 4, 3, 2, 1].map(n => ({
    star: n,
    count: ratings.filter(r => Math.round(r.rawScore) === n).length
  }));
  const maxCount = Math.max(...counts.map(c => c.count), 1);

  return (
    <View style={s.distChart}>
      {counts.map(({ star, count }) => (
        <View key={star} style={s.distRow}>
          <Text style={s.distStar}>{star}</Text>
          <View style={s.distBarTrack}>
            <View
              style={[s.distBarFill, {
                width: pctDim((count / maxCount) * 100),
                backgroundColor: count === maxCount && count > 0 ? Colors.gold : Colors.border,
              }]}
            />
          </View>
          <Text style={s.distCount}>{count}</Text>
        </View>
      ))}
    </View>
  );
});

export const RatingRow = React.memo(function RatingRow({ rating }: { rating: MappedRating }) {
  const tierColor = TIER_COLORS[rating.userTier];
  const tierName = TIER_DISPLAY_NAMES[rating.userTier];
  return (
    <View style={s.ratingRow}>
      <View style={s.ratingTop}>
        <View style={s.ratingUser}>
          <View style={s.ratingAvatar}>
            {rating.userAvatarUrl ? (
              <Image source={{ uri: rating.userAvatarUrl }} style={s.ratingAvatarImg} contentFit="cover" />
            ) : (
              <Text style={s.ratingAvatarText}>
                {rating.userName.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View>
            <Text style={s.ratingName}>{rating.userName}</Text>
            <Text style={[s.ratingTierText, { color: tierColor }]}>{tierName}</Text>
          </View>
        </View>
        <View style={s.ratingScoreBox}>
          <Text style={s.ratingScore}>{rating.rawScore.toFixed(1)}</Text>
          <Text style={s.ratingWeight}>{rating.weight.toFixed(2)}x</Text>
          <Text style={s.ratingTime}>{formatTimeAgo(rating.createdAt)}</Text>
        </View>
      </View>
      <View style={s.ratingSubScores}>
        <View style={s.ratingSubItem}>
          <Text style={s.ratingSubLabel}>Quality</Text>
          <Text style={s.ratingSubVal}>{rating.q1}</Text>
        </View>
        <View style={s.ratingSubItem}>
          <Text style={s.ratingSubLabel}>Value</Text>
          <Text style={s.ratingSubVal}>{rating.q2}</Text>
        </View>
        <View style={s.ratingSubItem}>
          <Text style={s.ratingSubLabel}>Service</Text>
          <Text style={s.ratingSubVal}>{rating.q3}</Text>
        </View>
        <View style={s.ratingSubItem}>
          <Text style={s.ratingSubLabel}>Return</Text>
          <Ionicons
            name={rating.wouldReturn ? "checkmark-circle" : "close-circle"}
            size={14}
            color={rating.wouldReturn ? Colors.green : Colors.red}
          />
        </View>
      </View>
      {rating.comment && (
        <Text style={s.ratingComment}>"{rating.comment}"</Text>
      )}
    </View>
  );
});

export function ActionButton({ icon, label, onPress, disabled }: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[s.actionBtn, disabled && s.actionBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Ionicons name={icon} size={18} color={disabled ? Colors.textTertiary : Colors.text} />
      <Text style={[s.actionBtnLabel, disabled && s.actionBtnLabelDisabled]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function CollapsibleReviews({ ratings }: { ratings: MappedRating[] }) {
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
    if (expanded) setVisibleCount(5);
  };

  const showMore = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVisibleCount(v => v + 10);
  };

  const visibleRatings = ratings.slice(0, visibleCount);
  const hasMore = visibleCount < ratings.length;

  return (
    <View style={s.collapsibleSection}>
      <TouchableOpacity
        style={s.collapsibleHeader}
        onPress={toggleExpanded}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse community reviews" : "Expand community reviews"}
      >
        <Ionicons name="chatbubbles-outline" size={16} color={BRAND.colors.amber} />
        <Text style={s.collapsibleTitle}>Community Reviews</Text>
        <View style={s.collapsibleBadge}>
          <Text style={s.collapsibleBadgeText}>{ratings.length}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
      {expanded && (
        <View style={s.collapsibleBody}>
          <DistributionChart ratings={ratings} />
          {visibleRatings.map((rating: MappedRating) => (
            <RatingRow key={rating.id} rating={rating} />
          ))}
          {hasMore && (
            <TouchableOpacity onPress={showMore} style={s.showMoreBtn} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Show more reviews">
              <Text style={s.showMoreText}>Show more ({ratings.length - visibleCount} remaining)</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

export function AnimatedScore({ value, style }: { value: number; style: any }) {
  const animVal = useRef(new Animated.Value(0)).current;
  const [displayVal, setDisplayVal] = useState("0.00");

  useEffect(() => {
    animVal.setValue(0);
    const listener = animVal.addListener(({ value: v }) => {
      setDisplayVal(v.toFixed(2));
    });
    Animated.timing(animVal, {
      toValue: value,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => animVal.removeListener(listener);
  }, [value]);

  return <Text style={style}>{displayVal}</Text>;
}

export interface RankHistoryPoint {
  rank: number;
  date: string;
}

export const RatingDistribution = React.memo(function RatingDistribution({ ratings }: { ratings: MappedRating[] }) {
  const dist = [0, 0, 0, 0, 0];
  ratings.forEach(r => {
    const bucket = Math.min(4, Math.max(0, Math.round(r.rawScore) - 1));
    dist[bucket]++;
  });
  const maxCount = Math.max(...dist);

  return (
    <View style={s.rdCard}>
      <Text style={s.rdTitle}>Rating Distribution</Text>
      <Text style={s.rdSubtitle}>Transparent breakdown of all community ratings</Text>
      {[5, 4, 3, 2, 1].map(score => {
        const count = dist[score - 1];
        const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
        return (
          <View key={score} style={s.rdRow}>
            <Text style={s.rdLabel}>{score}</Text>
            <View style={s.rdBarBg}>
              <View style={[s.rdBarFill, { width: pctDim(pct), backgroundColor: score >= 4 ? Colors.green : score === 3 ? BRAND.colors.amber : Colors.red }]} />
            </View>
            <Text style={s.rdCount}>{count}</Text>
          </View>
        );
      })}
    </View>
  );
});

export const RankHistoryChart = React.memo(function RankHistoryChart({ points }: { points: RankHistoryPoint[] }) {
  const maxRank = Math.max(...points.map(p => p.rank));
  const minRank = Math.min(...points.map(p => p.rank));
  const range = Math.max(maxRank - minRank, 1);
  const chartW = 280;
  const chartH = 60;

  return (
    <View style={s.rhCard}>
      <View style={s.rhHeader}>
        <Ionicons name="trending-up" size={14} color={BRAND.colors.amber} />
        <Text style={s.rhTitle}>30-Day Rank Trend</Text>
      </View>
      <View style={s.rhChart}>
        {points.map((p, i) => {
          const x = (i / (points.length - 1)) * chartW;
          const y = chartH - ((maxRank - p.rank) / range) * chartH;
          return (
            <View
              key={i}
              style={[s.rhDot, { left: x - 3, top: y - 3 }]}
            />
          );
        })}
        <View style={[s.rhLine, { width: chartW }]} />
      </View>
      <View style={s.rhLabels}>
        <Text style={s.rhLabel}>#{maxRank}</Text>
        <Text style={s.rhLabel}>#{minRank}</Text>
      </View>
    </View>
  );
});

// ── Opening Hours Card ─────────────────────────────────────────
export function OpeningHoursCard({ hours }: { hours: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const todayLine = hours.find(h => h.toLowerCase().startsWith(todayName));
  return (
    <View style={s.hoursCard}>
      <TouchableOpacity
        onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpanded(!expanded); }}
        activeOpacity={0.7}
        style={s.hoursHeader}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse hours" : "Expand hours"}
      >
        <Text style={s.sectionTitle}>Hours</Text>
        <View style={s.hoursTodayRow}>
          <Text style={s.hoursTodaySummary} numberOfLines={1}>{todayLine || hours[0] || "—"}</Text>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={Colors.textSecondary} />
        </View>
      </TouchableOpacity>
      {expanded && hours.map((line: string, i: number) => {
        const isToday = line.toLowerCase().startsWith(todayName);
        return (
          <View key={i} style={[s.hoursRow, isToday && s.hoursRowToday]}>
            <Text style={[s.hoursText, isToday && s.hoursTextToday]}>{line}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Location Card with Map ─────────────────────────────────────
export function LocationCard({
  address,
  lat,
  lng,
  onDirections,
}: {
  address: string;
  lat?: string | null;
  lng?: string | null;
  onDirections: () => void;
}) {
  return (
    <View style={s.locationCard}>
      <Text style={s.sectionTitle}>Location</Text>
      {Platform.OS === "web" && lat && lng && (
        <View style={s.mapEmbed}>
          <iframe
            src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
            style={{ width: "100%", height: 180, border: "none", borderRadius: 10 } as any}
            loading="lazy"
          />
        </View>
      )}
      <Text style={s.addressText}>{address}</Text>
      <TouchableOpacity style={s.directionsBtn} onPress={onDirections} accessibilityRole="button" accessibilityLabel="Get directions">
        <Text style={s.directionsBtnText}>Get Directions</Text>
      </TouchableOpacity>
    </View>
  );
}

export function DishPill({ dish }: { dish: ApiDish }) {
  return (
    <View style={s.dishPill}>
      <Text style={s.dishPillText}>{dish.name}</Text>
      <Text style={s.dishVoteCountText}>{dish.voteCount}</Text>
    </View>
  );
}

// ── Hero Carousel ──────────────────────────────────────────────
const HERO_HEIGHT = 280;

export interface HeroCarouselProps {
  photoUrls: string[];
  heroPhotoIdx: number;
  screenWidth: number;
  businessName: string;
  category: string;
  saved: boolean;
  topPad: number;
  onHeroScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onBack: () => void;
  onToggleBookmark: () => void;
  onShare: () => void;
}

export function HeroCarousel({
  photoUrls, heroPhotoIdx, screenWidth, businessName, category,
  saved, topPad, onHeroScroll, onBack, onToggleBookmark, onShare,
}: HeroCarouselProps) {
  return (
    <View style={s.heroImageContainer}>
      {photoUrls.length > 0 ? (
        <ScrollView
          horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          onScroll={onHeroScroll} scrollEventThrottle={16}
        >
          {photoUrls.map((url, i) => (
            <SafeImage key={i} uri={url} style={[s.heroImage, { width: screenWidth }]}
              contentFit="cover" category={category}
              fallbackText={businessName.charAt(0).toUpperCase()} />
          ))}
        </ScrollView>
      ) : (
        <LinearGradient colors={[BRAND.colors.amber, BRAND.colors.amberDark]}
          style={[s.heroImage, s.heroImagePlaceholder, { width: screenWidth }]}>
          <Text style={s.heroPlaceholderInitial}>{businessName.charAt(0).toUpperCase()}</Text>
        </LinearGradient>
      )}

      {photoUrls.length > 1 && (
        <View style={s.heroDotContainer}>
          {photoUrls.map((_, i) => (
            <View key={i} style={[s.heroDot, i === heroPhotoIdx ? s.heroDotActive : s.heroDotInactive]} />
          ))}
        </View>
      )}

      <View style={[s.navBar, { paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={onBack} style={s.navBtn} hitSlop={8}
          accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={s.navBtnGroup}>
          <TouchableOpacity style={s.navBtn} onPress={onToggleBookmark} hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={saved ? "Remove from saved" : "Save this business"}>
            <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={16}
              color={saved ? BRAND.colors.amber : "#fff"} />
          </TouchableOpacity>
          <TouchableOpacity style={s.navBtn} onPress={onShare} hitSlop={8}
            accessibilityRole="button" accessibilityLabel="Share this business">
            <Ionicons name="share-outline" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── Business Name Card ─────────────────────────────────────────
export interface BusinessNameCardProps {
  name: string;
  isClaimed: boolean;
  category: string;
  neighborhood?: string;
  city: string;
  isOpenNow?: boolean;
  priceRange?: string;
}

export function BusinessNameCard({
  name, isClaimed, category, neighborhood, city, isOpenNow, priceRange,
}: BusinessNameCardProps) {
  const catDisplay = getCategoryDisplay(category);
  return (
    <View style={s.nameCard}>
      <View style={s.nameRow}>
        <Text style={s.businessName}>{name}</Text>
        {isClaimed && <Ionicons name="checkmark-circle" size={18} color={Colors.blue} />}
      </View>
      <Text style={s.businessMeta}>
        {catDisplay.emoji} {catDisplay.label}{neighborhood ? ` \u00B7 ${neighborhood}` : ""} {"\u00B7"} {city}
      </Text>
      <View style={s.nameCardRow}>
        {isOpenNow !== undefined && (
          <View style={[s.openBadge, isOpenNow ? s.openBadgeOpen : s.openBadgeClosed]}>
            <View style={[s.openDot, { backgroundColor: isOpenNow ? Colors.green : Colors.red }]} />
            <Text style={[s.openBadgeText, { color: isOpenNow ? Colors.green : Colors.red }]}>
              {isOpenNow ? "OPEN NOW" : "CLOSED"}
            </Text>
          </View>
        )}
        {priceRange && <Text style={s.priceText}>{priceRange}</Text>}
      </View>
    </View>
  );
}

// ── Quick Stats Bar ────────────────────────────────────────────
export interface QuickStatsBarProps {
  rank: number;
  rankDelta?: number | null;
  ratingCount: number;
  ratings: MappedRating[];
}

export function QuickStatsBar({ rank, rankDelta, ratingCount, ratings }: QuickStatsBarProps) {
  return (
    <View style={s.statsBar}>
      <View style={s.statItem}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text style={s.statValue}>{getRankDisplay(rank)}</Text>
          <RankMovementPulse delta={rankDelta ?? 0} size={24} />
        </View>
        <Text style={s.statLabel}>Rank</Text>
      </View>
      <View style={s.statDivider} />
      <View style={s.statItem}>
        <Text style={s.statValue}>{ratingCount.toLocaleString()}</Text>
        <Text style={s.statLabel}>Ratings</Text>
      </View>
      <View style={s.statDivider} />
      <View style={s.statItem}>
        <Text style={s.statValue}>
          {formatReturnRate(ratings.filter(r => r.wouldReturn).length, ratings.length)}
        </Text>
        <Text style={s.statLabel}>Would Return</Text>
      </View>
      {ratings.length > 0 && (
        <>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>{ratings.length}</Text>
            <Text style={s.statLabel}>Reviews</Text>
          </View>
        </>
      )}
    </View>
  );
}

// ── Ranking Confidence Indicator ───────────────────────────────
export function RankConfidenceIndicator({ ratingCount, category }: { ratingCount: number; category: string }) {
  const confidence = getRankConfidence(ratingCount, category);
  if (confidence === "strong") return null;
  const { label, description } = RANK_CONFIDENCE_LABELS[confidence];
  const confidenceColor = confidence === "provisional" ? Colors.textTertiary
    : confidence === "early" ? BRAND.colors.amber : Colors.green;
  return (
    <View style={s.confidenceBadge}>
      <Ionicons
        name={confidence === "provisional" ? "hourglass-outline" : "trending-up-outline"}
        size={14} color={confidenceColor} />
      <Text style={[s.confidenceLabel, { color: confidenceColor }]}>{label}</Text>
      <Text style={s.confidenceDesc}>{description}</Text>
    </View>
  );
}

// ── Score Card ─────────────────────────────────────────────────
export interface ScoreCardProps {
  weightedScore: number;
  ratingCount: number;
  rank: number;
  googleRating?: number | null;
}

export function ScoreCard({ weightedScore, ratingCount, rank, googleRating }: ScoreCardProps) {
  return (
    <View style={s.scoreCard}>
      <ScoreCountUp targetValue={weightedScore} duration={1000} decimalPlaces={1} style={s.scoreNumber} />
      <Text style={s.scoreLabel}>Weighted Score</Text>
      <View style={s.scoreMetaRow}>
        <Text style={s.scoreMetaItem}>{ratingCount.toLocaleString()} ratings</Text>
        <Text style={s.scoreMetaItem}>{getRankDisplay(rank)}</Text>
        {googleRating && (
          <View style={s.googleRow}>
            <MaterialCommunityIcons name="google" size={10} color={Colors.textTertiary} />
            <Text style={s.scoreMetaItem}>{googleRating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Trust Explainer Card ───────────────────────────────────────
export interface TrustExplainerCardProps {
  ratingCount: number;
  weightedScore: number;
  category: string;
  ratings: MappedRating[];
}

export function TrustExplainerCard({ ratingCount, weightedScore, category, ratings }: TrustExplainerCardProps) {
  const conf = getRankConfidence(ratingCount, category);
  const bodyText = (conf === "provisional" || conf === "early")
    ? `Based on ${ratingCount} rating${ratingCount !== 1 ? "s" : ""} so far. This ranking will stabilize as more community members contribute. Each rating is weighted by the rater's credibility.`
    : `Calculated from ${ratingCount.toLocaleString()} community ratings, weighted by each rater's credibility. Higher-credibility members have more influence, making this ranking resistant to spam and manipulation.`;

  return (
    <SlideUpView delay={100} distance={20}>
      <View style={s.trustCard}>
        <View style={s.trustCardHeader}>
          <Ionicons name="shield-checkmark" size={16} color={Colors.green} />
          <Text style={s.trustCardTitle}>About This Ranking</Text>
        </View>
        <Text style={s.trustCardBody}>{bodyText}</Text>
        <View style={s.trustCardStats}>
          <View style={s.trustStat}>
            <Text style={s.trustStatValue}>{ratingCount.toLocaleString()}</Text>
            <Text style={s.trustStatLabel}>Weighted Ratings</Text>
          </View>
          <View style={s.trustStat}>
            <Text style={s.trustStatValue}>{weightedScore.toFixed(1)}</Text>
            <Text style={s.trustStatLabel}>Community Score</Text>
          </View>
          {ratings.length > 0 && (
            <View style={s.trustStat}>
              <Text style={s.trustStatValue}>
                {formatReturnRate(ratings.filter(r => r.wouldReturn).length, ratings.length)}
              </Text>
              <Text style={s.trustStatLabel}>Would Return</Text>
            </View>
          )}
        </View>
      </View>
    </SlideUpView>
  );
}

// ── Sub-Scores Card ────────────────────────────────────────────
export interface SubScoresCardProps {
  avgQ1: number;
  avgQ2: number;
  avgQ3: number;
  ratings: MappedRating[];
}

export function SubScoresCard({ avgQ1, avgQ2, avgQ3, ratings }: SubScoresCardProps) {
  return (
    <SlideUpView delay={200} distance={20}>
      <View style={s.subScoresCard}>
        <SubScoreBar label="Quality" value={avgQ1} />
        <SubScoreBar label="Value" value={avgQ2} />
        <SubScoreBar label="Service" value={avgQ3} />
        <View style={s.returnRateRow}>
          <Ionicons name="refresh-circle" size={14} color={Colors.green} />
          <Text style={s.returnRateText}>
            {Math.round((ratings.filter(r => r.wouldReturn).length / ratings.length) * 100)}% would return
          </Text>
        </View>
      </View>
    </SlideUpView>
  );
}

// ── Your Previous Rating Card ──────────────────────────────────
export interface YourRatingCardProps {
  myRating: MappedRating;
  tier: CredibilityTier;
}

export function YourRatingCard({ myRating, tier }: YourRatingCardProps) {
  const ratedDate = new Date(myRating.createdAt);
  const daysAgo = Math.floor((Date.now() - ratedDate.getTime()) / (1000 * 60 * 60 * 24));
  return (
    <View style={s.yourRatingCard}>
      <View style={s.yourRatingHeader}>
        <Ionicons name="star" size={14} color={BRAND.colors.amber} />
        <Text style={s.yourRatingTitle}>Your Rating</Text>
        <Text style={s.yourRatingDate}>
          {daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`}
        </Text>
      </View>
      <View style={s.yourRatingScores}>
        <View style={s.yourRatingScoreItem}>
          <Text style={s.yourRatingScoreValue}>{myRating.q1}</Text>
          <Text style={s.yourRatingScoreLabel}>Quality</Text>
        </View>
        <View style={s.yourRatingScoreItem}>
          <Text style={s.yourRatingScoreValue}>{myRating.q2}</Text>
          <Text style={s.yourRatingScoreLabel}>Value</Text>
        </View>
        <View style={s.yourRatingScoreItem}>
          <Text style={s.yourRatingScoreValue}>{myRating.q3}</Text>
          <Text style={s.yourRatingScoreLabel}>Service</Text>
        </View>
        <View style={s.yourRatingScoreItem}>
          <Ionicons
            name={myRating.wouldReturn ? "checkmark-circle" : "close-circle"}
            size={16} color={myRating.wouldReturn ? Colors.green : Colors.red} />
          <Text style={s.yourRatingScoreLabel}>Return</Text>
        </View>
      </View>
      <Text style={s.yourRatingInfluence}>
        {TIER_INFLUENCE_LABELS[tier]} · Score {myRating.rawScore.toFixed(1)}
      </Text>
    </View>
  );
}

// Styles for extracted sub-components
const s = StyleSheet.create({
  subScoreRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  subScoreLabel: { width: 60, fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  subScoreTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: Colors.border, overflow: "hidden" },
  subScoreFill: { height: 6, borderRadius: 3, backgroundColor: BRAND.colors.amber },
  subScoreValue: { width: 30, fontSize: 13, fontWeight: "600", color: Colors.text, textAlign: "right", fontFamily: "DMSans_600SemiBold" },

  distChart: { gap: 4, marginBottom: 12 },
  distRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  distStar: { width: 16, fontSize: 12, color: Colors.textSecondary, textAlign: "center", fontFamily: "DMSans_400Regular" },
  distBarTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: `${Colors.border}60`, overflow: "hidden" },
  distBarFill: { height: 8, borderRadius: 4 },
  distCount: { width: 24, ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary, textAlign: "right" },

  ratingRow: {
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 8,
  },
  ratingTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  ratingUser: { flexDirection: "row", alignItems: "center", gap: 10 },
  ratingAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: `${BRAND.colors.amber}18`,
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  ratingAvatarImg: { width: 32, height: 32, borderRadius: 16 },
  ratingAvatarText: { fontSize: 14, fontWeight: "600", color: BRAND.colors.amber },
  ratingName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  ratingTierText: { fontSize: 10, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
  ratingScoreBox: { alignItems: "flex-end", gap: 2 },
  ratingScore: { fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold" },
  ratingWeight: { ...TYPOGRAPHY.ui.small, color: Colors.textTertiary },
  ratingTime: { ...TYPOGRAPHY.ui.small, color: Colors.textTertiary },
  ratingSubScores: { flexDirection: "row", gap: 16, paddingLeft: 42 },
  ratingSubItem: { alignItems: "center", gap: 2 },
  ratingSubLabel: { ...TYPOGRAPHY.ui.small, color: Colors.textTertiary },
  ratingSubVal: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  ratingComment: {
    fontSize: 13, color: Colors.textSecondary, fontStyle: "italic",
    fontFamily: "DMSans_400Regular", paddingLeft: 42, lineHeight: 18,
  },

  actionBtn: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 4,
    paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.surface,
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnLabel: { fontSize: 11, color: Colors.text, fontFamily: "DMSans_500Medium" },
  actionBtnLabelDisabled: { color: Colors.textTertiary },

  collapsibleSection: {
    backgroundColor: Colors.surface, borderRadius: 14, overflow: "hidden",
    ...Colors.cardShadow,
  },
  collapsibleHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 14,
  },
  collapsibleTitle: {
    fontSize: 15, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  collapsibleBadge: {
    backgroundColor: `${BRAND.colors.amber}15`,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  collapsibleBadgeText: {
    fontSize: 11, fontWeight: "700", color: BRAND.colors.amber,
    fontFamily: "DMSans_700Bold",
  },
  collapsibleBody: { paddingHorizontal: 14, paddingBottom: 14 },

  showMoreBtn: {
    paddingVertical: 10, alignItems: "center",
  },
  showMoreText: {
    fontSize: 13, color: BRAND.colors.amber, fontWeight: "600",
    fontFamily: "DMSans_600SemiBold",
  },

  rdCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 8,
    ...Colors.cardShadow,
  },
  rdTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  rdSubtitle: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary, marginBottom: 4 },
  rdRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  rdLabel: { width: 12, fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_500Medium", textAlign: "center" },
  rdBarBg: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: "hidden" },
  rdBarFill: { height: "100%", borderRadius: 2 },
  rdCount: { width: 20, ...TYPOGRAPHY.ui.small, color: Colors.textTertiary, textAlign: "right" },

  rhCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 10,
    ...Colors.cardShadow,
  },
  rhHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  rhTitle: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  rhChart: { height: 66, position: "relative" },
  rhDot: {
    position: "absolute", width: 6, height: 6, borderRadius: 3,
    backgroundColor: BRAND.colors.amber,
  },
  rhLine: { position: "absolute", top: "50%", left: 0, height: 1, backgroundColor: Colors.border },
  rhLabels: { flexDirection: "row", justifyContent: "space-between" },
  rhLabel: { ...TYPOGRAPHY.ui.small, color: Colors.textTertiary },

  dishPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: `${BRAND.colors.amber}10`,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: `${BRAND.colors.amber}25`,
  },
  dishPillText: {
    fontSize: 13, color: Colors.text, fontFamily: "DMSans_500Medium",
  },
  dishVoteCountText: {
    fontSize: 11, color: BRAND.colors.amber, fontWeight: "700",
    fontFamily: "DMSans_700Bold",
  },

  // Opening Hours
  hoursCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 4,
    ...Colors.cardShadow,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold", marginBottom: 8,
  },
  hoursHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hoursTodayRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1, marginLeft: 12 },
  hoursTodaySummary: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", flex: 1, textAlign: "right" },
  hoursRow: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginTop: 2 },
  hoursRowToday: { backgroundColor: `${BRAND.colors.amber}10` },
  hoursText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  hoursTextToday: { color: Colors.text, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },

  // Location Card
  locationCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 8,
    ...Colors.cardShadow,
  },
  mapEmbed: { borderRadius: 10, overflow: "hidden", marginBottom: 4 },
  addressText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  directionsBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10,
    backgroundColor: Colors.surfaceRaised, alignSelf: "flex-start",
  },
  directionsBtnText: {
    fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },

  // Hero Carousel
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
    backgroundColor: BRAND.colors.amber, alignItems: "center", justifyContent: "center",
  },
  heroPlaceholderInitial: {
    fontSize: 48, fontWeight: "700", color: "#FFFFFF", fontFamily: "PlayfairDisplay_700Bold",
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
  navBtnGroup: { flexDirection: "row", gap: 8 },

  // Business Name Card
  nameCard: {
    backgroundColor: Colors.surface, marginHorizontal: 14, marginTop: -24,
    borderRadius: 16, padding: 16, gap: 4, ...Colors.cardShadow,
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  businessName: {
    fontSize: 24, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5,
  },
  businessMeta: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  nameCardRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  openBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
  },
  openBadgeOpen: {
    backgroundColor: `${Colors.green}12`,
    shadowColor: Colors.green, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 2,
  },
  openBadgeClosed: { backgroundColor: `${Colors.red}12` },
  openDot: { width: 6, height: 6, borderRadius: 3 },
  openBadgeText: { fontSize: 10, fontWeight: "700", fontFamily: "DMSans_700Bold", letterSpacing: 0.5 },
  priceText: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  // Quick Stats Bar
  statsBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-around",
    backgroundColor: Colors.surface, marginHorizontal: 16, marginTop: -8,
    paddingVertical: 14, borderRadius: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statItem: { alignItems: "center", gap: 2 },
  statValue: {
    fontSize: 18, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5,
  },
  statLabel: {
    ...TYPOGRAPHY.ui.small, color: Colors.textTertiary,
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.border },

  // Confidence Badge
  confidenceBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginHorizontal: 16, marginTop: 8,
    backgroundColor: Colors.surfaceRaised, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  confidenceLabel: { fontSize: 12, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
  confidenceDesc: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", flex: 1,
  },

  // Score Card
  scoreCard: {
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 20, alignItems: "center", gap: 4, ...Colors.cardShadow,
  },
  scoreNumber: {
    fontSize: 48, fontWeight: "900", color: Colors.gold,
    fontFamily: "PlayfairDisplay_900Black", letterSpacing: -1.5,
  },
  scoreLabel: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary },
  scoreMetaRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  scoreMetaItem: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  googleRow: { flexDirection: "row", alignItems: "center", gap: 3 },

  // Trust Card
  trustCard: {
    backgroundColor: `${Colors.green}08`, borderRadius: 14, padding: 16,
    gap: 10, borderWidth: 1, borderColor: `${Colors.green}20`,
  },
  trustCardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  trustCardTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  trustCardBody: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 18 },
  trustCardStats: {
    flexDirection: "row", justifyContent: "space-around",
    paddingTop: 8, borderTopWidth: 1, borderTopColor: `${Colors.green}15`,
  },
  trustStat: { alignItems: "center", gap: 2 },
  trustStatValue: { fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold" },
  trustStatLabel: {
    fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textTransform: "uppercase" as const, letterSpacing: 0.5,
  },

  // Sub-Scores Card
  subScoresCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 10, ...Colors.cardShadow,
  },
  returnRateRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingTop: 6, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  returnRateText: { ...TYPOGRAPHY.ui.label, color: Colors.textSecondary },

  // Your Rating Card
  yourRatingCard: {
    backgroundColor: `${BRAND.colors.amber}08`, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: `${BRAND.colors.amber}20`, gap: 10, marginBottom: 12,
  },
  yourRatingHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  yourRatingTitle: {
    fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold", flex: 1,
  },
  yourRatingDate: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  yourRatingScores: { flexDirection: "row", justifyContent: "space-around" },
  yourRatingScoreItem: { alignItems: "center", gap: 2 },
  yourRatingScoreValue: {
    fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold",
  },
  yourRatingScoreLabel: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  yourRatingInfluence: {
    fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", textAlign: "center",
  },
});

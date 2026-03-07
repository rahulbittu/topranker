import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Linking, Share, Dimensions,
  NativeScrollEvent, NativeSyntheticEvent, RefreshControl, Alert,
  LayoutAnimation, UIManager,
} from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { fetchBusinessBySlug, type ApiDish } from "@/lib/api";
import {
  formatTimeAgo, TIER_COLORS, TIER_DISPLAY_NAMES, getCategoryDisplay, getRankDisplay, type CredibilityTier,
} from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import * as Haptics from "expo-haptics";
import { BRAND } from "@/constants/brand";
import { BusinessDetailSkeleton } from "@/components/Skeleton";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface MappedRating {
  id: string;
  userName: string;
  userTier: CredibilityTier;
  rawScore: number;
  weight: number;
  q1: number;
  q2: number;
  q3: number;
  wouldReturn: boolean;
  comment: string | null;
  createdAt: number;
}

function SubScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min((value / 5) * 100, 100);
  return (
    <View style={styles.subScoreRow}>
      <Text style={styles.subScoreLabel}>{label}</Text>
      <View style={styles.subScoreTrack}>
        <View style={[styles.subScoreFill, { width: `${pct}%` as any }]} />
      </View>
      <Text style={styles.subScoreValue}>{value.toFixed(1)}</Text>
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
                backgroundColor: count === maxCount && count > 0 ? Colors.gold : Colors.border,
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
          <View style={styles.ratingAvatar}>
            <Text style={styles.ratingAvatarText}>
              {rating.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.ratingName}>{rating.userName}</Text>
            <Text style={[styles.ratingTierText, { color: tierColor }]}>{tierName}</Text>
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
          <Text style={styles.ratingSubLabel}>Quality</Text>
          <Text style={styles.ratingSubVal}>{rating.q1}</Text>
        </View>
        <View style={styles.ratingSubItem}>
          <Text style={styles.ratingSubLabel}>Value</Text>
          <Text style={styles.ratingSubVal}>{rating.q2}</Text>
        </View>
        <View style={styles.ratingSubItem}>
          <Text style={styles.ratingSubLabel}>Service</Text>
          <Text style={styles.ratingSubVal}>{rating.q3}</Text>
        </View>
        <View style={styles.ratingSubItem}>
          <Text style={styles.ratingSubLabel}>Return</Text>
          <Ionicons
            name={rating.wouldReturn ? "checkmark-circle" : "close-circle"}
            size={14}
            color={rating.wouldReturn ? Colors.green : Colors.red}
          />
        </View>
      </View>
      {rating.comment && (
        <Text style={styles.ratingComment}>"{rating.comment}"</Text>
      )}
    </View>
  );
}

function ActionButton({ icon, label, onPress, disabled }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, disabled && styles.actionBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Ionicons name={icon} size={18} color={disabled ? Colors.textTertiary : Colors.text} />
      <Text style={[styles.actionBtnLabel, disabled && styles.actionBtnLabelDisabled]}>{label}</Text>
    </TouchableOpacity>
  );
}

function CollapsibleReviews({ ratings }: { ratings: MappedRating[] }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.collapsibleSection}>
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={toggleExpanded}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse community reviews" : "Expand community reviews"}
      >
        <Ionicons name="chatbubbles-outline" size={16} color={BRAND.colors.amber} />
        <Text style={styles.collapsibleTitle}>Community Reviews</Text>
        <View style={styles.collapsibleBadge}>
          <Text style={styles.collapsibleBadgeText}>{ratings.length}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.collapsibleBody}>
          <DistributionChart ratings={ratings} />
          {ratings.map((rating: MappedRating) => (
            <RatingRow key={rating.id} rating={rating} />
          ))}
        </View>
      )}
    </View>
  );
}

function DishPill({ dish }: { dish: ApiDish }) {
  return (
    <View style={styles.dishPill}>
      <Text style={styles.dishPillText}>{dish.name}</Text>
      <Text style={styles.dishVoteCountText}>{dish.voteCount}</Text>
    </View>
  );
}

export default function BusinessProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id: slug } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["business", slug],
    queryFn: () => fetchBusinessBySlug(slug),
    enabled: !!slug,
    staleTime: 30000,
  });

  const business = data?.business;
  const ratings = (data?.ratings || []) as MappedRating[];
  const dishes = data?.dishes || [];
  const photoUrls: string[] = business?.photoUrls || (business?.photoUrl ? [business.photoUrl] : []);
  const [heroPhotoIdx, setHeroPhotoIdx] = useState(0);
  const [heroImgErrors, setHeroImgErrors] = useState<Set<number>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const onHeroScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
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
                heroImgErrors.has(i) ? (
                  <LinearGradient key={i} colors={[BRAND.colors.amber, BRAND.colors.amberDark]} style={[styles.heroImage, styles.heroImagePlaceholder]}>
                    <Text style={styles.heroPlaceholderInitial}>
                      {business.name.charAt(0).toUpperCase()}
                    </Text>
                  </LinearGradient>
                ) : (
                  <Image
                    key={i}
                    source={{ uri: url }}
                    style={styles.heroImage}
                    contentFit="cover"
                    transition={300}
                    onError={() => setHeroImgErrors(prev => new Set(prev).add(i))}
                  />
                )
              ))}
            </ScrollView>
          ) : (
            <LinearGradient colors={[BRAND.colors.amber, BRAND.colors.amberDark]} style={[styles.heroImage, styles.heroImagePlaceholder]}>
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
            <TouchableOpacity style={styles.navBtn} onPress={handleShare} hitSlop={8} accessibilityRole="button" accessibilityLabel="Share this business">
              <Ionicons name="share-outline" size={16} color="#fff" />
            </TouchableOpacity>
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
            {getCategoryDisplay(business.category).emoji} {getCategoryDisplay(business.category).label} {business.neighborhood ? `\u00B7 ${business.neighborhood}` : ""} \u00B7 {business.city}
          </Text>
          <View style={styles.nameCardRow}>
            {business.isOpenNow !== undefined && (
              <Text style={[styles.openStatusText, { color: business.isOpenNow ? Colors.green : Colors.red }]}>
                {business.isOpenNow ? "OPEN" : "CLOSED"}
              </Text>
            )}
            {business.priceRange && <Text style={styles.priceText}>{business.priceRange}</Text>}
          </View>
        </View>

        <View style={styles.body}>
          {/* Description */}
          {business.description && (
            <Text style={styles.descriptionText}>{business.description}</Text>
          )}

          {/* Score */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreNumber}>{business.weightedScore.toFixed(2)}</Text>
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

          {/* Action Bar */}
          <View style={styles.actionBar}>
            <ActionButton icon="call-outline" label="Call" onPress={handleCall} disabled={!business.phone} />
            <ActionButton icon="globe-outline" label="Website" onPress={handleWebsite} disabled={!business.website} />
            <ActionButton icon="navigate-outline" label="Maps" onPress={handleMaps} disabled={!business.address} />
            <ActionButton icon="share-outline" label="Share" onPress={handleShare} />
          </View>

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

          {/* Rate Button */}
          {user ? (
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
          {openingHoursText && openingHoursText.length > 0 && (() => {
            const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
            return (
            <View style={styles.hoursCard}>
              <Text style={styles.sectionTitle}>Opening Hours</Text>
              {openingHoursText.map((line: string, i: number) => {
                const isToday = line.toLowerCase().startsWith(todayName);
                return (
                  <View key={i} style={[styles.hoursRow, isToday && styles.hoursRowToday]}>
                    <Text style={[styles.hoursText, isToday && styles.hoursTextToday]}>{line}</Text>
                  </View>
                );
              })}
            </View>
            );
          })()}

          {business.address && (
            <View style={styles.addressCard}>
              <Text style={styles.sectionTitle}>Location</Text>
              {Platform.OS === "web" && business.lat && business.lng && (
                <View style={styles.mapEmbed}>
                  <iframe
                    src={`https://www.google.com/maps?q=${business.lat},${business.lng}&z=15&output=embed`}
                    style={{ width: "100%", height: 180, border: "none", borderRadius: 10 } as any}
                    loading="lazy"
                  />
                </View>
              )}
              <Text style={styles.addressText}>{business.address}</Text>
              <TouchableOpacity style={styles.directionsBtn} onPress={handleMaps} accessibilityRole="button" accessibilityLabel="Get directions">
                <Feather name="navigation" size={13} color={Colors.text} />
                <Text style={styles.directionsBtnText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
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
                  <Image
                    key={i}
                    source={{ uri: url }}
                    style={styles.photoGridImage}
                    contentFit="cover"
                    transition={200}
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
        </View>
      </ScrollView>
    </View>
  );
}

const HERO_HEIGHT = 280;

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: Colors.background },
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
  heroImage: { width: SCREEN_WIDTH, height: HERO_HEIGHT },
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
  openStatusText: {
    fontSize: 11, fontFamily: "DMSans_600SemiBold", letterSpacing: 0.5,
  },
  priceText: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

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
  subScoreRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  subScoreLabel: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_500Medium", width: 60 },
  subScoreTrack: { flex: 1, height: 3, backgroundColor: Colors.border, borderRadius: 2, overflow: "hidden" },
  subScoreFill: { height: "100%", backgroundColor: Colors.gold, borderRadius: 2 },
  subScoreValue: { fontSize: 13, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold", width: 28, textAlign: "right" },

  actionBar: {
    flexDirection: "row", justifyContent: "space-around",
    paddingVertical: 12,
  },
  actionBtn: { alignItems: "center", gap: 5 },
  actionBtnDisabled: { opacity: 0.3 },
  actionBtnLabel: { fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  actionBtnLabelDisabled: { color: Colors.textTertiary },

  sectionContainer: { gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  sectionHeaderBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionCount: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  dishesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dishPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.surfaceRaised, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  dishPillText: { fontSize: 12, color: Colors.text, fontFamily: "DMSans_500Medium" },
  dishVoteCountText: { fontSize: 10, fontWeight: "700", color: Colors.textTertiary, fontFamily: "DMSans_700Bold" },

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

  hoursCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 8,
    ...Colors.cardShadow,
  },
  hoursRow: { paddingVertical: 3, paddingHorizontal: 4, borderRadius: 4 },
  hoursRowToday: { backgroundColor: Colors.goldFaint },
  hoursText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 18 },
  hoursTextToday: { color: Colors.gold, fontFamily: "DMSans_600SemiBold" },

  addressCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 10,
    ...Colors.cardShadow,
  },
  mapEmbed: { borderRadius: 10, overflow: "hidden", marginBottom: 8 },
  addressText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 18 },
  directionsBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
  },
  directionsBtnText: { fontSize: 12, color: Colors.text, fontFamily: "DMSans_600SemiBold" },

  card: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
    gap: 10, ...Colors.cardShadow,
  },

  distChart: { gap: 7 },
  distRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  distStar: { width: 12, fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  distBarTrack: { flex: 1, height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: "hidden" },
  distBarFill: { height: "100%", borderRadius: 2 },
  distCount: { width: 16, fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", textAlign: "right" },

  ratingRow: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 13,
    gap: 8, ...Colors.cardShadow,
  },
  ratingTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  ratingUser: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  ratingAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceRaised,
    alignItems: "center", justifyContent: "center",
  },
  ratingAvatarText: { fontSize: 13, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  ratingName: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  ratingTierText: { fontSize: 10, fontFamily: "DMSans_500Medium" },
  ratingScoreBox: { alignItems: "flex-end", gap: 1 },
  ratingScore: { fontSize: 17, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5 },
  ratingWeight: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  ratingTime: { fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  ratingSubScores: { flexDirection: "row", gap: 14 },
  ratingSubItem: { alignItems: "center", gap: 2 },
  ratingSubLabel: { fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  ratingSubVal: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  ratingComment: { fontSize: 12, color: Colors.textSecondary, fontStyle: "italic", fontFamily: "DMSans_400Regular", lineHeight: 17 },

  photoGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 4, borderRadius: 12, overflow: "hidden",
  },
  photoGridImage: {
    width: (SCREEN_WIDTH - 28 - 8) / 3, height: (SCREEN_WIDTH - 28 - 8) / 3,
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

  collapsibleSection: {
    backgroundColor: Colors.surface, borderRadius: 14, overflow: "hidden",
    ...Colors.cardShadow,
  },
  collapsibleHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 14,
  },
  collapsibleTitle: {
    fontSize: 14, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold",
    letterSpacing: 0.3,
  },
  collapsibleBadge: {
    backgroundColor: `${BRAND.colors.amber}15`, paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 8,
  },
  collapsibleBadgeText: {
    fontSize: 11, fontWeight: "700", color: BRAND.colors.amber, fontFamily: "DMSans_700Bold",
  },
  collapsibleBody: {
    paddingHorizontal: 14, paddingBottom: 14, gap: 10,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },

  reportLink: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 16, marginTop: 4,
  },
  reportLinkText: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
});

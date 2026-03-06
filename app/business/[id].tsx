import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, ActivityIndicator, Linking, Share, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { fetchBusinessBySlug, type ApiDish } from "@/lib/api";
import {
  formatTimeAgo, TIER_COLORS, TIER_DISPLAY_NAMES, type CredibilityTier,
} from "@/lib/data";
import { useAuth } from "@/lib/auth-context";

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

function SubScoreBar({ label, value, icon }: { label: string; value: number; icon: string }) {
  const pct = Math.min((value / 5) * 100, 100);
  return (
    <View style={styles.subScoreRow}>
      <View style={styles.subScoreIcon}>
        <Ionicons name={icon as any} size={14} color={Colors.gold} />
      </View>
      <View style={styles.subScoreContent}>
        <View style={styles.subScoreLabelRow}>
          <Text style={styles.subScoreLabel}>{label}</Text>
          <Text style={styles.subScoreValue}>{value.toFixed(1)}</Text>
        </View>
        <View style={styles.subScoreTrack}>
          <View style={[styles.subScoreFill, { width: `${pct}%` as any }]} />
        </View>
      </View>
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
          <View style={[styles.ratingAvatar, { borderColor: tierColor }]}>
            <Text style={styles.ratingAvatarText}>
              {rating.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.ratingName}>{rating.userName}</Text>
            <View style={[styles.tierBadge, { borderColor: tierColor, backgroundColor: `${tierColor}18` }]}>
              <Text style={[styles.tierBadgeText, { color: tierColor }]}>{tierName}</Text>
            </View>
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

function ActionButton({ icon, label, onPress, disabled }: { icon: string; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, disabled && styles.actionBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.actionBtnCircle}>
        <Ionicons name={icon as any} size={18} color={disabled ? Colors.textTertiary : Colors.gold} />
      </View>
      <Text style={[styles.actionBtnLabel, disabled && styles.actionBtnLabelDisabled]}>{label}</Text>
    </TouchableOpacity>
  );
}

function DishPill({ dish }: { dish: ApiDish }) {
  return (
    <View style={styles.dishPill}>
      <Ionicons name="flame" size={12} color={Colors.gold} />
      <Text style={styles.dishPillText}>{dish.name}</Text>
      <View style={styles.dishVoteCount}>
        <Text style={styles.dishVoteCountText}>{dish.voteCount}</Text>
      </View>
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
  const ratings = (data?.ratings || []) as MappedRating[];
  const dishes = data?.dishes || [];

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

  const avgQ1 = ratings.length > 0 ? ratings.reduce((a, r) => a + r.q1, 0) / ratings.length : 0;
  const avgQ2 = ratings.length > 0 ? ratings.reduce((a, r) => a + r.q2, 0) / ratings.length : 0;
  const avgQ3 = ratings.length > 0 ? ratings.reduce((a, r) => a + r.q3, 0) / ratings.length : 0;

  const handleCall = () => {
    if (business.phone) Linking.openURL(`tel:${business.phone}`);
  };
  const handleWebsite = () => {
    if (business.website) Linking.openURL(business.website);
  };
  const handleMaps = () => {
    if (business.address) {
      const q = encodeURIComponent(business.address);
      Linking.openURL(Platform.OS === "ios" ? `maps:?q=${q}` : `geo:0,0?q=${q}`);
    }
  };
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${business.name} on Top Ranker! Ranked #${business.rank} with a ${business.weightedScore.toFixed(2)} score.`,
      });
    } catch {}
  };

  const openingHoursText = business.openingHours?.weekday_text;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 32 }
        ]}
      >
        {/* SECTION 1: Hero Image with Gradient Overlay */}
        <View style={styles.heroImageContainer}>
          <View style={[styles.heroImage, styles.heroImagePlaceholder]}>
            <Ionicons name="restaurant-outline" size={48} color={Colors.textTertiary} />
          </View>
          <View style={styles.heroGradientTop} />
          <View style={styles.heroGradientBottom} />

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
              {business.isOpenNow !== undefined && (
                <View style={[styles.statusDot, { backgroundColor: business.isOpenNow ? Colors.greenBright : Colors.redBright }]} />
              )}
              {business.isOpenNow !== undefined && (
                <Text style={styles.statusText}>{business.isOpenNow ? "Open" : "Closed"}</Text>
              )}
            </View>
            <Text style={styles.heroNameOverlay}>{business.name}</Text>
            <Text style={styles.heroCatOverlay}>
              {business.category} {business.neighborhood ? `· ${business.neighborhood}` : ""} · {business.city}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* SECTION 2: Action Bar */}
          <View style={styles.actionBar}>
            <ActionButton icon="call-outline" label="Call" onPress={handleCall} disabled={!business.phone} />
            <ActionButton icon="globe-outline" label="Website" onPress={handleWebsite} disabled={!business.website} />
            <ActionButton icon="navigate-outline" label="Maps" onPress={handleMaps} disabled={!business.address} />
            <ActionButton icon="share-outline" label="Share" onPress={handleShare} />
          </View>

          {/* SECTION 3: Score Card with Sub-scores */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreMainSection}>
              <Text style={styles.scoreNumber}>{business.weightedScore.toFixed(2)}</Text>
              <Text style={styles.scoreLabel}>Weighted Score</Text>
              {business.googleRating && (
                <View style={styles.googleRow}>
                  <MaterialCommunityIcons name="google" size={10} color={Colors.textTertiary} />
                  <Text style={styles.googleRatingText}>{business.googleRating.toFixed(1)}</Text>
                </View>
              )}
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreMetrics}>
              <View style={styles.scoreMetricRow}>
                <Text style={styles.scoreMetricValue}>{business.ratingCount}</Text>
                <Text style={styles.scoreMetricLabel}>Ratings</Text>
              </View>
              <View style={styles.scoreMetricRow}>
                <Text style={styles.scoreMetricValue}>{business.priceRange ?? "—"}</Text>
                <Text style={styles.scoreMetricLabel}>Price</Text>
              </View>
              <View style={styles.scoreMetricRow}>
                <Text style={[styles.scoreMetricValue, { fontSize: 11 }]}>{business.neighborhood || "—"}</Text>
                <Text style={styles.scoreMetricLabel}>Area</Text>
              </View>
            </View>
          </View>

          {ratings.length > 0 && (
            <View style={styles.subScoresCard}>
              <SubScoreBar label="Quality" value={avgQ1} icon="star" />
              <SubScoreBar label="Value" value={avgQ2} icon="cash-outline" />
              <SubScoreBar label="Service" value={avgQ3} icon="people-outline" />
              <View style={styles.returnRateRow}>
                <Ionicons name="repeat" size={14} color={Colors.gold} />
                <Text style={styles.returnRateLabel}>Would Return</Text>
                <Text style={styles.returnRateValue}>
                  {Math.round((ratings.filter(r => r.wouldReturn).length / ratings.length) * 100)}%
                </Text>
              </View>
            </View>
          )}

          {/* SECTION 4: Top Dishes */}
          {dishes.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="flame" size={16} color={Colors.gold} />
                <Text style={styles.sectionTitle}>Top Dishes</Text>
              </View>
              <View style={styles.dishesGrid}>
                {dishes.slice(0, 8).map((dish: ApiDish) => (
                  <DishPill key={dish.id} dish={dish} />
                ))}
              </View>
            </View>
          )}

          {/* SECTION 5: Rate Button */}
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

          {/* SECTION 6: Opening Hours */}
          {openingHoursText && openingHoursText.length > 0 && (
            <View style={styles.hoursCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={16} color={Colors.gold} />
                <Text style={styles.sectionTitle}>Opening Hours</Text>
                {business.isOpenNow !== undefined && (
                  <View style={[styles.openBadge, { backgroundColor: business.isOpenNow ? Colors.greenFaint : Colors.redFaint }]}>
                    <View style={[styles.openDot, { backgroundColor: business.isOpenNow ? Colors.greenBright : Colors.redBright }]} />
                    <Text style={[styles.openBadgeText, { color: business.isOpenNow ? Colors.greenBright : Colors.redBright }]}>
                      {business.isOpenNow ? "Open Now" : "Closed"}
                    </Text>
                  </View>
                )}
              </View>
              {openingHoursText.map((line: string, i: number) => {
                const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
                const isToday = line.toLowerCase().startsWith(today.toLowerCase());
                return (
                  <View key={i} style={[styles.hoursRow, isToday && styles.hoursRowToday]}>
                    <Text style={[styles.hoursText, isToday && styles.hoursTextToday]}>{line}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {business.address && (
            <View style={styles.addressCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="location-outline" size={16} color={Colors.gold} />
                <Text style={styles.sectionTitle}>Location</Text>
              </View>
              <Text style={styles.addressText}>{business.address}</Text>
              {business.address && (
                <TouchableOpacity style={styles.directionsBtn} onPress={handleMaps}>
                  <Feather name="navigation" size={13} color={Colors.gold} />
                  <Text style={styles.directionsBtnText}>Get Directions</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* SECTION 7: Community Ratings */}
          {ratings.length > 0 && (
            <>
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderBetween}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="chatbubbles-outline" size={16} color={Colors.gold} />
                    <Text style={styles.sectionTitle}>Community Ratings</Text>
                  </View>
                  <Text style={styles.sectionCount}>{ratings.length} reviews</Text>
                </View>
              </View>

              <View style={styles.card}>
                <DistributionChart ratings={ratings} />
              </View>

              {ratings.map((rating: MappedRating) => (
                <RatingRow key={rating.id} rating={rating} />
              ))}
            </>
          )}

          {/* SECTION 8: Photo Gallery */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="images-outline" size={16} color={Colors.gold} />
              <Text style={styles.sectionTitle}>Photos</Text>
            </View>
            <View style={styles.photoGalleryEmpty}>
              <Ionicons name="camera-outline" size={28} color={Colors.textTertiary} />
              <Text style={styles.photoGalleryEmptyText}>No photos yet</Text>
              <Text style={styles.photoGalleryEmptyHint}>Photos from the community will appear here</Text>
            </View>
          </View>

          {/* SECTION 9: Claim Listing */}
          {!business.isClaimed && (
            <View style={styles.claimCard}>
              <View style={styles.claimContent}>
                <Ionicons name="storefront-outline" size={22} color={Colors.blue} />
                <View style={styles.claimTextWrap}>
                  <Text style={styles.claimTitle}>Own this business?</Text>
                  <Text style={styles.claimDesc}>Claim your listing to respond to reviews and update your info</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.claimBtn} activeOpacity={0.8}>
                <Text style={styles.claimBtnText}>Claim Listing</Text>
              </TouchableOpacity>
            </View>
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

const HERO_HEIGHT = 280;

const styles = StyleSheet.create({
  notFound: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: "center", justifyContent: "center", gap: 12,
  },
  notFoundText: { fontSize: 18, color: Colors.text, fontWeight: "600" },
  backLink: { fontSize: 14, color: Colors.gold, fontWeight: "500" },

  content: { gap: 0 },
  body: { paddingHorizontal: 14, gap: 12, paddingTop: 14 },

  heroImageContainer: { height: HERO_HEIGHT, position: "relative" },
  heroImage: { width: "100%", height: HERO_HEIGHT },
  heroImagePlaceholder: {
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  heroGradientTop: {
    position: "absolute",
    top: 0, left: 0, right: 0, height: 100,
    backgroundColor: "rgba(13,27,42,0.6)",
  },
  heroGradientBottom: {
    position: "absolute",
    bottom: 0, left: 0, right: 0, height: HERO_HEIGHT * 0.65,
    backgroundColor: "rgba(13,27,42,0.7)",
  },

  navBar: {
    position: "absolute", top: 0, left: 0, right: 0,
    flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: 14, zIndex: 10,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(13,27,42,0.55)",
    alignItems: "center", justifyContent: "center",
  },

  heroRankOverlay: {
    position: "absolute", bottom: 18, left: 18, right: 18, gap: 4,
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
    letterSpacing: 0.5,
  },
  heroRankTextGold: { color: "#000" },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: "500" },
  heroNameOverlay: {
    fontSize: 26, fontWeight: "700", color: "#fff",
    letterSpacing: -0.7,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroCatOverlay: {
    fontSize: 13, color: "rgba(255,255,255,0.75)",
  },

  actionBar: {
    flexDirection: "row", justifyContent: "space-around",
    backgroundColor: Colors.surface,
    borderRadius: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  actionBtn: { alignItems: "center", gap: 5 },
  actionBtnDisabled: { opacity: 0.4 },
  actionBtnCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceRaised,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.border,
  },
  actionBtnLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: "500" },
  actionBtnLabelDisabled: { color: Colors.textTertiary },

  scoreCard: {
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: Colors.border,
  },
  scoreMainSection: { alignItems: "center", paddingRight: 16 },
  scoreNumber: {
    fontSize: 38, fontWeight: "800", color: Colors.gold,
    letterSpacing: -1.5,
  },
  scoreLabel: { fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
  googleRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  googleRatingText: { fontSize: 10, color: Colors.textTertiary },
  scoreDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  scoreMetrics: { flex: 1, paddingLeft: 16, gap: 8 },
  scoreMetricRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  scoreMetricValue: { fontSize: 13, fontWeight: "700", color: Colors.text, textAlign: "right" },
  scoreMetricLabel: { fontSize: 10, color: Colors.textTertiary },

  subScoresCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  subScoreRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  subScoreIcon: { width: 24, alignItems: "center" },
  subScoreContent: { flex: 1, gap: 4 },
  subScoreLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  subScoreLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: "500" },
  subScoreValue: { fontSize: 13, fontWeight: "700", color: Colors.text },
  subScoreTrack: { height: 5, backgroundColor: Colors.surfaceRaised, borderRadius: 3, overflow: "hidden" },
  subScoreFill: { height: "100%", backgroundColor: Colors.gold, borderRadius: 3 },
  returnRateRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  returnRateLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: "500", flex: 1 },
  returnRateValue: { fontSize: 14, fontWeight: "700", color: Colors.greenBright },

  sectionContainer: { gap: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 7 },
  sectionHeaderBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.text },
  sectionCount: { fontSize: 11, color: Colors.textTertiary },

  dishesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dishPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.surface, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: Colors.border,
  },
  dishPillText: { fontSize: 12, color: Colors.text, fontWeight: "500" },
  dishVoteCount: {
    backgroundColor: Colors.goldFaint, borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  dishVoteCountText: { fontSize: 10, fontWeight: "700", color: Colors.gold },

  rateButton: {
    backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  rateButtonText: { fontSize: 16, fontWeight: "700", color: "#000" },

  hoursCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  openBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    marginLeft: "auto",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  openDot: { width: 5, height: 5, borderRadius: 3 },
  openBadgeText: { fontSize: 10, fontWeight: "600" },
  hoursRow: { paddingVertical: 3, paddingHorizontal: 4, borderRadius: 4 },
  hoursRowToday: { backgroundColor: Colors.goldFaint },
  hoursText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  hoursTextToday: { color: Colors.gold, fontWeight: "600" },

  addressCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  addressText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  directionsBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.gold,
  },
  directionsBtnText: { fontSize: 12, color: Colors.gold, fontWeight: "600" },

  card: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border, gap: 10,
  },

  distChart: { gap: 7 },
  distRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  distStar: { width: 12, fontSize: 11, color: Colors.textSecondary, fontWeight: "500" },
  distBarTrack: { flex: 1, height: 6, backgroundColor: Colors.surfaceRaised, borderRadius: 3, overflow: "hidden" },
  distBarFill: { height: "100%", borderRadius: 3 },
  distCount: { width: 16, fontSize: 10, color: Colors.textTertiary, textAlign: "right" },

  ratingRow: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 13,
    gap: 8, borderWidth: 1, borderColor: Colors.border,
  },
  ratingTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  ratingUser: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  ratingAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceRaised,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
  },
  ratingAvatarText: { fontSize: 13, fontWeight: "700", color: Colors.text },
  ratingName: { fontSize: 13, fontWeight: "600", color: Colors.text },
  tierBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, borderWidth: 1, marginTop: 2 },
  tierBadgeText: { fontSize: 9, fontWeight: "600", letterSpacing: 0.3 },
  ratingScoreBox: { alignItems: "flex-end", gap: 1 },
  ratingScore: { fontSize: 17, fontWeight: "700", color: Colors.text, letterSpacing: -0.5 },
  ratingWeight: { fontSize: 10, color: Colors.textTertiary },
  ratingTime: { fontSize: 9, color: Colors.textTertiary },
  ratingSubScores: { flexDirection: "row", gap: 14 },
  ratingSubItem: { alignItems: "center", gap: 2 },
  ratingSubLabel: { fontSize: 9, color: Colors.textTertiary },
  ratingSubVal: { fontSize: 13, fontWeight: "600", color: Colors.text },
  ratingComment: { fontSize: 12, color: Colors.textSecondary, fontStyle: "italic", lineHeight: 17 },

  photoGalleryEmpty: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 24,
    alignItems: "center", justifyContent: "center", gap: 6,
    borderWidth: 1, borderColor: Colors.border, borderStyle: "dashed",
  },
  photoGalleryEmptyText: { fontSize: 13, color: Colors.textSecondary, fontWeight: "500" },
  photoGalleryEmptyHint: { fontSize: 11, color: Colors.textTertiary },

  claimCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 12,
    borderWidth: 1, borderColor: Colors.blue,
  },
  claimContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  claimTextWrap: { flex: 1 },
  claimTitle: { fontSize: 14, fontWeight: "600", color: Colors.text },
  claimDesc: { fontSize: 11, color: Colors.textSecondary, lineHeight: 16, marginTop: 2 },
  claimBtn: {
    backgroundColor: Colors.blueFaint, borderRadius: 10,
    paddingVertical: 10, alignItems: "center",
    borderWidth: 1, borderColor: Colors.blue,
  },
  claimBtnText: { fontSize: 13, fontWeight: "600", color: Colors.blue },

  reportLink: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 16, marginTop: 4,
  },
  reportLinkText: { fontSize: 11, color: Colors.textTertiary },
});

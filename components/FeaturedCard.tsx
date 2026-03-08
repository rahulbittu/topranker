import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { BRAND, getCategoryDisplay } from "@/constants/brand";
import { hapticPress } from "@/lib/audio";

export interface FeaturedBusiness {
  id: string;
  name: string;
  slug: string;
  category: string;
  photoUrl?: string;
  weightedScore: number;
  tagline: string;
  totalRatings: number;
}

// Mock featured data — in production, fetched from API
export const MOCK_FEATURED: FeaturedBusiness[] = [
  {
    id: "featured-1",
    name: "Pecan Lodge",
    slug: "pecan-lodge",
    category: "bbq",
    photoUrl: undefined,
    weightedScore: 4.7,
    tagline: "Award-winning BBQ in Deep Ellum",
    totalRatings: 142,
  },
];

export function FeaturedCard({ business }: { business: FeaturedBusiness }) {
  const catDisplay = getCategoryDisplay(business.category);

  return (
    <Animated.View entering={FadeInDown.delay(50).duration(400)}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          hapticPress();
          router.push({ pathname: "/business/[id]", params: { id: business.slug } });
        }}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Featured: ${business.name}, ${business.tagline}`}
      >
        {/* Photo or gradient background */}
        {business.photoUrl ? (
          <Image
            source={{ uri: business.photoUrl }}
            style={styles.photo}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <LinearGradient
            colors={[BRAND.colors.amber, "#A67C15"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.photo}
          >
            <Text style={styles.photoInitial}>{business.name.charAt(0)}</Text>
          </LinearGradient>
        )}

        {/* Content overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.75)"]}
          style={styles.overlay}
        >
          {/* Promoted label */}
          <View style={styles.promotedBadge}>
            <Ionicons name="megaphone-outline" size={10} color={BRAND.colors.amber} />
            <Text style={styles.promotedText}>PROMOTED</Text>
          </View>

          <View style={styles.contentRow}>
            <View style={styles.contentLeft}>
              <Text style={styles.name} numberOfLines={1}>{business.name}</Text>
              <Text style={styles.tagline} numberOfLines={1}>{business.tagline}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.category}>{catDisplay.emoji} {catDisplay.label}</Text>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.ratings}>{business.totalRatings} ratings</Text>
              </View>
            </View>
            <View style={styles.scoreWrap}>
              <Text style={styles.score}>{business.weightedScore.toFixed(1)}</Text>
              <Text style={styles.scoreLabel}>score</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Featured section with header and card.
 * Returns null if no featured businesses.
 */
export function FeaturedSection({ featured }: { featured: FeaturedBusiness[] }) {
  if (featured.length === 0) return null;

  return (
    <View style={styles.section}>
      {featured.map((biz) => (
        <FeaturedCard key={biz.id} business={biz} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  card: {
    height: 160,
    borderRadius: 14,
    overflow: "hidden",
    ...Colors.cardShadow,
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitial: {
    fontSize: 48,
    fontWeight: "900",
    color: "rgba(255,255,255,0.3)",
    fontFamily: "PlayfairDisplay_900Black",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: 14,
  },
  promotedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  promotedText: {
    fontSize: 9,
    fontWeight: "800",
    color: BRAND.colors.amber,
    fontFamily: "DMSans_800ExtraBold",
    letterSpacing: 1,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  contentLeft: { flex: 1, gap: 2 },
  name: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    fontFamily: "PlayfairDisplay_900Black",
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "DMSans_400Regular",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  category: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "DMSans_500Medium",
  },
  dot: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
  },
  ratings: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "DMSans_400Regular",
  },
  scoreWrap: {
    alignItems: "center",
    marginLeft: 12,
  },
  score: {
    fontSize: 28,
    fontWeight: "900",
    color: BRAND.colors.amber,
    fontFamily: "PlayfairDisplay_900Black",
    letterSpacing: -1,
  },
  scoreLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "DMSans_400Regular",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

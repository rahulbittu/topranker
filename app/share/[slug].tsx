/**
 * Sprint 618: WhatsApp deep link landing page
 * Renders when someone taps a shared link from WhatsApp.
 * Shows business info, ranking, and CTA to rate or explore.
 * Route: /share/:slug
 */
import React, { useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { BRAND, getRankDisplay, getCategoryDisplay } from "@/constants/brand";
import { AppLogo } from "@/components/Logo";
import { SafeImage } from "@/components/SafeImage";
import { fetchBusiness } from "@/lib/api";
import { Analytics } from "@/lib/analytics";
import { pct } from "@/lib/style-helpers";

const AMBER = BRAND.colors.amber;

export default function ShareLandingScreen() {
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const { data: business, isLoading } = useQuery({
    queryKey: ["business", slug],
    queryFn: () => fetchBusiness(slug!),
    enabled: !!slug,
  });

  useEffect(() => {
    if (slug) Analytics.shareLandingView(slug);
  }, [slug]);

  const handleRate = () => {
    Analytics.shareLandingRateTap(slug!);
    router.push({ pathname: "/rate/[id]", params: { id: slug! } });
  };

  const handleExplore = () => {
    Analytics.shareLandingExploreTap(slug!);
    router.push({ pathname: "/business/[id]", params: { id: slug! } });
  };

  const handleDiscover = () => {
    router.push("/(tabs)/search");
  };

  if (isLoading) {
    return (
      <View style={[s.loading, { paddingTop: topPad + 40 }]}>
        <ActivityIndicator size="large" color={AMBER} />
      </View>
    );
  }

  const photoUrl = business?.photoUrl || business?.photoUrls?.[0];
  const displayCat = business ? getCategoryDisplay(business.category) : null;

  return (
    <ScrollView style={[s.container, { paddingTop: topPad + 20 }]} contentContainerStyle={s.content}>
      <AppLogo size={40} />
      <Text style={s.tagline}>Trustworthy Rankings</Text>

      {business ? (
        <>
          {/* Business card */}
          <View style={s.card}>
            {photoUrl ? (
              <SafeImage uri={photoUrl} style={s.photo} contentFit="cover" category={business.category} />
            ) : (
              <View style={[s.photo, s.photoPlaceholder]}>
                <Text style={s.photoEmoji}>{displayCat?.emoji || "🍽"}</Text>
              </View>
            )}
            <View style={s.cardBody}>
              <Text style={s.bizName}>{business.name}</Text>
              <View style={s.metaRow}>
                <Text style={s.rank}>{getRankDisplay(business.rank)}</Text>
                <Text style={s.sep}>·</Text>
                <Text style={s.score}>{business.weightedScore.toFixed(1)}</Text>
                <Text style={s.sep}>·</Text>
                <Text style={s.cat}>{displayCat?.label}</Text>
              </View>
              {business.ratingCount > 0 && (
                <Text style={s.ratings}>{business.ratingCount} rating{business.ratingCount !== 1 ? "s" : ""}</Text>
              )}
            </View>
          </View>

          {/* Pitch */}
          <Text style={s.pitch}>
            Someone shared this restaurant with you. Think you know better?
          </Text>

          {/* CTAs */}
          <TouchableOpacity style={s.primaryCta} onPress={handleRate} activeOpacity={0.85}>
            <Ionicons name="star" size={18} color="#FFF" />
            <Text style={s.primaryCtaText}>Rate This Restaurant</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.secondaryCta} onPress={handleExplore} activeOpacity={0.7}>
            <Ionicons name="information-circle-outline" size={16} color={AMBER} />
            <Text style={s.secondaryCtaText}>View Full Details</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={s.notFound}>
          <Ionicons name="alert-circle-outline" size={40} color={Colors.textTertiary} />
          <Text style={s.notFoundText}>Restaurant not found</Text>
        </View>
      )}

      {/* Discover CTA */}
      <TouchableOpacity style={s.discoverCta} onPress={handleDiscover}>
        <Ionicons name="compass-outline" size={14} color={Colors.textSecondary} />
        <Text style={s.discoverCtaText}>Discover more top-rated restaurants</Text>
      </TouchableOpacity>

      <View style={s.footer}>
        <Text style={s.footerText}>Best In — powered by TopRanker</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F6F3" },
  content: { paddingHorizontal: 24, paddingBottom: 40, alignItems: "center" },
  loading: { flex: 1, backgroundColor: "#F7F6F3", alignItems: "center", justifyContent: "center" },
  tagline: {
    marginTop: 8, fontSize: 12, color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular", letterSpacing: 1,
  },
  card: {
    marginTop: 24, width: pct(100), maxWidth: 420,
    backgroundColor: "#FFF", borderRadius: 16, overflow: "hidden",
    ...Colors.cardShadow,
  },
  photo: { width: pct(100), height: 180 },
  photoPlaceholder: {
    backgroundColor: Colors.surfaceRaised, alignItems: "center", justifyContent: "center",
  },
  photoEmoji: { fontSize: 48 },
  cardBody: { padding: 16, gap: 6 },
  bizName: {
    fontSize: 20, fontWeight: "800", color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  rank: { fontSize: 14, fontWeight: "700", color: AMBER, fontFamily: "DMSans_700Bold" },
  sep: { fontSize: 10, color: Colors.textTertiary },
  score: { fontSize: 14, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold" },
  cat: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  ratings: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  pitch: {
    marginTop: 20, fontSize: 15, color: Colors.textSecondary,
    textAlign: "center", lineHeight: 22, fontFamily: "DMSans_400Regular",
    maxWidth: 340,
  },
  primaryCta: {
    marginTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: AMBER, paddingVertical: 16, paddingHorizontal: 32,
    borderRadius: 14, width: pct(100), maxWidth: 380,
  },
  primaryCtaText: { fontSize: 17, fontWeight: "800", color: "#FFF", fontFamily: "DMSans_700Bold" },
  secondaryCta: {
    marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12,
  },
  secondaryCtaText: { fontSize: 14, fontWeight: "600", color: AMBER, fontFamily: "DMSans_600SemiBold" },
  notFound: { marginTop: 40, alignItems: "center", gap: 12 },
  notFoundText: { fontSize: 16, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  discoverCta: {
    marginTop: 24, flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 10, paddingHorizontal: 16,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    backgroundColor: "#FFF",
  },
  discoverCtaText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  footer: { marginTop: 32 },
  footerText: { fontSize: 11, color: "#BBB", textAlign: "center" },
});

/**
 * Sprint 213: Marketing / About Page
 * Public landing page accessible at /about — serves as marketing overview.
 * Owner: Leo Hernandez (Frontend) + Jasmine Taylor (Marketing)
 */

import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

const FEATURES = [
  {
    icon: "shield-checkmark-outline",
    title: "Trust-Weighted Rankings",
    description: "Not all votes are equal. Experienced reviewers carry more influence, creating rankings that reflect real quality.",
  },
  {
    icon: "trending-up-outline",
    title: "Credibility Tiers",
    description: "Build your reputation through consistent, honest ratings. Watch your influence grow as you advance.",
  },
  {
    icon: "trophy-outline",
    title: "Challenger Battles",
    description: "Head-to-head restaurant competitions. Vote for your favorite and see how the community ranks them.",
  },
  {
    icon: "people-outline",
    title: "Trust Network",
    description: "Invite friends who care about honest rankings. More trusted reviewers = better rankings for everyone.",
  },
];

const HOW_IT_WORKS = [
  { step: "1", text: "Rate restaurants you've actually visited" },
  { step: "2", text: "Build credibility through honest, consistent reviews" },
  { step: "3", text: "Your influence grows as you advance through tiers" },
  { step: "4", text: "Discover the best restaurants ranked by people who know food" },
];

export default function AboutPage() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About TopRanker</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Rankings You Can Trust</Text>
          <Text style={styles.heroSubtitle}>
            The restaurant ranking app where your honest opinion actually matters.
            No fake reviews. No pay-to-play. Just trust-weighted rankings powered
            by community credibility.
          </Text>
        </View>

        {/* Features */}
        <Text style={styles.sectionTitle}>Why TopRanker?</Text>
        {FEATURES.map((feature) => (
          <View key={feature.title} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name={feature.icon as IoniconsName} size={24} color={BRAND.colors.amber} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}

        {/* How It Works */}
        <Text style={styles.sectionTitle}>How It Works</Text>
        {HOW_IT_WORKS.map((item) => (
          <View key={item.step} style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>{item.step}</Text>
            </View>
            <Text style={styles.stepText}>{item.text}</Text>
          </View>
        ))}

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to join?</Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push("/auth/signup")}
            accessibilityRole="button"
            accessibilityLabel="Sign up for TopRanker"
          >
            <Text style={styles.ctaButtonText}>Get Started</Text>
          </TouchableOpacity>
          <Text style={styles.ctaSubtext}>Free to join. Your taste matters.</Text>
        </View>

        {/* Trust message */}
        <View style={styles.trustRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.trustText}>
            Built with integrity. No fake reviews, no paid rankings, no spam.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  content: { paddingHorizontal: 16, paddingTop: 20, gap: 16 },
  hero: {
    backgroundColor: BRAND.colors.navy,
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    fontFamily: "PlayfairDisplay_900Black",
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
    marginTop: 8,
  },
  featureCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    ...Colors.cardShadow,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${BRAND.colors.amber}12`,
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: { flex: 1, gap: 4 },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },
  featureDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    lineHeight: 20,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 8,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND.colors.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "DMSans_700Bold",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontFamily: "DMSans_400Regular",
    lineHeight: 22,
  },
  ctaSection: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 12,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_900Black",
  },
  ctaButton: {
    backgroundColor: BRAND.colors.amber,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "DMSans_700Bold",
  },
  ctaSubtext: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    paddingVertical: 12,
  },
  trustText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
});

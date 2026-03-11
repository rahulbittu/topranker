/**
 * Sprint 653: Public Pricing Page
 * Marketing-oriented page showing all business tiers (Free, Pro, Featured).
 * Accessible without auth — drives conversion for business owners.
 */
import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { PRICING } from "@/shared/pricing";
import { TypedIcon } from "@/components/TypedIcon";

const AMBER = BRAND.colors.amber;

interface TierCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  highlight?: boolean;
  ctaText: string;
  onPress: () => void;
}

function TierCard({ name, price, period, description, features, highlight, ctaText, onPress }: TierCardProps) {
  return (
    <View style={[s.tierCard, highlight && s.tierCardHighlight]}>
      {highlight && (
        <View style={s.popularBadge}>
          <Text style={s.popularBadgeText}>MOST POPULAR</Text>
        </View>
      )}
      <Text style={[s.tierName, highlight && s.tierNameHighlight]}>{name}</Text>
      <View style={s.tierPriceRow}>
        <Text style={[s.tierPrice, highlight && s.tierPriceHighlight]}>{price}</Text>
        {period ? <Text style={s.tierPeriod}>{period}</Text> : null}
      </View>
      <Text style={s.tierDesc}>{description}</Text>
      <View style={s.tierDivider} />
      {features.map((f, i) => (
        <View key={i} style={s.featureRow}>
          <Ionicons
            name={f.included ? "checkmark-circle" : "close-circle"}
            size={16}
            color={f.included ? (highlight ? AMBER : Colors.green) : Colors.textTertiary}
          />
          <Text style={[s.featureText, !f.included && s.featureTextDisabled]}>{f.text}</Text>
        </View>
      ))}
      <TouchableOpacity
        style={[s.tierBtn, highlight && s.tierBtnHighlight]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={[s.tierBtnText, highlight && s.tierBtnTextHighlight]}>{ctaText}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PricingScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.navTitle}>Pricing</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.heroTitle}>Grow Your Business on TopRanker</Text>
        <Text style={s.heroSub}>
          Join the trusted ranking platform. From free analytics to premium visibility — choose the plan that fits your business.
        </Text>

        <TierCard
          name="Free"
          price="$0"
          period=""
          description="Claim your business and track basic analytics."
          features={[
            { text: "Business claim & verification", included: true },
            { text: "Basic rating analytics", included: true },
            { text: "Score trends (7 days)", included: true },
            { text: "Update business hours", included: true },
            { text: "Full review notes", included: false },
            { text: "Dimension breakdowns", included: false },
            { text: "Competitor insights", included: false },
            { text: "Priority support", included: false },
          ]}
          ctaText="Claim Your Business"
          onPress={() => router.push("/(tabs)/search")}
        />

        <TierCard
          name="Dashboard Pro"
          price={`$${PRICING.dashboardPro.amountCents / 100}`}
          period="/month"
          description="Advanced analytics, full review notes, and priority support."
          highlight
          features={[
            { text: "Everything in Free", included: true },
            { text: "Full review text & notes", included: true },
            { text: "Dimension score breakdowns", included: true },
            { text: "Visit type distribution", included: true },
            { text: "Weekly & monthly trends", included: true },
            { text: "Competitor benchmarking", included: true },
            { text: "Export reports (CSV)", included: true },
            { text: "Priority support (24hr)", included: true },
          ]}
          ctaText="Get Started"
          onPress={() => router.push("/(tabs)/search")}
        />

        <TierCard
          name="Featured Placement"
          price={`$${PRICING.featuredPlacement.amountCents / 100}`}
          period="/week"
          description="Premium visibility in search results and rankings."
          features={[
            { text: "Everything in Dashboard Pro", included: true },
            { text: "Featured card in Discover tab", included: true },
            { text: "Highlighted in search results", included: true },
            { text: "Priority in category rankings", included: true },
            { text: "Custom business spotlight", included: true },
          ]}
          ctaText="Contact Sales"
          onPress={() => router.push("/feedback")}
        />

        <View style={s.faqSection}>
          <Text style={s.faqTitle}>Common Questions</Text>

          <View style={s.faqCard}>
            <Text style={s.faqQ}>Can I cancel anytime?</Text>
            <Text style={s.faqA}>Yes. Dashboard Pro is month-to-month with no commitment. Cancel from your dashboard and keep access until the end of your billing period.</Text>
          </View>

          <View style={s.faqCard}>
            <Text style={s.faqQ}>Does Pro affect my ranking?</Text>
            <Text style={s.faqA}>No. Rankings are based entirely on ratings and our integrity algorithm. Pro only unlocks analytics — it never influences ranking position.</Text>
          </View>

          <View style={s.faqCard}>
            <Text style={s.faqQ}>How does business verification work?</Text>
            <Text style={s.faqA}>Claim your business, then verify via a 6-digit code sent to your business email. Verification is free and unlocks the owner dashboard.</Text>
          </View>
        </View>

        <View style={s.securityRow}>
          <Ionicons name="lock-closed" size={12} color={Colors.textTertiary} />
          <Text style={s.securityText}>All payments secured by Stripe</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  navBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 8,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceRaised, alignItems: "center", justifyContent: "center",
  },
  navTitle: {
    fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 20 },

  heroTitle: {
    fontSize: 28, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5,
    textAlign: "center", marginTop: 12,
  },
  heroSub: {
    fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    textAlign: "center", lineHeight: 20,
  },

  // Tier cards
  tierCard: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 16, padding: 20, gap: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  tierCardHighlight: {
    borderColor: AMBER, borderWidth: 2,
    backgroundColor: `${AMBER}08`,
  },
  popularBadge: {
    alignSelf: "center", backgroundColor: AMBER, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 3, marginTop: -4, marginBottom: 4,
  },
  popularBadgeText: {
    fontSize: 9, fontWeight: "800", color: "#fff",
    fontFamily: "DMSans_800ExtraBold", letterSpacing: 0.8,
  },
  tierName: {
    fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold",
  },
  tierNameHighlight: { color: AMBER },
  tierPriceRow: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  tierPrice: {
    fontSize: 36, fontWeight: "900", color: Colors.text,
    fontFamily: "PlayfairDisplay_900Black", letterSpacing: -1,
  },
  tierPriceHighlight: { color: AMBER },
  tierPeriod: { fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  tierDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 18 },
  tierDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontSize: 13, color: Colors.text, fontFamily: "DMSans_400Regular", flex: 1 },
  featureTextDisabled: { color: Colors.textTertiary },
  tierBtn: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 12, paddingVertical: 14,
    alignItems: "center", marginTop: 8, borderWidth: 1, borderColor: Colors.border,
  },
  tierBtnHighlight: { backgroundColor: AMBER, borderColor: AMBER },
  tierBtnText: { fontSize: 14, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  tierBtnTextHighlight: { color: "#fff" },

  // FAQ
  faqSection: { gap: 12, marginTop: 8 },
  faqTitle: { fontSize: 20, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  faqCard: { backgroundColor: Colors.surfaceRaised, borderRadius: 12, padding: 16, gap: 6 },
  faqQ: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  faqA: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 18 },

  securityRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    marginTop: 4,
  },
  securityText: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
});

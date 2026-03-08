import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TypedIcon } from "@/components/TypedIcon";
import { useAuth } from "@/lib/auth-context";
import { getApiUrl } from "@/lib/query-client";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { PRICING } from "@/shared/pricing";

export default function EnterChallengerScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { name, slug } = useLocalSearchParams<{ name: string; slug: string }>();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const [confirmed, setConfirmed] = useState(false);
  const [processing, setProcessing] = useState(false);

  if (!user) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: topPad }]}>
        <Ionicons name="lock-closed-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.signInText}>Sign in to enter a challenge</Text>
        <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push("/auth/login")} activeOpacity={0.85}>
          <Text style={styles.ctaBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (confirmed) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: topPad }]}>
        <View style={styles.successCircle}>
          <Ionicons name="flash" size={36} color="#FFFFFF" />
        </View>
        <Text style={styles.successTitle}>Challenge Entry Confirmed!</Text>
        <Text style={styles.successSub}>
          {name || "Your business"} is now in a 30-day head-to-head challenge.{"\n"}Results are driven by community-weighted votes.
        </Text>
        <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push("/(tabs)/challenger")} activeOpacity={0.85}>
          <Text style={styles.ctaBtnText}>View Live Challenges</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePayment = async () => {
    setProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const res = await fetch(`${getApiUrl()}/api/payments/challenger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ businessName: name || "Business", slug }),
      });
      const json = await res.json();
      if (!res.ok) {
        Alert.alert("Payment Error", json.error || "Payment failed");
        setProcessing(false);
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setConfirmed(true);
    } catch {
      Alert.alert("Error", "Network error — please try again");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Enter Challenge</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[BRAND.colors.navy, BRAND.colors.navyDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroEmoji}>⚡</Text>
          <Text style={styles.heroTitle}>30-Day Challenge</Text>
          <Text style={styles.heroSub}>{name || "Your Business"} vs the #1 Ranked</Text>
          <View style={styles.heroDivider} />
          <Text style={styles.heroPrice}>{PRICING.challenger.displayAmount}</Text>
          <Text style={styles.heroPriceSub}>one-time entry fee</Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          {[
            { num: "1", title: "Challenge begins", desc: "Your business is matched against the current #1 in your category" },
            { num: "2", title: "Community votes", desc: "TopRanker members cast trust-weighted votes over 30 days" },
            { num: "3", title: "Winner announced", desc: "The business with more weighted votes wins the challenge" },
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{step.num}</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You Get</Text>
          {[
            { icon: "flash-outline", text: "Featured placement on the Challenger tab for 30 days" },
            { icon: "people-outline", text: "Exposure to all TopRanker community members in your city" },
            { icon: "share-social-outline", text: "Shareable challenge card for social media marketing" },
            { icon: "trophy-outline", text: "Winner badge if you defeat the #1 ranked business" },
            { icon: "analytics-outline", text: "Real-time vote tracking and community engagement metrics" },
          ].map((item, i) => (
            <View key={i} style={styles.benefitRow}>
              <TypedIcon name={item.icon} size={18} color={BRAND.colors.amber} />
              <Text style={styles.benefitText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{PRICING.challenger.label} (30 days)</Text>
            <Text style={styles.priceValue}>{`$${(PRICING.challenger.amountCents / 100).toFixed(2)}`}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabelBold}>Total</Text>
            <Text style={styles.priceValueBold}>{`$${(PRICING.challenger.amountCents / 100).toFixed(2)}`}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.payBtn, processing && styles.payBtnProcessing]}
          onPress={handlePayment}
          activeOpacity={0.85}
          disabled={processing}
        >
          <Ionicons name="card-outline" size={18} color="#FFFFFF" />
          <Text style={styles.payBtnText}>
            {processing ? "Processing..." : `Pay ${PRICING.challenger.displayAmount} — Enter Challenge`}
          </Text>
        </TouchableOpacity>

        <View style={styles.securityRow}>
          <Ionicons name="lock-closed" size={12} color={Colors.textTertiary} />
          <Text style={styles.securityText}>Secured by Stripe. Your payment info is never stored on our servers.</Text>
        </View>

        <Text style={styles.disclaimer}>
          By purchasing, you agree to TopRanker's Terms of Service. Challenge results are determined by community-weighted votes and cannot be influenced by payment.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
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

  // Hero card
  heroCard: { borderRadius: 20, padding: 28, alignItems: "center", gap: 4 },
  heroEmoji: { fontSize: 40, marginBottom: 4 },
  heroTitle: {
    fontSize: 26, fontWeight: "900", color: "#FFFFFF",
    fontFamily: "PlayfairDisplay_900Black", letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 14, color: "rgba(255,255,255,0.6)", fontFamily: "DMSans_400Regular",
  },
  heroDivider: {
    width: 40, height: 1, backgroundColor: "rgba(196,154,26,0.4)", marginVertical: 12,
  },
  heroPrice: {
    fontSize: 48, fontWeight: "900", color: BRAND.colors.amber,
    fontFamily: "PlayfairDisplay_900Black", letterSpacing: -2,
  },
  heroPriceSub: {
    fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "DMSans_400Regular",
    textTransform: "uppercase" as const, letterSpacing: 1,
  },

  // Sections
  section: { gap: 12 },
  sectionTitle: {
    fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold",
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  stepNum: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: BRAND.colors.amber,
    alignItems: "center", justifyContent: "center",
  },
  stepNumText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", fontFamily: "DMSans_700Bold" },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  stepDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", marginTop: 2 },

  benefitRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  benefitText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", flex: 1 },

  // Price breakdown
  priceBreakdown: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 16, gap: 10,
  },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceLabel: { fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  priceValue: { fontSize: 14, color: Colors.text, fontFamily: "DMSans_500Medium" },
  priceDivider: { height: 1, backgroundColor: Colors.border },
  priceLabelBold: { fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  priceValueBold: { fontSize: 18, fontWeight: "800", color: Colors.text, fontFamily: "DMSans_800ExtraBold" },

  // Payment button
  payBtn: {
    backgroundColor: BRAND.colors.amber, borderRadius: 14, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  payBtnProcessing: { opacity: 0.7 },
  payBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "DMSans_700Bold" },

  securityRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  securityText: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  signInText: {
    fontSize: 16, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    marginTop: 12, marginBottom: 20,
  },
  ctaBtn: {
    backgroundColor: BRAND.colors.navy, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32,
    alignItems: "center", justifyContent: "center",
  },
  ctaBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "DMSans_700Bold" },

  successCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: BRAND.colors.amber,
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  successTitle: {
    fontSize: 24, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", marginBottom: 8,
  },
  successSub: {
    fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    textAlign: "center", lineHeight: 20, marginBottom: 24,
  },

  disclaimer: {
    fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textAlign: "center", lineHeight: 15,
  },
});

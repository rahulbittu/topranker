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

export default function EnterFeaturedScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { name, slug, city } = useLocalSearchParams<{ name: string; slug: string; city: string }>();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const [confirmed, setConfirmed] = useState(false);
  const [processing, setProcessing] = useState(false);

  if (!user) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: topPad }]}>
        <Ionicons name="lock-closed-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.signInText}>Sign in to purchase featured placement</Text>
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
          <Ionicons name="megaphone" size={36} color="#FFFFFF" />
        </View>
        <Text style={styles.successTitle}>Featured Placement Active!</Text>
        <Text style={styles.successSub}>
          {name || "Your business"} is now featured in {city || "your city"} rankings.{"\n"}
          Placement runs for 7 days with priority visibility.
        </Text>
        <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push("/(tabs)")} activeOpacity={0.85}>
          <Text style={styles.ctaBtnText}>View Rankings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePayment = async () => {
    setProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const res = await fetch(`${getApiUrl()}/api/payments/featured`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ slug }),
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
        <Text style={styles.navTitle}>Featured Placement</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[BRAND.colors.amber, "#A87D15"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroEmoji}>📣</Text>
          <Text style={styles.heroTitle}>Featured Placement</Text>
          <Text style={styles.heroSub}>{name || "Your Business"} in {city || "Your City"}</Text>
          <View style={styles.heroDivider} />
          <Text style={styles.heroPrice}>$199</Text>
          <Text style={styles.heroPriceSub}>per week</Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How Featured Works</Text>
          {[
            { num: "1", title: "Instant activation", desc: "Your business appears at the top of search and rankings in your city" },
            { num: "2", title: "7-day placement", desc: "Featured badge and priority position for a full week" },
            { num: "3", title: "Organic trust", desc: "Your actual ratings and trust score are always visible — no fake inflation" },
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
          <Text style={styles.sectionTitle}>What's Included</Text>
          {[
            { icon: "megaphone-outline", text: '"PROMOTED" badge on your listing across all rankings' },
            { icon: "trending-up-outline", text: "Priority placement at top of category and city searches" },
            { icon: "eye-outline", text: "3-5x more visibility than standard listings" },
            { icon: "bar-chart-outline", text: "Featured analytics showing impressions and click-throughs" },
            { icon: "shield-checkmark-outline", text: "Trust score displayed prominently — builds credibility" },
          ].map((item, i) => (
            <View key={i} style={styles.benefitRow}>
              <TypedIcon name={item.icon} size={18} color={BRAND.colors.navy} />
              <Text style={styles.benefitText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.trustNote}>
          <Ionicons name="information-circle-outline" size={16} color={BRAND.colors.amber} />
          <Text style={styles.trustNoteText}>
            Featured placement increases visibility, not your trust score.
            Rankings remain 100% community-driven.
          </Text>
        </View>

        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Featured Placement (7 days)</Text>
            <Text style={styles.priceValue}>$199.00</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabelBold}>Total</Text>
            <Text style={styles.priceValueBold}>$199.00</Text>
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
            {processing ? "Processing..." : "Pay $199 — Get Featured"}
          </Text>
        </TouchableOpacity>

        <View style={styles.securityRow}>
          <Ionicons name="lock-closed" size={12} color={Colors.textTertiary} />
          <Text style={styles.securityText}>Secured by Stripe. Your payment info is never stored on our servers.</Text>
        </View>

        <Text style={styles.disclaimer}>
          By purchasing, you agree to TopRanker's Terms of Service. Featured placement enhances visibility only — trust scores and rankings remain determined by community-weighted votes.
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

  heroCard: { borderRadius: 20, padding: 28, alignItems: "center", gap: 4 },
  heroEmoji: { fontSize: 40, marginBottom: 4 },
  heroTitle: {
    fontSize: 26, fontWeight: "900", color: "#FFFFFF",
    fontFamily: "PlayfairDisplay_900Black", letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 14, color: "rgba(255,255,255,0.8)", fontFamily: "DMSans_400Regular",
  },
  heroDivider: {
    width: 40, height: 1, backgroundColor: "rgba(255,255,255,0.3)", marginVertical: 12,
  },
  heroPrice: {
    fontSize: 48, fontWeight: "900", color: "#FFFFFF",
    fontFamily: "PlayfairDisplay_900Black", letterSpacing: -2,
  },
  heroPriceSub: {
    fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "DMSans_400Regular",
    textTransform: "uppercase" as const, letterSpacing: 1,
  },

  section: { gap: 12 },
  sectionTitle: {
    fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold",
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  stepNum: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: BRAND.colors.navy,
    alignItems: "center", justifyContent: "center",
  },
  stepNumText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", fontFamily: "DMSans_700Bold" },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  stepDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", marginTop: 2 },

  benefitRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  benefitText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", flex: 1 },

  trustNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "rgba(196,154,26,0.08)", borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: "rgba(196,154,26,0.15)",
  },
  trustNoteText: {
    fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    flex: 1, lineHeight: 18,
  },

  priceBreakdown: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 16, gap: 10,
  },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceLabel: { fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  priceValue: { fontSize: 14, color: Colors.text, fontFamily: "DMSans_500Medium" },
  priceDivider: { height: 1, backgroundColor: Colors.border },
  priceLabelBold: { fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  priceValueBold: { fontSize: 18, fontWeight: "800", color: Colors.text, fontFamily: "DMSans_800ExtraBold" },

  payBtn: {
    backgroundColor: BRAND.colors.navy, borderRadius: 14, paddingVertical: 16,
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

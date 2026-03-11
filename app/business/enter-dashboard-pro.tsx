import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Alert, Linking,
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

export default function EnterDashboardProScreen() {
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
        <Text style={styles.signInText}>Sign in to upgrade to Dashboard Pro</Text>
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
          <Ionicons name="speedometer" size={36} color="#FFFFFF" />
        </View>
        <Text style={styles.successTitle}>Dashboard Pro Active!</Text>
        <Text style={styles.successSub}>
          {name || "Your business"} now has access to advanced analytics,{"\n"}competitor insights, and priority support.
        </Text>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.push({ pathname: "/business/dashboard", params: { slug } })}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>Open Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePayment = async () => {
    setProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const res = await fetch(`${getApiUrl()}/api/payments/dashboard-pro`, {
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
      // Sprint 653: Redirect to Stripe Checkout in production, confirm in dev (mock)
      if (json.data?.url) {
        if (Platform.OS === "web") {
          window.location.href = json.data.url;
        } else {
          await Linking.openURL(json.data.url);
        }
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
        <Text style={styles.navTitle}>Dashboard Pro</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#1A365D", BRAND.colors.navy]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroEmoji}>📊</Text>
          <Text style={styles.heroTitle}>Dashboard Pro</Text>
          <Text style={styles.heroSub}>{name || "Your Business"}</Text>
          <View style={styles.heroDivider} />
          <Text style={styles.heroPrice}>{`$${PRICING.dashboardPro.amountCents / 100}`}</Text>
          <Text style={styles.heroPriceSub}>per month</Text>
        </LinearGradient>

        <View style={styles.comparisonCard}>
          <Text style={styles.comparisonTitle}>Free vs Pro</Text>
          <View style={styles.comparisonHeader}>
            <Text style={styles.comparisonFeature}>Feature</Text>
            <Text style={styles.comparisonFree}>Free</Text>
            <Text style={styles.comparisonPro}>Pro</Text>
          </View>
          {[
            { feature: "Basic analytics", free: true, pro: true },
            { feature: "Rating trends", free: true, pro: true },
            { feature: "Competitor comparison", free: false, pro: true },
            { feature: "Customer demographics", free: false, pro: true },
            { feature: "Export reports (CSV)", free: false, pro: true },
            { feature: "Priority support", free: false, pro: true },
          ].map((row, i) => (
            <View key={i} style={styles.comparisonRow}>
              <Text style={styles.comparisonFeatureText}>{row.feature}</Text>
              <Ionicons
                name={row.free ? "checkmark-circle" : "close-circle"}
                size={16}
                color={row.free ? Colors.green : Colors.textTertiary}
                style={styles.comparisonCheck}
              />
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={BRAND.colors.amber}
                style={styles.comparisonCheck}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Included</Text>
          {[
            { icon: "bar-chart-outline", text: "Advanced analytics with weekly and monthly trends" },
            { icon: "people-outline", text: "Customer demographics — who's rating your business" },
            { icon: "git-compare-outline", text: "Competitor benchmarking against top 5 in your category" },
            { icon: "download-outline", text: "Export detailed reports to CSV for your records" },
            { icon: "headset-outline", text: "Priority email support with 24-hour response time" },
          ].map((item, i) => (
            <View key={i} style={styles.benefitRow}>
              <TypedIcon name={item.icon} size={18} color={BRAND.colors.amber} />
              <Text style={styles.benefitText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{PRICING.dashboardPro.label} (monthly)</Text>
            <Text style={styles.priceValue}>{`$${(PRICING.dashboardPro.amountCents / 100).toFixed(2)}`}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabelBold}>Total today</Text>
            <Text style={styles.priceValueBold}>{`$${(PRICING.dashboardPro.amountCents / 100).toFixed(2)}`}</Text>
          </View>
          <Text style={styles.renewalNote}>Renews monthly. Cancel anytime.</Text>
        </View>

        <TouchableOpacity
          style={[styles.payBtn, processing && styles.payBtnProcessing]}
          onPress={handlePayment}
          activeOpacity={0.85}
          disabled={processing}
        >
          <Ionicons name="card-outline" size={18} color="#FFFFFF" />
          <Text style={styles.payBtnText}>
            {processing ? "Processing..." : `Subscribe — ${PRICING.dashboardPro.displayAmount}`}
          </Text>
        </TouchableOpacity>

        <View style={styles.securityRow}>
          <Ionicons name="lock-closed" size={12} color={Colors.textTertiary} />
          <Text style={styles.securityText}>Secured by Stripe. Cancel anytime from your dashboard.</Text>
        </View>

        <Text style={styles.disclaimer}>
          By subscribing, you agree to TopRanker's Terms of Service. Your subscription will automatically renew each month until cancelled. Pro features are additive — your free dashboard features remain available.
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

  comparisonCard: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 16, gap: 8,
  },
  comparisonTitle: {
    fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold",
    marginBottom: 4,
  },
  comparisonHeader: {
    flexDirection: "row", alignItems: "center", paddingBottom: 6,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  comparisonFeature: {
    flex: 1, fontSize: 11, fontWeight: "600", color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold", textTransform: "uppercase" as const, letterSpacing: 0.5,
  },
  comparisonFree: {
    width: 44, textAlign: "center", fontSize: 11, fontWeight: "600",
    color: Colors.textTertiary, fontFamily: "DMSans_600SemiBold",
    textTransform: "uppercase" as const,
  },
  comparisonPro: {
    width: 44, textAlign: "center", fontSize: 11, fontWeight: "700",
    color: BRAND.colors.amber, fontFamily: "DMSans_700Bold",
    textTransform: "uppercase" as const,
  },
  comparisonRow: {
    flexDirection: "row", alignItems: "center", paddingVertical: 6,
  },
  comparisonFeatureText: {
    flex: 1, fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
  comparisonCheck: { width: 44, textAlign: "center" },

  section: { gap: 12 },
  sectionTitle: {
    fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold",
  },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  benefitText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", flex: 1 },

  priceBreakdown: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 16, gap: 10,
  },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceLabel: { fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  priceValue: { fontSize: 14, color: Colors.text, fontFamily: "DMSans_500Medium" },
  priceDivider: { height: 1, backgroundColor: Colors.border },
  priceLabelBold: { fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  priceValueBold: { fontSize: 18, fontWeight: "800", color: Colors.text, fontFamily: "DMSans_800ExtraBold" },
  renewalNote: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textAlign: "center", marginTop: 2,
  },

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

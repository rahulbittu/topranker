/**
 * Sprint 196: Beta join landing page.
 * Receives ?ref=CODE from invite email links.
 * Shows branded welcome, trust pitch, and directs to signup with referral code pre-filled.
 */
import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { AppLogo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";

const AMBER = BRAND.colors.amber;

export default function JoinScreen() {
  const insets = useSafeAreaInsets();
  const { ref } = useLocalSearchParams<{ ref?: string }>();
  const { user } = useAuth();
  const [referralCode] = useState(ref || "");
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  // If already logged in, go to home
  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user]);

  const handleJoin = () => {
    router.push(`/auth/signup${referralCode ? `?ref=${encodeURIComponent(referralCode)}` : ""}`);
  };

  const handleLogin = () => {
    router.push("/auth/login");
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: topPad + 20 }]} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.heroSection}>
        <AppLogo size={56} />
        <Text style={styles.betaBadge}>BETA</Text>
        <Text style={styles.heroTitle}>Trust-Weighted Rankings</Text>
        <Text style={styles.heroSubtitle}>
          No fake reviews. No pay-to-play.{"\n"}Your credibility determines your influence.
        </Text>
      </View>

      {/* Referral indicator */}
      {referralCode ? (
        <View style={styles.referralBanner}>
          <Ionicons name="gift-outline" size={18} color={AMBER} />
          <Text style={styles.referralText}>
            Invited with code: <Text style={styles.referralCode}>{referralCode}</Text>
          </Text>
        </View>
      ) : null}

      {/* Value props */}
      <View style={styles.valueSection}>
        <ValueProp
          icon="shield-checkmark-outline"
          title="Credibility Matters"
          description="Your ratings carry more weight as you build trust through consistent, honest reviews."
        />
        <ValueProp
          icon="trophy-outline"
          title="Real Rankings"
          description="Businesses earn their rank. No sponsored listings, no paid placements."
        />
        <ValueProp
          icon="people-outline"
          title="Community Driven"
          description="Join 25 founding beta testers shaping the future of trustworthy reviews."
        />
        <ValueProp
          icon="trending-up-outline"
          title="Your Voice, Amplified"
          description="Rate, challenge, and help your city discover hidden gems."
        />
      </View>

      {/* CTA */}
      <TouchableOpacity style={styles.joinButton} onPress={handleJoin} activeOpacity={0.85}>
        <Text style={styles.joinButtonText}>Create Your Account</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginLink} onPress={handleLogin}>
        <Text style={styles.loginLinkText}>Already have an account? <Text style={styles.loginLinkBold}>Log in</Text></Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>TopRanker Beta — Trustworthy rankings for restaurants</Text>
      </View>
    </ScrollView>
  );
}

function ValueProp({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <View style={styles.valueProp}>
      <View style={styles.valueIcon}>
        <Ionicons name={icon as any} size={22} color={AMBER} />
      </View>
      <View style={styles.valueText}>
        <Text style={styles.valueTitle}>{title}</Text>
        <Text style={styles.valueDesc}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F6F3",
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  betaBadge: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3,
    color: AMBER,
    backgroundColor: "#0D1B2A",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  heroTitle: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: "900",
    color: "#0D1B2A",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    marginTop: 10,
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },
  referralBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8E6E1",
    marginBottom: 24,
  },
  referralText: {
    fontSize: 13,
    color: "#666",
  },
  referralCode: {
    fontWeight: "700",
    color: AMBER,
  },
  valueSection: {
    width: "100%" as any,
    maxWidth: 480,
    marginBottom: 28,
  },
  valueProp: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  valueIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFF8E7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  valueText: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0D1B2A",
    marginBottom: 3,
  },
  valueDesc: {
    fontSize: 13,
    color: "#666",
    lineHeight: 19,
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: AMBER,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: "100%" as any,
    maxWidth: 380,
  },
  joinButtonText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  loginLink: {
    marginTop: 16,
    paddingVertical: 8,
  },
  loginLinkText: {
    fontSize: 14,
    color: "#888",
  },
  loginLinkBold: {
    fontWeight: "700",
    color: AMBER,
  },
  footer: {
    marginTop: 32,
  },
  footerText: {
    fontSize: 11,
    color: "#BBB",
    textAlign: "center",
  },
});

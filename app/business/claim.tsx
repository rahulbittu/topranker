import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { PRICING } from "@/shared/pricing";
import { TypedIcon } from "@/components/TypedIcon";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import * as Haptics from "expo-haptics";

export default function ClaimBusinessScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { name, slug } = useLocalSearchParams<{ name: string; slug: string }>();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [verificationMethod, setVerificationMethod] = useState<"email" | "phone" | "document">("email");
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: topPad }]}>
        <Ionicons name="lock-closed-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.signInText}>Sign in to claim this business</Text>
        <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push("/auth/login")} activeOpacity={0.85}>
          <Text style={styles.ctaBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (submitted) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: topPad }]}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={36} color="#FFFFFF" />
        </View>
        <Text style={styles.successTitle}>Claim Submitted</Text>
        <Text style={styles.successSub}>
          Your claim has been submitted for review. We'll notify you at {user.email} when your claim for {name || "this business"} is approved.
        </Text>
        <TouchableOpacity style={styles.ctaBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.ctaBtnText}>Back to Business</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!role.trim()) {
      Alert.alert("Required", "Please enter your role at this business.");
      return;
    }
    if (!slug) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/businesses/${slug}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          role: role.trim(),
          phone: phone.trim() || undefined,
          businessEmail: businessEmail.trim() || undefined,
          website: website.trim() || undefined,
          verificationMethod,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        Alert.alert("Error", json.error || "Failed to submit claim");
        setSubmitting(false);
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitted(true);
    } catch {
      Alert.alert("Error", "Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Claim Business</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={styles.claimIcon}>
            <Ionicons name="shield-checkmark" size={28} color={BRAND.colors.amber} />
          </View>
          <Text style={styles.title}>Claim {name || "This Business"}</Text>
          <Text style={styles.subtitle}>
            Verified owners get a dashboard with analytics and a verified badge on their listing.
          </Text>
        </View>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Owner Benefits</Text>
          {[
            { icon: "analytics-outline", text: "View rating analytics and trends" },
            { icon: "chatbubble-outline", text: "Respond to community reviews" },
            { icon: "shield-checkmark-outline", text: "Verified Owner badge on listing" },
            { icon: "trending-up-outline", text: "Track ranking position over time" },
            { icon: "megaphone-outline", text: `Enter Challenger events (${PRICING.challenger.displayAmount})` },
          ].map((benefit, i) => (
            <View key={i} style={styles.benefitRow}>
              <TypedIcon name={benefit.icon} size={18} color={BRAND.colors.amber} />
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Verification Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Your Role *</Text>
            <View style={styles.inputRow}>
              <Ionicons name="briefcase-outline" size={16} color={Colors.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="e.g., Owner, General Manager"
                placeholderTextColor={Colors.textTertiary}
                value={role}
                onChangeText={setRole}
                maxLength={50}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Phone (optional)</Text>
            <View style={styles.inputRow}>
              <Ionicons name="call-outline" size={16} color={Colors.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="(214) 555-0100"
                placeholderTextColor={Colors.textTertiary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={20}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Email (optional)</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={16} color={Colors.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="owner@restaurant.com"
                placeholderTextColor={Colors.textTertiary}
                value={businessEmail}
                onChangeText={setBusinessEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={100}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Website (optional)</Text>
            <View style={styles.inputRow}>
              <Ionicons name="globe-outline" size={16} color={Colors.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="https://yourrestaurant.com"
                placeholderTextColor={Colors.textTertiary}
                value={website}
                onChangeText={setWebsite}
                keyboardType="url"
                autoCapitalize="none"
                maxLength={200}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Preferred Verification Method</Text>
            <View style={styles.methodRow}>
              {([
                { key: "email" as const, icon: "mail-outline", label: "Email" },
                { key: "phone" as const, icon: "call-outline", label: "Phone" },
                { key: "document" as const, icon: "document-outline", label: "Document" },
              ]).map(m => (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.methodChip, verificationMethod === m.key && styles.methodChipActive]}
                  onPress={() => { Haptics.selectionAsync(); setVerificationMethod(m.key); }}
                  activeOpacity={0.7}
                >
                  <Ionicons name={m.icon as any} size={14} color={verificationMethod === m.key ? "#fff" : Colors.textSecondary} />
                  <Text style={[styles.methodChipText, verificationMethod === m.key && styles.methodChipTextActive]}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.methodHint}>
              {verificationMethod === "email" && "We'll send a verification code to your business email address."}
              {verificationMethod === "phone" && "We'll call or text the business phone number to verify."}
              {verificationMethod === "document" && "Upload a business license, utility bill, or tax document for verification."}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              Claims are reviewed by our team. Providing a business email or website speeds up verification. You'll be notified at your registered email.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.ctaBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.ctaBtnText}>Submit Claim</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By submitting, you confirm you are authorized to manage this business listing on TopRanker.
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

  headerSection: { alignItems: "center", gap: 8, paddingTop: 8 },
  claimIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "rgba(196,154,26,0.1)", alignItems: "center", justifyContent: "center",
  },
  title: {
    fontSize: 24, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5, textAlign: "center",
  },
  subtitle: {
    fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    textAlign: "center", lineHeight: 20,
  },

  benefitsCard: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 18, gap: 12,
  },
  benefitsTitle: {
    fontSize: 14, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold",
  },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  benefitText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", flex: 1 },

  formSection: { gap: 14 },
  formTitle: {
    fontSize: 14, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold",
  },
  formGroup: { gap: 6 },
  label: {
    fontSize: 12, fontWeight: "600", color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold", letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.surfaceRaised, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  input: {
    flex: 1, fontSize: 15, color: Colors.text, fontFamily: "DMSans_400Regular",
  },

  infoCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "rgba(196,154,26,0.06)", borderRadius: 12, padding: 14,
  },
  infoText: {
    fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    lineHeight: 18, flex: 1,
  },

  ctaBtn: {
    backgroundColor: BRAND.colors.navy, borderRadius: 14, paddingVertical: 16,
    alignItems: "center", justifyContent: "center",
  },
  ctaBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "DMSans_700Bold" },

  signInText: {
    fontSize: 16, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    marginTop: 12, marginBottom: 20,
  },

  successCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.green,
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
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textAlign: "center", lineHeight: 16,
  },
  methodRow: {
    flexDirection: "row", gap: 8,
  },
  methodChip: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, borderRadius: 10,
    backgroundColor: Colors.surfaceRaised,
  },
  methodChipActive: {
    backgroundColor: BRAND.colors.navy,
  },
  methodChipText: {
    fontSize: 12, fontWeight: "600", color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold",
  },
  methodChipTextActive: {
    color: "#FFFFFF",
  },
  methodHint: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    lineHeight: 16, marginTop: 4,
  },
});

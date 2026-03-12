/**
 * Sprint 212: In-app Beta Feedback Form
 * Allows authenticated users to submit structured feedback.
 * Owner: Leo Hernandez (Frontend)
 */

import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Platform, Alert, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { useAuth } from "@/lib/auth-context";
import { getApiUrl } from "@/lib/query-client";
import { hapticPress } from "@/lib/audio";
import { track } from "@/lib/analytics";
import Constants from "expo-constants";

const CATEGORIES = [
  { key: "bug", label: "Bug Report", icon: "bug-outline" },
  { key: "feature", label: "Feature Request", icon: "bulb-outline" },
  { key: "praise", label: "Something Great", icon: "heart-outline" },
  { key: "other", label: "Other", icon: "chatbox-outline" },
] as const;

const RATINGS = [1, 2, 3, 4, 5] as const;

export default function FeedbackScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const [category, setCategory] = useState<string>("other");
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = rating > 0 && message.trim().length > 0 && category;

  // Sprint 719: Device context for better bug reports
  const deviceContext = {
    platform: Platform.OS,
    osVersion: Platform.Version,
    appVersion: Constants.expoConfig?.version || "unknown",
    buildNumber: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || "dev",
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    hapticPress();
    setSubmitting(true);
    try {
      const res = await fetch(getApiUrl() + "/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          rating,
          category,
          message: message.trim(),
          screenContext: "feedback_screen",
          deviceContext,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        track("feedback_submitted" as any, { category, rating });
      } else {
        Alert.alert("Error", "Failed to submit feedback. Please try again.");
      }
    } catch {
      Alert.alert("Error", "Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
          <Text style={styles.successTitle}>Thank You!</Text>
          <Text style={styles.successMessage}>
            Your feedback helps us build a better TopRanker for everyone.
          </Text>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.back()}
            accessibilityRole="button"
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Send Feedback</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Category */}
        <Text style={styles.sectionLabel}>CATEGORY</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryChip, category === cat.key && styles.categoryChipActive]}
              onPress={() => { hapticPress(); setCategory(cat.key); }}
              accessibilityRole="button"
              accessibilityLabel={cat.label}
            >
              <Ionicons
                name={cat.icon as IoniconsName}
                size={18}
                color={category === cat.key ? BRAND.colors.amber : Colors.textSecondary}
              />
              <Text style={[styles.categoryLabel, category === cat.key && styles.categoryLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rating */}
        <Text style={styles.sectionLabel}>HOW ARE WE DOING?</Text>
        <View style={styles.ratingRow}>
          {RATINGS.map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => { hapticPress(); setRating(r); }}
              style={[styles.starBtn, rating >= r && styles.starBtnActive]}
              accessibilityRole="button"
              accessibilityLabel={`${r} star${r > 1 ? "s" : ""}`}
            >
              <Ionicons
                name={rating >= r ? "star" : "star-outline"}
                size={32}
                color={rating >= r ? BRAND.colors.amber : Colors.textTertiary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Message */}
        <Text style={styles.sectionLabel}>YOUR FEEDBACK</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="Tell us what you think..."
          placeholderTextColor={Colors.textTertiary}
          multiline
          maxLength={2000}
          value={message}
          onChangeText={setMessage}
          accessibilityLabel="Feedback message"
        />
        <Text style={styles.charCount}>{message.length}/2000</Text>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
          accessibilityRole="button"
          accessibilityLabel="Submit feedback"
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          )}
        </TouchableOpacity>
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
  content: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textTertiary,
    letterSpacing: 1.2,
    marginTop: 8,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    borderColor: BRAND.colors.amber,
    backgroundColor: `${BRAND.colors.amber}10`,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold",
  },
  categoryLabelActive: {
    color: BRAND.colors.amber,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 8,
  },
  starBtn: {
    padding: 8,
  },
  starBtnActive: {},
  messageInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    fontFamily: "DMSans_400Regular",
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: "right",
  },
  submitButton: {
    backgroundColor: BRAND.colors.amber,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "DMSans_700Bold",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_900Black",
  },
  successMessage: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  doneButton: {
    backgroundColor: BRAND.colors.amber,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginTop: 12,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "DMSans_700Bold",
  },
});

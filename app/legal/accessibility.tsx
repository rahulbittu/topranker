import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const LAST_UPDATED = "March 8, 2026";

const SECTIONS = [
  {
    title: "Our Commitment",
    body: `TopRanker is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.`,
  },
  {
    title: "Standards",
    body: `We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. These guidelines explain how to make web and mobile content more accessible to people with a wide array of disabilities.`,
  },
  {
    title: "Measures Taken",
    body: `- Semantic HTML and ARIA roles in web views
- accessibilityRole and accessibilityLabel on interactive elements
- Sufficient color contrast ratios (WCAG AA minimum 4.5:1)
- Touch targets minimum 44x44 points
- Screen reader support via React Native accessibility API
- Keyboard navigation support on web
- Reduced motion support for users who prefer minimal animation`,
  },
  {
    title: "Known Limitations",
    body: `- Some map interactions may not be fully accessible via screen readers
- Complex data visualizations (charts) may require alternative text descriptions
- Third-party content (Google Maps, Stripe checkout) follows their own accessibility standards

We are actively working to resolve these limitations.`,
  },
  {
    title: "Feedback",
    body: `We welcome your feedback on the accessibility of TopRanker. Please let us know if you encounter accessibility barriers:

Email: accessibility@topranker.com
Response time: Within 5 business days

We will work with you to provide the information or functionality you need through an accessible alternative.`,
  },
  {
    title: "Enforcement",
    body: `If you are not satisfied with our response, you may contact your local accessibility enforcement authority. In the United States, this is the Department of Justice ADA Information Line. In the EU, contact your national equality body.`,
  },
];

export default function AccessibilityStatement() {
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
        <Text style={styles.headerTitle}>Accessibility</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.effectiveDate}>
          Last Updated: {LAST_UPDATED}
        </Text>

        {SECTIONS.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
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
  content: { paddingHorizontal: 20, paddingTop: 16 },
  effectiveDate: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    marginBottom: 20,
    textAlign: "center",
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    lineHeight: 22,
  },
});

import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

const EFFECTIVE_DATE = "March 1, 2026";
const LAST_UPDATED = "March 8, 2026"; // Updated: A/B testing disclosure (Section 13)

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `Account Information: Name, email address, username, city, and optional profile photo.

Rating Data: Your ratings, reviews, photos, and associated metadata (timestamps, device type).

Usage Data: App interactions, search queries, pages viewed, feature usage. Collected to improve the product and personalize your experience.

Location Data: Approximate location (city-level) from your profile. Precise GPS location only when you use the "Near Me" feature, collected only during active use and never stored on our servers.

Device Data: Device model, OS version, app version. Used for compatibility and crash reporting.

Push Notification Tokens: If you enable notifications, your device token is stored to deliver alerts.

Real-Time Connection Data: When using the App, a persistent connection (SSE) is maintained to deliver live updates. Connection metadata (connect/disconnect times) is logged for performance monitoring but not linked to your identity.

Webhook Event Data: Payment status updates received from payment providers are logged for operational integrity. These logs contain transaction identifiers but no additional personal data beyond what is already collected for payment processing.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `- Calculate and display trust-weighted rankings
- Compute your credibility tier (algorithmically, not manually)
- Deliver personalized search results and recommendations
- Process payments for Challenger, Dashboard Pro, and Featured Placement
- Send transactional emails (welcome, password reset, payment receipts)
- Send marketing emails (weekly digest, drip sequence) — opt-out available
- Send push notifications for ratings, tier changes, and challenges — opt-out available
- Detect and prevent fraud, fake reviews, and ranking manipulation
- Improve our algorithms and product experience
- Comply with legal obligations
- Deliver real-time ranking and rating updates via server-sent events
- Process and replay webhook events for payment accuracy
- Send transactional emails via Resend (our email delivery provider)
- Conduct A/B tests on user interface variations to improve feature design and ranking transparency (see Section 13)`,
  },
  {
    title: "3. Trust Score Data",
    body: `Your Trust Score is a proprietary algorithmic calculation. It is:

- Computed from your rating activity, consistency, account age, and engagement patterns
- NOT based on personal characteristics (race, gender, religion, etc.)
- NOT shared with third parties as an individual data point
- Used only within the TopRanker ecosystem to weight your ratings
- Not a credit score and has no effect outside this platform

You may request an explanation of the factors influencing your tier via support@topranker.com.`,
  },
  {
    title: "4. Data Sharing",
    body: `We do NOT sell your personal data. We share data only:

- With service providers: Payment processing (Stripe), email delivery (Resend), push notifications (Expo), cloud hosting, real-time event delivery infrastructure
- With business owners: Your ratings and reviews are visible to claimed business owners (not your email or personal details)
- For legal compliance: When required by law, court order, or government request
- In aggregated form: Anonymous analytics for public rankings and reports
- In a merger or acquisition: With notice and opt-out opportunity`,
  },
  {
    title: "5. Data Retention",
    body: `- Account data: Retained while your account is active. Deleted within 30 days of account deletion request.
- Ratings: Retained in anonymized form after account deletion to preserve ranking integrity.
- Payment data: Retained as required by tax and financial regulations (typically 7 years).
- Usage analytics: Retained in aggregated, anonymized form indefinitely.
- Push tokens: Deleted immediately upon disabling notifications or deleting account.`,
  },
  {
    title: "6. Your Rights",
    body: `United States (CCPA/State Privacy Laws):
- Right to know what data we collect
- Right to delete your personal information
- Right to opt-out of marketing communications
- Right to non-discrimination for exercising privacy rights

India (DPDPA 2023):
- Right to access your personal data
- Right to correction of inaccurate data
- Right to erasure of personal data
- Right to nominate a representative
- Right to grievance redressal (response within 30 days)

European Union (GDPR):
- All rights above, plus right to data portability
- Right to restrict processing
- Right to object to automated decision-making

To exercise any right: privacy@topranker.com`,
  },
  {
    title: "7. Data Security",
    body: `We protect your data with:
- Encryption in transit (TLS 1.3). Database encryption at rest managed by hosting provider.
- Bcrypt password hashing (never stored in plaintext)
- Session-based authentication with secure HTTP-only cookies
- Rate limiting on all API endpoints
- Regular security audits and vulnerability scanning
- Access controls limiting employee data access to need-to-know basis
- Webhook signature verification for payment event authenticity
- Admin-only access to webhook replay with double-gated authentication
- Real-time connections secured with same-origin policy and TLS

No system is 100% secure. We will notify affected users within 72 hours of a confirmed data breach.`,
  },
  {
    title: "8. International Data Transfers",
    body: `TopRanker is based in the United States. If you access the App from India, the EU, or other jurisdictions, your data may be transferred to and processed in the United States.

For India: Transfers comply with the Digital Personal Data Protection Act 2023 and are made only to countries not restricted by the Government of India.

For EU: Transfers are protected by Standard Contractual Clauses (SCCs) as approved by the European Commission.`,
  },
  {
    title: "9. Children's Privacy",
    body: `TopRanker is not intended for children under 13. We do not knowingly collect data from children under 13. If you believe a child has provided us data, contact privacy@topranker.com and we will delete it promptly.`,
  },
  {
    title: "10. Cookies & Tracking",
    body: `The mobile app does not use cookies. The web version uses:
- Essential cookies: Session management, authentication
- Analytics cookies: Anonymous usage tracking (opt-out available)

We do NOT use third-party advertising trackers or sell data for ad targeting.`,
  },
  {
    title: "11. Changes to This Policy",
    body: `We may update this Privacy Policy periodically. Material changes will be communicated via in-app notification and email at least 30 days before taking effect. The "Last Updated" date at the top reflects the most recent revision.`,
  },
  {
    title: "12. Data Protection Officer",
    body: `For privacy inquiries, data requests, or complaints:

Email: privacy@topranker.com
Data Protection Officer: Victoria Ashworth, VP of Legal
Address: TopRanker Inc., Dallas, TX, United States

India Grievance Officer: Arjun Mehta, Senior Legal Counsel
Email: india-privacy@topranker.com

Response time: Within 30 days of receiving your request.`,
  },
  {
    title: "13. A/B Testing & Feature Experiments",
    body: `We may conduct A/B tests where different users see different versions of a feature (e.g., tooltip styles, display formats, UI layouts). This is used solely to improve the product experience.

How it works:
- Your user identifier is hashed deterministically to assign you to a test group
- Assignment is consistent — you always see the same variant for a given experiment
- We record which variant you were assigned ("experiment exposure") for analysis

What we do NOT do:
- We do not use A/B testing for pricing, access restrictions, or content gating
- We do not profile you based on experiment assignments
- We do not share experiment data with third parties

Under GDPR Article 22, these experiments constitute low-impact UX variations and do not qualify as automated decisions that significantly affect you. You may contact privacy@topranker.com with questions about any active experiments.`,
  },
];

export default function PrivacyPolicy() {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.effectiveDate}>
          Effective: {EFFECTIVE_DATE} | Last Updated: {LAST_UPDATED}
        </Text>

        <Text style={styles.intro}>
          TopRanker Inc. ("we," "us," "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, share, and protect your information when you use the TopRanker app and services.
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
    marginBottom: 16,
    textAlign: "center",
  },
  intro: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    lineHeight: 22,
    marginBottom: 24,
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

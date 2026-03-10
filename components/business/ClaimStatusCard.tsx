/**
 * Sprint 579: Claim Status Card
 *
 * Shows the current user's claim status for a business.
 * Self-fetching — queries /api/members/me/claims and filters by businessId.
 * Displays pending/approved/rejected states with appropriate messaging.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { apiFetch } from "@/lib/query-client";
import { useAuth } from "@/lib/auth-context";

const AMBER = BRAND.colors.amber;

interface ClaimData {
  id: string; businessId: string; businessName: string; businessSlug: string;
  verificationMethod: string; status: string; submittedAt: string; reviewedAt: string | null;
}

export interface ClaimStatusCardProps {
  businessId: string;
  businessSlug: string;
  businessName: string;
}

const STATUS_CONFIG = {
  pending: { icon: "time-outline" as const, color: "#E5A100", bg: "rgba(229,161,0,0.08)", title: "Claim Under Review", message: "Our team is reviewing your ownership claim. You'll be notified by email when a decision is made." },
  approved: { icon: "shield-checkmark" as const, color: "#2D8F4E", bg: "rgba(45,143,78,0.08)", title: "Verified Owner", message: "Your ownership has been verified. Access your dashboard to manage your listing." },
  rejected: { icon: "close-circle-outline" as const, color: "#D44040", bg: "rgba(212,64,64,0.08)", title: "Claim Not Approved", message: "Your claim was not approved. You can submit additional evidence or contact support." },
} as const;

export function ClaimStatusCard({ businessId, businessSlug, businessName }: ClaimStatusCardProps) {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["my-claims"],
    queryFn: () => apiFetch("/api/members/me/claims"),
    staleTime: 60_000,
    enabled: !!user,
  });

  if (isLoading || !user) return null;
  const claims = (data as ClaimData[] | undefined) ?? [];
  const claim = claims.find(c => c.businessId === businessId);
  if (!claim) return null;

  const status = claim.status as keyof typeof STATUS_CONFIG;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const date = new Date(claim.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <View style={[s.card, { backgroundColor: cfg.bg }]}>
      <View style={s.row}>
        <View style={[s.iconCircle, { backgroundColor: cfg.color }]}>
          <Ionicons name={cfg.icon} size={20} color="#FFFFFF" />
        </View>
        <View style={s.content}>
          <Text style={[s.title, { color: cfg.color }]}>{cfg.title}</Text>
          <Text style={s.message}>{cfg.message}</Text>
          <Text style={s.date}>Submitted {date} via {claim.verificationMethod}</Text>
        </View>
      </View>
      {status === "approved" && (
        <TouchableOpacity style={s.dashboardBtn} onPress={() => router.push(`/business/dashboard?slug=${businessSlug}`)} activeOpacity={0.8}>
          <Ionicons name="analytics-outline" size={16} color="#FFFFFF" />
          <Text style={s.dashboardBtnText}>Open Dashboard</Text>
        </TouchableOpacity>
      )}
      {status === "rejected" && (
        <TouchableOpacity style={[s.dashboardBtn, { backgroundColor: Colors.textTertiary }]} onPress={() => router.push(`/business/claim?name=${encodeURIComponent(businessName)}&slug=${businessSlug}`)} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
          <Text style={s.dashboardBtnText}>Resubmit Claim</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 14, padding: 16, marginHorizontal: 16, marginTop: 12, gap: 12 },
  row: { flexDirection: "row", gap: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  content: { flex: 1, gap: 4 },
  title: { fontSize: 15, fontWeight: "700", fontFamily: "DMSans_700Bold" },
  message: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 18 },
  date: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", marginTop: 2 },
  dashboardBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: BRAND.colors.navy, borderRadius: 10, paddingVertical: 12 },
  dashboardBtnText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", fontFamily: "DMSans_700Bold" },
});

/**
 * Sprint 516: Claims tab content extracted from admin/index.tsx
 *
 * Displays pending business claims with QueueItem cards and
 * optional V2 evidence cards. Extracted to manage admin dashboard LOC.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { ClaimEvidenceCard } from "./ClaimEvidenceCard";
import type { AdminClaim, ClaimEvidence } from "@/lib/api";

interface QueueItemProps {
  title: string;
  subtitle: string;
  type: string;
  onApprove: () => void;
  onReject: () => void;
}

interface ClaimsTabContentProps {
  claims: AdminClaim[];
  claimEvidence: ClaimEvidence[];
  claimsLoading: boolean;
  isFullTab: boolean;
  onClaimAction: (id: string, action: "approved" | "rejected") => void;
  QueueItem: React.ComponentType<QueueItemProps>;
}

export function ClaimsTabContent({
  claims,
  claimEvidence,
  claimsLoading,
  isFullTab,
  onClaimAction,
  QueueItem,
}: ClaimsTabContentProps) {
  return (
    <>
      {isFullTab && <Text style={styles.sectionTitle}>Business Claims</Text>}
      {claimsLoading && <Text style={styles.emptySub}>Loading claims...</Text>}
      {!claimsLoading && claims.length === 0 && isFullTab && (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={48} color={Colors.green} />
          <Text style={styles.emptyTitle}>No Pending Claims</Text>
          <Text style={styles.emptySub}>All business claims have been reviewed</Text>
        </View>
      )}
      {claims.map((claim) => {
        const evidence = claimEvidence.find((e) => e.claimId === claim.id);
        return (
          <View key={claim.id}>
            <QueueItem
              title={claim.businessName || "Unknown Business"}
              subtitle={`Claim by ${claim.memberName || "Unknown"} via ${claim.verificationMethod}`}
              type="claim"
              onApprove={() => onClaimAction(claim.id, "approved")}
              onReject={() => onClaimAction(claim.id, "rejected")}
            />
            {evidence && <ClaimEvidenceCard evidence={evidence} />}
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
    marginTop: 20,
    marginBottom: 12,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.subtext,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    marginTop: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
    marginTop: 12,
  },
});

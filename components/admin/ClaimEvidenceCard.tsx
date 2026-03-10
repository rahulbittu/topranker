/**
 * Sprint 509: Claim V2 Evidence Card for admin dashboard
 *
 * Displays claim verification evidence: score bar, match indicators,
 * document list, and review notes. Used in the claims tab.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import type { ClaimEvidence } from "@/lib/api";

export { ClaimEvidence };

function MatchIndicator({ label, matched }: { label: string; matched: boolean }) {
  return (
    <View style={styles.matchRow}>
      <View style={[styles.matchDot, matched ? styles.matchDotPass : styles.matchDotFail]} />
      <Text style={[styles.matchLabel, matched && styles.matchLabelPass]}>{label}</Text>
    </View>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? Colors.green : score >= 40 ? BRAND.colors.amber : Colors.red;
  return (
    <View style={styles.scoreBarWrap}>
      <View style={styles.scoreBarTrack}>
        <View style={[styles.scoreBarFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.scoreText, { color }]}>{score}/100</Text>
    </View>
  );
}

export function ClaimEvidenceCard({ evidence }: { evidence: ClaimEvidence }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Verification Evidence</Text>
        {evidence.autoApproved && (
          <View style={styles.autoBadge}>
            <Text style={styles.autoBadgeText}>AUTO-APPROVED</Text>
          </View>
        )}
      </View>

      <ScoreBar score={evidence.verificationScore} />

      <View style={styles.matchSection}>
        <MatchIndicator label="Business Name" matched={evidence.businessNameMatch} />
        <MatchIndicator label="Address" matched={evidence.addressMatch} />
        <MatchIndicator label="Phone" matched={evidence.phoneMatch} />
      </View>

      {evidence.documents.length > 0 && (
        <View style={styles.docSection}>
          <Text style={styles.docTitle}>Documents ({evidence.documents.length})</Text>
          {evidence.documents.map((doc, i) => (
            <View key={i} style={styles.docRow}>
              <Text style={styles.docName} numberOfLines={1}>{doc.fileName}</Text>
              <Text style={styles.docType}>{doc.documentType.replace(/_/g, " ")}</Text>
            </View>
          ))}
        </View>
      )}

      {evidence.reviewNotes.length > 0 && (
        <View style={styles.notesSection}>
          {evidence.reviewNotes.map((note, i) => (
            <Text key={i} style={styles.noteText}>• {note}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },
  autoBadge: {
    backgroundColor: `${Colors.green}20`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  autoBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.green,
    fontFamily: "DMSans_700Bold",
    letterSpacing: 0.5,
  },
  scoreBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  scoreBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "DMSans_700Bold",
    width: 50,
    textAlign: "right",
  },
  matchSection: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  matchDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  matchDotPass: {
    backgroundColor: Colors.green,
  },
  matchDotFail: {
    backgroundColor: Colors.red,
  },
  matchLabel: {
    fontSize: 12,
    color: Colors.subtext,
    fontFamily: "DMSans_400Regular",
  },
  matchLabelPass: {
    color: Colors.text,
  },
  docSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    marginBottom: 8,
  },
  docTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.subtext,
    fontFamily: "DMSans_600SemiBold",
    marginBottom: 6,
  },
  docRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  docName: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: "DMSans_400Regular",
    flex: 1,
    marginRight: 8,
  },
  docType: {
    fontSize: 11,
    color: Colors.subtext,
    fontFamily: "DMSans_400Regular",
    textTransform: "capitalize",
  },
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  noteText: {
    fontSize: 12,
    color: Colors.subtext,
    fontFamily: "DMSans_400Regular",
    lineHeight: 18,
  },
});

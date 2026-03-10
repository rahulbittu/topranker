/**
 * Sprint 581: Claim Progress Timeline
 *
 * Vertical step-based timeline showing claim verification progress.
 * Steps: Submitted → Under Review → Verification → Decision
 * Adapts to claim status (pending/approved/rejected) with appropriate styling.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

const AMBER = BRAND.colors.amber;
const GREEN = "#2D8F4E";
const RED = "#D44040";

type StepStatus = "complete" | "active" | "upcoming" | "failed";

interface TimelineStep {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  status: StepStatus;
  detail?: string;
  timestamp?: string;
}

export interface ClaimProgressTimelineProps {
  claimStatus: "pending" | "approved" | "rejected";
  verificationMethod: string;
  submittedAt: string;
  reviewedAt: string | null;
}

function getSteps(props: ClaimProgressTimelineProps): TimelineStep[] {
  const { claimStatus, verificationMethod, submittedAt, reviewedAt } = props;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const steps: TimelineStep[] = [
    { label: "Claim Submitted", icon: "document-text-outline", status: "complete", detail: `Via ${verificationMethod}`, timestamp: fmtDate(submittedAt) },
    { label: "Under Review", icon: "search-outline", status: claimStatus === "pending" ? "active" : "complete", detail: claimStatus === "pending" ? "Our team is reviewing your claim" : "Review complete" },
    { label: "Verification", icon: "shield-checkmark-outline", status: claimStatus === "pending" ? "upcoming" : claimStatus === "approved" ? "complete" : "failed", detail: claimStatus === "approved" ? "Identity verified" : claimStatus === "rejected" ? "Could not verify" : "Awaiting review completion" },
  ];

  if (claimStatus === "approved") {
    steps.push({ label: "Ownership Granted", icon: "checkmark-circle", status: "complete", detail: "Dashboard access enabled", timestamp: reviewedAt ? fmtDate(reviewedAt) : undefined });
  } else if (claimStatus === "rejected") {
    steps.push({ label: "Claim Declined", icon: "close-circle", status: "failed", detail: "You can resubmit with additional evidence", timestamp: reviewedAt ? fmtDate(reviewedAt) : undefined });
  } else {
    steps.push({ label: "Decision Pending", icon: "hourglass-outline", status: "upcoming", detail: "You'll be notified by email" });
  }

  return steps;
}

function stepColor(status: StepStatus): string {
  if (status === "complete") return GREEN;
  if (status === "active") return AMBER;
  if (status === "failed") return RED;
  return Colors.border;
}

export function ClaimProgressTimeline(props: ClaimProgressTimelineProps) {
  const steps = getSteps(props);

  return (
    <View style={s.container}>
      {steps.map((step, i) => {
        const color = stepColor(step.status);
        const isLast = i === steps.length - 1;
        return (
          <View key={step.label} style={s.stepRow}>
            <View style={s.indicatorCol}>
              <View style={[s.circle, { backgroundColor: step.status === "upcoming" ? Colors.background : color, borderColor: color }]}>
                <Ionicons name={step.icon} size={14} color={step.status === "upcoming" ? Colors.textTertiary : "#FFFFFF"} />
              </View>
              {!isLast && <View style={[s.line, { backgroundColor: i < steps.length - 1 && steps[i + 1].status !== "upcoming" ? GREEN : Colors.border }]} />}
            </View>
            <View style={s.contentCol}>
              <Text style={[s.stepLabel, step.status === "upcoming" && s.stepLabelDim]}>{step.label}</Text>
              {step.detail && <Text style={s.stepDetail}>{step.detail}</Text>}
              {step.timestamp && <Text style={s.stepTimestamp}>{step.timestamp}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: 0 },
  stepRow: { flexDirection: "row", minHeight: 52 },
  indicatorCol: { width: 32, alignItems: "center" },
  circle: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  line: { width: 2, flex: 1, marginVertical: 2 },
  contentCol: { flex: 1, paddingLeft: 10, paddingBottom: 12 },
  stepLabel: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  stepLabelDim: { color: Colors.textTertiary },
  stepDetail: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", marginTop: 2 },
  stepTimestamp: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", marginTop: 2 },
});

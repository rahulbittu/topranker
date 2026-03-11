/**
 * Sprint 594: Extracted moderation item card from admin/moderation.tsx
 * Shows content, violations, actions, and age indicator.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];
type ContentType = "review" | "photo" | "reply";
type ModerationStatus = "pending" | "approved" | "rejected";

export interface ModerationItem {
  id: string;
  contentType: ContentType;
  contentId: string;
  memberId: string;
  businessId: string;
  content: string;
  violations: string[];
  status: ModerationStatus;
  moderatorId: string | null;
  moderatorNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  review: "Review",
  photo: "Photo",
  reply: "Reply",
};

const CONTENT_TYPE_ICONS: Record<ContentType, string> = {
  review: "chatbubble-outline",
  photo: "image-outline",
  reply: "arrow-undo-outline",
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function isStale(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() > 24 * 60 * 60 * 1000;
}

interface Props {
  item: ModerationItem;
  selected: boolean;
  onToggleSelect: () => void;
  onApprove: () => void;
  onReject: (note: string) => void;
  rejectNote: string;
  onRejectNoteChange: (text: string) => void;
  showRejectInput: boolean;
  onToggleRejectInput: () => void;
}

export function ModerationItemCard({
  item, selected, onToggleSelect, onApprove, onReject,
  rejectNote, onRejectNoteChange, showRejectInput, onToggleRejectInput,
}: Props) {
  const stale = item.status === "pending" && isStale(item.createdAt);

  return (
    <View style={[s.card, selected && s.cardSelected, stale && s.cardStale]}>
      <View style={s.header}>
        {item.status === "pending" && (
          <TouchableOpacity onPress={onToggleSelect} style={s.checkbox} accessibilityRole="checkbox">
            <Ionicons name={selected ? "checkbox" : "square-outline"} size={18} color={BRAND.colors.amber} />
          </TouchableOpacity>
        )}
        <Ionicons name={CONTENT_TYPE_ICONS[item.contentType] as IoniconsName} size={14} color={Colors.textSecondary} />
        <Text style={s.type}>{CONTENT_TYPE_LABELS[item.contentType]}</Text>
        {item.violations.length > 0 && (
          <View style={s.violationBadge}>
            <Ionicons name="warning" size={10} color={Colors.red} />
            <Text style={s.violationCount}>{item.violations.length}</Text>
          </View>
        )}
        {stale && (
          <View style={s.staleBadge}>
            <Ionicons name="time-outline" size={10} color="#D97706" />
            <Text style={s.staleText}>Stale</Text>
          </View>
        )}
        <View style={{ flex: 1 }} />
        <Text style={s.time}>{formatTimeAgo(item.createdAt)}</Text>
      </View>

      <Text style={s.content} numberOfLines={3}>{item.content}</Text>

      {item.violations.length > 0 && (
        <View style={s.violationList}>
          {item.violations.map((v, i) => (
            <Text key={i} style={s.violationItem}>• {v}</Text>
          ))}
        </View>
      )}

      {item.status === "pending" && (
        <>
          <View style={s.actions}>
            <TouchableOpacity style={s.approveBtn} onPress={onApprove} accessibilityRole="button">
              <Ionicons name="checkmark" size={14} color={Colors.green} />
              <Text style={[s.actionText, { color: Colors.green }]}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.rejectBtn} onPress={onToggleRejectInput} accessibilityRole="button">
              <Ionicons name="close" size={14} color={Colors.red} />
              <Text style={[s.actionText, { color: Colors.red }]}>Reject</Text>
            </TouchableOpacity>
          </View>
          {showRejectInput && (
            <View style={s.rejectInputRow}>
              <TextInput
                style={s.rejectInput}
                placeholder="Reason for rejection..."
                placeholderTextColor={Colors.textTertiary}
                value={rejectNote}
                onChangeText={onRejectNoteChange}
                multiline
              />
              <TouchableOpacity
                style={[s.confirmRejectBtn, !rejectNote.trim() && s.btnDisabled]}
                onPress={() => rejectNote.trim() && onReject(rejectNote.trim())}
                disabled={!rejectNote.trim()}
                accessibilityRole="button"
              >
                <Text style={s.confirmRejectText}>Confirm Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {item.status !== "pending" && (
        <View style={s.resolvedRow}>
          <Ionicons
            name={item.status === "approved" ? "checkmark-circle" : "close-circle"}
            size={14}
            color={item.status === "approved" ? Colors.green : Colors.red}
          />
          <Text style={s.resolvedText}>
            {item.status === "approved" ? "Approved" : "Rejected"}
            {item.resolvedAt ? ` ${formatTimeAgo(item.resolvedAt)}` : ""}
          </Text>
          {item.moderatorNote && (
            <Text style={s.moderatorNote} numberOfLines={1}>— {item.moderatorNote}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 12, ...Colors.cardShadow },
  cardSelected: { borderWidth: 1, borderColor: BRAND.colors.amber },
  cardStale: { borderLeftWidth: 3, borderLeftColor: "#D97706" },
  header: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  checkbox: { marginRight: 2 },
  type: { fontSize: 11, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  violationBadge: {
    flexDirection: "row", alignItems: "center", gap: 2,
    backgroundColor: Colors.redFaint, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1,
  },
  violationCount: { fontSize: 10, fontWeight: "700", color: Colors.red, fontFamily: "DMSans_700Bold" },
  staleBadge: {
    flexDirection: "row", alignItems: "center", gap: 2,
    backgroundColor: "rgba(217,119,6,0.1)", borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1,
  },
  staleText: { fontSize: 10, fontWeight: "600", color: "#D97706", fontFamily: "DMSans_600SemiBold" },
  time: { ...TYPOGRAPHY.ui.small, color: Colors.textTertiary },
  content: { fontSize: 13, color: Colors.text, fontFamily: "DMSans_400Regular", lineHeight: 18, marginBottom: 6 },
  violationList: { marginBottom: 6 },
  violationItem: { fontSize: 11, color: Colors.red, fontFamily: "DMSans_500Medium", lineHeight: 16 },
  actions: { flexDirection: "row", gap: 8, marginTop: 4 },
  approveBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.greenFaint,
  },
  rejectBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.redFaint,
  },
  actionText: { fontSize: 11, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
  rejectInputRow: { marginTop: 8, gap: 6 },
  rejectInput: {
    backgroundColor: Colors.background, borderRadius: 8, padding: 10,
    fontSize: 12, color: Colors.text, fontFamily: "DMSans_400Regular",
    borderWidth: 1, borderColor: Colors.border, minHeight: 50,
  },
  confirmRejectBtn: {
    backgroundColor: Colors.red, borderRadius: 8, paddingVertical: 8,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.4 },
  confirmRejectText: { color: "#fff", fontSize: 12, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
  resolvedRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4, flexWrap: "wrap" },
  resolvedText: { ...TYPOGRAPHY.ui.small, color: Colors.textTertiary },
  moderatorNote: { fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", fontStyle: "italic" },
});

import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TypedIcon } from "@/components/TypedIcon";
import { hapticPress, hapticError } from "@/lib/audio";
import * as Haptics from "expo-haptics";

export type ReportReason =
  | "fake_review"
  | "spam"
  | "offensive"
  | "conflict_of_interest"
  | "wrong_business"
  | "harassment"
  | "other";

const REPORT_REASONS: { value: ReportReason; label: string; icon: string; description: string }[] = [
  { value: "fake_review", label: "Fake Review", icon: "alert-circle-outline", description: "This review appears fabricated or paid for" },
  { value: "spam", label: "Spam", icon: "megaphone-outline", description: "Promotional content or repetitive posting" },
  { value: "offensive", label: "Offensive Content", icon: "ban-outline", description: "Hate speech, slurs, or inappropriate language" },
  { value: "conflict_of_interest", label: "Conflict of Interest", icon: "people-outline", description: "Owner reviewing their own business or competitor sabotage" },
  { value: "wrong_business", label: "Wrong Business", icon: "location-outline", description: "Review is about a different business" },
  { value: "harassment", label: "Harassment", icon: "hand-left-outline", description: "Targeting a specific person or business owner" },
  { value: "other", label: "Other", icon: "ellipsis-horizontal-outline", description: "Something else not listed above" },
];

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details: string) => void;
  targetType: "rating" | "business" | "user";
  targetName: string;
}

export function ReportModal({ visible, onClose, onSubmit, targetType, targetName }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selectedReason) {
      hapticError();
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit(selectedReason, details);
    setSubmitted(true);
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDetails("");
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} onPress={handleClose} activeOpacity={1} />
        <Animated.View entering={SlideInDown.duration(300)} style={styles.sheet}>
          {submitted ? (
            <View style={styles.successView}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
              </View>
              <Text style={styles.successTitle}>Report Submitted</Text>
              <Text style={styles.successSub}>
                Our trust & safety team will review this within 24 hours. Thank you for helping keep TopRanker trustworthy.
              </Text>
              <TouchableOpacity style={styles.doneBtn} onPress={handleClose} activeOpacity={0.85}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Report {targetType === "rating" ? "Review" : targetType === "business" ? "Business" : "User"}</Text>
                <TouchableOpacity onPress={handleClose} hitSlop={8}>
                  <Ionicons name="close" size={22} color={Colors.textTertiary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.sheetSub}>
                Why are you reporting {targetName}?
              </Text>

              <View style={styles.reasons}>
                {REPORT_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason.value}
                    style={[
                      styles.reasonRow,
                      selectedReason === reason.value && styles.reasonRowSelected,
                    ]}
                    onPress={() => {
                      hapticPress();
                      setSelectedReason(reason.value);
                    }}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: selectedReason === reason.value }}
                  >
                    <TypedIcon
                      name={reason.icon}
                      size={18}
                      color={selectedReason === reason.value ? BRAND.colors.amber : Colors.textSecondary}
                    />
                    <View style={styles.reasonInfo}>
                      <Text style={[
                        styles.reasonLabel,
                        selectedReason === reason.value && styles.reasonLabelSelected,
                      ]}>
                        {reason.label}
                      </Text>
                      <Text style={styles.reasonDesc}>{reason.description}</Text>
                    </View>
                    <View style={[
                      styles.radio,
                      selectedReason === reason.value && styles.radioSelected,
                    ]}>
                      {selectedReason === reason.value && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.detailsInput}
                placeholder="Additional details (optional)"
                placeholderTextColor={Colors.textTertiary}
                value={details}
                onChangeText={setDetails}
                multiline
                maxLength={500}
              />

              <TouchableOpacity
                style={[styles.submitBtn, !selectedReason && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                activeOpacity={0.85}
                disabled={!selectedReason}
              >
                <Text style={styles.submitBtnText}>Submit Report</Text>
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                False reports may affect your credibility tier. All reports are reviewed by our trust & safety team.
              </Text>
            </>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  backdropTouch: { flex: 1 },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "85%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  sheetSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    marginBottom: 16,
  },
  reasons: { gap: 6 },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reasonRowSelected: {
    borderColor: BRAND.colors.amber,
    backgroundColor: `${BRAND.colors.amber}08`,
  },
  reasonInfo: { flex: 1, gap: 1 },
  reasonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  reasonLabelSelected: { color: BRAND.colors.amber },
  reasonDesc: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: BRAND.colors.amber },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND.colors.amber,
  },
  detailsInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    fontFamily: "DMSans_400Regular",
    minHeight: 60,
    textAlignVertical: "top",
  },
  submitBtn: {
    marginTop: 16,
    backgroundColor: Colors.red || "#E53935",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "DMSans_700Bold",
  },
  disclaimer: {
    marginTop: 12,
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    lineHeight: 16,
  },
  successView: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  successIcon: { marginBottom: 4 },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  successSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  doneBtn: {
    marginTop: 16,
    backgroundColor: BRAND.colors.navy,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "DMSans_700Bold",
  },
});

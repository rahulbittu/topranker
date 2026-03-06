import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { getBusinessById, MOCK_USER, TIER_COLORS, TIER_DISPLAY_NAMES, TIER_WEIGHTS } from "@/lib/data";

type Step = "form" | "confirm";

const STAR_LABELS = ["Poor", "Fair", "Good", "Great", "Amazing"];

function StarPicker({
  label, description, value, onChange
}: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.questionBlock}>
      <Text style={styles.questionLabel}>{label}</Text>
      <Text style={styles.questionDesc}>{description}</Text>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map(n => (
          <TouchableOpacity
            key={n}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChange(n);
            }}
            style={[styles.starBtn, value >= n && styles.starBtnActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.starNum, value >= n && styles.starNumActive]}>{n}</Text>
            <Text style={[styles.starLabel, value >= n && styles.starLabelActive]}>
              {STAR_LABELS[n - 1]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function YesNoPicker({
  label, description, value, onChange
}: {
  label: string;
  description: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.questionBlock}>
      <Text style={styles.questionLabel}>{label}</Text>
      <Text style={styles.questionDesc}>{description}</Text>
      <View style={styles.yesNoRow}>
        <TouchableOpacity
          style={[styles.yesNoBtn, value === true && styles.yesNoBtnYes]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onChange(true);
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={value === true ? "#fff" : Colors.textTertiary}
          />
          <Text style={[styles.yesNoText, value === true && styles.yesNoTextYes]}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.yesNoBtn, value === false && styles.yesNoBtnNo]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onChange(false);
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="close-circle"
            size={18}
            color={value === false ? "#fff" : Colors.textTertiary}
          />
          <Text style={[styles.yesNoText, value === false && styles.yesNoTextNo]}>No</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RateScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const business = getBusinessById(id);

  const [food, setFood] = useState(0);
  const [value, setValue] = useState(0);
  const [service, setService] = useState(0);
  const [wouldReturn, setWouldReturn] = useState<boolean | null>(null);
  const [note, setNote] = useState("");
  const [step, setStep] = useState<Step>("form");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const tierColor = TIER_COLORS[MOCK_USER.tier];
  const tierDisplayName = TIER_DISPLAY_NAMES[MOCK_USER.tier];
  const voteWeight = TIER_WEIGHTS[MOCK_USER.tier];

  const isComplete = food > 0 && value > 0 && service > 0 && wouldReturn !== null;

  const rawScore = food > 0 && value > 0 && service > 0
    ? (food + value + service) / 3
    : 0;
  const weightedScore = rawScore * voteWeight;

  const prevRank = business?.rank ?? 1;
  const newRank = Math.max(1, prevRank - (rawScore > 4 ? 1 : 0));

  const handleSubmit = () => {
    if (!isComplete) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep("confirm");
  };

  if (!business) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <Text style={styles.errorText}>Business not found</Text>
      </View>
    );
  }

  if (step === "confirm") {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.confirmInner}>
          <View style={styles.confirmIcon}>
            <Ionicons name="checkmark-circle" size={56} color={Colors.greenBright} />
          </View>
          <Text style={styles.confirmTitle}>Rating Submitted</Text>
          <Text style={styles.confirmSub}>Your weighted vote has been counted.</Text>

          <View style={styles.rankChangeCard}>
            <Text style={styles.rankChangeTitle}>{business.name}</Text>
            <View style={styles.rankChangeRow}>
              <View style={styles.rankBox}>
                <Text style={styles.rankBoxLabel}>Before</Text>
                <Text style={styles.rankBoxNum}>#{prevRank}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={Colors.gold} />
              <View style={[styles.rankBox, newRank < prevRank && styles.rankBoxImproved]}>
                <Text style={styles.rankBoxLabel}>After</Text>
                <Text style={[styles.rankBoxNum, newRank < prevRank && { color: Colors.greenBright }]}>
                  #{newRank}
                </Text>
              </View>
            </View>
            {newRank < prevRank && (
              <View style={styles.movedUpBanner}>
                <Ionicons name="trending-up" size={14} color={Colors.greenBright} />
                <Text style={styles.movedUpText}>Your rating helped this business move up!</Text>
              </View>
            )}
          </View>

          <View style={styles.scoreBreakdownCard}>
            <View style={styles.scoreBreakdownRow}>
              <Text style={styles.scoreBreakdownLabel}>Raw Score</Text>
              <Text style={styles.scoreBreakdownVal}>{rawScore.toFixed(2)}</Text>
            </View>
            <View style={styles.scoreBreakdownRow}>
              <Text style={styles.scoreBreakdownLabel}>Your Weight ({tierDisplayName})</Text>
              <Text style={[styles.scoreBreakdownVal, { color: tierColor }]}>× {voteWeight.toFixed(2)}</Text>
            </View>
            <View style={styles.scoreBreakdownDivider} />
            <View style={styles.scoreBreakdownRow}>
              <Text style={styles.scoreBreakdownLabelBold}>Weighted Score</Text>
              <Text style={styles.scoreBreakdownValBold}>{weightedScore.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }
        ]}
      >
        <Text style={styles.rateLabel}>RATE</Text>
        <Text style={styles.businessName}>{business.name}</Text>
        <Text style={styles.subtitle}>Answer 4 questions. Takes 15 seconds.</Text>

        <StarPicker
          label="01  Food Quality"
          description="How was the overall quality of the food?"
          value={food}
          onChange={setFood}
        />
        <StarPicker
          label="02  Value for Money"
          description="Was the price fair for what you received?"
          value={value}
          onChange={setValue}
        />
        <StarPicker
          label="03  Service"
          description="How was the speed and quality of service?"
          value={service}
          onChange={setService}
        />
        <YesNoPicker
          label="04  Would You Return?"
          description="Would you visit this place again?"
          value={wouldReturn}
          onChange={setWouldReturn}
        />

        <View style={styles.noteBlock}>
          <Text style={styles.noteLabel}>Optional Note</Text>
          <Text style={styles.noteDesc}>One sentence (optional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="In your own words..."
            placeholderTextColor={Colors.textTertiary}
            value={note}
            onChangeText={t => t.length <= 160 && setNote(t)}
            multiline
            maxLength={160}
          />
          <Text style={styles.noteCount}>{note.length}/160</Text>
        </View>

        <View style={styles.weightInfo}>
          <View style={[styles.tierDot, { backgroundColor: tierColor }]} />
          <Text style={styles.weightText}>
            Your rating counts at{" "}
            <Text style={{ color: tierColor, fontFamily: "Inter_600SemiBold" }}>
              {tierDisplayName}
            </Text>
            {" "}weight (
            <Text style={{ color: tierColor, fontFamily: "Inter_700Bold" }}>
              {voteWeight.toFixed(2)}x
            </Text>
            )
          </Text>
        </View>

        {isComplete && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Score Preview</Text>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Raw: ({food}+{value}+{service})/3 =</Text>
              <Text style={styles.previewVal}>{rawScore.toFixed(2)}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Weighted: {rawScore.toFixed(2)} × {voteWeight.toFixed(2)} =</Text>
              <Text style={[styles.previewVal, { color: Colors.gold }]}>{weightedScore.toFixed(2)}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, !isComplete && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={!isComplete}
          testID="submit-rating"
        >
          <Text style={[styles.submitButtonText, !isComplete && styles.submitButtonTextDisabled]}>
            Submit Rating
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  errorText: { color: Colors.text, textAlign: "center", marginTop: 40, fontFamily: "Inter_400Regular" },
  navBar: { paddingHorizontal: 16, paddingBottom: 4 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.border,
  },
  scrollContent: { paddingHorizontal: 20, gap: 16, paddingTop: 8 },
  rateLabel: {
    fontSize: 13, fontWeight: "600", color: Colors.textTertiary,
    fontFamily: "Inter_600SemiBold", letterSpacing: 1,
  },
  businessName: {
    fontSize: 28, fontWeight: "700", color: Colors.text,
    fontFamily: "Inter_700Bold", letterSpacing: -0.8, marginTop: -4,
  },
  subtitle: {
    fontSize: 13, color: Colors.textTertiary, fontFamily: "Inter_400Regular",
    marginTop: -8, marginBottom: 4,
  },
  questionBlock: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  questionLabel: {
    fontSize: 12, fontWeight: "700", color: Colors.textTertiary,
    fontFamily: "Inter_700Bold", letterSpacing: 0.5,
  },
  questionDesc: {
    fontSize: 15, fontWeight: "600", color: Colors.text,
    fontFamily: "Inter_600SemiBold", lineHeight: 21, marginTop: -2,
  },
  starRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  starBtn: {
    flex: 1, aspectRatio: 0.85, maxWidth: 58, borderRadius: 10,
    backgroundColor: Colors.surfaceRaised, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.border, gap: 2,
  },
  starBtnActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  starNum: { fontSize: 16, fontWeight: "700", color: Colors.textTertiary, fontFamily: "Inter_700Bold" },
  starNumActive: { color: "#000" },
  starLabel: { fontSize: 8, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },
  starLabelActive: { color: "#000" },

  yesNoRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  yesNoBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12, borderRadius: 10,
    backgroundColor: Colors.surfaceRaised, borderWidth: 1, borderColor: Colors.border,
  },
  yesNoBtnYes: { backgroundColor: Colors.green, borderColor: Colors.green },
  yesNoBtnNo: { backgroundColor: Colors.red, borderColor: Colors.red },
  yesNoText: { fontSize: 15, fontWeight: "600", color: Colors.textTertiary, fontFamily: "Inter_600SemiBold" },
  yesNoTextYes: { color: "#fff" },
  yesNoTextNo: { color: "#fff" },

  noteBlock: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  noteLabel: {
    fontSize: 12, fontWeight: "700", color: Colors.textTertiary,
    fontFamily: "Inter_700Bold", letterSpacing: 0.5,
  },
  noteDesc: { fontSize: 13, color: Colors.textTertiary, fontFamily: "Inter_400Regular", marginTop: -4 },
  noteInput: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 10, padding: 12,
    fontSize: 14, color: Colors.text, fontFamily: "Inter_400Regular",
    borderWidth: 1, borderColor: Colors.border, minHeight: 72, textAlignVertical: "top",
  },
  noteCount: { fontSize: 10, color: Colors.textTertiary, fontFamily: "Inter_400Regular", textAlign: "right" },

  weightInfo: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 4 },
  tierDot: { width: 8, height: 8, borderRadius: 4 },
  weightText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Inter_400Regular", flex: 1 },

  previewCard: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14, gap: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  previewTitle: { fontSize: 11, fontWeight: "600", color: Colors.textTertiary, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase" as const },
  previewRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  previewLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Inter_400Regular" },
  previewVal: { fontSize: 15, fontWeight: "700", color: Colors.text, fontFamily: "Inter_700Bold" },

  submitButton: {
    backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 17,
    alignItems: "center", marginTop: 4,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  submitButtonText: { fontSize: 16, fontWeight: "700", color: "#000", fontFamily: "Inter_700Bold" },
  submitButtonTextDisabled: { color: Colors.textTertiary },

  confirmInner: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 24, gap: 16,
  },
  confirmIcon: { marginBottom: 8 },
  confirmTitle: {
    fontSize: 28, fontWeight: "700", color: Colors.text,
    fontFamily: "Inter_700Bold", letterSpacing: -0.8, textAlign: "center",
  },
  confirmSub: {
    fontSize: 14, color: Colors.textSecondary, fontFamily: "Inter_400Regular",
    textAlign: "center", marginTop: -8,
  },
  rankChangeCard: {
    width: "100%", backgroundColor: Colors.surface, borderRadius: 16,
    padding: 16, alignItems: "center", gap: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  rankChangeTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Inter_600SemiBold" },
  rankChangeRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  rankBox: {
    alignItems: "center", gap: 4, width: 72, paddingVertical: 10,
    borderRadius: 10, backgroundColor: Colors.surfaceRaised,
  },
  rankBoxImproved: { backgroundColor: Colors.greenFaint },
  rankBoxLabel: { fontSize: 10, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },
  rankBoxNum: { fontSize: 22, fontWeight: "700", color: Colors.text, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  movedUpBanner: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: Colors.greenFaint, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6,
  },
  movedUpText: { fontSize: 11, color: Colors.greenBright, fontFamily: "Inter_500Medium" },

  scoreBreakdownCard: {
    width: "100%", backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, gap: 8, borderWidth: 1, borderColor: Colors.border,
  },
  scoreBreakdownRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  scoreBreakdownLabel: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Inter_400Regular" },
  scoreBreakdownVal: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Inter_600SemiBold" },
  scoreBreakdownDivider: { height: 1, backgroundColor: Colors.border },
  scoreBreakdownLabelBold: { fontSize: 14, fontWeight: "700", color: Colors.text, fontFamily: "Inter_700Bold" },
  scoreBreakdownValBold: { fontSize: 20, fontWeight: "700", color: Colors.gold, fontFamily: "Inter_700Bold" },

  doneButton: {
    width: "100%", backgroundColor: Colors.gold, borderRadius: 14,
    paddingVertical: 16, alignItems: "center", marginTop: 8,
  },
  doneButtonText: { fontSize: 16, fontWeight: "700", color: "#000", fontFamily: "Inter_700Bold" },
});

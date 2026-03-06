import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { getBusinessById, MOCK_USER, TIER_COLORS } from "@/lib/data";

type Step = "form" | "confirm";

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
            color={value === true ? "#000" : Colors.textTertiary}
          />
          <Text style={[styles.yesNoText, value === true && styles.yesNoTextActive]}>Yes</Text>
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
  const [comment, setComment] = useState("");
  const [step, setStep] = useState<Step>("form");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const tierColor = TIER_COLORS[MOCK_USER.tier];

  const isComplete = food > 0 && value > 0 && service > 0 && wouldReturn !== null;

  const weightedScore = food > 0 && value > 0 && service > 0
    ? ((food + value + service) / 3 + (wouldReturn ? 0.3 : -0.3))
    : 0;

  const prevRank = business?.rank ?? 1;
  const newRank = Math.max(1, prevRank - (weightedScore > 4 ? 1 : 0));

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
            <Ionicons name="checkmark-circle" size={56} color={Colors.green} />
          </View>
          <Text style={styles.confirmTitle}>Rating Submitted</Text>
          <Text style={styles.confirmSub}>Your vote has been counted.</Text>

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
                <Text style={[styles.rankBoxNum, newRank < prevRank && { color: Colors.green }]}>
                  #{newRank}
                </Text>
              </View>
            </View>
            {newRank < prevRank && (
              <View style={styles.movedUpBanner}>
                <Ionicons name="trending-up" size={14} color={Colors.green} />
                <Text style={styles.movedUpText}>Your rating helped this business move up!</Text>
              </View>
            )}
          </View>

          <View style={styles.yourRatingCard}>
            <Text style={styles.yourRatingLabel}>Your Score</Text>
            <Text style={styles.yourRatingNum}>{weightedScore.toFixed(1)}</Text>
            <Text style={styles.yourRatingWeight}>
              Counted at <Text style={{ color: tierColor }}>{MOCK_USER.tier}</Text> weight
            </Text>
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
        <Text style={styles.title}>Rate</Text>
        <Text style={styles.businessName}>{business.name}</Text>
        <Text style={styles.subtitle}>4 questions. No fluff.</Text>

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

        <View style={styles.commentBlock}>
          <Text style={styles.commentLabel}>Optional Comment</Text>
          <Text style={styles.commentDesc}>One sentence, 150 character limit</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="In your own words..."
            placeholderTextColor={Colors.textTertiary}
            value={comment}
            onChangeText={t => t.length <= 150 && setComment(t)}
            multiline
            maxLength={150}
          />
          <Text style={styles.commentCount}>{comment.length}/150</Text>
        </View>

        <View style={styles.credibilityInfo}>
          <View style={[styles.tierDot, { backgroundColor: tierColor }]} />
          <Text style={styles.credibilityText}>
            Your rating will be counted at{" "}
            <Text style={{ color: tierColor, fontFamily: "Inter_600SemiBold" }}>
              {MOCK_USER.tier}
            </Text>
            {" "}weight
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, !isComplete && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={!isComplete}
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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorText: {
    color: Colors.text,
    textAlign: "center",
    marginTop: 40,
    fontFamily: "Inter_400Regular",
  },
  navBar: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textTertiary,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  businessName: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
    marginTop: -4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    marginTop: -8,
    marginBottom: 4,
  },
  questionBlock: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textTertiary,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  questionDesc: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 21,
    marginTop: -2,
  },
  starRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  starBtn: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 52,
    borderRadius: 10,
    backgroundColor: Colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  starBtnActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  starNum: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textTertiary,
    fontFamily: "Inter_700Bold",
  },
  starNumActive: {
    color: "#000",
  },
  yesNoRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  yesNoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  yesNoBtnYes: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  yesNoBtnNo: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },
  yesNoText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textTertiary,
    fontFamily: "Inter_600SemiBold",
  },
  yesNoTextActive: {
    color: "#000",
  },
  yesNoTextNo: {
    color: "#fff",
  },
  commentBlock: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  commentLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textTertiary,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  commentDesc: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    marginTop: -4,
  },
  commentInput: {
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 72,
    textAlignVertical: "top",
  },
  commentCount: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  credibilityInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  credibilityText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  submitButton: {
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 4,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    fontFamily: "Inter_700Bold",
  },
  submitButtonTextDisabled: {
    color: Colors.textTertiary,
  },
  confirmInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  confirmIcon: {
    marginBottom: 8,
  },
  confirmTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
    textAlign: "center",
  },
  confirmSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: -8,
  },
  rankChangeCard: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rankChangeTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  rankChangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  rankBox: {
    alignItems: "center",
    gap: 4,
    width: 72,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceRaised,
  },
  rankBoxImproved: {
    backgroundColor: Colors.greenFaint,
  },
  rankBoxLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  rankBoxNum: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  movedUpBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.greenFaint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  movedUpText: {
    fontSize: 11,
    color: Colors.green,
    fontFamily: "Inter_500Medium",
  },
  yourRatingCard: {
    width: "100%",
    backgroundColor: Colors.goldFaint,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(245,197,24,0.25)",
  },
  yourRatingLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  yourRatingNum: {
    fontSize: 40,
    fontWeight: "800",
    color: Colors.gold,
    fontFamily: "Inter_700Bold",
    letterSpacing: -2,
  },
  yourRatingWeight: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  doneButton: {
    width: "100%",
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    fontFamily: "Inter_700Bold",
  },
});

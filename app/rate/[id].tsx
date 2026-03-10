import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, ActivityIndicator, useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  withDelay, Easing, FadeIn,
} from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { pct } from "@/lib/style-helpers";
import {
  TIER_COLORS, TIER_DISPLAY_NAMES, TIER_WEIGHTS, TIER_SCORE_RANGES,
  TIER_INFLUENCE_LABELS,
  type CredibilityTier, getQ1Label, getQ3Label, getWouldReturnLabel,
  getCredibilityTier,
} from "@/lib/data";
import { computeComposite, type VisitType as ScoreVisitType } from "@/shared/score-engine";
import { useAuth } from "@/lib/auth-context";
import { fetchBusinessBySlug, fetchDishSearch, type ApiDish } from "@/lib/api";
import { Confetti } from "@/components/Confetti";
import {
  CircleScorePicker, ProgressBar, StepIndicator, RatingConfirmation,
} from "@/components/rate/SubComponents";
import { RatingExtrasStep } from "@/components/rate/RatingExtrasStep";
import { BadgeToast } from "@/components/badges/BadgeToast";
import type { Badge } from "@/lib/badges";
import { useRatingSubmit } from "@/lib/hooks/useRatingSubmit";

type RatingStep = 0 | 1 | 2;
type VisitType = "dine_in" | "delivery" | "takeaway";

export default function RateScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const circleSize = Math.min(56, (screenWidth - 80) / 5 - 8);
  const { id: slug, dish: dishContext } = useLocalSearchParams<{ id: string; dish?: string }>();
  const { user } = useAuth();

  const { data: bizData, isLoading } = useQuery({
    queryKey: ["business", slug],
    queryFn: () => fetchBusinessBySlug(slug),
    enabled: !!slug,
  });

  const business = bizData?.business;
  const existingDishes = bizData?.dishes || [];

  const [step, setStep] = useState<RatingStep>(0);
  const [visitType, setVisitType] = useState<VisitType | null>(null);
  // Sprint 267: Track time-on-page for verification boost (+5% if plausible)
  const [pageEnteredAt] = useState(() => Date.now());
  const [showConfirm, setShowConfirm] = useState(false);
  const [toastBadge, setToastBadge] = useState<Badge | null>(null);
  const [q1Score, setQ1Score] = useState(0);
  const [q2Score, setQ2Score] = useState(0);
  const [q3Score, setQ3Score] = useState(0);
  const [wouldReturn, setWouldReturn] = useState<boolean | null>(null);
  const [selectedDish, setSelectedDish] = useState<string>("");
  const [dishInput, setDishInput] = useState(dishContext || "");
  const [note, setNote] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  // Sprint 334: Auto-advance focus between dimensions
  const [focusedDimension, setFocusedDimension] = useState<number>(0);

  useEffect(() => {
    if (submitError) {
      const timer = setTimeout(() => setSubmitError(""), 8000);
      return () => clearTimeout(timer);
    }
  }, [submitError]);

  const [dishSearchResults, setDishSearchResults] = useState<ApiDish[]>([]);
  const [dishSearching, setDishSearching] = useState(false);
  const dishSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (dishSearchTimeout.current) clearTimeout(dishSearchTimeout.current);
    };
  }, []);

  // Sprint 334: Auto-advance handlers — set score then focus next dimension
  const handleQ1 = (val: number) => {
    setQ1Score(val);
    if (val > 0) setTimeout(() => setFocusedDimension(1), 300);
  };
  const handleQ2 = (val: number) => {
    setQ2Score(val);
    if (val > 0) setTimeout(() => setFocusedDimension(2), 300);
  };
  const handleQ3 = (val: number) => {
    setQ3Score(val);
    if (val > 0) setTimeout(() => setFocusedDimension(3), 300);
  };
  const handleReturn = (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWouldReturn(val);
    setFocusedDimension(4); // All done — Next button focus
  };

  const userTier = (user?.credibilityTier as CredibilityTier) || "community";
  const tierColor = TIER_COLORS[userTier];
  const tierDisplayName = TIER_DISPLAY_NAMES[userTier];
  const voteWeight = TIER_WEIGHTS[userTier];

  // Sprint 274: Live composite score using score engine (visit-type weighted)
  const rawScore = q1Score > 0 && q2Score > 0 && q3Score > 0
    ? computeComposite((visitType || "dine_in") as ScoreVisitType, {
        foodScore: q1Score,
        serviceScore: visitType === "dine_in" ? q2Score : undefined,
        vibeScore: visitType === "dine_in" ? q3Score : undefined,
        packagingScore: visitType === "delivery" ? q2Score : undefined,
        waitTimeScore: visitType === "takeaway" ? q2Score : undefined,
        valueScore: (visitType === "delivery" || visitType === "takeaway") ? q3Score : undefined,
      })
    : 0;
  const weightedScore = rawScore * voteWeight;

  const confirmScale = useSharedValue(0);
  const rankSlide = useSharedValue(0);
  const tierProgress = useSharedValue(0);

  const confirmIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confirmScale.value }],
    opacity: confirmScale.value,
  }));
  const rankStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: rankSlide.value }],
    opacity: rankSlide.value === 30 ? 0 : 1,
  }));
  const tierBarStyle = useAnimatedStyle(() => ({
    width: pct(tierProgress.value),
  }));

  useEffect(() => {
    if (showConfirm) {
      confirmScale.value = withSpring(1, { damping: 12, stiffness: 120 });
      rankSlide.value = withDelay(300, withSpring(0, { damping: 14 }));
      const userScore = user?.credibilityScore || 10;
      const currentTier = getCredibilityTier(userScore);
      const range = TIER_SCORE_RANGES[currentTier];
      const progress = Math.min(100, ((userScore - range.min) / (range.max - range.min)) * 100);
      tierProgress.value = withDelay(500, withTiming(progress, { duration: 800, easing: Easing.out(Easing.cubic) }));
    } else {
      confirmScale.value = 0;
      rankSlide.value = 30;
      tierProgress.value = 0;
    }
  }, [showConfirm]);

  const handleDishSearch = (text: string) => {
    setDishInput(text);
    if (dishSearchTimeout.current) clearTimeout(dishSearchTimeout.current);
    if (text.length >= 2 && business) {
      setDishSearching(true);
      dishSearchTimeout.current = setTimeout(async () => {
        try {
          const results = await fetchDishSearch(business.id, text);
          setDishSearchResults(results);
        } catch {
          setDishSearchResults([]);
        } finally {
          setDishSearching(false);
        }
      }, 300);
    } else {
      setDishSearchResults([]);
      setDishSearching(false);
    }
  };

  const submitMutation = useRatingSubmit({
    slug,
    businessId: business?.id,
    q1Score, q2Score, q3Score,
    wouldReturn,
    visitType,
    selectedDish,
    dishInput,
    note,
    photoUri,
    timeOnPageMs: Date.now() - pageEnteredAt,
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowConfirm(true);
    },
    onBadgeEarned: (badge) => setToastBadge(badge),
    setSubmitError,
  });

  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: topPad }]}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  if (!business) {
    return (
      <View style={[styles.container, styles.centeredPadded, { paddingTop: topPad }]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.signInPromptText}>Business not found</Text>
        <TouchableOpacity style={styles.signInPromptButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
          <Text style={styles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centeredPadded, { paddingTop: topPad }]}>
        <Ionicons name="lock-closed-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.signInPromptText}>Sign in to rate businesses</Text>
        <TouchableOpacity style={styles.signInPromptButton} onPress={() => router.replace("/auth/login")} accessibilityRole="button" accessibilityLabel="Sign in to rate businesses">
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const category = business.category || "restaurant";
  const returnLabel = getWouldReturnLabel(category);

  // Dimension gating based on visit type (Rating Integrity Phase 1a)
  const getDimensionLabels = () => {
    switch (visitType) {
      case "delivery":
        return { q1Label: "Food Quality", q2Label: "Packaging Quality", q3Label: "Value for Money" };
      case "takeaway":
        return { q1Label: "Food Quality", q2Label: "Wait Time Accuracy", q3Label: "Value for Money" };
      case "dine_in":
      default:
        return { q1Label: "Food Quality", q2Label: "Service", q3Label: "Vibe & Atmosphere" };
    }
  };
  const { q1Label, q2Label, q3Label } = getDimensionLabels();

  const prevRank = business.rank ?? 1;
  const newRank = Math.max(1, prevRank - (rawScore > 4 ? 1 : 0));

  const userScore = user?.credibilityScore || 10;
  const currentTier = getCredibilityTier(userScore);
  const nextTierMap: Record<CredibilityTier, CredibilityTier | null> = {
    community: "city", city: "trusted", trusted: "top", top: null,
  };
  const nextTier = nextTierMap[currentTier];

  if (showConfirm) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <Confetti show={showConfirm} />
        {toastBadge && <BadgeToast badge={toastBadge} onDismiss={() => setToastBadge(null)} />}
        <RatingConfirmation
          business={business}
          rawScore={rawScore}
          weightedScore={weightedScore}
          voteWeight={voteWeight}
          prevRank={prevRank}
          newRank={newRank}
          userTier={currentTier}
          userScore={userScore}
          tierColor={tierColor}
          tierDisplayName={tierDisplayName}
          nextTier={nextTier}
          confirmIconStyle={confirmIconStyle}
          rankStyle={rankStyle}
          tierBarStyle={tierBarStyle}
          dishContext={dishContext}
          onDone={() => router.back()}
        />
      </View>
    );
  }

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return visitType !== null;
      case 1: return q1Score > 0 && q2Score > 0 && q3Score > 0 && wouldReturn !== null;
      case 2: return true;
      default: return false;
    }
  };

  const goNext = () => {
    if (step === 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(1);
      setFocusedDimension(0); // Sprint 334: Reset focus for dimensions step
    } else if (step === 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(2);
    } else {
      setSubmitError("");
      submitMutation.mutate();
    }
  };

  const goBack = () => {
    if (step === 2) setStep(1);
    else if (step === 1) setStep(0);
    else router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={8} accessibilityRole="button" accessibilityLabel={step > 0 ? "Previous step" : "Go back"}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <StepIndicator step={step} total={3} />
        <View style={styles.navSpacer} />
      </View>

      <ProgressBar step={step} total={3} />

      <View style={styles.businessHeader}>
        <Text style={styles.rateLabel}>RATE</Text>
        <Text style={styles.businessName} numberOfLines={1}>{business.name}</Text>
      </View>

      <ScrollView style={styles.stepArea} contentContainerStyle={styles.stepAreaContent} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
        {step === 0 ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.visitTypeContainer} key="step0">
            <Text style={styles.visitTypeTitle}>How did you experience {business.name}?</Text>
            {([
              { type: "dine_in" as VisitType, icon: "\uD83C\uDF7D\uFE0F", label: "Dined In", desc: "I ate at the restaurant" },
              { type: "delivery" as VisitType, icon: "\uD83D\uDEF5", label: "Delivery", desc: "I ordered delivery" },
              { type: "takeaway" as VisitType, icon: "\uD83D\uDCE6", label: "Takeaway", desc: "I picked up my order" },
            ]).map((opt) => (
              <TouchableOpacity
                key={opt.type}
                style={[styles.visitTypeCard, visitType === opt.type && styles.visitTypeCardSelected]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setVisitType(opt.type); }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${opt.label}: ${opt.desc}`}
                accessibilityState={{ selected: visitType === opt.type }}
              >
                <Text style={styles.visitTypeIcon}>{opt.icon}</Text>
                <View>
                  <Text style={styles.visitTypeLabel}>{opt.label}</Text>
                  <Text style={styles.visitTypeDesc}>{opt.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        ) : step === 1 ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.stepContent} key="step1" accessibilityRole="summary">
            {dishContext && (
              <View style={styles.dishContextBanner}>
                <Text style={styles.dishContextText}>
                  You're rating {business.name} for their <Text style={{ fontWeight: "700" }}>{dishContext}</Text>
                </Text>
              </View>
            )}
            {/* Sprint 334: Auto-advance focus highlighting */}
            <View style={[styles.compactQuestion, focusedDimension === 0 && q1Score === 0 && styles.focusedQuestion]}>
              <Text style={styles.compactLabel}>{q1Label}</Text>
              <CircleScorePicker value={q1Score} onChange={handleQ1} circleSize={circleSize} />
            </View>
            <View style={[styles.compactQuestion, focusedDimension === 1 && q2Score === 0 && styles.focusedQuestion]}>
              <Text style={styles.compactLabel}>{q2Label}</Text>
              <CircleScorePicker value={q2Score} onChange={handleQ2} circleSize={circleSize} />
            </View>
            <View style={[styles.compactQuestion, focusedDimension === 2 && q3Score === 0 && styles.focusedQuestion]}>
              <Text style={styles.compactLabel}>{q3Label}</Text>
              <CircleScorePicker value={q3Score} onChange={handleQ3} circleSize={circleSize} />
            </View>
            <View style={[styles.compactQuestion, focusedDimension === 3 && wouldReturn === null && styles.focusedQuestion]}>
              <Text style={styles.compactLabel}>{returnLabel}</Text>
              <View style={styles.yesNoRow}>
                <TouchableOpacity style={[styles.yesNoBtn, wouldReturn === true && styles.yesNoBtnYes]} onPress={() => handleReturn(true)} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Yes, would return" accessibilityState={{ selected: wouldReturn === true }}>
                  <Ionicons name="checkmark-circle" size={24} color={wouldReturn === true ? "#fff" : Colors.textTertiary} />
                  <Text style={[styles.yesNoText, wouldReturn === true && styles.yesNoTextActive]}>YES</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.yesNoBtn, wouldReturn === false && styles.yesNoBtnNo]} onPress={() => handleReturn(false)} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="No, would not return" accessibilityState={{ selected: wouldReturn === false }}>
                  <Ionicons name="close-circle" size={24} color={wouldReturn === false ? "#fff" : Colors.textTertiary} />
                  <Text style={[styles.yesNoText, wouldReturn === false && styles.yesNoTextActive]}>NO</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Sprint 274: Live composite score preview */}
            {rawScore > 0 && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.liveScorePreview}>
                <Text style={styles.liveScoreLabel}>YOUR SCORE</Text>
                <Text style={styles.liveScoreValue}>{rawScore.toFixed(1)}</Text>
                <Text style={styles.liveScoreWeight}>×{voteWeight} weight = {weightedScore.toFixed(1)}</Text>
              </Animated.View>
            )}
          </Animated.View>
        ) : (
          <RatingExtrasStep
            existingDishes={existingDishes}
            selectedDish={selectedDish}
            setSelectedDish={setSelectedDish}
            dishInput={dishInput}
            handleDishSearch={handleDishSearch}
            dishSearching={dishSearching}
            dishSearchResults={dishSearchResults}
            setDishSearchResults={setDishSearchResults}
            note={note}
            setNote={setNote}
            photoUri={photoUri}
            setPhotoUri={setPhotoUri}
            q1Score={q1Score}
            q2Score={q2Score}
            q3Score={q3Score}
            wouldReturn={wouldReturn}
            userTier={userTier}
            tierColor={tierColor}
            weightedScore={weightedScore}
          />
        )}
      </ScrollView>

      {!!submitError && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color={Colors.red} />
          <Text style={styles.errorBannerText}>{submitError}</Text>
          <TouchableOpacity
            onPress={() => { setSubmitError(""); submitMutation.mutate(); }}
            hitSlop={8} accessibilityRole="button" accessibilityLabel="Retry submission"
          >
            <Text style={styles.errorRetryText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSubmitError("")} hitSlop={8} accessibilityRole="button" accessibilityLabel="Dismiss error">
            <Ionicons name="close" size={14} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 12 }]}>
        {step === 2 && (
          <TouchableOpacity
            style={[styles.skipBtn, submitMutation.isPending && { opacity: 0.5 }]}
            onPress={() => { setSelectedDish(""); setDishInput(""); setNote(""); setSubmitError(""); submitMutation.mutate(); }}
            activeOpacity={0.7} disabled={submitMutation.isPending}
            accessibilityRole="button" accessibilityLabel="Skip extras and submit rating"
          >
            <Text style={styles.skipBtnText}>Skip & Submit</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.primaryButton, styles.primaryButtonFlex, !canProceed() && styles.primaryButtonDisabled]}
          onPress={goNext} activeOpacity={0.8} disabled={!canProceed() || submitMutation.isPending}
          testID="next-step" accessibilityRole="button" accessibilityLabel={step === 2 ? "Submit rating" : "Next step"}
        >
          <Text style={[styles.primaryButtonText, !canProceed() && styles.primaryButtonTextDisabled]}>
            {submitMutation.isPending ? "Submitting..." : step === 2 ? "Submit Rating" : "Next"}
          </Text>
          {(step === 0 || step === 1) && canProceed() && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { alignItems: "center", justifyContent: "center" },
  centeredPadded: { alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  signInPromptText: { color: Colors.text, textAlign: "center", marginTop: 16, fontFamily: "DMSans_400Regular" },
  signInPromptButton: {
    backgroundColor: Colors.text, borderRadius: 14, paddingVertical: 16,
    alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6,
    marginTop: 16, width: "100%",
  },
  navSpacer: { width: 36 },
  navBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 4, height: 44,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceRaised, alignItems: "center", justifyContent: "center",
  },
  businessHeader: { paddingHorizontal: 20, marginTop: 16, marginBottom: 8 },
  rateLabel: {
    fontSize: 11, fontWeight: "600" as const, color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold", letterSpacing: 1.5,
  },
  businessName: {
    fontSize: 24, fontWeight: "700" as const, color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5, marginTop: 2,
  },
  stepArea: { flex: 1, paddingHorizontal: 20 },
  stepAreaContent: { paddingVertical: 8 },
  stepContent: { gap: 20 },
  compactQuestion: { gap: 8 },
  focusedQuestion: {
    backgroundColor: "rgba(196,154,26,0.06)",
    borderRadius: 12,
    padding: 8,
    marginHorizontal: -8,
    borderWidth: 1,
    borderColor: "rgba(196,154,26,0.15)",
  },
  compactLabel: {
    fontSize: 15, fontWeight: "600" as const, color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  dishContextBanner: {
    backgroundColor: "rgba(196,154,26,0.08)", borderRadius: 10,
    padding: 12, marginBottom: 12, flexDirection: "row", alignItems: "center",
  },
  dishContextText: { fontSize: 13, color: "#111" },
  yesNoRow: { flexDirection: "row", gap: 12 },
  yesNoBtn: {
    flex: 1, alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 6, paddingVertical: 14, borderRadius: 14,
    backgroundColor: Colors.surfaceRaised, borderWidth: 2, borderColor: Colors.border,
  },
  yesNoBtnYes: { backgroundColor: Colors.green, borderColor: Colors.green },
  yesNoBtnNo: { backgroundColor: Colors.red, borderColor: Colors.red },
  yesNoText: {
    fontSize: 18, fontWeight: "700" as const, color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold", letterSpacing: 1,
  },
  yesNoTextActive: { color: "#fff" },
  bottomBar: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  skipBtn: { paddingHorizontal: 16, paddingVertical: 14 },
  skipBtnText: { fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  primaryButton: {
    backgroundColor: Colors.text, borderRadius: 14, paddingVertical: 16,
    alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6,
  },
  primaryButtonFlex: { flex: 1 },
  primaryButtonDisabled: { backgroundColor: Colors.surfaceRaised },
  primaryButtonText: {
    fontSize: 16, fontWeight: "700" as const, color: "#FFFFFF", fontFamily: "DMSans_700Bold",
  },
  primaryButtonTextDisabled: { color: Colors.textTertiary },
  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.redFaint, borderRadius: 10, padding: 12,
    marginHorizontal: 20, marginBottom: 8,
  },
  errorBannerText: {
    fontSize: 13, color: Colors.red, fontFamily: "DMSans_500Medium", flex: 1,
  },
  errorRetryText: {
    fontSize: 13, fontWeight: "600", color: BRAND.colors.amber,
    fontFamily: "DMSans_600SemiBold",
  },
  visitTypeContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center" as const,
  },
  visitTypeTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center" as const,
    marginBottom: 32,
    fontFamily: "DMSans_700Bold",
  },
  visitTypeCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 20,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  visitTypeCardSelected: {
    borderColor: BRAND.colors.amber,
    backgroundColor: "rgba(196, 154, 26, 0.08)",
  },
  visitTypeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  visitTypeLabel: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },
  visitTypeDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    fontFamily: "DMSans_400Regular",
  },
  // Sprint 274: Live score preview
  liveScorePreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
  },
  liveScoreLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold",
    letterSpacing: 1,
  },
  liveScoreValue: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.gold,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  liveScoreWeight: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
  },
});

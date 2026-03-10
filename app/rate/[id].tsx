import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, ActivityIndicator, useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import {
  TIER_COLORS, TIER_DISPLAY_NAMES, TIER_WEIGHTS,
  type CredibilityTier, getQ1Label, getQ3Label, getWouldReturnLabel,
  getCredibilityTier,
} from "@/lib/data";
import { computeComposite, type VisitType as ScoreVisitType } from "@/shared/score-engine";
import { useAuth } from "@/lib/auth-context";
import { fetchBusinessBySlug, fetchDishSearch, type ApiDish } from "@/lib/api";
import { Confetti } from "@/components/Confetti";
import {
  CircleScorePicker, ProgressBar, StepIndicator, StepDescription, RatingConfirmation,
} from "@/components/rate/SubComponents";
import { RatingExtrasStep } from "@/components/rate/RatingExtrasStep";
import { VisitTypeStep, getDimensionLabels, type VisitType } from "@/components/rate/VisitTypeStep";
import { BadgeToast } from "@/components/badges/BadgeToast";
import type { Badge } from "@/lib/badges";
import { useRatingSubmit } from "@/lib/hooks/useRatingSubmit";
import {
  useDimensionHighlight, useDimensionTiming, useConfirmationAnimations,
} from "@/lib/hooks/useRatingAnimations";

type RatingStep = 0 | 1 | 2;

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
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  // Sprint 334: Auto-advance focus between dimensions
  const [focusedDimension, setFocusedDimension] = useState<number>(0);
  // Sprint 339: Scroll-to-focus on small screens
  const scrollViewRef = useRef<ScrollView>(null);
  const dimensionYPositions = useRef<number[]>([0, 0, 0, 0]);
  // Sprint 346: Extracted timing hook
  const dimensionTimingRef = useDimensionTiming(focusedDimension);

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

  // Sprint 339: Auto-scroll to focused dimension on small screens
  useEffect(() => {
    if (focusedDimension >= 1 && focusedDimension <= 3 && scrollViewRef.current) {
      const targetY = dimensionYPositions.current[focusedDimension] || 0;
      if (targetY > 0) {
        scrollViewRef.current.scrollTo({ y: Math.max(0, targetY - 40), animated: true });
      }
    }
  }, [focusedDimension]);

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

  // Sprint 346: Extracted animation hooks
  const [dim0Style, dim1Style, dim2Style, dim3Style] = useDimensionHighlight({
    focusedDimension, q1Score, q2Score, q3Score, wouldReturn,
  });
  const { confirmIconStyle, rankStyle, tierBarStyle } = useConfirmationAnimations(
    showConfirm, user?.credibilityScore,
  );

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
    receiptUri,
    timeOnPageMs: Date.now() - pageEnteredAt,
    dimensionTimingMs: dimensionTimingRef.current,
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

  // Sprint 411: Extracted to VisitTypeStep (Rating Integrity Phase 1a)
  const { q1Label, q2Label, q3Label } = getDimensionLabels(visitType);

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
          hasPhoto={!!photoUri || photoUris.length > 0}
          hasDish={!!(selectedDish || dishInput.trim())}
          hasReceipt={!!receiptUri}
          timeOnPageMs={Date.now() - pageEnteredAt}
          businessSlug={slug}
          onRateAnother={() => router.replace("/(tabs)/search")}
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
        <Text style={styles.businessName} numberOfLines={1} accessibilityRole="header">{business.name}</Text>
        <StepDescription step={step} />
      </View>

      <ScrollView ref={scrollViewRef} style={styles.stepArea} contentContainerStyle={styles.stepAreaContent} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
        {step === 0 ? (
          <VisitTypeStep businessName={business.name} visitType={visitType} onSelect={setVisitType} />
        ) : step === 1 ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.stepContent} key="step1" accessibilityRole="summary">
            {dishContext && (
              <View style={styles.dishContextBanner}>
                <Text style={styles.dishContextText}>
                  You're rating {business.name} for their <Text style={{ fontWeight: "700" }}>{dishContext}</Text>
                </Text>
              </View>
            )}
            {/* Sprint 334/342: Auto-advance focus with animated highlight */}
            <Animated.View style={[styles.compactQuestion, dim0Style]} onLayout={(e) => { dimensionYPositions.current[0] = e.nativeEvent.layout.y; }}>
              <Text style={styles.compactLabel}>{q1Label}</Text>
              <CircleScorePicker value={q1Score} onChange={handleQ1} circleSize={circleSize} />
            </Animated.View>
            <Animated.View style={[styles.compactQuestion, dim1Style]} onLayout={(e) => { dimensionYPositions.current[1] = e.nativeEvent.layout.y; }}>
              <Text style={styles.compactLabel}>{q2Label}</Text>
              <CircleScorePicker value={q2Score} onChange={handleQ2} circleSize={circleSize} />
            </Animated.View>
            <Animated.View style={[styles.compactQuestion, dim2Style]} onLayout={(e) => { dimensionYPositions.current[2] = e.nativeEvent.layout.y; }}>
              <Text style={styles.compactLabel}>{q3Label}</Text>
              <CircleScorePicker value={q3Score} onChange={handleQ3} circleSize={circleSize} />
            </Animated.View>
            <Animated.View style={[styles.compactQuestion, dim3Style]} onLayout={(e) => { dimensionYPositions.current[3] = e.nativeEvent.layout.y; }}>
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
            </Animated.View>
            {/* Sprint 274: Live composite score preview */}
            {rawScore > 0 && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.liveScorePreview} accessibilityLiveRegion="polite" accessibilityLabel={`Your score: ${rawScore.toFixed(1)}, weighted: ${weightedScore.toFixed(1)}`}>
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
            photoUris={photoUris}
            setPhotoUris={setPhotoUris}
            receiptUri={receiptUri}
            setReceiptUri={setReceiptUri}
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

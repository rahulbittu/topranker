import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, ActivityIndicator, useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated from "react-native-reanimated";
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
  ProgressBar, StepIndicator, StepDescription, RatingConfirmation,
} from "@/components/rate/SubComponents";
import { RatingExtrasStep } from "@/components/rate/RatingExtrasStep";
import { RatingReviewStep } from "@/components/rate/RatingReviewStep";
import { DimensionScoringStep } from "@/components/rate/DimensionScoringStep";
import { VisitTypeStep, getDimensionLabels, getDimensionTooltips, type VisitType } from "@/components/rate/VisitTypeStep";
import { BadgeToast } from "@/components/badges/BadgeToast";
import { Analytics } from "@/lib/analytics";
import type { Badge } from "@/lib/badges";
import { useRatingSubmit } from "@/lib/hooks/useRatingSubmit";
import {
  useDimensionHighlight, useDimensionTiming, useConfirmationAnimations,
} from "@/lib/hooks/useRatingAnimations";

type RatingStep = 0 | 1 | 2 | 3;

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

  // Sprint 714: Track rate_start on mount
  const hasTrackedStart = useRef(false);
  useEffect(() => {
    if (slug && !hasTrackedStart.current) {
      hasTrackedStart.current = true;
      Analytics.rateStart(slug);
    }
  }, [slug]);

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
      if (slug) Analytics.rateComplete(slug, q1Score);
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
  // Sprint 439: Dimension tooltips
  const dimensionTooltips = getDimensionTooltips(visitType);
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

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
      case 3: return true;
      default: return false;
    }
  };

  // Sprint 703: Show users what's needed before they can proceed
  const validationHint = (): string | null => {
    if (canProceed()) return null;
    if (step === 0) return "Select how you visited";
    if (step === 1) {
      const missing: string[] = [];
      if (q1Score === 0 || q2Score === 0 || q3Score === 0) missing.push("Rate all dimensions");
      if (wouldReturn === null) missing.push("Answer \"Would you return?\"");
      return missing.join(" · ");
    }
    return null;
  };

  const goNext = () => {
    if (step === 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(1);
      setFocusedDimension(0); // Sprint 334: Reset focus for dimensions step
    } else if (step === 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(2);
    } else if (step === 2) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(3);
    } else {
      setSubmitError("");
      submitMutation.mutate();
    }
  };

  const goBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
    else if (step === 1) setStep(0);
    else {
      if (slug) Analytics.rateAbandon(slug, step);
      router.back();
    }
  };

  // Sprint 531: Jump to specific step from review screen
  const handleEditStep = (targetStep: number) => {
    setStep(targetStep as RatingStep);
    if (targetStep === 1) setFocusedDimension(0);
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={8} accessibilityRole="button" accessibilityLabel={step > 0 ? "Previous step" : "Go back"}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <StepIndicator step={step} total={4} />
        <View style={styles.navSpacer} />
      </View>

      <ProgressBar step={step} total={4} />

      <View style={styles.businessHeader}>
        <Text style={styles.rateLabel}>RATE</Text>
        <Text style={styles.businessName} numberOfLines={1} accessibilityRole="header">{business.name}</Text>
        <StepDescription step={step} />
      </View>

      <ScrollView ref={scrollViewRef} style={styles.stepArea} contentContainerStyle={styles.stepAreaContent} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
        {step === 0 ? (
          <VisitTypeStep businessName={business.name} visitType={visitType} onSelect={setVisitType} />
        ) : step === 1 ? (
          <DimensionScoringStep
            businessName={business.name}
            dishContext={dishContext}
            q1Label={q1Label} q2Label={q2Label} q3Label={q3Label}
            returnLabel={returnLabel}
            dimensionTooltips={dimensionTooltips}
            q1Score={q1Score} q2Score={q2Score} q3Score={q3Score}
            wouldReturn={wouldReturn}
            rawScore={rawScore} weightedScore={weightedScore} voteWeight={voteWeight}
            circleSize={circleSize}
            activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}
            onQ1Change={handleQ1} onQ2Change={handleQ2} onQ3Change={handleQ3}
            onReturnChange={handleReturn}
            dim0Style={dim0Style} dim1Style={dim1Style} dim2Style={dim2Style} dim3Style={dim3Style}
            onDimensionLayout={(idx, y) => { dimensionYPositions.current[idx] = y; }}
          />
        ) : step === 2 ? (
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
            visitType={visitType}
            pageEnteredAt={pageEnteredAt}
          />
        ) : (
          <RatingReviewStep
            businessName={business.name}
            visitType={visitType || "dine_in"}
            q1Score={q1Score}
            q2Score={q2Score}
            q3Score={q3Score}
            wouldReturn={wouldReturn}
            rawScore={rawScore}
            weightedScore={weightedScore}
            voteWeight={voteWeight}
            userTier={userTier}
            tierColor={tierColor}
            selectedDish={selectedDish}
            dishInput={dishInput}
            note={note}
            photoUris={photoUris.length > 0 ? photoUris : (photoUri ? [photoUri] : [])}
            receiptUri={receiptUri}
            onEditStep={handleEditStep}
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
            style={styles.skipBtn}
            onPress={() => { setSelectedDish(""); setDishInput(""); setNote(""); setStep(3); }}
            activeOpacity={0.7}
            accessibilityRole="button" accessibilityLabel="Skip extras and go to review"
          >
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.primaryButton, styles.primaryButtonFlex, !canProceed() && styles.primaryButtonDisabled]}
          onPress={goNext} activeOpacity={0.8} disabled={!canProceed() || submitMutation.isPending}
          testID="next-step" accessibilityRole="button" accessibilityLabel={step === 3 ? "Submit rating" : "Next step"}
        >
          <Text style={[styles.primaryButtonText, !canProceed() && styles.primaryButtonTextDisabled]}>
            {submitMutation.isPending ? "Submitting..." : step === 3 ? "Submit Rating" : step === 2 ? "Review" : "Next"}
          </Text>
          {(step === 0 || step === 1 || step === 2) && canProceed() && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>
      {/* Sprint 703: Validation hint when Next is disabled */}
      {validationHint() && (
        <Text style={styles.validationHint}>{validationHint()}</Text>
      )}
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
  validationHint: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textAlign: "center", paddingHorizontal: 20, paddingBottom: 4, marginTop: -4,
  },
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
});

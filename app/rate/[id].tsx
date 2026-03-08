import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  Platform, ActivityIndicator, useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  withSequence, withDelay, Easing, FadeIn, FadeInDown, FadeInUp,
} from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { pct } from "@/lib/style-helpers";
import {
  TIER_COLORS, TIER_DISPLAY_NAMES, TIER_WEIGHTS, TIER_SCORE_RANGES,
  type CredibilityTier, getQ1Label, getQ3Label, getWouldReturnLabel,
  getCredibilityTier,
} from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { fetchBusinessBySlug, fetchDishSearch, type ApiDish } from "@/lib/api";
import { apiRequest } from "@/lib/query-client";
import { Confetti } from "@/components/Confetti";
import { hapticRatingSuccess, hapticConfetti } from "@/lib/audio";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import {
  CircleScorePicker, CircleScoreLabels, ProgressBar, StepIndicator,
  DishPill, RatingConfirmation,
} from "@/components/rate/SubComponents";
import { BadgeToast } from "@/components/badges/BadgeToast";
import { getBadgeById, type Badge } from "@/lib/badges";

type RatingStep = 1 | 2;

export default function RateScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const circleSize = Math.min(56, (screenWidth - 80) / 5 - 8);
  const { id: slug } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: bizData, isLoading } = useQuery({
    queryKey: ["business", slug],
    queryFn: () => fetchBusinessBySlug(slug),
    enabled: !!slug,
  });

  const business = bizData?.business;
  const existingDishes = bizData?.dishes || [];

  const [step, setStep] = useState<RatingStep>(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toastBadge, setToastBadge] = useState<Badge | null>(null);
  const [q1Score, setQ1Score] = useState(0);
  const [q2Score, setQ2Score] = useState(0);
  const [q3Score, setQ3Score] = useState(0);
  const [wouldReturn, setWouldReturn] = useState<boolean | null>(null);
  const [selectedDish, setSelectedDish] = useState<string>("");
  const [dishInput, setDishInput] = useState("");
  const [note, setNote] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");

  const [dishSearchResults, setDishSearchResults] = useState<ApiDish[]>([]);
  const [dishSearching, setDishSearching] = useState(false);
  const dishSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (dishSearchTimeout.current) clearTimeout(dishSearchTimeout.current);
    };
  }, []);

  const userTier = (user?.credibilityTier as CredibilityTier) || "community";
  const tierColor = TIER_COLORS[userTier];
  const tierDisplayName = TIER_DISPLAY_NAMES[userTier];
  const voteWeight = TIER_WEIGHTS[userTier];

  const rawScore = q1Score > 0 && q2Score > 0 && q3Score > 0
    ? (q1Score + q2Score + q3Score) / 3
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

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!business) throw new Error("Business not found");
      const dishName = selectedDish || (dishInput.trim() || undefined);
      const res = await apiRequest("POST", "/api/ratings", {
        businessId: business.id,
        q1Score,
        q2Score,
        q3Score,
        wouldReturn,
        dishName: dishName || undefined,
        note: note.trim() || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ["business", slug] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
      qc.invalidateQueries({ queryKey: ["search"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["challengers"] });
      setShowConfirm(true);
      hapticRatingSuccess();
      setTimeout(() => hapticConfetti(), 300);

      // Check for milestone and streak badges earned by this rating
      const milestoneBadgeMap: Record<number, string> = {
        1: "first-taste", 5: "getting-started", 10: "ten-strong",
        25: "quarter-century", 50: "half-century", 100: "centurion",
        250: "rating-machine", 500: "legendary-judge",
      };
      const streakBadgeMap: Record<number, string> = {
        3: "three-day-streak", 7: "week-warrior",
        14: "two-week-streak", 30: "monthly-devotion",
      };
      // Profile data comes from react-query cache
      const profileData = qc.getQueryData<{
        totalRatings?: number;
        currentStreak?: number;
      }>(["profile"]);
      const newTotal = (profileData?.totalRatings ?? 0) + 1;
      const newStreak = (profileData?.currentStreak ?? 0) + 1;

      // Milestone badge takes priority, then streak badge
      const milestoneBadgeId = milestoneBadgeMap[newTotal];
      const streakBadgeId = streakBadgeMap[newStreak];
      const badgeId = milestoneBadgeId || streakBadgeId;

      if (badgeId) {
        const badge = getBadgeById(badgeId);
        if (badge) {
          setTimeout(() => setToastBadge(badge), 1500);
        }
      }
    },
    onError: (err: Error) => {
      const msg = err.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("Network")) {
        setSubmitError("No internet connection. Please check your network and try again.");
      } else if (msg.includes("401")) {
        setSubmitError("Your session has expired. Please sign in again.");
      } else {
        setSubmitError(msg || "Failed to submit rating");
      }
    },
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
        <TouchableOpacity
          style={styles.signInPromptButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
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
        <TouchableOpacity
          style={styles.signInPromptButton}
          onPress={() => router.replace("/auth/login")}
          accessibilityRole="button"
          accessibilityLabel="Sign in to rate businesses"
        >
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const category = business.category || "restaurant";
  const q1Label = getQ1Label(category);
  const q3Label = getQ3Label(category);
  const returnLabel = getWouldReturnLabel(category);

  const prevRank = business.rank ?? 1;
  const newRank = Math.max(1, prevRank - (rawScore > 4 ? 1 : 0));

  const userScore = user?.credibilityScore || 10;
  const currentTier = getCredibilityTier(userScore);
  const nextTierMap: Record<CredibilityTier, CredibilityTier | null> = {
    community: "city", city: "trusted", trusted: "top", top: null,
  };
  const nextTier = nextTierMap[currentTier];
  const range = TIER_SCORE_RANGES[currentTier];
  const tierPercent = Math.min(100, ((userScore - range.min) / (range.max - range.min)) * 100);

  if (showConfirm) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <Confetti show={showConfirm} />
        {toastBadge && (
          <BadgeToast badge={toastBadge} onDismiss={() => setToastBadge(null)} />
        )}
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
          onDone={() => router.back()}
        />
      </View>
    );
  }

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return q1Score > 0 && q2Score > 0 && q3Score > 0 && wouldReturn !== null;
      case 2: return true;
      default: return false;
    }
  };

  const goNext = () => {
    if (step < 2) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(2);
    } else {
      setSubmitError("");
      submitMutation.mutate();
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(1);
    } else {
      router.back();
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Animated.View entering={FadeIn.duration(300)} style={styles.stepContent} key="step1" accessibilityRole="summary">
            {/* Q1: Quality */}
            <View style={styles.compactQuestion}>
              <Text style={styles.compactLabel}>{q1Label}</Text>
              <CircleScorePicker value={q1Score} onChange={setQ1Score} circleSize={circleSize} />
            </View>

            {/* Q2: Value */}
            <View style={styles.compactQuestion}>
              <Text style={styles.compactLabel}>Value for Money</Text>
              <CircleScorePicker value={q2Score} onChange={setQ2Score} circleSize={circleSize} />
            </View>

            {/* Q3: Service */}
            <View style={styles.compactQuestion}>
              <Text style={styles.compactLabel}>{q3Label}</Text>
              <CircleScorePicker value={q3Score} onChange={setQ3Score} circleSize={circleSize} />
            </View>

            {/* Would Return */}
            <View style={styles.compactQuestion}>
              <Text style={styles.compactLabel}>{returnLabel}</Text>
              <View style={styles.yesNoRow}>
                <TouchableOpacity
                  style={[styles.yesNoBtn, wouldReturn === true && styles.yesNoBtnYes]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setWouldReturn(true);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Yes, would return"
                  accessibilityState={{ selected: wouldReturn === true }}
                >
                  <Ionicons name="checkmark-circle" size={24} color={wouldReturn === true ? "#fff" : Colors.textTertiary} />
                  <Text style={[styles.yesNoText, wouldReturn === true && styles.yesNoTextActive]}>YES</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.yesNoBtn, wouldReturn === false && styles.yesNoBtnNo]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setWouldReturn(false);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="No, would not return"
                  accessibilityState={{ selected: wouldReturn === false }}
                >
                  <Ionicons name="close-circle" size={24} color={wouldReturn === false ? "#fff" : Colors.textTertiary} />
                  <Text style={[styles.yesNoText, wouldReturn === false && styles.yesNoTextActive]}>NO</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View entering={FadeIn.duration(300)} style={styles.stepContent} key="step2" accessibilityRole="summary">
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>Almost done!</Text>
              <Text style={styles.stepSubtitle}>Optional extras — skip or add details</Text>
            </View>

            {/* Dish selection */}
            {existingDishes.length > 0 && (
              <View>
                <Text style={styles.compactLabel}>Top Dish</Text>
                <View style={styles.dishPillsWrap}>
                  {existingDishes.map(dish => (
                    <DishPill
                      key={dish.id}
                      dish={dish}
                      selected={selectedDish === dish.name}
                      onPress={() => {
                        setSelectedDish(selectedDish === dish.name ? "" : dish.name);
                        setDishInput("");
                      }}
                    />
                  ))}
                </View>
              </View>
            )}

            {!selectedDish && (
              <View style={styles.dishInputWrap}>
                <TextInput
                  style={styles.dishInput}
                  placeholder="Type a dish name (optional)..."
                  placeholderTextColor={Colors.textTertiary}
                  value={dishInput}
                  onChangeText={handleDishSearch}
                  maxLength={80}
                />
                {dishSearching && (
                  <ActivityIndicator size="small" color={Colors.gold} style={{ marginTop: 8 }} />
                )}
                {dishSearchResults.length > 0 && !dishSearching && (
                  <View style={styles.dishSuggestions}>
                    {dishSearchResults.map(d => (
                      <TouchableOpacity
                        key={d.id}
                        style={styles.dishSuggestionItem}
                        onPress={() => {
                          setSelectedDish(d.name);
                          setDishInput("");
                          setDishSearchResults([]);
                        }}
                      >
                        <Text style={styles.dishSuggestionText}>{d.name}</Text>
                        <Text style={styles.dishSuggestionCount}>{d.voteCount} votes</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {selectedDish ? (
              <View style={styles.dishSelectedDisplay}>
                <Ionicons name="restaurant" size={16} color={Colors.gold} />
                <Text style={styles.dishSelectedText}>{selectedDish}</Text>
                <TouchableOpacity onPress={() => setSelectedDish("")}>
                  <Ionicons name="close" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Quick Note */}
            <View style={styles.noteInputWrap}>
              <TextInput
                style={[styles.noteInput, { minHeight: 60 }]}
                placeholder="Quick note (optional)..."
                placeholderTextColor={Colors.textTertiary}
                value={note}
                onChangeText={t => t.length <= 160 && setNote(t)}
                multiline
                maxLength={160}
              />
              <Text style={[
                styles.noteCounter,
                note.length > 140 && styles.noteCounterWarn,
                note.length >= 160 && styles.noteCounterMax,
              ]}>
                {note.length}/160
              </Text>
            </View>

            {/* Photo Upload */}
            <View style={styles.photoSection}>
              {photoUri ? (
                <View style={styles.photoPreview}>
                  <Image source={{ uri: photoUri }} style={styles.photoImage} contentFit="cover" />
                  <TouchableOpacity
                    style={styles.photoRemove}
                    onPress={() => setPhotoUri(null)}
                    hitSlop={8}
                  >
                    <Ionicons name="close-circle" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.photoAddBtn}
                  onPress={async () => {
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: true,
                      aspect: [4, 3],
                      quality: 0.8,
                    });
                    if (!result.canceled && result.assets[0]) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setPhotoUri(result.assets[0].uri);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera-outline" size={20} color={Colors.textTertiary} />
                  <Text style={styles.photoAddText}>Add photo</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Score summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>YOUR RATING</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryItemVal}>{q1Score}</Text>
                  <Text style={styles.summaryItemLabel}>Quality</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryItemVal}>{q2Score}</Text>
                  <Text style={styles.summaryItemLabel}>Value</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryItemVal}>{q3Score}</Text>
                  <Text style={styles.summaryItemLabel}>Service</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Ionicons
                    name={wouldReturn ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={wouldReturn ? Colors.green : Colors.red}
                  />
                  <Text style={styles.summaryItemLabel}>Return</Text>
                </View>
              </View>
              <View style={styles.summaryScoreRow}>
                <View style={[styles.tierDot, { backgroundColor: tierColor }]} />
                <Text style={styles.summaryWeightLabel}>
                  {rawScore.toFixed(1)} x {voteWeight.toFixed(2)} =
                </Text>
                <Text style={[styles.summaryWeightVal, { color: Colors.gold }]}>
                  {weightedScore.toFixed(2)}
                </Text>
              </View>
            </View>
          </Animated.View>
        );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={8} accessibilityRole="button" accessibilityLabel={step > 1 ? "Previous step" : "Go back"}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <StepIndicator step={step - 1} total={2} />
        <View style={styles.navSpacer} />
      </View>

      <ProgressBar step={step - 1} total={2} />

      <View style={styles.businessHeader}>
        <Text style={styles.rateLabel}>RATE</Text>
        <Text style={styles.businessName} numberOfLines={1}>{business.name}</Text>
      </View>

      <ScrollView style={styles.stepArea} contentContainerStyle={styles.stepAreaContent} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
        {renderStepContent()}
      </ScrollView>

      {!!submitError && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color={Colors.red} />
          <Text style={styles.errorBannerText}>{submitError}</Text>
        </View>
      )}

      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 12 }]}>
        {step === 2 && (
          <TouchableOpacity
            style={[styles.skipBtn, submitMutation.isPending && { opacity: 0.5 }]}
            onPress={() => {
              setSelectedDish("");
              setDishInput("");
              setNote("");
              setSubmitError("");
              submitMutation.mutate();
            }}
            activeOpacity={0.7}
            disabled={submitMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="Skip extras and submit rating"
          >
            <Text style={styles.skipBtnText}>Skip & Submit</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            styles.primaryButtonFlex,
            !canProceed() && styles.primaryButtonDisabled,
          ]}
          onPress={goNext}
          activeOpacity={0.8}
          disabled={!canProceed() || submitMutation.isPending}
          testID="next-step"
          accessibilityRole="button"
          accessibilityLabel={step === 2 ? "Submit rating" : "Next step"}
        >
          <Text style={[styles.primaryButtonText, !canProceed() && styles.primaryButtonTextDisabled]}>
            {submitMutation.isPending
              ? "Submitting..."
              : step === 2
                ? "Submit Rating"
                : "Next"
            }
          </Text>
          {step === 1 && canProceed() && (
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { alignItems: "center", justifyContent: "center" },
  centeredPadded: { alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  errorText: { color: Colors.text, textAlign: "center", marginTop: 40, fontFamily: "DMSans_400Regular" },
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
  stepIndicator: {
    fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold",
  },
  stepIndicatorOf: { color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  progressContainer: {
    flexDirection: "row", gap: 4, paddingHorizontal: 20, marginTop: 8,
  },
  progressDot: {
    flex: 1, height: 3, borderRadius: 2, backgroundColor: Colors.border,
  },
  progressDotComplete: { backgroundColor: Colors.gold },
  progressDotCurrent: { backgroundColor: Colors.textTertiary },

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
  stepHeader: { gap: 4 },
  stepNumber: {
    fontSize: 32, fontWeight: "700" as const, color: Colors.gold,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -1,
  },
  stepTitle: {
    fontSize: 22, fontWeight: "700" as const, color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },

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

  dishPillsWrap: {
    flexDirection: "row", flexWrap: "wrap", gap: 8,
  },

  dishInputWrap: { gap: 4 },
  dishInput: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 14,
    fontSize: 15, color: Colors.text, fontFamily: "DMSans_400Regular",
  },
  dishSuggestions: {
    backgroundColor: Colors.surface, borderRadius: 10,
    overflow: "hidden", ...Colors.cardShadow,
  },
  dishSuggestionItem: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  dishSuggestionText: {
    fontSize: 14, color: Colors.text, fontFamily: "DMSans_500Medium",
  },
  dishSuggestionCount: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  dishSelectedDisplay: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.goldFaint, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12,
  },
  dishSelectedText: {
    fontSize: 14, color: Colors.gold, fontFamily: "DMSans_600SemiBold", flex: 1,
  },

  noteInputWrap: { gap: 4 },
  noteInput: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 14,
    fontSize: 15, color: Colors.text, fontFamily: "DMSans_400Regular",
    minHeight: 100,
    textAlignVertical: "top" as const,
  },
  noteCounter: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textAlign: "right",
  },
  noteCounterWarn: { color: Colors.gold },
  noteCounterMax: { color: Colors.red },

  // Photo upload
  photoSection: { marginTop: 4 },
  photoAddBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: Colors.surfaceRaised, borderRadius: 12, paddingVertical: 16,
    borderWidth: 1, borderColor: Colors.border, borderStyle: "dashed",
  },
  photoAddText: { fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  photoPreview: { borderRadius: 12, overflow: "hidden", position: "relative" },
  photoImage: { width: "100%", height: 160, borderRadius: 12 },
  photoRemove: {
    position: "absolute", top: 8, right: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3, shadowRadius: 2,
  },

  summaryCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 12,
    ...Colors.cardShadow,
  },
  summaryTitle: {
    fontSize: 10, fontWeight: "700" as const, color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold", letterSpacing: 1.5,
  },
  summaryGrid: { flexDirection: "row", justifyContent: "space-around" },
  summaryItem: { alignItems: "center", gap: 4 },
  summaryItemVal: {
    fontSize: 22, fontWeight: "700" as const, color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  summaryItemLabel: {
    fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  summaryScoreRow: {
    flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center",
    paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  summaryWeightLabel: {
    fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
  summaryWeightVal: {
    fontSize: 16, fontWeight: "700" as const, fontFamily: "PlayfairDisplay_700Bold",
  },
  tierDot: { width: 8, height: 8, borderRadius: 4 },

  bottomBar: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  skipBtn: {
    paddingHorizontal: 16, paddingVertical: 14,
  },
  skipBtnText: {
    fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_500Medium",
  },
  primaryButton: {
    backgroundColor: Colors.text, borderRadius: 14, paddingVertical: 16,
    alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6,
  },
  primaryButtonFlex: { flex: 1 },
  primaryButtonDisabled: {
    backgroundColor: Colors.surfaceRaised,
  },
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

});

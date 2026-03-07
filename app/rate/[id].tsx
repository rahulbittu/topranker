import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
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
import {
  TIER_COLORS, TIER_DISPLAY_NAMES, TIER_WEIGHTS, TIER_SCORE_RANGES,
  type CredibilityTier, getQ1Label, getQ3Label, getWouldReturnLabel,
  getCredibilityTier,
} from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { fetchBusinessBySlug, fetchDishSearch, type ApiDish } from "@/lib/api";
import { apiRequest } from "@/lib/query-client";

const SCORE_LABELS = ["Poor", "Fair", "Good", "Great", "Amazing"];

type RatingStep = 1 | 2 | 3 | 4 | 5 | 6;

function CircleScorePicker({ value, onChange, circleSize }: { value: number; onChange: (v: number) => void; circleSize: number }) {
  return (
    <View style={styles.circleRow}>
      {[1, 2, 3, 4, 5].map(n => {
        const isActive = value === n;
        return (
          <TouchableOpacity
            key={n}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onChange(n);
            }}
            style={[styles.circle, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }, isActive && styles.circleActive]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Score ${n}, ${SCORE_LABELS[n - 1]}`}
            accessibilityState={{ selected: isActive }}
            accessibilityHint="Double tap to select this score"
          >
            <Text style={[styles.circleNum, isActive && styles.circleNumActive]}>{n}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function CircleScoreLabels({ circleSize }: { circleSize: number }) {
  return (
    <View style={styles.circleLabelRow}>
      {SCORE_LABELS.map((label, i) => (
        <View key={i} style={[styles.circleLabelItem, { width: circleSize }]}>
          <Text style={styles.circleLabelText}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.progressContainer} accessibilityRole="progressbar" accessibilityLabel={`Step ${step + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.progressDot,
            i < step && styles.progressDotComplete,
            i === step && styles.progressDotCurrent,
          ]}
          accessibilityLabel={`Step ${i + 1}${i < step ? ", completed" : i === step ? ", current" : ""}`}
        />
      ))}
    </View>
  );
}

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <Text style={styles.stepIndicator}>
      {step + 1} <Text style={styles.stepIndicatorOf}>of</Text> {total}
    </Text>
  );
}

function DishPill({ dish, selected, onPress }: { dish: ApiDish; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.dishPill, selected && styles.dishPillSelected]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.7}
    >
      <Text style={[styles.dishPillText, selected && styles.dishPillTextSelected]}>
        {dish.name}
      </Text>
      {dish.voteCount > 0 && (
        <View style={[styles.dishVoteBadge, selected && styles.dishVoteBadgeSelected]}>
          <Text style={[styles.dishVoteCount, selected && styles.dishVoteCountSelected]}>
            {dish.voteCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

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
  const [q1Score, setQ1Score] = useState(0);
  const [q2Score, setQ2Score] = useState(0);
  const [q3Score, setQ3Score] = useState(0);
  const [wouldReturn, setWouldReturn] = useState<boolean | null>(null);
  const [selectedDish, setSelectedDish] = useState<string>("");
  const [dishInput, setDishInput] = useState("");
  const [note, setNote] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [dishSearchResults, setDishSearchResults] = useState<ApiDish[]>([]);
  const [dishSearching, setDishSearching] = useState(false);
  const dishSearchTimeout = useRef<NodeJS.Timeout | null>(null);

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
    width: `${tierProgress.value}%` as any,
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
        <View style={styles.confirmInner}>
          <Animated.View style={[styles.confirmIconWrap, confirmIconStyle]}>
            <View style={styles.confirmIconCircle}>
              <Ionicons name="checkmark" size={40} color="#FFFFFF" />
            </View>
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(200).duration(400)} style={styles.confirmTitle}>
            Rating Submitted
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(300).duration(400)} style={styles.confirmSub}>
            Your weighted vote has been counted
          </Animated.Text>

          <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.rankChangeCard}>
            <Text style={styles.rankChangeTitle}>{business.name}</Text>
            <Animated.View style={[styles.rankChangeRow, rankStyle]}>
              <View style={styles.rankBox}>
                <Text style={styles.rankBoxLabel}>Before</Text>
                <Text style={styles.rankBoxNum}>#{prevRank}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={Colors.textTertiary} />
              <View style={[styles.rankBox, newRank < prevRank && styles.rankBoxImproved]}>
                <Text style={styles.rankBoxLabel}>After</Text>
                <Text style={[styles.rankBoxNum, newRank < prevRank && { color: Colors.green }]}>
                  #{newRank}
                </Text>
              </View>
            </Animated.View>
            {newRank < prevRank && (
              <View style={styles.movedUpBanner}>
                <Ionicons name="trending-up" size={14} color={Colors.green} />
                <Text style={styles.movedUpText}>Your rating helped this business move up!</Text>
              </View>
            )}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(600).duration(500)} style={styles.tierProgressCard}>
            <View style={styles.tierProgressHeader}>
              <View style={styles.tierBadgeRow}>
                <View style={[styles.tierDot, { backgroundColor: tierColor }]} />
                <Text style={styles.tierBadgeText}>{tierDisplayName}</Text>
              </View>
              <Text style={styles.tierScoreText}>{userScore} pts</Text>
            </View>
            <View style={styles.tierBarOuter}>
              <Animated.View style={[styles.tierBarInner, { backgroundColor: tierColor }, tierBarStyle]} />
            </View>
            {nextTier && (
              <Text style={styles.tierNextText}>
                {TIER_SCORE_RANGES[nextTier].min - userScore} pts to{" "}
                <Text style={[styles.tierNextHighlight, { color: TIER_COLORS[nextTier] }]}>{TIER_DISPLAY_NAMES[nextTier]}</Text>
              </Text>
            )}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(700).duration(500)} style={styles.scoreBreakdownCard}>
            <View style={styles.scoreBreakdownRow}>
              <Text style={styles.scoreBreakdownLabel}>Raw Score</Text>
              <Text style={styles.scoreBreakdownVal}>{rawScore.toFixed(2)}</Text>
            </View>
            <View style={styles.scoreBreakdownRow}>
              <Text style={styles.scoreBreakdownLabel}>Your Weight ({tierDisplayName})</Text>
              <Text style={[styles.scoreBreakdownVal, { color: tierColor }]}>x {voteWeight.toFixed(2)}</Text>
            </View>
            <View style={styles.scoreBreakdownDivider} />
            <View style={styles.scoreBreakdownRow}>
              <Text style={styles.scoreBreakdownLabelBold}>Weighted Score</Text>
              <Text style={styles.scoreBreakdownValBold}>{weightedScore.toFixed(2)}</Text>
            </View>
          </Animated.View>

          <TouchableOpacity
            style={[styles.primaryButton, styles.doneButton]}
            onPress={() => router.back()}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Done, go back to business"
          >
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return q1Score > 0;
      case 2: return q2Score > 0;
      case 3: return q3Score > 0;
      case 4: return wouldReturn !== null;
      case 5: return true;
      case 6: return true;
      default: return false;
    }
  };

  const goNext = () => {
    if (step < 6) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep((step + 1) as RatingStep);
    } else {
      setSubmitError("");
      submitMutation.mutate();
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep((step - 1) as RatingStep);
    } else {
      router.back();
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Animated.View entering={FadeIn.duration(300)} style={styles.stepContent} key="step1" accessibilityRole="summary">
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>01</Text>
              <Text style={styles.stepTitle}>{q1Label}</Text>
              <Text style={styles.stepSubtitle}>Tap a score from 1 to 5</Text>
            </View>
            <CircleScorePicker value={q1Score} onChange={setQ1Score} circleSize={circleSize} />
            <CircleScoreLabels circleSize={circleSize} />
            {q1Score > 0 && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>{SCORE_LABELS[q1Score - 1]}</Text>
              </View>
            )}
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View entering={FadeIn.duration(300)} style={styles.stepContent} key="step2" accessibilityRole="summary">
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>02</Text>
              <Text style={styles.stepTitle}>Value for Money</Text>
              <Text style={styles.stepSubtitle}>Was the price fair for what you received?</Text>
            </View>
            <CircleScorePicker value={q2Score} onChange={setQ2Score} circleSize={circleSize} />
            <CircleScoreLabels circleSize={circleSize} />
            {q2Score > 0 && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>{SCORE_LABELS[q2Score - 1]}</Text>
              </View>
            )}
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View entering={FadeIn.duration(300)} style={styles.stepContent} key="step3" accessibilityRole="summary">
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>03</Text>
              <Text style={styles.stepTitle}>{q3Label}</Text>
              <Text style={styles.stepSubtitle}>Rate the overall experience</Text>
            </View>
            <CircleScorePicker value={q3Score} onChange={setQ3Score} circleSize={circleSize} />
            <CircleScoreLabels circleSize={circleSize} />
            {q3Score > 0 && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>{SCORE_LABELS[q3Score - 1]}</Text>
              </View>
            )}
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View entering={FadeIn.duration(300)} style={styles.stepContent} key="step4" accessibilityRole="summary">
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>04</Text>
              <Text style={styles.stepTitle}>{returnLabel}</Text>
              <Text style={styles.stepSubtitle}>One tap, be honest</Text>
            </View>
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
                accessibilityHint="Double tap to select yes"
                accessibilityState={{ selected: wouldReturn === true }}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={32}
                  color={wouldReturn === true ? "#fff" : Colors.textTertiary}
                />
                <Text style={[styles.yesNoText, wouldReturn === true && styles.yesNoTextActive]}>
                  YES
                </Text>
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
                accessibilityHint="Double tap to select no"
                accessibilityState={{ selected: wouldReturn === false }}
              >
                <Ionicons
                  name="close-circle"
                  size={32}
                  color={wouldReturn === false ? "#fff" : Colors.textTertiary}
                />
                <Text style={[styles.yesNoText, wouldReturn === false && styles.yesNoTextActive]}>
                  NO
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );

      case 5:
        return (
          <Animated.View entering={FadeIn.duration(300)} style={styles.stepContent} key="step5" accessibilityRole="summary">
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>05</Text>
              <Text style={styles.stepTitle}>Top Dish</Text>
              <Text style={styles.stepSubtitle}>What stood out? (optional)</Text>
            </View>

            {existingDishes.length > 0 && (
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
            )}

            {!selectedDish && (
              <View style={styles.dishInputWrap}>
                <TextInput
                  style={styles.dishInput}
                  placeholder="Or type a dish name..."
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
          </Animated.View>
        );

      case 6:
        return (
          <Animated.View entering={FadeIn.duration(300)} style={styles.stepContent} key="step6" accessibilityRole="summary">
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>06</Text>
              <Text style={styles.stepTitle}>Quick Note</Text>
              <Text style={styles.stepSubtitle}>One sentence review (optional)</Text>
            </View>

            <View style={styles.noteInputWrap}>
              <TextInput
                style={styles.noteInput}
                placeholder="In your own words..."
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
        <StepIndicator step={step - 1} total={6} />
        <View style={styles.navSpacer} />
      </View>

      <ProgressBar step={step - 1} total={6} />

      <View style={styles.businessHeader}>
        <Text style={styles.rateLabel}>RATE</Text>
        <Text style={styles.businessName} numberOfLines={1}>{business.name}</Text>
      </View>

      <View style={styles.stepArea}>
        {renderStepContent()}
      </View>

      {!!submitError && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color={Colors.red} />
          <Text style={styles.errorBannerText}>{submitError}</Text>
        </View>
      )}

      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 12 }]}>
        {step === 5 && (
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => {
              setSelectedDish("");
              setDishInput("");
              goNext();
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Skip dish selection"
          >
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>
        )}
        {step === 6 && (
          <TouchableOpacity
            style={[styles.skipBtn, submitMutation.isPending && { opacity: 0.5 }]}
            onPress={() => {
              setNote("");
              setSubmitError("");
              submitMutation.mutate();
            }}
            activeOpacity={0.7}
            disabled={submitMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="Skip note and submit rating"
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
          accessibilityLabel={step === 6 ? "Submit rating" : "Next step"}
        >
          <Text style={[styles.primaryButtonText, !canProceed() && styles.primaryButtonTextDisabled]}>
            {submitMutation.isPending
              ? "Submitting..."
              : step === 6
                ? "Submit Rating"
                : "Next"
            }
          </Text>
          {step < 6 && canProceed() && (
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

  stepArea: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },

  stepContent: { gap: 24 },
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

  circleRow: {
    flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 8,
  },
  circle: {
    backgroundColor: Colors.surfaceRaised, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: Colors.border,
  },
  circleActive: {
    backgroundColor: Colors.text, borderColor: Colors.text,
  },
  circleNum: {
    fontSize: 20, fontWeight: "700" as const, color: Colors.textTertiary,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  circleNumActive: { color: "#FFFFFF" },

  circleLabelRow: {
    flexDirection: "row", justifyContent: "center", gap: 12, marginTop: -4,
  },
  circleLabelItem: { alignItems: "center" },
  circleLabelText: {
    fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textAlign: "center",
  },

  selectedBadge: {
    alignSelf: "center", backgroundColor: Colors.goldFaint,
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
  },
  selectedBadgeText: {
    fontSize: 14, color: Colors.gold, fontFamily: "DMSans_600SemiBold",
  },

  yesNoRow: { flexDirection: "row", gap: 16, marginTop: 16 },
  yesNoBtn: {
    flex: 1, alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 28, borderRadius: 20,
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
  dishPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.surfaceRaised, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20,
  },
  dishPillSelected: {
    backgroundColor: Colors.text,
  },
  dishPillText: {
    fontSize: 14, color: Colors.text, fontFamily: "DMSans_500Medium",
  },
  dishPillTextSelected: { color: "#FFFFFF" },
  dishVoteBadge: {
    backgroundColor: Colors.border, paddingHorizontal: 6,
    paddingVertical: 2, borderRadius: 8,
  },
  dishVoteBadgeSelected: { backgroundColor: "rgba(255,255,255,0.2)" },
  dishVoteCount: {
    fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_600SemiBold",
  },
  dishVoteCountSelected: { color: "#FFFFFF" },

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

  confirmInner: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 24, gap: 12,
  },
  confirmIconWrap: { marginBottom: 4 },
  confirmIconCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.green,
    alignItems: "center", justifyContent: "center",
  },
  confirmTitle: {
    fontSize: 26, fontWeight: "700" as const, color: Colors.gold,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5, textAlign: "center",
  },
  confirmSub: {
    fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    textAlign: "center", marginBottom: 8,
  },
  rankChangeCard: {
    width: "100%", backgroundColor: Colors.surface, borderRadius: 16,
    padding: 16, alignItems: "center", gap: 12,
    ...Colors.cardShadow,
  },
  rankChangeTitle: {
    fontSize: 15, fontWeight: "600" as const, color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  rankChangeRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  rankBox: {
    alignItems: "center", gap: 4, width: 72, paddingVertical: 10,
    borderRadius: 10, backgroundColor: Colors.surfaceRaised,
  },
  rankBoxImproved: { backgroundColor: Colors.greenFaint },
  rankBoxLabel: {
    fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  rankBoxNum: {
    fontSize: 22, fontWeight: "700" as const, color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5,
  },
  movedUpBanner: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: Colors.greenFaint, paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 6,
  },
  movedUpText: {
    fontSize: 11, color: Colors.green, fontFamily: "DMSans_500Medium",
  },

  tierProgressCard: {
    width: "100%", backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, gap: 8, ...Colors.cardShadow,
  },
  tierProgressHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  tierBadgeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  tierBadgeText: {
    fontSize: 13, color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  tierScoreText: {
    fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
  tierBarOuter: {
    height: 4, borderRadius: 2, backgroundColor: Colors.border, overflow: "hidden",
  },
  tierBarInner: { height: "100%", borderRadius: 2 },
  tierNextText: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },

  scoreBreakdownCard: {
    width: "100%", backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, gap: 8, ...Colors.cardShadow,
  },
  scoreBreakdownRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  scoreBreakdownLabel: {
    fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
  scoreBreakdownVal: {
    fontSize: 15, fontWeight: "600" as const, color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  scoreBreakdownDivider: { height: 1, backgroundColor: Colors.border },
  scoreBreakdownLabelBold: {
    fontSize: 14, fontWeight: "700" as const, color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },
  scoreBreakdownValBold: {
    fontSize: 20, fontWeight: "700" as const, color: Colors.gold,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  doneButton: { width: "100%", marginTop: 8 },
  tierNextHighlight: { fontFamily: "DMSans_600SemiBold" },
});

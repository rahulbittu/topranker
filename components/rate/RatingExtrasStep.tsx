/**
 * RatingExtrasStep — extracted from app/rate/[id].tsx (Sprint 172)
 * Step 2 of the rating flow: dish selection, note, photo, score summary.
 */
import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import Colors from "@/constants/colors";
import { TIER_INFLUENCE_LABELS, type CredibilityTier } from "@/lib/data";
import type { ApiDish } from "@/lib/api";
import { DishPill } from "@/components/rate/SubComponents";
import { PhotoBoostMeter, PhotoTips } from "@/components/rate/PhotoBoostMeter";
import { NoteSentimentIndicator } from "@/components/rate/NoteSentimentIndicator";
import { getPhotoPromptsByVisitType, getReceiptHint, type VisitType } from "@/components/rate/RatingPrompts";
import { ReceiptUploadCard } from "@/components/rate/ReceiptUploadCard";

// Re-exports for backward compatibility
export { getPhotoPromptsByVisitType, getReceiptHint } from "@/components/rate/RatingPrompts";
export type { VisitType, PhotoPrompt } from "@/components/rate/RatingPrompts";

const MAX_PHOTOS = 3;

interface RatingExtrasStepProps {
  existingDishes: ApiDish[];
  selectedDish: string;
  setSelectedDish: (d: string) => void;
  dishInput: string;
  handleDishSearch: (text: string) => void;
  dishSearching: boolean;
  dishSearchResults: ApiDish[];
  setDishSearchResults: (r: ApiDish[]) => void;
  note: string;
  setNote: (n: string) => void;
  photoUri: string | null;
  setPhotoUri: (uri: string | null) => void;
  photoUris?: string[];
  setPhotoUris?: (uris: string[]) => void;
  receiptUri?: string | null;
  setReceiptUri?: (uri: string | null) => void;
  q1Score: number;
  q2Score: number;
  q3Score: number;
  wouldReturn: boolean | null;
  userTier: CredibilityTier;
  tierColor: string;
  weightedScore: number;
  visitType?: VisitType | null; // Sprint 459
}

export function RatingExtrasStep({
  existingDishes, selectedDish, setSelectedDish,
  dishInput, handleDishSearch, dishSearching, dishSearchResults, setDishSearchResults,
  note, setNote, photoUri, setPhotoUri,
  photoUris = [], setPhotoUris,
  receiptUri = null, setReceiptUri,
  q1Score, q2Score, q3Score, wouldReturn,
  userTier, tierColor, weightedScore,
  visitType,
}: RatingExtrasStepProps) {
  // Multi-photo support: use photoUris array if available, fall back to single photoUri
  const photos = setPhotoUris ? photoUris : (photoUri ? [photoUri] : []);
  const canAddMore = photos.length < MAX_PHOTOS;

  const addPhotoFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const uri = result.assets[0].uri;
      if (setPhotoUris) {
        setPhotoUris([...photoUris, uri]);
      } else {
        setPhotoUri(uri);
      }
    }
  };

  const addPhotoFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const uri = result.assets[0].uri;
      if (setPhotoUris) {
        setPhotoUris([...photoUris, uri]);
      } else {
        setPhotoUri(uri);
      }
    }
  };

  const removePhoto = (index: number) => {
    if (setPhotoUris) {
      setPhotoUris(photoUris.filter((_, i) => i !== index));
    } else {
      setPhotoUri(null);
    }
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} style={s.stepContent} key="step2" accessibilityRole="summary">
      <View style={s.stepHeader}>
        <Text style={s.stepTitle}>Almost done!</Text>
        <Text style={s.stepSubtitle}>Optional extras — skip or add details</Text>
      </View>

      {/* Dish selection */}
      {existingDishes.length > 0 && (
        <View>
          <Text style={s.compactLabel}>Top Dish</Text>
          <View style={s.dishPillsWrap}>
            {existingDishes.map(dish => (
              <DishPill
                key={dish.id}
                dish={dish}
                selected={selectedDish === dish.name}
                onPress={() => {
                  setSelectedDish(selectedDish === dish.name ? "" : dish.name);
                  handleDishSearch("");
                }}
              />
            ))}
          </View>
        </View>
      )}

      {!selectedDish && (
        <View style={s.dishInputWrap}>
          <TextInput
            style={s.dishInput}
            placeholder="Type a dish name (optional)..."
            placeholderTextColor={Colors.textTertiary}
            value={dishInput}
            onChangeText={handleDishSearch}
            maxLength={80}
            accessibilityLabel="Dish name input"
            accessibilityHint="Type a dish name to search or add a new one"
          />
          {dishSearching && (
            <ActivityIndicator size="small" color={Colors.gold} style={{ marginTop: 8 }} />
          )}
          {dishSearchResults.length > 0 && !dishSearching && (
            <View style={s.dishSuggestions}>
              {dishSearchResults.map(d => (
                <TouchableOpacity
                  key={d.id}
                  style={s.dishSuggestionItem}
                  onPress={() => {
                    setSelectedDish(d.name);
                    handleDishSearch("");
                    setDishSearchResults([]);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${d.name}, ${d.voteCount} votes`}
                >
                  <Text style={s.dishSuggestionText}>{d.name}</Text>
                  <Text style={s.dishSuggestionCount}>{d.voteCount} votes</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {selectedDish ? (
        <View style={s.dishSelectedDisplay}>
          <Ionicons name="restaurant" size={16} color={Colors.gold} />
          <Text style={s.dishSelectedText}>{selectedDish}</Text>
          <TouchableOpacity onPress={() => setSelectedDish("")} accessibilityRole="button" accessibilityLabel={`Remove ${selectedDish} selection`}>
            <Ionicons name="close" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Dish photo nudge — appears after dish selection when no photos yet */}
      {selectedDish && photos.length === 0 && canAddMore && (
        <View style={s.dishPhotoNudge}>
          <View style={s.dishPhotoNudgeHeader}>
            <Ionicons name="camera" size={18} color={Colors.gold} />
            <Text style={s.dishPhotoNudgeTitle}>
              Got a photo of your {selectedDish}?
            </Text>
          </View>
          <Text style={s.dishPhotoNudgeHint}>
            A dish photo adds +15% verification boost to your rating
          </Text>
          <View style={s.dishPhotoNudgeActions}>
            <TouchableOpacity
              style={s.dishPhotoNudgeBtn}
              onPress={addPhotoFromCamera}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Take a photo of ${selectedDish}`}
            >
              <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
              <Text style={s.dishPhotoNudgeBtnText}>Snap it</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.dishPhotoNudgeBtnSecondary}
              onPress={addPhotoFromGallery}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Choose a photo of ${selectedDish} from gallery`}
            >
              <Ionicons name="images-outline" size={16} color={Colors.gold} />
              <Text style={s.dishPhotoNudgeBtnTextSecondary}>From gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Quick Note */}
      <View style={s.noteInputWrap}>
        <TextInput
          style={[s.noteInput, { minHeight: 60 }]}
          placeholder="Quick note (optional)..."
          placeholderTextColor={Colors.textTertiary}
          value={note}
          onChangeText={t => t.length <= 160 && setNote(t)}
          multiline
          maxLength={160}
          accessibilityLabel="Quick note"
          accessibilityHint="Optional note about your experience, 160 characters max"
        />
        <Text style={[
          s.noteCounter,
          note.length > 140 && s.noteCounterWarn,
          note.length >= 160 && s.noteCounterMax,
        ]}>
          {note.length}/160
        </Text>
        <NoteSentimentIndicator note={note} />
      </View>

      {/* Photo Upload — Sprint 379/424: multi-photo + camera + boost meter */}
      <View style={s.photoSection}>
        <PhotoBoostMeter photoCount={photos.length} hasReceipt={!!receiptUri} />
        {photos.length > 0 && (
          <View style={s.photoStrip}>
            {photos.map((uri, idx) => (
              <View key={uri} style={s.photoThumb}>
                <Image source={{ uri }} style={s.photoThumbImage} contentFit="cover" />
                <View style={s.photoIndexBadge}>
                  <Text style={s.photoIndexText}>{idx + 1}</Text>
                </View>
                <TouchableOpacity
                  style={s.photoThumbRemove}
                  onPress={() => removePhoto(idx)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove photo ${idx + 1}`}
                >
                  <Ionicons name="close-circle" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        {canAddMore && (
          <View style={s.photoActionRow}>
            <TouchableOpacity
              style={s.photoAddBtn}
              onPress={addPhotoFromGallery}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Add photo from gallery"
            >
              <Ionicons name="images-outline" size={18} color={Colors.textTertiary} />
              <Text style={s.photoAddText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.photoAddBtn}
              onPress={addPhotoFromCamera}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Take a photo with camera"
            >
              <Ionicons name="camera-outline" size={18} color={Colors.textTertiary} />
              <Text style={s.photoAddText}>Camera</Text>
            </TouchableOpacity>
          </View>
        )}
        {photos.length === 0 && !selectedDish && (
          <View style={s.photoPromptSection}>
            {getPhotoPromptsByVisitType(visitType).map((prompt, idx) => (
              <View key={idx} style={s.photoPromptRow}>
                <Ionicons name={prompt.icon as any} size={16} color={Colors.gold} />
                <View style={s.photoPromptTextWrap}>
                  <Text style={s.photoPromptLabel}>{prompt.label}</Text>
                  <Text style={s.photoPromptHint}>{prompt.hint}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        {photos.length > 0 && photos.length < MAX_PHOTOS && <PhotoTips />}
      </View>

      {/* Receipt Upload — extracted to ReceiptUploadCard (Sprint 606) */}
      {setReceiptUri && (
        <ReceiptUploadCard receiptUri={receiptUri} setReceiptUri={setReceiptUri} visitType={visitType} />
      )}

      {/* Score summary */}
      <View style={s.summaryCard} accessibilityRole="summary" accessibilityLabel={`Your rating summary: Quality ${q1Score}, Value ${q2Score}, Service ${q3Score}, Would return: ${wouldReturn ? "yes" : "no"}, weighted score ${weightedScore.toFixed(1)}`}>
        <Text style={s.summaryTitle}>YOUR RATING</Text>
        <View style={s.summaryGrid}>
          <View style={s.summaryItem}>
            <Text style={s.summaryItemVal}>{q1Score}</Text>
            <Text style={s.summaryItemLabel}>Quality</Text>
          </View>
          <View style={s.summaryItem}>
            <Text style={s.summaryItemVal}>{q2Score}</Text>
            <Text style={s.summaryItemLabel}>Value</Text>
          </View>
          <View style={s.summaryItem}>
            <Text style={s.summaryItemVal}>{q3Score}</Text>
            <Text style={s.summaryItemLabel}>Service</Text>
          </View>
          <View style={s.summaryItem}>
            <Ionicons
              name={wouldReturn ? "checkmark-circle" : "close-circle"}
              size={20}
              color={wouldReturn ? Colors.green : Colors.red}
            />
            <Text style={s.summaryItemLabel}>Return</Text>
          </View>
        </View>
        <View style={s.summaryScoreRow}>
          <View style={[s.tierDot, { backgroundColor: tierColor }]} />
          <Text style={s.summaryWeightLabel}>
            {TIER_INFLUENCE_LABELS[userTier]}
          </Text>
          <Text style={[s.summaryWeightVal, { color: Colors.gold }]}>
            {weightedScore.toFixed(1)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  stepContent: { gap: 20 },
  stepHeader: { gap: 4 },
  stepTitle: {
    fontSize: 22, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
  compactLabel: {
    fontSize: 15, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  dishPillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
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
  dishSuggestionText: { fontSize: 14, color: Colors.text, fontFamily: "DMSans_500Medium" },
  dishSuggestionCount: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  dishSelectedDisplay: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.goldFaint, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12,
  },
  dishSelectedText: {
    fontSize: 14, color: Colors.gold, fontFamily: "DMSans_600SemiBold", flex: 1,
  },
  dishPhotoNudge: {
    backgroundColor: "rgba(196,154,26,0.06)", borderRadius: 14, padding: 14, gap: 8,
    borderWidth: 1, borderColor: "rgba(196,154,26,0.2)",
  },
  dishPhotoNudgeHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  dishPhotoNudgeTitle: {
    fontSize: 14, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold", flex: 1,
  },
  dishPhotoNudgeHint: {
    fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
  dishPhotoNudgeActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  dishPhotoNudgeBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: Colors.gold, borderRadius: 10, paddingVertical: 10,
  },
  dishPhotoNudgeBtnText: {
    fontSize: 13, fontWeight: "600", color: "#FFFFFF", fontFamily: "DMSans_600SemiBold",
  },
  dishPhotoNudgeBtnSecondary: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: "transparent", borderRadius: 10, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.gold,
  },
  dishPhotoNudgeBtnTextSecondary: {
    fontSize: 13, fontWeight: "600", color: Colors.gold, fontFamily: "DMSans_600SemiBold",
  },
  noteInputWrap: { gap: 4 },
  noteInput: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 14,
    fontSize: 15, color: Colors.text, fontFamily: "DMSans_400Regular",
    minHeight: 100, textAlignVertical: "top",
  },
  noteCounter: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textAlign: "right",
  },
  noteCounterWarn: { color: Colors.gold },
  noteCounterMax: { color: Colors.red },
  photoSection: { marginTop: 4, gap: 8 },
  photoStrip: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  photoThumb: { width: 80, height: 80, borderRadius: 10, overflow: "hidden", position: "relative" as const },
  photoThumbImage: { width: 80, height: 80, borderRadius: 10 },
  photoIndexBadge: {
    position: "absolute" as const, bottom: 4, left: 4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center" as const, justifyContent: "center" as const,
  },
  photoIndexText: { fontSize: 10, fontWeight: "700", color: "#fff", fontFamily: "DMSans_700Bold" },
  photoThumbRemove: {
    position: "absolute" as const, top: 2, right: 2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2,
  },
  photoActionRow: { flexDirection: "row", gap: 10 },
  photoAddBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.surfaceRaised, borderRadius: 12, paddingVertical: 14,
    borderWidth: 1, borderColor: Colors.border, borderStyle: "dashed",
  },
  photoAddText: { fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  photoPromptSection: { gap: 8, paddingVertical: 4 },
  photoPromptRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  photoPromptTextWrap: { flex: 1, gap: 1 },
  photoPromptLabel: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  photoPromptHint: { fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  photoBoostHint: { fontSize: 11, color: Colors.gold, fontFamily: "DMSans_500Medium", textAlign: "center" as const },
  photoVerifiedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(34, 139, 34, 0.85)", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4, alignSelf: "flex-start" as const,
  },
  photoVerifiedText: {
    fontSize: 11, color: "#FFFFFF", fontWeight: "600",
    fontFamily: "DMSans_600SemiBold",
  },
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
    fontSize: 10, fontWeight: "700", color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold", letterSpacing: 1.5,
  },
  summaryGrid: { flexDirection: "row", justifyContent: "space-around" },
  summaryItem: { alignItems: "center", gap: 4 },
  summaryItemVal: {
    fontSize: 22, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  summaryItemLabel: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  summaryScoreRow: {
    flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center",
    paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  summaryWeightLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  summaryWeightVal: { fontSize: 16, fontWeight: "700", fontFamily: "PlayfairDisplay_700Bold" },
  tierDot: { width: 8, height: 8, borderRadius: 4 },
});

/**
 * Suggest a Category — User-facing category request form
 * Owner: James Park (Frontend) + Suki (Design)
 *
 * Allows users to propose new categories for the leaderboard.
 * Submissions go to `category_suggestions` table for admin review.
 */
import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { TypedIcon } from "@/components/TypedIcon";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import {
  type CategoryVertical,
  VERTICAL_LABELS,
  getVerticals,
} from "@/lib/category-registry";

const AMBER = BRAND.colors.amber;

interface SuggestCategoryProps {
  onSubmit: (suggestion: {
    name: string;
    description: string;
    vertical: CategoryVertical;
  }) => void;
  onClose: () => void;
}

export function SuggestCategory({ onSubmit, onClose }: SuggestCategoryProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [vertical, setVertical] = useState<CategoryVertical>("food");
  const [submitted, setSubmitted] = useState(false);

  const verticals = getVerticals();
  const canSubmit = name.trim().length >= 2 && description.trim().length >= 10;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({ name: name.trim(), description: description.trim(), vertical });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <View style={s.container}>
        <View style={s.successCard}>
          <TypedIcon name="checkmark-circle" size={48} color={AMBER} />
          <Text style={s.successTitle}>Suggestion Submitted!</Text>
          <Text style={s.successBody}>
            Our team will review "{name}" and notify you if it gets approved.
            Popular suggestions get prioritized.
          </Text>
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Text style={s.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={s.container}
    >
      <View style={s.card}>
        <View style={s.header}>
          <TypedIcon name="bulb" size={20} color={AMBER} />
          <Text style={s.title}>Suggest a Category</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <TypedIcon name="close" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <Text style={s.label}>Category Name</Text>
        <TextInput
          style={s.input}
          placeholder="e.g. Pet Groomers, Tattoo Shops..."
          placeholderTextColor={Colors.textTertiary}
          value={name}
          onChangeText={setName}
          maxLength={50}
        />

        <Text style={s.label}>Why should we add this?</Text>
        <TextInput
          style={[s.input, s.textArea]}
          placeholder="What would users rank? Why is it valuable?"
          placeholderTextColor={Colors.textTertiary}
          value={description}
          onChangeText={setDescription}
          maxLength={200}
          multiline
          numberOfLines={3}
        />

        <Text style={s.label}>Vertical</Text>
        <View style={s.verticalRow}>
          {verticals.map((v) => {
            const info = VERTICAL_LABELS[v];
            const selected = v === vertical;
            return (
              <TouchableOpacity
                key={v}
                style={[s.verticalChip, selected && s.verticalChipSelected]}
                onPress={() => setVertical(v)}
              >
                <Text style={s.verticalEmoji}>{info.emoji}</Text>
                <Text style={[s.verticalLabel, selected && s.verticalLabelSelected]}>
                  {info.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <Text style={s.submitBtnText}>Submit Suggestion</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 20, gap: 12,
    ...Colors.cardShadow,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: {
    flex: 1, fontSize: 18, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  label: {
    fontSize: 12, fontWeight: "600", color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 12, padding: 14,
    fontSize: 15, color: Colors.text, fontFamily: "DMSans_400Regular",
    borderWidth: 1, borderColor: Colors.border,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  verticalRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  verticalChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, backgroundColor: Colors.surfaceRaised,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  verticalChipSelected: { borderColor: AMBER, backgroundColor: `${AMBER}10` },
  verticalEmoji: { fontSize: 14 },
  verticalLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  verticalLabelSelected: { color: AMBER, fontWeight: "600" },
  submitBtn: {
    backgroundColor: AMBER, borderRadius: 14, paddingVertical: 14,
    alignItems: "center", marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontSize: 15, fontWeight: "700", color: "#FFF", fontFamily: "DMSans_700Bold" },
  successCard: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 32,
    alignItems: "center", gap: 12, ...Colors.cardShadow,
  },
  successTitle: {
    fontSize: 20, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  successBody: {
    fontSize: 14, color: Colors.textSecondary, textAlign: "center",
    fontFamily: "DMSans_400Regular", lineHeight: 20,
  },
  closeBtn: {
    backgroundColor: AMBER, borderRadius: 12, paddingHorizontal: 32, paddingVertical: 12,
    marginTop: 8,
  },
  closeBtnText: { fontSize: 14, fontWeight: "700", color: "#FFF", fontFamily: "DMSans_700Bold" },
});

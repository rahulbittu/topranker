/**
 * Sprint 464: Note Sentiment Indicator
 *
 * Shows a small sentiment badge below the note input.
 * Gives real-time feedback on note tone (positive/neutral/negative).
 * Appears only when note has enough text and a detectable sentiment.
 */
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { analyzeSentiment } from "@/lib/note-sentiment";

interface NoteSentimentIndicatorProps {
  note: string;
}

export function NoteSentimentIndicator({ note }: NoteSentimentIndicatorProps) {
  const sentiment = useMemo(() => analyzeSentiment(note), [note]);

  if (!sentiment.label) return null;

  return (
    <View style={[s.container, { borderColor: `${sentiment.color}30` }]}>
      <Ionicons name={sentiment.icon as any} size={12} color={sentiment.color} />
      <Text style={[s.label, { color: sentiment.color }]}>{sentiment.label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "DMSans_600SemiBold",
  },
});

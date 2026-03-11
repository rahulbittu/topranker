// Sprint 632: Action URL editor for business owner dashboard
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { useMutation } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/query-client";

const AMBER = BRAND.colors.amber;

interface ActionField {
  key: string;
  label: string;
  icon: string;
  placeholder: string;
}

const ACTION_FIELDS: ActionField[] = [
  { key: "menuUrl", label: "Menu", icon: "restaurant-outline", placeholder: "https://yoursite.com/menu" },
  { key: "orderUrl", label: "Order Online", icon: "bag-handle-outline", placeholder: "https://yoursite.com/order" },
  { key: "pickupUrl", label: "Pickup", icon: "car-outline", placeholder: "https://yoursite.com/pickup" },
  { key: "doordashUrl", label: "DoorDash", icon: "bicycle-outline", placeholder: "https://doordash.com/store/..." },
  { key: "uberEatsUrl", label: "Uber Eats", icon: "fast-food-outline", placeholder: "https://ubereats.com/store/..." },
  { key: "reservationUrl", label: "Reservations", icon: "calendar-outline", placeholder: "https://opentable.com/..." },
];

interface ActionUrlEditorProps {
  slug: string;
  initialUrls?: Record<string, string | null>;
  delay: number;
}

export function ActionUrlEditor({ slug, initialUrls, delay }: ActionUrlEditorProps) {
  const [editing, setEditing] = useState(false);
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialUrls) {
      const mapped: Record<string, string> = {};
      ACTION_FIELDS.forEach(f => { mapped[f.key] = initialUrls[f.key] || ""; });
      setUrls(mapped);
    }
  }, [initialUrls]);

  const saveMutation = useMutation({
    mutationFn: async (updates: Record<string, string | null>) => {
      const res = await fetch(`${getApiUrl()}/api/businesses/${slug}/actions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      setEditing(false);
      Alert.alert("Saved", "Action URLs updated successfully.");
    },
    onError: () => Alert.alert("Error", "Failed to save action URLs."),
  });

  const handleSave = () => {
    const updates: Record<string, string | null> = {};
    ACTION_FIELDS.forEach(f => {
      const val = urls[f.key]?.trim();
      updates[f.key] = val && val.startsWith("http") ? val : null;
    });
    saveMutation.mutate(updates);
  };

  const filledCount = ACTION_FIELDS.filter(f => urls[f.key]?.trim()).length;

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={s.card}>
      <View style={s.header}>
        <Ionicons name="link-outline" size={18} color={AMBER} />
        <Text style={s.title}>Action Links</Text>
        <Text style={s.badge}>{filledCount}/6</Text>
        <TouchableOpacity style={s.editBtn} onPress={() => setEditing(!editing)}>
          <Text style={s.editText}>{editing ? "Cancel" : "Edit"}</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.desc}>Add links so customers can order, reserve, or view your menu directly from TopRanker.</Text>
      {editing ? (
        <View style={s.fields}>
          {ACTION_FIELDS.map(f => (
            <View key={f.key} style={s.fieldRow}>
              <Ionicons name={f.icon as any} size={16} color={Colors.textSecondary} style={s.fieldIcon} />
              <TextInput
                style={s.input}
                value={urls[f.key] || ""}
                onChangeText={v => setUrls(prev => ({ ...prev, [f.key]: v }))}
                placeholder={f.placeholder}
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>
          ))}
          <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saveMutation.isPending}>
            <Text style={s.saveBtnText}>{saveMutation.isPending ? "Saving..." : "Save Links"}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.summary}>
          {ACTION_FIELDS.filter(f => urls[f.key]?.trim()).map(f => (
            <View key={f.key} style={s.urlPill}>
              <Ionicons name={f.icon as any} size={12} color={AMBER} />
              <Text style={s.urlPillText}>{f.label}</Text>
            </View>
          ))}
          {filledCount === 0 && (
            <Text style={s.emptyText}>No action links set. Tap Edit to add.</Text>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 14, gap: 8,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 14, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold", flex: 1 },
  badge: {
    fontSize: 11, fontWeight: "600", color: AMBER, fontFamily: "DMSans_600SemiBold",
    backgroundColor: `${AMBER}15`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  editBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: `${AMBER}10` },
  editText: { fontSize: 12, fontWeight: "600", color: AMBER, fontFamily: "DMSans_600SemiBold" },
  desc: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 16 },
  fields: { gap: 8, marginTop: 4 },
  fieldRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  fieldIcon: { width: 20 },
  input: {
    flex: 1, fontSize: 13, color: Colors.text, fontFamily: "DMSans_400Regular",
    backgroundColor: Colors.surface, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  saveBtn: {
    backgroundColor: AMBER, borderRadius: 10, paddingVertical: 10, alignItems: "center", marginTop: 4,
  },
  saveBtnText: { fontSize: 14, fontWeight: "700", color: "#fff", fontFamily: "DMSans_700Bold" },
  summary: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  urlPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    backgroundColor: `${AMBER}10`, borderWidth: 1, borderColor: `${AMBER}25`,
  },
  urlPillText: { fontSize: 11, fontWeight: "600", color: AMBER, fontFamily: "DMSans_600SemiBold" },
  emptyText: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", fontStyle: "italic" },
});

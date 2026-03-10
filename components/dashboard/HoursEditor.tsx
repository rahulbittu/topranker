// Sprint 561: Extracted from dashboard.tsx (was at 592/610 LOC — 97% threshold)
import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/query-client";
import { updateBusinessHours, type HoursUpdate } from "@/lib/api";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function HoursEditor({ businessId, delay }: { businessId: string; delay: number }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [hours, setHours] = useState<string[]>(
    DAY_NAMES.map(() => "11:00 AM – 10:00 PM"),
  );
  const [initialized, setInitialized] = useState(false);

  // Sprint 556: Fetch existing hours from business data
  const { data: existingHours } = useQuery<{ weekday_text?: string[] }>({
    queryKey: ["business-hours", businessId],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/businesses/${businessId}`, { credentials: "include" });
      if (!res.ok) return {};
      const json = await res.json();
      return json.data?.openingHours || json.openingHours || {};
    },
    staleTime: 300000,
  });

  // Pre-populate hours from existing data on first load
  if (existingHours?.weekday_text && existingHours.weekday_text.length === 7 && !initialized) {
    setHours(existingHours.weekday_text);
    setInitialized(true);
  }

  const mutation = useMutation({
    mutationFn: () => {
      const hoursUpdate: HoursUpdate = { weekday_text: hours };
      return updateBusinessHours(businessId, hoursUpdate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", businessId] });
      setEditing(false);
      Alert.alert("Hours Updated", "Your operating hours have been saved.");
    },
    onError: () => Alert.alert("Error", "Failed to update hours. Please try again."),
  });

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.hoursCard}>
      <View style={styles.hoursHeader}>
        <View style={styles.hoursHeaderLeft}>
          <Ionicons name="time-outline" size={18} color={BRAND.colors.amber} />
          <View>
            <Text style={styles.hoursTitle}>Operating Hours</Text>
            <Text style={styles.hoursSource}>{initialized ? "From your listing" : "Default hours — tap Edit to update"}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => editing ? mutation.mutate() : setEditing(true)} style={styles.hoursEditBtn}>
          <Ionicons name={editing ? "checkmark" : "create-outline"} size={16} color={BRAND.colors.amber} />
          <Text style={styles.hoursEditText}>{editing ? "Save" : "Edit"}</Text>
        </TouchableOpacity>
      </View>
      {DAY_NAMES.map((day, i) => (
        <View key={day} style={styles.hoursRow}>
          <Text style={styles.hoursDayLabel}>{day.slice(0, 3)}</Text>
          {editing ? (
            <TextInput
              style={styles.hoursInput}
              value={hours[i]}
              onChangeText={(t) => {
                const next = [...hours];
                next[i] = t;
                setHours(next);
              }}
              placeholder="e.g. 11:00 AM – 10:00 PM"
              placeholderTextColor={Colors.textTertiary}
            />
          ) : (
            <Text style={styles.hoursValue}>{hours[i]}</Text>
          )}
        </View>
      ))}
      {editing && (
        <TouchableOpacity onPress={() => setEditing(false)} style={styles.hoursCancelBtn}>
          <Text style={styles.hoursCancelText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hoursCard: { backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 14, gap: 8 },
  hoursHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  hoursHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  hoursTitle: { fontSize: 14, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  hoursSource: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", marginTop: 1 },
  hoursEditBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: `${BRAND.colors.amber}12` },
  hoursEditText: { fontSize: 12, fontWeight: "600", color: BRAND.colors.amber, fontFamily: "DMSans_600SemiBold" },
  hoursRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 4 },
  hoursDayLabel: { fontSize: 12, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold", width: 36 },
  hoursValue: { fontSize: 12, color: Colors.text, fontFamily: "DMSans_400Regular" },
  hoursInput: { flex: 1, marginLeft: 8, fontSize: 12, color: Colors.text, fontFamily: "DMSans_400Regular", borderWidth: 1, borderColor: Colors.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  hoursCancelBtn: { alignSelf: "center", paddingVertical: 6, paddingHorizontal: 16 },
  hoursCancelText: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_500Medium" },
});

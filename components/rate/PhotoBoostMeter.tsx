/**
 * Sprint 424: PhotoBoostMeter — progressive verification boost indicator.
 * Shows users how adding photos increases their rating verification percentage.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { pct } from "@/lib/style-helpers";

const AMBER = BRAND.colors.amber;
const PHOTO_BOOST = 15; // +15% per photo (from Rating Integrity doc)
const MAX_PHOTOS = 3;

export interface PhotoBoostMeterProps {
  photoCount: number;
  hasReceipt: boolean;
}

export function PhotoBoostMeter({ photoCount, hasReceipt }: PhotoBoostMeterProps) {
  const photoBoost = Math.min(photoCount * PHOTO_BOOST, MAX_PHOTOS * PHOTO_BOOST);
  const receiptBoost = hasReceipt ? 25 : 0;
  const totalBoost = Math.min(photoBoost + receiptBoost, 50); // Capped at 50%
  const maxPossible = 50;

  return (
    <View style={s.container} accessibilityRole="progressbar" accessibilityLabel={`Verification boost: ${totalBoost}% of ${maxPossible}% maximum`} accessibilityValue={{ min: 0, max: maxPossible, now: totalBoost }}>
      <View style={s.header}>
        <Ionicons name="shield-checkmark" size={14} color={AMBER} />
        <Text style={s.headerText}>Verification Boost</Text>
        <Text style={s.boostValue}>+{totalBoost}%</Text>
      </View>
      <View style={s.track}>
        <View style={[s.fill, { width: pct((totalBoost / maxPossible) * 100) }]} />
        {[1, 2, 3].map(i => (
          <View key={i} style={[s.marker, { left: pct((i * PHOTO_BOOST / maxPossible) * 100) }]}>
            <Ionicons
              name={photoCount >= i ? "camera" : "camera-outline"}
              size={10}
              color={photoCount >= i ? "#fff" : Colors.textTertiary}
            />
          </View>
        ))}
      </View>
      <View style={s.legend}>
        <Text style={s.legendItem}>
          {photoCount}/{MAX_PHOTOS} photos (+{photoBoost}%)
        </Text>
        {hasReceipt ? (
          <Text style={[s.legendItem, s.legendActive]}>Receipt (+25%)</Text>
        ) : (
          <Text style={s.legendItem}>Receipt (+25%)</Text>
        )}
      </View>
    </View>
  );
}

export function PhotoTips() {
  return (
    <View style={s.tipsContainer}>
      <Text style={s.tipsTitle}>Photo tips for higher verification</Text>
      <View style={s.tipRow}>
        <Ionicons name="restaurant-outline" size={13} color={AMBER} />
        <Text style={s.tipText}>Show the food up close</Text>
      </View>
      <View style={s.tipRow}>
        <Ionicons name="sunny-outline" size={13} color={AMBER} />
        <Text style={s.tipText}>Good lighting, no filters</Text>
      </View>
      <View style={s.tipRow}>
        <Ionicons name="location-outline" size={13} color={AMBER} />
        <Text style={s.tipText}>Include table or restaurant context</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: 6 },
  header: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerText: { fontSize: 12, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold", flex: 1 },
  boostValue: { fontSize: 13, fontWeight: "700", color: AMBER, fontFamily: "DMSans_700Bold" },
  track: {
    height: 8, borderRadius: 4, backgroundColor: `${Colors.border}60`,
    overflow: "visible", position: "relative",
  },
  fill: {
    height: 8, borderRadius: 4,
    backgroundColor: AMBER,
  },
  marker: {
    position: "absolute", top: -4, width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center", marginLeft: -8,
  },
  legend: { flexDirection: "row", justifyContent: "space-between" },
  legendItem: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  legendActive: { color: AMBER, fontWeight: "600" },
  tipsContainer: {
    backgroundColor: `${AMBER}08`, borderRadius: 10, padding: 10, gap: 6,
    borderWidth: 1, borderColor: `${AMBER}12`,
  },
  tipsTitle: { fontSize: 11, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  tipText: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
});

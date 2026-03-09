import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { getCategoryDisplay } from "@/lib/data";

export interface BusinessNameCardProps {
  name: string;
  isClaimed: boolean;
  category: string;
  neighborhood?: string;
  city: string;
  isOpenNow?: boolean;
  priceRange?: string;
}

export function BusinessNameCard({
  name, isClaimed, category, neighborhood, city, isOpenNow, priceRange,
}: BusinessNameCardProps) {
  const catDisplay = getCategoryDisplay(category);
  return (
    <View style={s.nameCard}>
      <View style={s.nameRow}>
        <Text style={s.businessName}>{name}</Text>
        {isClaimed && <Ionicons name="checkmark-circle" size={18} color={Colors.blue} />}
      </View>
      <Text style={s.businessMeta}>
        {catDisplay.emoji} {catDisplay.label}{neighborhood ? ` \u00B7 ${neighborhood}` : ""} {"\u00B7"} {city}
      </Text>
      <View style={s.nameCardRow}>
        {isOpenNow !== undefined && (
          <View style={[s.openBadge, isOpenNow ? s.openBadgeOpen : s.openBadgeClosed]}>
            <View style={[s.openDot, { backgroundColor: isOpenNow ? Colors.green : Colors.red }]} />
            <Text style={[s.openBadgeText, { color: isOpenNow ? Colors.green : Colors.red }]}>
              {isOpenNow ? "OPEN NOW" : "CLOSED"}
            </Text>
          </View>
        )}
        {priceRange && <Text style={s.priceText}>{priceRange}</Text>}
      </View>
    </View>
  );
}

export default BusinessNameCard;

const s = StyleSheet.create({
  nameCard: {
    backgroundColor: Colors.surface, marginHorizontal: 14, marginTop: -24,
    borderRadius: 16, padding: 16, gap: 4, ...Colors.cardShadow,
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  businessName: {
    fontSize: 24, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5,
  },
  businessMeta: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  nameCardRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  openBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
  },
  openBadgeOpen: {
    backgroundColor: `${Colors.green}12`,
    shadowColor: Colors.green, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 2,
  },
  openBadgeClosed: { backgroundColor: `${Colors.red}12` },
  openDot: { width: 6, height: 6, borderRadius: 3 },
  openBadgeText: { fontSize: 10, fontWeight: "700", fontFamily: "DMSans_700Bold", letterSpacing: 0.5 },
  priceText: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
});

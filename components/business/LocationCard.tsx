import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import Colors from "@/constants/colors";

export function LocationCard({
  address,
  lat,
  lng,
  onDirections,
}: {
  address: string;
  lat?: string | null;
  lng?: string | null;
  onDirections: () => void;
}) {
  return (
    <View style={s.locationCard}>
      <Text style={s.sectionTitle}>Location</Text>
      {Platform.OS === "web" && lat && lng && (
        <View style={s.mapEmbed}>
          <iframe
            src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
            style={{ width: "100%", height: 180, border: "none", borderRadius: 10 } as any}
            loading="lazy"
          />
        </View>
      )}
      <Text style={s.addressText}>{address}</Text>
      <TouchableOpacity style={s.directionsBtn} onPress={onDirections} accessibilityRole="button" accessibilityLabel="Get directions">
        <Text style={s.directionsBtnText}>Get Directions</Text>
      </TouchableOpacity>
    </View>
  );
}

export default LocationCard;

const s = StyleSheet.create({
  locationCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 8,
    ...Colors.cardShadow,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold", marginBottom: 8,
  },
  mapEmbed: { borderRadius: 10, overflow: "hidden", marginBottom: 4 },
  addressText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  directionsBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10,
    backgroundColor: Colors.surfaceRaised, alignSelf: "flex-start",
  },
  directionsBtnText: {
    fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
});

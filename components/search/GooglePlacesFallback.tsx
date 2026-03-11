/**
 * Sprint 623: Google Places fallback for empty city+category.
 * Shows nearby restaurants from Google when TopRanker has no local data.
 * CEO feedback: "Empty city shows nothing — pull from Google Places."
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { fetchGooglePlacesFallback, type GooglePlaceResult } from "@/lib/api";

const AMBER = BRAND.colors.amber;

interface GooglePlacesFallbackProps {
  city: string;
  category?: string;
}

export function GooglePlacesFallback({ city, category }: GooglePlacesFallbackProps) {
  const [places, setPlaces] = useState<GooglePlaceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchGooglePlacesFallback(city, category || "restaurant", 10)
      .then((data) => { if (!cancelled) setPlaces(data); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [city, category]);

  if (loading) {
    return (
      <View style={s.container}>
        <ActivityIndicator size="small" color={AMBER} />
        <Text style={s.loadingText}>Finding restaurants near {city.replace(/_/g, " ")}...</Text>
      </View>
    );
  }

  if (error || places.length === 0) return null;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Ionicons name="globe-outline" size={14} color={Colors.textTertiary} />
        <Text style={s.headerText}>Restaurants in {city.replace(/_/g, " ")} (via Google)</Text>
      </View>
      <Text style={s.subtitle}>
        These haven't been rated on TopRanker yet. Be the first!
      </Text>
      {places.map((place) => (
        <TouchableOpacity
          key={place.placeId}
          style={s.placeRow}
          onPress={() => router.push({ pathname: "/(tabs)/", params: { search: place.name } })}
          accessibilityRole="button"
          accessibilityLabel={`${place.name} — tap to search`}
        >
          <View style={s.placeInfo}>
            <Text style={s.placeName} numberOfLines={1}>{place.name}</Text>
            <Text style={s.placeAddress} numberOfLines={1}>{place.address}</Text>
          </View>
          <View style={s.placeMeta}>
            {place.rating && (
              <View style={s.googleRating}>
                <Ionicons name="star" size={10} color="#FBBC04" />
                <Text style={s.ratingText}>{place.rating.toFixed(1)}</Text>
              </View>
            )}
            {place.priceLevel && <Text style={s.priceText}>{place.priceLevel}</Text>}
          </View>
          <View style={s.rateCta}>
            <Text style={s.rateCtaText}>Rate</Text>
            <Ionicons name="chevron-forward" size={12} color={AMBER} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginTop: 16, width: "100%" as any, gap: 6,
  },
  loadingText: {
    fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textAlign: "center",
  },
  header: {
    flexDirection: "row", alignItems: "center", gap: 6,
  },
  headerText: {
    fontSize: 12, fontWeight: "600", color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold", textTransform: "uppercase" as const, letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    marginBottom: 4,
  },
  placeRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 10, paddingHorizontal: 12,
    backgroundColor: Colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    gap: 8,
  },
  placeInfo: { flex: 1, gap: 2 },
  placeName: {
    fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  placeAddress: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  placeMeta: {
    alignItems: "flex-end", gap: 2,
  },
  googleRating: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(251,188,4,0.1)", paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11, fontWeight: "600", color: "#8B6914", fontFamily: "DMSans_600SemiBold",
  },
  priceText: {
    fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  rateCta: {
    flexDirection: "row", alignItems: "center", gap: 2,
    paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: Colors.border,
  },
  rateCtaText: {
    fontSize: 12, fontWeight: "600", color: AMBER, fontFamily: "DMSans_600SemiBold",
  },
});

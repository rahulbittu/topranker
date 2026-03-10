/**
 * Sprint 426: MapView — extracted from search/SubComponents.tsx
 * Google Maps integration for the Discover tab with markers, info windows,
 * and "Search this area" functionality.
 */
import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Platform, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { MappedBusiness } from "@/types/business";
import { setOptions as setGoogleMapsOptions, importLibrary } from "@googlemaps/js-api-loader";

const AMBER = BRAND.colors.amber;

export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  // Active TX cities
  Dallas: { lat: 32.7767, lng: -96.7970 },
  Austin: { lat: 30.2672, lng: -97.7431 },
  Houston: { lat: 29.7604, lng: -95.3698 },
  "San Antonio": { lat: 29.4241, lng: -98.4936 },
  "Fort Worth": { lat: 32.7555, lng: -97.3308 },
  // Sprint 418: Beta cities
  "Oklahoma City": { lat: 35.4676, lng: -97.5164 },
  "New Orleans": { lat: 29.9511, lng: -90.0715 },
  Memphis: { lat: 35.1495, lng: -90.0490 },
  Nashville: { lat: 36.1627, lng: -86.7816 },
  Charlotte: { lat: 35.2271, lng: -80.8431 },
  Raleigh: { lat: 35.7796, lng: -78.6382 },
};

let _mapsInitialized = false;

export function MapView({ businesses, city, onSelectBiz, onSearchArea }: { businesses: MappedBusiness[]; city: string; onSelectBiz?: (biz: MappedBusiness | null) => void; onSearchArea?: (lat: number, lng: number) => void }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | false>(false);
  const [showSearchArea, setShowSearchArea] = useState(false);

  const bizWithCoords = businesses.filter(b => b.lat && b.lng);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    console.log("[MapView] Init — key length:", apiKey.length, "platform:", Platform.OS);
    if (!apiKey) {
      setMapError("No API key found. Rebuild after adding EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to your environment. Expo inlines EXPO_PUBLIC_* vars at build time.");
      return;
    }

    // Listen for Google Maps auth failures (fires when key is invalid/restricted)
    window.gm_authFailure = () => {
      console.error("[MapView] Google Maps auth failure — key rejected");
      setMapError("Map temporarily unavailable. Please try the list view.");
    };

    if (!_mapsInitialized) {
      setGoogleMapsOptions({ key: apiKey, v: "weekly" });
      _mapsInitialized = true;
    }

    importLibrary("maps").then((mapsLib: any) => {
      if (!mapRef.current || mapInstance.current) return;
      // Verify DOM element is still attached to prevent IntersectionObserver errors
      if (!mapRef.current.isConnected) return;
      const center = CITY_COORDS[city] || CITY_COORDS.Dallas;

      try {
        // Double-check element is still connected right before construction
        if (!mapRef.current.isConnected) return;
        const map = new mapsLib.Map(mapRef.current, {
          center,
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
          ],
        });

        map.addListener("click", () => {
          onSelectBiz?.(null);
          if (infoWindowRef.current) infoWindowRef.current.close();
        });

        // Sprint 418: Show "Search this area" on pan/zoom
        map.addListener("dragend", () => setShowSearchArea(true));
        map.addListener("zoom_changed", () => setShowSearchArea(true));

        mapInstance.current = map;
        setMapReady(true);
        const google = window.google;
        if (google) updateMarkers(google, map, bizWithCoords);
      } catch (initErr: any) {
        console.error("[MapView] Map initialization failed:", initErr);
        setMapError("Map could not be initialized. Try the list view.");
      }
    }).catch((err: any) => {
      console.error("[MapView] Google Maps load error:", err);
      const msg = String(err?.message || err || "");
      if (msg.includes("ApiNotActivatedMapError") || msg.includes("REQUEST_DENIED")) {
        setMapError("Maps JavaScript API is not enabled. Enable it at console.cloud.google.com/apis/library/maps-backend.googleapis.com");
      } else if (msg.includes("InvalidKeyMapError")) {
        setMapError("Invalid API key. Check EXPO_PUBLIC_GOOGLE_MAPS_API_KEY.");
      } else {
        setMapError(`Failed to load Google Maps: ${msg || "Unknown error"}. Check browser console.`);
      }
    });

    return () => {
      markersRef.current.forEach(m => m.setMap?.(null));
      markersRef.current = [];
      // Clear map instance so it's re-created on next mount (prevents stale DOM ref)
      mapInstance.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    const google = window.google;
    if (!google) return;
    const center = CITY_COORDS[city] || CITY_COORDS.Dallas;
    mapInstance.current.panTo(center);
    updateMarkers(google, mapInstance.current, bizWithCoords);
  }, [businesses, city, mapReady]);

  function updateMarkers(google: any, map: any, items: MappedBusiness[]) {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    if (items.length === 0) return;

    const bounds = new google.maps.LatLngBounds();

    items.forEach(biz => {
      if (!biz.lat || !biz.lng) return;
      bounds.extend({ lat: biz.lat, lng: biz.lng });

      const pinSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48"><defs><filter id="s" x="-20%" y="-10%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/></filter></defs><path d="M20 46C20 46 36 28 36 18C36 9.16 28.84 2 20 2C11.16 2 4 9.16 4 18C4 28 20 46 20 46Z" fill="${AMBER}" stroke="white" stroke-width="2" filter="url(#s)"/><text x="20" y="23" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="sans-serif">${biz.rank}</text></svg>`
      );

      const marker = new google.maps.Marker({
        position: { lat: biz.lat, lng: biz.lng },
        map,
        icon: {
          url: `data:image/svg+xml,${pinSvg}`,
          scaledSize: new google.maps.Size(40, 48),
          anchor: new google.maps.Point(20, 48),
        },
        title: biz.name,
        zIndex: 1000 - biz.rank,
      });

      marker.addListener("click", () => {
        onSelectBiz?.(biz);
        map.panTo({ lat: biz.lat, lng: biz.lng });
        // Sprint 418: Info window with score + rating count
        if (infoWindowRef.current) infoWindowRef.current.close();
        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="font-family:sans-serif;padding:2px 4px"><b style="font-size:13px">${biz.name}</b><br/><span style="color:#C49A1A;font-weight:700">★ ${biz.weightedScore.toFixed(1)}</span> · <span style="color:#888">${biz.ratingCount} ratings</span></div>`,
        });
        infoWindow.open(map, marker);
        infoWindowRef.current = infoWindow;
      });

      markersRef.current.push(marker);
    });

    map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
    const listener = google.maps.event.addListener(map, "idle", () => {
      if (map.getZoom() > 15) map.setZoom(15);
      google.maps.event.removeListener(listener);
    });
  }

  if (Platform.OS !== "web") {
    return (
      <View style={ms.mapFallbackBanner}>
        <Ionicons name="map-outline" size={20} color={Colors.textTertiary} />
        <Text style={ms.mapFallbackText}>Map view is available on web</Text>
      </View>
    );
  }

  if (mapError) {
    return (
      <View style={ms.mapErrorBanner}>
        <Ionicons name="alert-circle-outline" size={24} color={Colors.red} />
        <Text style={ms.mapErrorText}>{mapError}</Text>
      </View>
    );
  }

  const handleSearchArea = () => {
    if (!mapInstance.current || !onSearchArea) return;
    const center = mapInstance.current.getCenter();
    if (center) {
      onSearchArea(center.lat(), center.lng());
      setShowSearchArea(false);
    }
  };

  return (
    <View style={ms.mapContainer}>
      <div ref={mapRef as any} style={{ width: "100%", height: "100%" }} />
      {!mapReady && (
        <View style={ms.mapLoadingOverlay}>
          <ActivityIndicator size="small" color={AMBER} />
        </View>
      )}
      {/* Sprint 418: Search this area button */}
      {mapReady && showSearchArea && onSearchArea && (
        <TouchableOpacity
          style={ms.searchAreaBtn}
          onPress={handleSearchArea}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Search this area on the map"
        >
          <Ionicons name="search" size={14} color="#fff" />
          <Text style={ms.searchAreaText}>Search this area</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Haversine distance utility
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const ms = StyleSheet.create({
  mapContainer: {
    flex: 1, position: "relative" as const,
  },
  mapLoadingOverlay: {
    position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.8)",
  },
  searchAreaBtn: {
    position: "absolute" as const, top: 12, alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: BRAND.colors.navy, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 4,
  },
  searchAreaText: {
    fontSize: 12, fontWeight: "600", color: "#fff", fontFamily: "DMSans_600SemiBold",
  },
  mapFallbackBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    padding: 20,
  },
  mapFallbackText: {
    fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  mapErrorBanner: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 10,
    paddingHorizontal: 24, paddingVertical: 40,
  },
  mapErrorText: {
    fontSize: 13, color: Colors.red, fontFamily: "DMSans_500Medium",
    textAlign: "center", lineHeight: 18,
  },
});

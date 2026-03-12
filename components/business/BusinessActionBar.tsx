/**
 * Sprint 381: Extracted action bar from business detail.
 * Contains Call, Website, Maps, Share, Copy Link action buttons.
 */
import React, { useEffect } from "react";
import { View, StyleSheet, Platform, Linking, Share } from "react-native";
import * as Haptics from "expo-haptics";
import { ActionButton } from "./ActionButton";
import { Analytics } from "@/lib/analytics";
import { getShareUrl, getShareText, copyShareLink, shareToWhatsApp } from "@/lib/sharing";

export interface BusinessActionBarProps {
  name: string;
  slug: string;
  weightedScore: number;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  googleMapsUrl?: string | null;
  // Sprint 627: Decision-to-Action CTAs
  menuUrl?: string | null;
  orderUrl?: string | null;
  pickupUrl?: string | null;
  doordashUrl?: string | null;
  uberEatsUrl?: string | null;
  reservationUrl?: string | null;
}

export function BusinessActionBar({
  name, slug, weightedScore, phone, website, address, googleMapsUrl,
  menuUrl, orderUrl, pickupUrl, doordashUrl, uberEatsUrl, reservationUrl,
}: BusinessActionBarProps) {
  const handleCall = () => {
    if (phone) { Haptics.selectionAsync(); Linking.openURL(`tel:${phone}`); }
  };

  const handleWebsite = () => {
    if (website) { Haptics.selectionAsync(); Linking.openURL(website); }
  };

  const handleMaps = () => {
    if (googleMapsUrl) {
      Linking.openURL(googleMapsUrl);
    } else if (address) {
      const q = encodeURIComponent(address);
      if (Platform.OS === "web") {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
      } else {
        Linking.openURL(Platform.OS === "ios" ? `maps:?q=${q}` : `geo:0,0?q=${q}`);
      }
    }
  };

  const handleShare = async () => {
    Haptics.selectionAsync();
    try {
      await Share.share({
        message: getShareText(name, weightedScore),
        url: getShareUrl("business", slug),
      });
      Analytics.shareBusiness(slug, "share_sheet");
    } catch (e) {
      if (__DEV__) console.warn("[ActionBar] Share failed:", e);
    }
  };

  const handleCopyLink = async () => {
    Haptics.selectionAsync();
    const url = getShareUrl("business", slug);
    const copied = await copyShareLink(url, name);
    if (copied) Analytics.shareBusiness(slug, "copy_link");
  };

  // Sprint 627: Decision-to-Action CTA handlers
  const handleMenu = () => { if (menuUrl) { Haptics.selectionAsync(); Linking.openURL(menuUrl); Analytics.actionCTATap(slug, "menu"); Analytics.actionCTAConversion(slug, "menu", "business_detail"); } };
  const handleOrder = () => { if (orderUrl) { Haptics.selectionAsync(); Linking.openURL(orderUrl); Analytics.actionCTATap(slug, "order"); Analytics.actionCTAConversion(slug, "order", "business_detail"); } };
  const handlePickup = () => { if (pickupUrl) { Haptics.selectionAsync(); Linking.openURL(pickupUrl); Analytics.actionCTATap(slug, "pickup"); Analytics.actionCTAConversion(slug, "pickup", "business_detail"); } };
  const handleDoordash = () => { if (doordashUrl) { Haptics.selectionAsync(); Linking.openURL(doordashUrl); Analytics.actionCTATap(slug, "doordash"); Analytics.actionCTAConversion(slug, "doordash", "business_detail"); } };
  const handleUberEats = () => { if (uberEatsUrl) { Haptics.selectionAsync(); Linking.openURL(uberEatsUrl); Analytics.actionCTATap(slug, "ubereats"); Analytics.actionCTAConversion(slug, "ubereats", "business_detail"); } };
  const handleReservation = () => { if (reservationUrl) { Haptics.selectionAsync(); Linking.openURL(reservationUrl); Analytics.actionCTATap(slug, "reservation"); Analytics.actionCTAConversion(slug, "reservation", "business_detail"); } };

  const hasActionCTAs = menuUrl || orderUrl || pickupUrl || doordashUrl || uberEatsUrl || reservationUrl;

  // Sprint 630: Track action CTA impressions on business detail
  useEffect(() => {
    if (hasActionCTAs) {
      const types: string[] = [];
      if (menuUrl) types.push("menu");
      if (orderUrl) types.push("order");
      if (pickupUrl) types.push("pickup");
      if (doordashUrl) types.push("doordash");
      if (uberEatsUrl) types.push("ubereats");
      if (reservationUrl) types.push("reservation");
      Analytics.actionCTAImpression(slug, "business_detail", types);
    }
  }, [slug, hasActionCTAs]);

  // Sprint 539: WhatsApp share with "Best In" format
  const handleWhatsApp = async () => {
    Haptics.selectionAsync();
    const url = getShareUrl("business", slug);
    const text = `🔥 ${name} — rated ${weightedScore.toFixed(1)}/5 on TopRanker!\n\nCheck it out:\n${url}`;
    const sent = await shareToWhatsApp(text);
    if (sent) Analytics.shareBusiness(slug, "whatsapp");
  };

  return (
    <View style={s.wrapper}>
      {/* Sprint 627: Decision-to-Action CTAs (shown when available) */}
      {hasActionCTAs && (
        <View style={s.actionRow}>
          {menuUrl && <ActionButton icon="restaurant-outline" label="Menu" onPress={handleMenu} accent />}
          {orderUrl && <ActionButton icon="bag-handle-outline" label="Order" onPress={handleOrder} accent />}
          {pickupUrl && <ActionButton icon="car-outline" label="Pickup" onPress={handlePickup} accent />}
          {doordashUrl && <ActionButton icon="bicycle-outline" label="DoorDash" onPress={handleDoordash} accent />}
          {uberEatsUrl && <ActionButton icon="fast-food-outline" label="Uber Eats" onPress={handleUberEats} accent />}
          {reservationUrl && <ActionButton icon="calendar-outline" label="Reserve" onPress={handleReservation} accent />}
        </View>
      )}
      <View style={s.actionRow}>
        <ActionButton icon="call-outline" label="Call" onPress={handleCall} disabled={!phone} />
        <ActionButton icon="globe-outline" label="Website" onPress={handleWebsite} disabled={!website} />
        <ActionButton icon="navigate-outline" label="Maps" onPress={handleMaps} disabled={!address} />
        <ActionButton icon="share-outline" label="Share" onPress={handleShare} />
        <ActionButton icon="logo-whatsapp" label="WhatsApp" onPress={handleWhatsApp} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { gap: 8, paddingVertical: 8 },
  actionRow: {
    flexDirection: "row", justifyContent: "space-around",
    paddingVertical: 4,
  },
});

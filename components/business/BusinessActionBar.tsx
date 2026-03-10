/**
 * Sprint 381: Extracted action bar from business detail.
 * Contains Call, Website, Maps, Share, Copy Link action buttons.
 */
import React from "react";
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
}

export function BusinessActionBar({
  name, slug, weightedScore, phone, website, address, googleMapsUrl,
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
    } catch {}
  };

  const handleCopyLink = async () => {
    Haptics.selectionAsync();
    const url = getShareUrl("business", slug);
    const copied = await copyShareLink(url, name);
    if (copied) Analytics.shareBusiness(slug, "copy_link");
  };

  // Sprint 539: WhatsApp share with "Best In" format
  const handleWhatsApp = async () => {
    Haptics.selectionAsync();
    const url = getShareUrl("business", slug);
    const text = `🔥 ${name} — rated ${weightedScore.toFixed(1)}/5 on TopRanker!\n\nCheck it out:\n${url}`;
    const sent = await shareToWhatsApp(text);
    if (sent) Analytics.shareBusiness(slug, "whatsapp");
  };

  return (
    <View style={s.actionBar}>
      <ActionButton icon="call-outline" label="Call" onPress={handleCall} disabled={!phone} />
      <ActionButton icon="globe-outline" label="Website" onPress={handleWebsite} disabled={!website} />
      <ActionButton icon="navigate-outline" label="Maps" onPress={handleMaps} disabled={!address} />
      <ActionButton icon="share-outline" label="Share" onPress={handleShare} />
      <ActionButton icon="logo-whatsapp" label="WhatsApp" onPress={handleWhatsApp} />
    </View>
  );
}

const s = StyleSheet.create({
  actionBar: {
    flexDirection: "row", justifyContent: "space-around",
    paddingVertical: 12,
  },
});

/**
 * Badge Sharing Utility — Capture + share badge card as image
 * Owner: Suki (Design Lead) + James Park (Frontend)
 *
 * Uses react-native-view-shot to capture BadgeShareCard as PNG,
 * then expo-sharing to open the native share sheet.
 */
import { type RefObject } from "react";
import { type View, Platform } from "react-native";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { getApiUrl } from "@/lib/query-client";

/**
 * Captures the badge share card view as a PNG and opens the share sheet.
 * @param viewRef — ref to the BadgeShareCard View
 * @returns true if shared successfully, false otherwise
 */
export async function shareBadgeCard(viewRef: RefObject<View | null>): Promise<boolean> {
  if (!viewRef.current) return false;

  try {
    const uri = await captureRef(viewRef, {
      format: "png",
      quality: 1,
      result: "tmpfile",
    });

    if (Platform.OS === "web") {
      // Web fallback: no expo-sharing support
      return false;
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) return false;

    await Sharing.shareAsync(uri, {
      mimeType: "image/png",
      dialogTitle: "Share your badge",
      UTI: "public.png",
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a shareable link URL for a badge with OG meta previews.
 * @param badgeId — the badge ID
 * @param username — optional username for attribution
 * @returns full share URL
 */
export function getBadgeShareUrl(badgeId: string, username?: string): string {
  const baseUrl = getApiUrl();
  const url = new URL(`/share/badge/${encodeURIComponent(badgeId)}`, baseUrl);
  if (username) {
    url.searchParams.set("user", username);
  }
  return url.toString();
}

/**
 * Sprint 664: Apple Sign-In integration.
 * Native: uses expo-apple-authentication
 * Web: Apple JS SDK (limited availability)
 */

import { Platform } from "react-native";

/**
 * Check if Apple Sign-In is available on this device.
 * Only available on iOS 13+ natively.
 */
export async function isAppleAuthAvailable(): Promise<boolean> {
  if (Platform.OS === "ios") {
    try {
      const AppleAuth = await import("expo-apple-authentication");
      return await AppleAuth.isAvailableAsync();
    } catch {
      return false;
    }
  }
  // Web: Apple Sign-In JS SDK could work but limited support
  // Android: Not supported
  return false;
}

/**
 * Trigger Apple Sign-In and return the identity token.
 * Returns null if user cancels or auth fails.
 */
export async function signInWithApple(): Promise<{
  identityToken: string;
  fullName: { givenName: string | null; familyName: string | null } | null;
  email: string | null;
} | null> {
  if (Platform.OS !== "ios") {
    return null;
  }

  try {
    const AppleAuth = await import("expo-apple-authentication");

    const credential = await AppleAuth.signInAsync({
      requestedScopes: [
        AppleAuth.AppleAuthenticationScope.FULL_NAME,
        AppleAuth.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      return null;
    }

    return {
      identityToken: credential.identityToken,
      fullName: credential.fullName ? {
        givenName: credential.fullName.givenName,
        familyName: credential.fullName.familyName,
      } : null,
      email: credential.email,
    };
  } catch (err: any) {
    // User cancelled or auth failed
    if (err.code === "ERR_REQUEST_CANCELED") {
      return null;
    }
    throw err;
  }
}

import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "";

// Complete auth session for native platforms
if (Platform.OS !== "web") {
  WebBrowser.maybeCompleteAuthSession();
}

// ── Web: Google Identity Services (GSI) ──────────────────────────

let gsiLoaded = false;
let gsiLoadPromise: Promise<void> | null = null;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          cancel: () => void;
        };
      };
    };
  }
}

function loadGsiScript(): Promise<void> {
  if (gsiLoaded) return Promise.resolve();
  if (gsiLoadPromise) return gsiLoadPromise;

  gsiLoadPromise = new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Not in browser environment"));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gsiLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Google Sign-In"));
    document.head.appendChild(script);
  });

  return gsiLoadPromise;
}

function renderAndClickGoogleButton(reject: (err: Error) => void) {
  if (!window.google) {
    reject(new Error("Google Sign-In not available"));
    return;
  }

  let container = document.getElementById("g-signin-fallback");
  if (!container) {
    container = document.createElement("div");
    container.id = "g-signin-fallback";
    container.style.position = "fixed";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
    document.body.appendChild(container);
  }

  window.google.accounts.id.renderButton(container, {
    type: "standard",
    size: "large",
  });

  requestAnimationFrame(() => {
    const btn =
      container?.querySelector<HTMLElement>('[role="button"]') ||
      container?.querySelector<HTMLElement>("div[style]");
    if (btn) {
      btn.click();
    } else {
      container?.remove();
      reject(new Error("Could not initialize Google Sign-In. Please try again."));
    }
  });
}

async function signInWithGoogleWeb(): Promise<string> {
  await loadGsiScript();

  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error("Google Sign-In failed to initialize"));
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential: string }) => {
        const container = document.getElementById("g-signin-fallback");
        if (container) container.remove();

        if (response.credential) {
          resolve(response.credential);
        } else {
          reject(new Error("No credential received from Google"));
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        renderAndClickGoogleButton(reject);
      }
    });
  });
}

// ── Native: OAuth via in-app browser ─────────────────────────────

async function signInWithGoogleNative(): Promise<string> {
  // For iOS/Android in Expo Go, we need an iOS client ID from GCP
  // which allows custom scheme redirects (com.googleusercontent.apps.*)
  const iosClientId = GOOGLE_IOS_CLIENT_ID;

  if (!iosClientId) {
    // Fallback: use web client ID with manual redirect through our server
    return signInWithGoogleViaServer();
  }

  // The iOS client ID's reversed ID is the redirect scheme
  // e.g., client ID "123-abc.apps.googleusercontent.com" → scheme "com.googleusercontent.apps.123-abc"
  const reversedClientId = iosClientId.split(".").reverse().join(".");
  const redirectUri = `${reversedClientId}:/oauthredirect`;

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(iosClientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=token` +
    `&scope=${encodeURIComponent("openid profile email")}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type !== "success" || !result.url) {
    throw new Error("Google sign-in cancelled");
  }

  const fragment = result.url.split("#")[1] || "";
  const params = new URLSearchParams(fragment);
  const accessToken = params.get("access_token");

  if (!accessToken) {
    throw new Error("No access token received from Google");
  }

  return accessToken;
}

// Fallback: redirect through our own server for OAuth
async function signInWithGoogleViaServer(): Promise<string> {
  const { apiFetch } = await import("./queryClient");

  // Get the API base URL
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || "";
  const authUrl = `${apiUrl}/api/auth/google/mobile-start?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}`;

  const result = await WebBrowser.openAuthSessionAsync(
    authUrl,
    "topranker://google-auth"
  );

  if (result.type !== "success" || !result.url) {
    throw new Error("Google sign-in cancelled");
  }

  // Extract token from redirect URL
  const url = new URL(result.url);
  const accessToken = url.searchParams.get("token") || url.hash?.split("access_token=")[1]?.split("&")[0];

  if (!accessToken) {
    throw new Error("No token received");
  }

  return accessToken;
}

// ── Public API ───────────────────────────────────────────────────

export function isGoogleAuthAvailable(): boolean {
  if (Platform.OS === "web") return !!GOOGLE_CLIENT_ID;
  return !!(GOOGLE_IOS_CLIENT_ID || GOOGLE_CLIENT_ID);
}

export async function signInWithGoogle(): Promise<string> {
  if (Platform.OS === "web") {
    if (!GOOGLE_CLIENT_ID) throw new Error("Google Client ID not configured");
    return signInWithGoogleWeb();
  }

  return signInWithGoogleNative();
}

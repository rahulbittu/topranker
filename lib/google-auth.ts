import { Platform } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
// AuthSession used only for makeRedirectUri, WebBrowser for the actual OAuth flow

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";

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

// ── Native: expo-auth-session OAuth flow ─────────────────────────

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  userInfoEndpoint: "https://www.googleapis.com/oauth2/v3/userinfo",
};

async function signInWithGoogleNative(): Promise<string> {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "topranker",
    path: "google-auth",
  });

  console.log("[Google Auth] Redirect URI:", redirectUri);

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=token` +
    `&scope=${encodeURIComponent("openid profile email")}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type !== "success" || !result.url) {
    throw new Error("Google sign-in cancelled");
  }

  // Extract access_token from the redirect URL fragment
  const fragment = result.url.split("#")[1] || "";
  const params = new URLSearchParams(fragment);
  const accessToken = params.get("access_token");

  if (!accessToken) {
    throw new Error("No access token received from Google");
  }

  return accessToken;
}

// ── Public API ───────────────────────────────────────────────────

export function isGoogleAuthAvailable(): boolean {
  return !!GOOGLE_CLIENT_ID;
}

export async function signInWithGoogle(): Promise<string> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Google Client ID not configured");
  }

  if (Platform.OS === "web") {
    return signInWithGoogleWeb();
  }

  return signInWithGoogleNative();
}

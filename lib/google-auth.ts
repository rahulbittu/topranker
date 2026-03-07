import { Platform } from "react-native";

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";

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

export function isGoogleAuthAvailable(): boolean {
  return Platform.OS === "web" && !!GOOGLE_CLIENT_ID;
}

export async function signInWithGoogle(): Promise<string> {
  if (Platform.OS !== "web") {
    throw new Error("Google Sign-In is only available on web");
  }
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Google Client ID not configured");
  }

  await loadGsiScript();

  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error("Google Sign-In failed to initialize"));
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential: string }) => {
        // Clean up the hidden button container
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

    // Try One Tap first
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // One Tap unavailable (e.g., third-party cookies blocked).
        // Fall back to rendering a hidden Google button and clicking it.
        renderAndClickGoogleButton(reject);
      }
    });
  });
}

function renderAndClickGoogleButton(reject: (err: Error) => void) {
  if (!window.google) {
    reject(new Error("Google Sign-In not available"));
    return;
  }

  // Create an off-screen container for the Google button
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

  // Click the rendered button to trigger the popup
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

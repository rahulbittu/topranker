/**
 * Sentry Integration Abstraction — Sprint 122
 * Replace with actual @sentry/react-native when DSN is configured.
 * Owner: Sarah Nakamura (Lead Engineer)
 * Reviewed: Amir Patel (Architecture)
 */

export interface SentryConfig {
  dsn: string;
  environment: string;
  release: string;
  tracesSampleRate: number;
}

let initialized = false;
let currentUser: { id: string; email?: string } | null = null;
const breadcrumbs: Array<{ category: string; message: string; timestamp: number }> = [];
const MAX_BREADCRUMBS = 50;

/** Initialize Sentry with the given config */
export function initSentry(config: SentryConfig): void {
  if (__DEV__) {
    console.log("[Sentry] Initializing with config:", {
      dsn: config.dsn,
      environment: config.environment,
      release: config.release,
      tracesSampleRate: config.tracesSampleRate,
    });
  }
  initialized = true;
}

/** Capture an exception and send to Sentry */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (__DEV__) {
    if (initialized) {
      console.log("[Sentry] Captured:", error.message, context || "");
    } else {
      console.error("[Sentry] Not initialized — fallback:", error.message, context || "");
    }
  }
}

/** Capture a message at a given severity level */
export function captureMessage(message: string, level?: "info" | "warning" | "error"): void {
  if (__DEV__) {
    if (initialized) {
      console.log(`[Sentry] Message (${level || "info"}):`, message);
    } else {
      console.error("[Sentry] Not initialized — fallback message:", message);
    }
  }
}

/** Set the current user context for Sentry */
export function setUser(user: { id: string; email?: string } | null): void {
  currentUser = user;
  if (__DEV__ && initialized) {
    console.log("[Sentry] User set:", user ? user.id : "cleared");
  }
}

/** Add a breadcrumb for debugging context */
export function addBreadcrumb(category: string, message: string): void {
  breadcrumbs.push({ category, message, timestamp: Date.now() });
  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs.splice(0, breadcrumbs.length - MAX_BREADCRUMBS);
  }
  if (__DEV__ && initialized) {
    console.log(`[Sentry] Breadcrumb (${category}):`, message);
  }
}

/** Get recent breadcrumbs for debugging (Sprint 717) */
export function getRecentBreadcrumbs(limit = 20): Array<{ category: string; message: string; timestamp: number }> {
  return breadcrumbs.slice(-limit);
}

/** Get current user context */
export function getCurrentUser(): { id: string; email?: string } | null {
  return currentUser;
}

/** Check whether Sentry has been initialized */
export function isInitialized(): boolean {
  return initialized;
}

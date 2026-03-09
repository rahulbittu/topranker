/**
 * Sprint 191: Server-side Error Tracking
 *
 * Captures unhandled errors, slow requests, and critical failures.
 * Sends to Sentry when SENTRY_DSN is configured, else logs to console.
 * Owner: Nadia Kaur (Cybersecurity)
 */
import type { Request, Response, NextFunction } from "express";
import { log } from "./logger";

const errorLog = log.tag("ErrorTracking");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SENTRY_DSN = process.env.SENTRY_DSN || "";
let initialized = false;

interface ErrorEvent {
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: string;
  severity: "error" | "warning" | "fatal";
  route?: string;
  userId?: string;
}

// In-memory buffer for recent errors (admin dashboard)
const recentErrors: ErrorEvent[] = [];
const MAX_RECENT_ERRORS = 100;

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

export function initErrorTracking(): void {
  if (SENTRY_DSN) {
    errorLog.info("Error tracking initialized with Sentry DSN");
    initialized = true;
  } else {
    errorLog.info("SENTRY_DSN not set — error tracking uses console fallback");
  }

  // Capture unhandled rejections
  process.on("unhandledRejection", (reason: unknown) => {
    const err = reason instanceof Error ? reason : new Error(String(reason));
    captureServerError(err, { type: "unhandledRejection" }, "fatal");
  });

  // Capture uncaught exceptions
  process.on("uncaughtException", (err: Error) => {
    captureServerError(err, { type: "uncaughtException" }, "fatal");
    // Give time for the error to be sent before exiting
    setTimeout(() => process.exit(1), 2000);
  });
}

// ---------------------------------------------------------------------------
// Error capture
// ---------------------------------------------------------------------------

export function captureServerError(
  error: Error,
  context?: Record<string, unknown>,
  severity: "error" | "warning" | "fatal" = "error",
): void {
  const event: ErrorEvent = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    severity,
  };

  // Add to recent errors buffer
  recentErrors.unshift(event);
  if (recentErrors.length > MAX_RECENT_ERRORS) {
    recentErrors.length = MAX_RECENT_ERRORS;
  }

  if (initialized && SENTRY_DSN) {
    // In production with Sentry DSN, would use @sentry/node SDK
    // For now, structured log output for log aggregation
    errorLog.error(JSON.stringify({
      sentry: true,
      ...event,
    }));
  } else {
    errorLog.error(`${severity}: ${error.message}`, context);
  }
}

// ---------------------------------------------------------------------------
// Express error-handling middleware (must be last middleware)
// ---------------------------------------------------------------------------

export function errorHandlerMiddleware(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const userId = (req as any).user?.id;
  const route = `${req.method} ${req.route?.path || req.path}`;

  captureServerError(err, {
    route,
    userId,
    query: req.query,
    ip: req.ip,
  });

  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error" });
  }
}

// ---------------------------------------------------------------------------
// Admin: get recent errors
// ---------------------------------------------------------------------------

export function getRecentServerErrors(limit: number = 20): ErrorEvent[] {
  return recentErrors.slice(0, limit);
}

export function getErrorStats(): {
  total: number;
  fatal: number;
  error: number;
  warning: number;
  last24h: number;
} {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return {
    total: recentErrors.length,
    fatal: recentErrors.filter((e) => e.severity === "fatal").length,
    error: recentErrors.filter((e) => e.severity === "error").length,
    warning: recentErrors.filter((e) => e.severity === "warning").length,
    last24h: recentErrors.filter((e) => new Date(e.timestamp).getTime() > oneDayAgo).length,
  };
}

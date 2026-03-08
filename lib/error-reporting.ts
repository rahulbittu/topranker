/**
 * Error Reporting Service — Sprint 116
 * Centralized error reporting. Currently logs to console.
 * Replace with Sentry/Bugsnag integration in production.
 * Owner: Sarah Nakamura (Lead Engineer)
 */

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  context?: Record<string, unknown>;
  userId?: string;
  timestamp: number;
}

// In-memory error buffer for debugging (last 100 errors)
const errorBuffer: ErrorReport[] = [];
const MAX_ERRORS = 100;

/** Report an error to the monitoring service */
export function reportError(error: Error, context?: Record<string, unknown>): void {
  const report: ErrorReport = {
    message: error.message,
    stack: error.stack?.split("\n").slice(0, 10).join("\n"),
    context,
    timestamp: Date.now(),
  };

  errorBuffer.push(report);
  if (errorBuffer.length > MAX_ERRORS) {
    errorBuffer.splice(0, errorBuffer.length - MAX_ERRORS);
  }

  // Production: replace with Sentry.captureException(error, { extra: context })
  console.error("[ErrorReporting]", report.message, context || "");
}

/** Report a component crash (from ErrorBoundary) */
export function reportComponentCrash(
  error: Error,
  componentStack?: string,
  userId?: string,
): void {
  const report: ErrorReport = {
    message: error.message,
    stack: error.stack?.split("\n").slice(0, 10).join("\n"),
    componentStack: componentStack?.split("\n").slice(0, 5).join("\n"),
    userId,
    timestamp: Date.now(),
  };

  errorBuffer.push(report);
  if (errorBuffer.length > MAX_ERRORS) {
    errorBuffer.splice(0, errorBuffer.length - MAX_ERRORS);
  }

  console.error("[ErrorReporting] Component crash:", report.message);
}

/** Get recent errors for debugging */
export function getRecentErrors(limit = 20): ErrorReport[] {
  return errorBuffer.slice(-limit);
}

/** Clear error buffer */
export function clearErrors(): void {
  errorBuffer.length = 0;
}

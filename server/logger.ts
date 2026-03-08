/**
 * Structured logger for server-side code.
 * Replaces raw console.log/error/warn with level-aware, tagged logging.
 * Audit finding H5: 49 console.log/error/warn statements across 21 files.
 *
 * In production: only info/warn/error are shown (debug is suppressed).
 * All output is structured with timestamp, level, and tag.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL: LogLevel = process.env.NODE_ENV === "production" ? "info" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[MIN_LEVEL];
}

function formatMessage(level: LogLevel, tag: string, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const prefix = `${timestamp} [${level.toUpperCase()}] [${tag}]`;
  if (data !== undefined) {
    return `${prefix} ${message} ${typeof data === "string" ? data : JSON.stringify(data)}`;
  }
  return `${prefix} ${message}`;
}

function createTaggedLogger(tag: string) {
  return {
    debug(message: string, data?: unknown) {
      if (shouldLog("debug")) console.log(formatMessage("debug", tag, message, data));
    },
    info(message: string, data?: unknown) {
      if (shouldLog("info")) console.log(formatMessage("info", tag, message, data));
    },
    warn(message: string, data?: unknown) {
      if (shouldLog("warn")) console.warn(formatMessage("warn", tag, message, data));
    },
    error(message: string, data?: unknown) {
      if (shouldLog("error")) console.error(formatMessage("error", tag, message, data));
    },
  };
}

export const log = {
  /** Create a logger with a specific tag (e.g., "Email", "Push", "Deploy") */
  tag: createTaggedLogger,

  // Top-level convenience methods (tag: "Server")
  debug(message: string, data?: unknown) {
    if (shouldLog("debug")) console.log(formatMessage("debug", "Server", message, data));
  },
  info(message: string, data?: unknown) {
    if (shouldLog("info")) console.log(formatMessage("info", "Server", message, data));
  },
  warn(message: string, data?: unknown) {
    if (shouldLog("warn")) console.warn(formatMessage("warn", "Server", message, data));
  },
  error(message: string, data?: unknown) {
    if (shouldLog("error")) console.error(formatMessage("error", "Server", message, data));
  },
};

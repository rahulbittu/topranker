/**
 * Request Logger Middleware — Sprint 120
 * Structured request logging with in-memory buffer
 */

export interface RequestLog {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  timestamp: number;
  requestId?: string;
}

const MAX_BUFFER_SIZE = 500;

export const requestLogs: RequestLog[] = [];

export function getRequestLogs(limit?: number): RequestLog[] {
  if (limit && limit > 0) {
    return requestLogs.slice(-limit);
  }
  return [...requestLogs];
}

export function clearRequestLogs(): void {
  requestLogs.length = 0;
}

export function requestLoggerMiddleware() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    const requestId = req.headers["x-request-id"] as string | undefined;

    res.on("finish", () => {
      const durationMs = Date.now() - start;
      const responseTimeHeader = res.getHeader("x-response-time");
      const finalDuration = responseTimeHeader
        ? parseFloat(String(responseTimeHeader).replace("ms", ""))
        : durationMs;

      const logEntry: RequestLog = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: finalDuration,
        timestamp: Date.now(),
        requestId,
      };

      requestLogs.push(logEntry);

      // Trim buffer to max size
      if (requestLogs.length > MAX_BUFFER_SIZE) {
        requestLogs.splice(0, requestLogs.length - MAX_BUFFER_SIZE);
      }
    });

    next();
  };
}

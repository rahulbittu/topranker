/**
 * Sprint 718: Performance Tracker
 * Lightweight performance monitoring for beta.
 * Tracks app startup, API response times, and screen mounts.
 * Data stored in-memory; surfaced in dev overlay and error reports.
 */

export interface PerfMark {
  name: string;
  startMs: number;
  endMs?: number;
  durationMs?: number;
}

export interface PerfSummary {
  appStartupMs: number | null;
  apiAvgMs: number | null;
  apiMaxMs: number | null;
  apiCallCount: number;
  screenMounts: Record<string, number>;
}

const marks: PerfMark[] = [];
const apiTimes: number[] = [];
const screenMountTimes: Record<string, number[]> = {};
const MAX_API_SAMPLES = 200;
let appStartMs: number | null = null;
let appReadyMs: number | null = null;

/** Mark app start (call in _layout.tsx before splash) */
export function markAppStart(): void {
  appStartMs = Date.now();
}

/** Mark app ready (call when splash animation completes) */
export function markAppReady(): void {
  appReadyMs = Date.now();
}

/** Record an API call duration */
export function recordApiCall(endpoint: string, durationMs: number): void {
  apiTimes.push(durationMs);
  if (apiTimes.length > MAX_API_SAMPLES) {
    apiTimes.splice(0, apiTimes.length - MAX_API_SAMPLES);
  }
  marks.push({ name: `api:${endpoint}`, startMs: Date.now() - durationMs, endMs: Date.now(), durationMs });
}

/** Record a screen mount time */
export function recordScreenMount(screenName: string, durationMs: number): void {
  if (!screenMountTimes[screenName]) screenMountTimes[screenName] = [];
  screenMountTimes[screenName].push(durationMs);
  marks.push({ name: `screen:${screenName}`, startMs: Date.now() - durationMs, endMs: Date.now(), durationMs });
}

/** Start a named performance mark (returns a stop function) */
export function startMark(name: string): () => number {
  const startMs = Date.now();
  return () => {
    const endMs = Date.now();
    const durationMs = endMs - startMs;
    marks.push({ name, startMs, endMs, durationMs });
    return durationMs;
  };
}

/** Get performance summary */
export function getPerfSummary(): PerfSummary {
  const avgApi = apiTimes.length > 0
    ? Math.round(apiTimes.reduce((a, b) => a + b, 0) / apiTimes.length)
    : null;
  const maxApi = apiTimes.length > 0
    ? Math.max(...apiTimes)
    : null;

  const avgScreenMounts: Record<string, number> = {};
  for (const [screen, times] of Object.entries(screenMountTimes)) {
    avgScreenMounts[screen] = Math.round(
      times.reduce((a, b) => a + b, 0) / times.length,
    );
  }

  return {
    appStartupMs: appStartMs && appReadyMs ? appReadyMs - appStartMs : null,
    apiAvgMs: avgApi,
    apiMaxMs: maxApi,
    apiCallCount: apiTimes.length,
    screenMounts: avgScreenMounts,
  };
}

/** Get recent performance marks */
export function getRecentMarks(limit = 20): PerfMark[] {
  return marks.slice(-limit);
}

/** Clear all performance data */
export function clearPerfData(): void {
  marks.length = 0;
  apiTimes.length = 0;
  for (const key of Object.keys(screenMountTimes)) {
    delete screenMountTimes[key];
  }
  appStartMs = null;
  appReadyMs = null;
}

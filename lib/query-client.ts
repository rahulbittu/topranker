import { fetch } from "expo/fetch";
import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { recordApiCall, recordApiError } from "@/lib/perf-tracker";
import { addBreadcrumb } from "@/lib/sentry";

/**
 * Gets the base URL for the Express API server (e.g., "http://localhost:3000")
 * @returns {string} The API base URL
 */
export function getApiUrl(): string {
  // Explicit API URL takes priority (for native apps pointing to production)
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (apiUrl) {
    return apiUrl;
  }

  if (typeof window !== "undefined" && window.location) {
    return window.location.origin;
  }

  let host = process.env.EXPO_PUBLIC_DOMAIN;

  if (!host) {
    return "http://localhost:5000";
  }

  host = host.replace(/:5000$/, "");

  return `https://${host}`;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let message = res.statusText;
    try {
      const text = await res.text();
      const json = JSON.parse(text);
      message = json.message || json.error || text;
    } catch {
      // Non-JSON response, use status text
    }
    throw new Error(`${res.status}: ${message}`);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);
  const startMs = Date.now();

  try {
    const res = await fetch(url.toString(), {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    // Sprint 728: Record API timing and errors
    const durationMs = Date.now() - startMs;
    const endpoint = `${method} ${route}`;
    recordApiCall(endpoint, durationMs);
    if (!res.ok) {
      recordApiError(endpoint, res.status);
      addBreadcrumb("api", `${endpoint} → ${res.status} (${durationMs}ms)`);
    }

    await throwIfResNotOk(res);
    return res;
  } catch (err) {
    // Sprint 728: Record network-level failures
    const durationMs = Date.now() - startMs;
    const endpoint = `${method} ${route}`;
    recordApiError(endpoint, 0); // 0 = network error (no response)
    addBreadcrumb("api", `${endpoint} → NETWORK_ERROR (${durationMs}ms)`);
    throw err;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);
    const startMs = Date.now();
    const endpoint = `GET ${queryKey.join("/")}`;

    const res = await fetch(url.toString(), {
      credentials: "include",
    });

    // Sprint 728: Record query timing
    const durationMs = Date.now() - startMs;
    recordApiCall(endpoint, durationMs);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      recordApiError(endpoint, res.status);
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Sprint 687: Retry only network errors, not 4xx client errors
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  const msg = error instanceof Error ? error.message : String(error);
  // Don't retry client errors (401, 403, 404, 422)
  if (/^4\d{2}:/.test(msg)) return false;
  // Retry network errors and 5xx server errors
  return true;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: true,
      staleTime: 10000, // 10s — SSE invalidation handles most refreshes
      retry: shouldRetry,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    },
    mutations: {
      retry: false,
    },
  },
});

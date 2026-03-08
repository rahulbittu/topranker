import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import { queryClient, getApiUrl } from "@/lib/query-client";

/**
 * Near-real-time hook using Server-Sent Events (SSE).
 * Connects to /api/events and invalidates React Query caches
 * when the server broadcasts ranking/rating/challenger changes.
 */

type SSEEventType =
  | "connected"
  | "ranking_updated"
  | "rating_submitted"
  | "challenger_updated"
  | "business_updated"
  | "featured_updated";

interface SSEEvent {
  type: SSEEventType;
  payload?: Record<string, unknown>;
  timestamp: number;
}

const INVALIDATION_MAP: Record<string, string[][]> = {
  ranking_updated: [["/api/leaderboard"], ["/api/trending"]],
  rating_submitted: [["/api/leaderboard"], ["/api/businesses"], ["/api/trending"]],
  challenger_updated: [["/api/challengers"]],
  business_updated: [["/api/businesses"], ["/api/leaderboard"]],
  featured_updated: [["/api/featured"]],
};

export function useRealtimeEvents() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // SSE requires EventSource — available in browsers and on web
    if (typeof EventSource === "undefined") {
      // Fallback: aggressive polling for native where EventSource isn't available
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
        queryClient.invalidateQueries({ queryKey: ["/api/challengers"] });
      }, 15000);
      return () => clearInterval(interval);
    }

    function connect() {
      const url = `${getApiUrl()}/api/events`;
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          const keys = INVALIDATION_MAP[data.type];
          if (keys) {
            for (const queryKey of keys) {
              queryClient.invalidateQueries({ queryKey });
            }
          }
        } catch {
          // Ignore malformed events
        }
      };

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        // Reconnect after 3 seconds
        reconnectTimer.current = setTimeout(connect, 3000);
      };
    }

    connect();

    // Reconnect when app comes back to foreground
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && !eventSourceRef.current) {
        connect();
      } else if (state === "background" && eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    });

    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      subscription.remove();
    };
  }, []);
}

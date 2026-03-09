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
  ranking_updated: [["leaderboard"], ["trending"]],
  rating_submitted: [["leaderboard"], ["business"], ["trending"], ["challengers"]],
  challenger_updated: [["challengers"]],
  business_updated: [["business"], ["leaderboard"]],
  featured_updated: [["featured"]],
};

export function useRealtimeEvents() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // SSE requires EventSource — available in browsers and on web
    if (typeof EventSource === "undefined") {
      // Fallback: aggressive polling for native where EventSource isn't available
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
        queryClient.invalidateQueries({ queryKey: ["challengers"] });
        queryClient.invalidateQueries({ queryKey: ["trending"] });
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

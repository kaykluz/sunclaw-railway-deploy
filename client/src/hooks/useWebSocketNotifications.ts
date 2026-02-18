/**
 * useWebSocketNotifications — React hook for real-time notification push.
 *
 * Connects to /ws/notifications, auto-reconnects on disconnect, and
 * invalidates the tRPC notification queries whenever a new notification
 * arrives so the UI updates instantly.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { trpc } from "@/lib/trpc";

interface WSNotificationMessage {
  type: "connected" | "notification";
  data?: {
    id: number;
    type: string;
    title: string;
    message: string;
    severity: string;
    createdAt: string;
  };
  timestamp: string;
}

interface UseWSNotificationsReturn {
  connected: boolean;
  lastNotification: WSNotificationMessage["data"] | null;
}

const RECONNECT_DELAY_MS = 3_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

export function useWebSocketNotifications(
  enabled: boolean = true
): UseWSNotificationsReturn {
  const [connected, setConnected] = useState(false);
  const [lastNotification, setLastNotification] =
    useState<WSNotificationMessage["data"] | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const utils = trpc.useUtils();

  const invalidateNotifications = useCallback(() => {
    utils.notifications.list.invalidate();
    utils.notifications.unreadCount.invalidate();
  }, [utils]);

  const connect = useCallback(() => {
    if (!enabled || !mountedRef.current) return;

    // Build WS URL from current page origin
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setConnected(true);
        reconnectAttemptRef.current = 0;
        console.log("[WS] Notification stream connected");
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const msg: WSNotificationMessage = JSON.parse(event.data);
          if (msg.type === "notification" && msg.data) {
            setLastNotification(msg.data);
            // Invalidate tRPC queries so the UI refreshes
            invalidateNotifications();
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        setConnected(false);
        wsRef.current = null;

        // Don't reconnect if closed intentionally (code 4001 = unauthorized)
        if (event.code === 4001) {
          console.warn("[WS] Unauthorized — not reconnecting");
          return;
        }

        // Exponential backoff reconnect
        const delay = Math.min(
          RECONNECT_DELAY_MS * Math.pow(2, reconnectAttemptRef.current),
          MAX_RECONNECT_DELAY_MS
        );
        reconnectAttemptRef.current++;
        console.log(`[WS] Disconnected, reconnecting in ${delay}ms...`);
        reconnectTimerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        // onclose will fire after this, which handles reconnection
      };
    } catch {
      // Connection failed, schedule reconnect
      const delay = Math.min(
        RECONNECT_DELAY_MS * Math.pow(2, reconnectAttemptRef.current),
        MAX_RECONNECT_DELAY_MS
      );
      reconnectAttemptRef.current++;
      reconnectTimerRef.current = setTimeout(connect, delay);
    }
  }, [enabled, invalidateNotifications]);

  useEffect(() => {
    mountedRef.current = true;

    if (enabled) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [enabled, connect]);

  return { connected, lastNotification };
}

/**
 * WebSocket Notification Push Server
 *
 * Uses `noServer` mode so it does NOT steal the `upgrade` event from Vite HMR.
 * The HTTP server's `upgrade` listener is registered in `attachWebSocket` and
 * only handles requests whose URL starts with `/ws/notifications`.
 * Every other upgrade (including Vite HMR) is left untouched.
 */

import { WebSocketServer, WebSocket } from "ws";
import type { Server as HTTPServer } from "http";
import type { IncomingMessage } from "http";
import type { Duplex } from "stream";
import { parse as parseCookie } from "cookie";
import { jwtVerify } from "jose";

/* ─── Types ─── */

interface AuthenticatedSocket extends WebSocket {
  userId?: number;
  isAlive?: boolean;
}

export interface NotificationPayload {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  severity: string;
  actionUrl?: string | null;
  createdAt: string;
}

/* ─── State ─── */

let wss: WebSocketServer | null = null;
const userSockets = new Map<number, Set<AuthenticatedSocket>>();

/* ─── JWT Verification ─── */

async function extractUserId(req: IncomingMessage): Promise<number | null> {
  try {
    const cookies = parseCookie(req.headers.cookie ?? "");
    const token = cookies["session"];
    if (!token) return null;

    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    return typeof payload.userId === "number" ? payload.userId : null;
  } catch {
    return null;
  }
}

/* ─── Server Setup ─── */

export function attachWebSocket(server: HTTPServer): void {
  // Create WebSocket server in `noServer` mode so it does NOT attach its own
  // `upgrade` listener.  This prevents it from intercepting Vite HMR upgrades.
  wss = new WebSocketServer({ noServer: true });

  // Manually listen for `upgrade` on the HTTP server and only handle our path.
  server.on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const url = req.url ?? "";

    // Only handle our notification WebSocket path
    if (url.startsWith("/ws/notifications")) {
      wss!.handleUpgrade(req, socket, head, (ws) => {
        wss!.emit("connection", ws, req);
      });
    }
    // All other upgrade requests (including Vite HMR at /) are left for
    // other listeners — we do NOT call socket.destroy() here.
  });

  wss.on("connection", async (ws: AuthenticatedSocket, req: IncomingMessage) => {
    const userId = await extractUserId(req);
    if (!userId) {
      ws.close(4001, "Unauthorized");
      return;
    }

    ws.userId = userId;
    ws.isAlive = true;

    // Track the socket
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(ws);

    // Send a welcome message
    ws.send(
      JSON.stringify({
        type: "connected",
        message: "Notification stream connected",
        timestamp: new Date().toISOString(),
      })
    );

    // Heartbeat
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("close", () => {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(ws);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });

    ws.on("error", () => {
      ws.terminate();
    });
  });

  // Heartbeat interval — ping every 30 seconds, terminate dead connections
  const heartbeat = setInterval(() => {
    if (!wss) return;
    wss.clients.forEach((ws) => {
      const authWs = ws as AuthenticatedSocket;
      if (authWs.isAlive === false) {
        authWs.terminate();
        return;
      }
      authWs.isAlive = false;
      authWs.ping();
    });
  }, 30_000);

  wss.on("close", () => {
    clearInterval(heartbeat);
  });

  console.log("[WebSocket] Notification server attached at /ws/notifications (noServer mode)");
}

/* ─── Broadcast ─── */

/**
 * Push a notification to all connected sockets for a specific user.
 */
export function pushNotification(userId: number, payload: NotificationPayload): void {
  const sockets = userSockets.get(userId);
  if (!sockets || sockets.size === 0) return;

  const message = JSON.stringify({
    type: "notification",
    data: payload,
    timestamp: new Date().toISOString(),
  });

  sockets.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

/**
 * Push a notification to ALL connected users (system-wide broadcast).
 */
export function broadcastNotification(payload: Omit<NotificationPayload, "userId">): void {
  if (!wss) return;

  const message = JSON.stringify({
    type: "notification",
    data: payload,
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

/**
 * Get count of connected users (for monitoring).
 */
export function getConnectedUserCount(): number {
  return userSockets.size;
}

/**
 * Get total connected socket count.
 */
export function getConnectedSocketCount(): number {
  let total = 0;
  userSockets.forEach((sockets) => {
    total += sockets.size;
  });
  return total;
}

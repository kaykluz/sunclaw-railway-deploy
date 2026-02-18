/**
 * Database-backed session manager — adapted from KIISHA's sessionManager.
 * Replaces Manus JWT-based session management with secure random session IDs.
 */
import crypto from "crypto";
import { eq, and, gt, isNull, lt } from "drizzle-orm";
import { serverSessions, type ServerSession } from "../../drizzle/schema";
import { getDb } from "../db";

const SESSION_ID_BYTES = 32;
const DEFAULT_SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 1 day
const REMEMBER_ME_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function generateSessionId(): string {
  return crypto.randomBytes(SESSION_ID_BYTES).toString("hex");
}

function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export interface CreateSessionOptions {
  userId: number;
  ip?: string | null;
  userAgent?: string | null;
  rememberMe?: boolean;
}

export interface SessionValidation {
  valid: boolean;
  session: ServerSession | null;
}

/**
 * Create a new server session for a user.
 */
export async function createSession(opts: CreateSessionOptions): Promise<{ sessionId: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const sessionId = generateSessionId();
  const durationMs = opts.rememberMe ? REMEMBER_ME_DURATION_MS : DEFAULT_SESSION_DURATION_MS;
  const expiresAt = new Date(Date.now() + durationMs);

  const ipHash = opts.ip ? hashValue(opts.ip) : null;
  const userAgentHash = opts.userAgent ? hashValue(opts.userAgent) : null;

  await db.insert(serverSessions).values({
    id: sessionId,
    userId: opts.userId,
    expiresAt,
    ipHash,
    userAgentHash,
    csrfSecret: crypto.randomBytes(32).toString("hex"),
  });

  return { sessionId };
}

/**
 * Validate a session ID. Returns the session if valid, null otherwise.
 */
export async function validateSession(sessionId: string): Promise<SessionValidation> {
  if (!sessionId || sessionId.length !== SESSION_ID_BYTES * 2) {
    return { valid: false, session: null };
  }

  const db = await getDb();
  if (!db) return { valid: false, session: null };

  const [session] = await db
    .select()
    .from(serverSessions)
    .where(
      and(
        eq(serverSessions.id, sessionId),
        isNull(serverSessions.revokedAt),
        gt(serverSessions.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!session) {
    return { valid: false, session: null };
  }

  // Update lastSeenAt (fire and forget)
  db.update(serverSessions)
    .set({ lastSeenAt: new Date() })
    .where(eq(serverSessions.id, sessionId))
    .catch(() => {});

  return { valid: true, session };
}

/**
 * Revoke a session (logout).
 */
export async function revokeSession(
  sessionId: string,
  reason: string = "user_logout"
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(serverSessions)
    .set({
      revokedAt: new Date(),
      revokedReason: reason,
    })
    .where(eq(serverSessions.id, sessionId));
}

/**
 * Revoke all sessions for a user (e.g. password change).
 */
export async function revokeAllUserSessions(
  userId: number,
  reason: string = "password_changed"
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(serverSessions)
    .set({
      revokedAt: new Date(),
      revokedReason: reason,
    })
    .where(
      and(
        eq(serverSessions.userId, userId),
        isNull(serverSessions.revokedAt)
      )
    );
}

/**
 * Clean up expired sessions (run periodically).
 */
export async function cleanupExpiredSessions(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .delete(serverSessions)
    .where(lt(serverSessions.expiresAt, new Date()));
}

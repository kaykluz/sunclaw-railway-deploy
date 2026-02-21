import { and, count, desc, eq, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  waitlist,
  InsertWaitlistEntry,
  configurations,
  InsertConfiguration,
  deployments,
  InsertDeployment,
  passwordResetTokens,
  authAuditLog,
  loginAttempts,
  emailVerificationTokens,
  stripeWebhookEvents,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.email && user.email === ENV.ownerEmail) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/* ─── Waitlist ─── */

export async function addToWaitlist(
  entry: InsertWaitlistEntry
): Promise<{ success: boolean; alreadyExists: boolean; telegramDeepLink?: string | null }> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add to waitlist: database not available");
    return { success: false, alreadyExists: false };
  }

  try {
    await db.insert(waitlist).values(entry);
    return { success: true, alreadyExists: false, telegramDeepLink: entry.telegramDeepLink };
  } catch (error: any) {
    // MySQL duplicate key error code - UPDATE existing record
    if (error?.code === "ER_DUP_ENTRY" || error?.errno === 1062) {
      // Update their details (name, phone, intent, region, company)
      await db.update(waitlist)
        .set({
          name: entry.name,
          phone: entry.phone,
          intent: entry.intent,
          region: entry.region,
          company: entry.company,
          role: entry.role,
          source: entry.source,
        })
        .where(eq(waitlist.email, entry.email!));

      // Get their existing telegramDeepLink
      const existing = await db
        .select({ telegramDeepLink: waitlist.telegramDeepLink })
        .from(waitlist)
        .where(eq(waitlist.email, entry.email!))
        .limit(1);

      let finalLink = existing[0]?.telegramDeepLink;

      // If they didn't have a deep link before, set one now
      if (!finalLink) {
        finalLink = entry.telegramDeepLink;
        await db.update(waitlist)
          .set({ telegramDeepLink: entry.telegramDeepLink })
          .where(eq(waitlist.email, entry.email!));
      }

      return {
        success: true,
        alreadyExists: true,
        telegramDeepLink: finalLink ?? entry.telegramDeepLink,
      };
    }
    console.error("[Database] Failed to add to waitlist:", error);
    throw error;
  }
}

export async function getWaitlistCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ value: count() }).from(waitlist);
  return result[0]?.value ?? 0;
}

export async function getWaitlistEntries(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(waitlist)
    .orderBy(desc(waitlist.createdAt))
    .limit(limit)
    .offset(offset);
}

/* ─── Configurations ─── */

export async function saveConfiguration(
  entry: InsertConfiguration
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(configurations).values(entry);
  return Number(result[0].insertId);
}

export async function updateConfiguration(
  id: number,
  userId: number,
  data: { name?: string; config?: unknown }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateSet: Record<string, unknown> = {};
  if (data.name !== undefined) updateSet.name = data.name;
  if (data.config !== undefined) updateSet.config = data.config;

  if (Object.keys(updateSet).length === 0) return;

  await db
    .update(configurations)
    .set(updateSet)
    .where(
      and(eq(configurations.id, id), eq(configurations.userId, userId))
    );
}

export async function getUserConfigurations(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(configurations)
    .where(eq(configurations.userId, userId))
    .orderBy(desc(configurations.updatedAt));
}

export async function getConfigurationById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(configurations)
    .where(
      and(eq(configurations.id, id), eq(configurations.userId, userId))
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function deleteConfiguration(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(configurations)
    .where(
      and(eq(configurations.id, id), eq(configurations.userId, userId))
    );
}

/* ─── Deployments ─── */

export async function createDeployment(
  entry: InsertDeployment
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(deployments).values(entry);
  return Number(result[0].insertId);
}

export async function updateDeploymentStatus(
  id: number,
  status: "pending" | "deploying" | "success" | "failed",
  metadata?: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateSet: Record<string, unknown> = { status };
  if (metadata) updateSet.metadata = metadata;

  await db.update(deployments).set(updateSet).where(eq(deployments.id, id));
}

export async function getUserDeployments(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(deployments)
    .where(eq(deployments.userId, userId))
    .orderBy(desc(deployments.createdAt));
}

/* ─── Admin Queries ─── */

export async function getAllDeployments(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(deployments)
    .orderBy(desc(deployments.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getAllConfigurations(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(configurations)
    .orderBy(desc(configurations.updatedAt))
    .limit(limit)
    .offset(offset);
}

/* ─── Stripe / Billing ─── */

export async function updateUserStripeCustomer(
  userId: number,
  stripeCustomerId: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({ stripeCustomerId })
    .where(eq(users.id, userId));
}

export async function updateUserSubscription(
  userId: number,
  data: {
    plan: string;
    stripeSubscriptionId: string | null;
    stripeCustomerId?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateSet: Record<string, unknown> = {
    plan: data.plan,
    stripeSubscriptionId: data.stripeSubscriptionId,
  };
  if (data.stripeCustomerId) {
    updateSet.stripeCustomerId = data.stripeCustomerId;
  }

  await db.update(users).set(updateSet).where(eq(users.id, userId));
}

export async function updateUserManagedKeys(
  userId: number,
  data: {
    managedKeysActive: boolean;
    managedKeysSubscriptionId: string | null;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      managedKeysActive: data.managedKeysActive,
      managedKeysSubscriptionId: data.managedKeysSubscriptionId,
    })
    .where(eq(users.id, userId));
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, stripeCustomerId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function countUserDeployments(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ value: count() })
    .from(deployments)
    .where(
      and(
        eq(deployments.userId, userId),
        eq(deployments.status, "success")
      )
    );
  return result[0]?.value ?? 0;
}

export async function getUserRailwayDeployments(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(deployments)
    .where(
      and(
        eq(deployments.userId, userId),
        eq(deployments.method, "railway"),
        eq(deployments.status, "success")
      )
    );
}

export async function markDeploymentsFailed(userId: number, method: "railway") {
  const db = await getDb();
  if (!db) return;

  await db
    .update(deployments)
    .set({ status: "failed" })
    .where(
      and(
        eq(deployments.userId, userId),
        eq(deployments.method, method),
        eq(deployments.status, "success")
      )
    );
}

/* ═══════════════════════════════════════════════════════════════
   ACTIVE TABLE HELPERS
   ═══════════════════════════════════════════════════════════════ */

import {
  apiKeys,
  InsertApiKey,
  conversations,
  InsertConversation,
  analyticsEvents,
  InsertAnalyticsEvent,
  notifications,
  InsertNotification,
  channelConnections,
  InsertChannelConnection,
} from "../drizzle/schema";

/* ─── API Keys ─── */

export async function createApiKey(data: {
  userId: number;
  provider: string;
  label: string | null;
  apiKey: string;
  priority?: number;
  baseUrl?: string;
  model?: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the next priority value
  const existingKeys = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, data.userId));
  const nextPriority = data.priority ?? existingKeys.length;

  const result = await db.insert(apiKeys).values({
    userId: data.userId,
    provider: data.provider,
    label: data.label,
    apiKey: data.apiKey,
    baseUrl: data.baseUrl,
    model: data.model,
    priority: nextPriority,
    status: "unchecked",
    enabled: 1,
  });

  return Number(result[0].insertId);
}

export async function getUserApiKeys(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: apiKeys.id,
      provider: apiKeys.provider,
      label: apiKeys.label,
      apiKey: apiKeys.apiKey, // Included but usually masked in UI
      baseUrl: apiKeys.baseUrl,
      model: apiKeys.model,
      priority: apiKeys.priority,
      status: apiKeys.status,
      lastCheckedAt: apiKeys.lastCheckedAt,
      lastError: apiKeys.lastError,
      enabled: apiKeys.enabled,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .orderBy(apiKeys.priority);
}

export async function getUserApiKeysWithSecrets(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .orderBy(apiKeys.priority);
}

export async function deleteApiKey(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)));
}

export async function updateApiKeyPriority(
  id: number,
  userId: number,
  priority: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(apiKeys)
    .set({ priority })
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)));
}

export async function toggleApiKey(id: number, userId: number, enabled: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(apiKeys)
    .set({ enabled: enabled ? 1 : 0 })
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)));
}

export async function updateApiKeyStatus(
  id: number,
  status: "healthy" | "degraded" | "failed" | "unchecked",
  lastError?: string
) {
  const db = await getDb();
  if (!db) return;

  const updateSet: Record<string, unknown> = {
    status,
    lastCheckedAt: new Date(),
  };
  if (lastError !== undefined) updateSet.lastError = lastError;

  await db.update(apiKeys).set(updateSet).where(eq(apiKeys.id, id));
}

/* ─── Conversations ─── */

export async function saveConversation(data: {
  userId: number;
  deploymentId?: number;
  title: string;
  messages: unknown[];
  model?: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(conversations).values({
    userId: data.userId,
    deploymentId: data.deploymentId ?? null,
    title: data.title,
    messages: JSON.stringify(data.messages),
    messageCount: data.messages.length,
    model: data.model ?? null,
  });

  return Number(result[0].insertId);
}

export async function getUserConversations(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt))
    .limit(limit);
}

export async function getConversationById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function deleteConversation(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
}

/* ─── Analytics Events ─── */

export async function trackEvent(data: {
  userId: number;
  deploymentId?: number;
  eventType: string;
  eventData?: unknown;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(analyticsEvents).values({
      userId: data.userId,
      deploymentId: data.deploymentId ?? null,
      eventType: data.eventType,
      eventData: data.eventData ? JSON.stringify(data.eventData) : null,
      eventTimestamp: Date.now(),
    });
  } catch {
    // Non-critical
  }
}

export async function getAnalyticsSummary(userId: number, days = 30) {
  const db = await getDb();
  if (!db) return { totalMessages: 0, totalEvents: 0, eventsByType: {} };

  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  const events = await db
    .select()
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.userId, userId),
      )
    )
    .orderBy(desc(analyticsEvents.eventTimestamp))
    .limit(1000);

  // Filter by cutoff in JS (bigint comparison in drizzle can be tricky)
  const filtered = events.filter(e => e.eventTimestamp >= cutoff);

  const eventsByType: Record<string, number> = {};
  let totalMessages = 0;

  for (const event of filtered) {
    eventsByType[event.eventType] = (eventsByType[event.eventType] ?? 0) + 1;
    if (event.eventType === "message_sent" || event.eventType === "message_received") {
      totalMessages++;
    }
  }

  return {
    totalMessages,
    totalEvents: filtered.length,
    eventsByType,
    recentEvents: filtered.slice(0, 50),
  };
}

export async function getAnalyticsTimeline(userId: number, days = 7) {
  const db = await getDb();
  if (!db) return [];

  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  const events = await db
    .select()
    .from(analyticsEvents)
    .where(eq(analyticsEvents.userId, userId))
    .orderBy(analyticsEvents.eventTimestamp)
    .limit(5000);

  const filtered = events.filter(e => e.eventTimestamp >= cutoff);

  // Group by day with per-channel breakdown
  const dayMap = new Map<string, { messages: number; skills: number; channels: number; byChannel: Record<string, number> }>();

  for (const event of filtered) {
    const date = new Date(event.eventTimestamp).toISOString().split("T")[0];
    const entry = dayMap.get(date) ?? { messages: 0, skills: 0, channels: 0, byChannel: {} };

    if (event.eventType === "message_sent" || event.eventType === "message_received") {
      entry.messages++;
      // Extract channel from eventData if present
      const data = event.eventData as any;
      const channel = data?.channel ?? "unknown";
      entry.byChannel[channel] = (entry.byChannel[channel] ?? 0) + 1;
    }
    else if (event.eventType === "skill_invoked") entry.skills++;
    else if (event.eventType.startsWith("channel_")) entry.channels++;

    dayMap.set(date, entry);
  }

  return Array.from(dayMap.entries()).map(([date, data]) => ({ date, ...data }));
}

/* ─── Notifications ─── */

export async function createNotification(data: {
  userId: number;
  type: string;
  title: string;
  message: string;
  severity?: "info" | "warning" | "error" | "success";
  actionUrl?: string;
  metadata?: unknown;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(notifications).values({
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    severity: data.severity ?? "info",
    actionUrl: data.actionUrl ?? null,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
  });

  const notifId = Number(result[0].insertId);

  // Push via WebSocket in real-time
  try {
    const { pushNotification } = await import("./ws-notifications");
    pushNotification(data.userId, {
      id: notifId,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      severity: data.severity ?? "info",
      actionUrl: data.actionUrl ?? null,
      createdAt: new Date().toISOString(),
    });
  } catch {
    // WebSocket not available (e.g. in tests), ignore
  }

  return notifId;
}

export async function getUserNotifications(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ value: count() })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, 0))
    );
  return result[0]?.value ?? 0;
}

export async function markNotificationRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notifications)
    .set({ isRead: 1 })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notifications)
    .set({ isRead: 1 })
    .where(eq(notifications.userId, userId));
}

/* ─── Channel Connections ─── */

export async function createChannelConnection(data: {
  userId: number;
  channel: string;
  label?: string;
  credentials?: unknown;
  webhookUrl?: string;
  config?: unknown;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(channelConnections).values({
    userId: data.userId,
    channel: data.channel,
    label: data.label ?? null,
    status: "pending",
    credentials: data.credentials ? JSON.stringify(data.credentials) : null,
    webhookUrl: data.webhookUrl ?? null,
    config: data.config ? JSON.stringify(data.config) : null,
  });
  return Number(result[0].insertId);
}

export async function getUserChannelConnections(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(channelConnections)
    .where(eq(channelConnections.userId, userId))
    .orderBy(channelConnections.channel);
}

export async function updateChannelConnectionStatus(
  id: number,
  userId: number,
  status: "connected" | "disconnected" | "pending" | "error",
  statusMessage?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateSet: Record<string, unknown> = { status };
  if (statusMessage !== undefined) updateSet.lastStatusMessage = statusMessage;
  if (status === "connected") updateSet.lastVerifiedAt = new Date();

  await db
    .update(channelConnections)
    .set(updateSet)
    .where(and(eq(channelConnections.id, id), eq(channelConnections.userId, userId)));
}

export async function updateChannelCredentials(
  id: number,
  userId: number,
  credentials: unknown,
  config?: unknown
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateSet: Record<string, unknown> = {
    credentials: JSON.stringify(credentials),
  };
  if (config !== undefined) updateSet.config = JSON.stringify(config);

  await db
    .update(channelConnections)
    .set(updateSet)
    .where(and(eq(channelConnections.id, id), eq(channelConnections.userId, userId)));
}

export async function deleteChannelConnection(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(channelConnections)
    .where(and(eq(channelConnections.id, id), eq(channelConnections.userId, userId)));
}

/* ─── Admin Helpers ─── */

export async function getAllApiKeys() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(apiKeys).orderBy(apiKeys.priority);
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: users.id, name: users.name, email: users.email, role: users.role, plan: users.plan, createdAt: users.createdAt, emailVerified: users.emailVerified, loginMethod: users.loginMethod }).from(users);
}

/* ─── Auth Helpers (KIISHA multiAuth migration) ─── */
import crypto from "crypto";

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createLocalUser(data: {
  email: string;
  name: string;
  passwordHash: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const openId = crypto.randomUUID();
  await db.insert(users).values({
    openId,
    email: data.email,
    name: data.name,
    passwordHash: data.passwordHash,
    loginMethod: "email",
    lastSignedIn: new Date(),
  });

  const [user] = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return user;
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

export async function updateUserPlanSelected(userId: number, planSelected: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ planSelected }).where(eq(users.id, userId));
}

/* ─── Password Reset Tokens ─── */
export async function createPasswordResetToken(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.insert(passwordResetTokens).values({
    userId,
    token,
    expiresAt,
  });

  return token;
}

export async function getPasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;

  const [record] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);

  if (!record) return undefined;
  if (record.usedAt) return undefined;
  if (record.expiresAt < new Date()) return undefined;

  return record;
}

export async function markPasswordResetTokenUsed(token: string) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.token, token));
}

/* ─── Auth Audit Log ─── */
export async function logAuthEvent(data: {
  eventType: string;
  userId?: number | null;
  sessionId?: string | null;
  ipHash?: string | null;
  userAgentHash?: string | null;
  details?: Record<string, unknown>;
  success: boolean;
  failureReason?: string | null;
}) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(authAuditLog).values({
      eventType: data.eventType,
      userId: data.userId ?? null,
      sessionId: data.sessionId ?? null,
      ipHash: data.ipHash ?? null,
      userAgentHash: data.userAgentHash ?? null,
      details: data.details ?? null,
      success: data.success,
      failureReason: data.failureReason ?? null,
    });
  } catch (e) {
    console.error("[AuthAudit] Failed to log event:", e);
  }
}

/* ─── Email Verification Tokens ─── */
export async function createEmailVerificationToken(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Invalidate any existing unused tokens for this user
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.insert(emailVerificationTokens).values({
    userId,
    token,
    expiresAt,
  });

  return token;
}

export async function getEmailVerificationToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;

  const [record] = await db
    .select()
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.token, token))
    .limit(1);

  if (!record) return undefined;
  if (record.usedAt) return undefined;
  if (record.expiresAt < new Date()) return undefined;

  return record;
}

/** Returns the raw token record without filtering out used/expired tokens */
export async function getEmailVerificationTokenRaw(token: string) {
  const db = await getDb();
  if (!db) return undefined;

  const [record] = await db
    .select()
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.token, token))
    .limit(1);

  return record ?? undefined;
}

export async function markEmailVerificationTokenUsed(token: string) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(emailVerificationTokens)
    .set({ usedAt: new Date() })
    .where(eq(emailVerificationTokens.token, token));
}

export async function setEmailVerified(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ emailVerified: true }).where(eq(users.id, userId));
}

/* ─── Stripe Webhook Idempotency ─── */

export async function hasProcessedStripeEvent(eventId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [record] = await db
    .select({ id: stripeWebhookEvents.id })
    .from(stripeWebhookEvents)
    .where(eq(stripeWebhookEvents.eventId, eventId))
    .limit(1);

  return !!record;
}

export async function markStripeEventProcessed(eventId: string, eventType: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(stripeWebhookEvents).values({ eventId, eventType }).onDuplicateKeyUpdate({ set: { eventId } });
}

/* ─── Stripe Sync Helpers ─── */

export async function getPaidUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(isNotNull(users.stripeCustomerId));
}

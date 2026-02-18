import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, boolean } from "drizzle-orm/mysql-core";
import { index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Migrated from Manus OAuth to KIISHA multiAuth (email/password + social OAuth).
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  /** Bcrypt password hash for email/password login */
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** Whether the user's email has been verified */
  emailVerified: boolean("emailVerified").default(false),
  /** Stripe customer ID for billing */
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  /** Current subscription plan: free, pro, enterprise */
  plan: varchar("plan", { length: 32 }).default("free").notNull(),
  /** Stripe subscription ID for active subscription */
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  /** Whether the user has completed initial plan selection */
  planSelected: boolean("planSelected").default(false),
  /** Whether the managed LLM keys add-on is active */
  managedKeysActive: boolean("managedKeysActive").default(false),
  /** Stripe subscription ID for the managed keys add-on (separate from plan subscription) */
  managedKeysSubscriptionId: varchar("managedKeysSubscriptionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Server-side sessions — database-backed session management.
 * Adapted from KIISHA's sessionManager. Replaces Manus JWT-based sessions.
 */
export const serverSessions = mysqlTable("serverSessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  revokedAt: timestamp("revokedAt"),
  revokedReason: varchar("revokedReason", { length: 255 }),
  ipHash: varchar("ipHash", { length: 64 }),
  userAgentHash: varchar("userAgentHash", { length: 64 }),
  refreshTokenHash: varchar("refreshTokenHash", { length: 64 }),
  csrfSecret: varchar("csrfSecret", { length: 64 }),
  deviceType: varchar("deviceType", { length: 50 }),
  browserName: varchar("browserName", { length: 50 }),
  osName: varchar("osName", { length: 50 }),
}, (table) => [
  index("serverSessions_userId_idx").on(table.userId),
  index("serverSessions_expiresAt_idx").on(table.expiresAt),
]);

export type ServerSession = typeof serverSessions.$inferSelect;
export type InsertServerSession = typeof serverSessions.$inferInsert;

/**
 * Password reset tokens for email/password auth.
 */
export const passwordResetTokens = mysqlTable("passwordResetTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("passwordResetTokens_userId_idx").on(table.userId),
  index("passwordResetTokens_token_idx").on(table.token),
]);

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

/**
 * Email verification tokens — sent after registration.
 * User must verify email before accessing the dashboard.
 */
export const emailVerificationTokens = mysqlTable("emailVerificationTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("emailVerificationTokens_userId_idx").on(table.userId),
  index("emailVerificationTokens_token_idx").on(table.token),
]);

export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type InsertEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;

/**
 * Auth audit log — tracks login, logout, password changes, etc.
 */
export const authAuditLog = mysqlTable("authAuditLog", {
  id: int("id").autoincrement().primaryKey(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  userId: int("userId"),
  sessionId: varchar("sessionId", { length: 64 }),
  ipHash: varchar("ipHash", { length: 64 }),
  userAgentHash: varchar("userAgentHash", { length: 64 }),
  details: json("details"),
  success: boolean("success").notNull(),
  failureReason: varchar("failureReason", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("authAuditLog_userId_idx").on(table.userId),
  index("authAuditLog_eventType_idx").on(table.eventType),
  index("authAuditLog_createdAt_idx").on(table.createdAt),
]);

export type AuthAuditLog = typeof authAuditLog.$inferSelect;
export type InsertAuthAuditLog = typeof authAuditLog.$inferInsert;

/**
 * Login attempts — rate limiting and lockout tracking.
 */
export const loginAttempts = mysqlTable("loginAttempts", {
  id: int("id").autoincrement().primaryKey(),
  identifierHash: varchar("identifierHash", { length: 64 }).notNull(),
  ipHash: varchar("ipHash", { length: 64 }).notNull(),
  attemptedAt: timestamp("attemptedAt").defaultNow().notNull(),
  success: boolean("success").notNull(),
  failureCount: int("failureCount").default(0),
  lockedUntil: timestamp("lockedUntil"),
}, (table) => [
  index("loginAttempts_identifierHash_idx").on(table.identifierHash),
  index("loginAttempts_ipHash_idx").on(table.ipHash),
]);

export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type InsertLoginAttempt = typeof loginAttempts.$inferInsert;

/**
 * Waitlist — captures early-access signups from the landing page.
 * Public endpoint, no auth required.
 */
export const waitlist = mysqlTable("waitlist", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  company: varchar("company", { length: 255 }),
  role: varchar("userRole", { length: 128 }),
  source: varchar("source", { length: 64 }).default("website"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WaitlistEntry = typeof waitlist.$inferSelect;
export type InsertWaitlistEntry = typeof waitlist.$inferInsert;

/**
 * Configurations — stores SunClaw setup wizard configs per user.
 * Protected: requires authenticated user.
 */
export const configurations = mysqlTable("configurations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull().default("My SunClaw"),
  /** Full wizard state stored as JSON */
  config: json("config").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Configuration = typeof configurations.$inferSelect;
export type InsertConfiguration = typeof configurations.$inferInsert;

/**
 * Deployments — tracks deployment attempts and their status.
 * Protected: requires authenticated user.
 */
export const deployments = mysqlTable("deployments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  configurationId: int("configurationId"),
  method: mysqlEnum("method", ["railway", "docker", "render", "hostinger", "emergent", "northflank", "cloudflare", "alibaba"]).notNull(),
  status: mysqlEnum("status", ["pending", "deploying", "success", "failed"]).default("pending").notNull(),
  instanceName: varchar("instanceName", { length: 255 }),
  /** External reference (e.g. Railway project ID) */
  externalId: varchar("externalId", { length: 255 }),
  externalUrl: varchar("externalUrl", { length: 512 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Deployment = typeof deployments.$inferSelect;
export type InsertDeployment = typeof deployments.$inferInsert;

/* ═══════════════════════════════════════════════════════════════
   ACTIVE TABLES
   ═══════════════════════════════════════════════════════════════ */

/**
 * API Keys — stores user-provided LLM provider API keys for multi-provider failover.
 * Keys are encrypted at rest. Priority determines failover order.
 */
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: varchar("provider", { length: 64 }).notNull(),
  /** Display label (e.g. "My OpenAI Key") */
  label: varchar("label", { length: 255 }),
  /** Encrypted API key value */
  apiKey: text("apiKey").notNull(),
  /** Optional custom base URL for the provider */
  baseUrl: varchar("baseUrl", { length: 512 }),
  /** Optional specific model to use for this key */
  model: varchar("model", { length: 128 }),
  /** Lower number = higher priority (tried first) */
  priority: int("priority").default(0).notNull(),
  /** Current health status */
  status: mysqlEnum("keyStatus", ["healthy", "degraded", "failed", "unchecked"]).default("unchecked").notNull(),
  /** Last time this key was health-checked */
  lastCheckedAt: timestamp("lastCheckedAt"),
  /** Last error message if status is failed/degraded */
  lastError: text("lastError"),
  /** Whether this key is enabled for failover */
  enabled: int("enabled").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

/**
 * Chat Conversations — saved conversation logs for export and analysis.
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  deploymentId: int("deploymentId"),
  title: varchar("title", { length: 512 }).default("Untitled Conversation").notNull(),
  /** Full message array as JSON */
  messages: json("messages").notNull(),
  messageCount: int("messageCount").default(0).notNull(),
  /** Which model was used */
  model: varchar("model", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Analytics Events — tracks usage metrics (messages, channel activity, skill invocations).
 */
export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  deploymentId: int("deploymentId"),
  /** Event type: message_sent, message_received, channel_connected, channel_disconnected, skill_invoked, failover_triggered */
  eventType: varchar("eventType", { length: 64 }).notNull(),
  /** Additional event data (e.g. channel name, skill id, provider name) */
  eventData: json("eventData"),
  /** Timestamp as Unix ms for efficient aggregation */
  eventTimestamp: bigint("eventTimestamp", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

/**
 * Notifications — in-app notification system for channel status changes, failovers, etc.
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Notification type: channel_status, failover, deployment, system */
  type: varchar("notificationType", { length: 64 }).notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  message: text("message").notNull(),
  /** Severity: info, warning, error, success */
  severity: mysqlEnum("severity", ["info", "warning", "error", "success"]).default("info").notNull(),
  /** Whether the user has read this notification */
  isRead: int("isRead").default(0).notNull(),
  /** Optional link to navigate to when clicked */
  actionUrl: varchar("actionUrl", { length: 512 }),
  /** Additional metadata */
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Channel Connections — stores per-user channel credentials and connection status.
 * Each row represents a configured channel (WhatsApp, Telegram, Slack, etc.)
 */
export const channelConnections = mysqlTable("channel_connections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Channel identifier: whatsapp, telegram, slack, discord, webchat, signal, teams, email, rcs */
  channel: varchar("channel", { length: 64 }).notNull(),
  /** Display label (e.g. "My WhatsApp Business") */
  label: varchar("label", { length: 255 }),
  /** Connection status */
  status: mysqlEnum("channelStatus", ["connected", "disconnected", "pending", "error"]).default("pending").notNull(),
  /** Credentials stored as encrypted JSON (bot token, API key, webhook URL, etc.) */
  credentials: json("credentials"),
  /** Webhook URL for this channel (auto-generated) */
  webhookUrl: varchar("webhookUrl", { length: 512 }),
  /** Additional config (e.g. channel-specific settings) */
  config: json("channelConfig"),
  /** Last status message or error */
  lastStatusMessage: text("lastStatusMessage"),
  /** Last time the connection was verified */
  lastVerifiedAt: timestamp("lastVerifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChannelConnection = typeof channelConnections.$inferSelect;
export type InsertChannelConnection = typeof channelConnections.$inferInsert;

/**
 * Stripe webhook event deduplication.
 * Tracks processed event IDs to prevent duplicate handling on retries.
 */
export const stripeWebhookEvents = mysqlTable("stripeWebhookEvents", {
  id: int("id").autoincrement().primaryKey(),
  eventId: varchar("eventId", { length: 255 }).notNull().unique(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  processedAt: timestamp("processedAt").defaultNow().notNull(),
});

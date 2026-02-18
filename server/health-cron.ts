/**
 * Scheduled Health-Check Cron
 *
 * Runs every 5 minutes. For each user with enabled API keys:
 *  1. Pings every enabled key via a minimal LLM request.
 *  2. Tracks consecutive failures in-memory (reset on success).
 *  3. Auto-disables a key after 3 consecutive failures.
 *  4. Creates a notification + alerts the owner when a key is disabled.
 */

import { eq, and, asc, ne } from "drizzle-orm";
import { getDb } from "./db";
import { apiKeys, notifications } from "../drizzle/schema";
import { healthCheckKey, PROVIDERS } from "./llm-failover";
import { pushNotification } from "./ws-notifications";
import { notifyOwner } from "./_core/notification";

/* ─── Config ─── */

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CONSECUTIVE_FAILURES = 3;

/* ─── In-memory failure counter (keyId → consecutive fail count) ─── */

const failureCounts = new Map<number, number>();

/* ─── Cron Logic ─── */

let cronTimer: ReturnType<typeof setInterval> | null = null;

export function startHealthCheckCron(): void {
  if (cronTimer) return; // Prevent double-start

  console.log(
    `[HealthCron] Starting scheduled health checks every ${CHECK_INTERVAL_MS / 1000}s`
  );

  cronTimer = setInterval(runHealthChecks, CHECK_INTERVAL_MS);
}

export function stopHealthCheckCron(): void {
  if (cronTimer) {
    clearInterval(cronTimer);
    cronTimer = null;
    console.log("[HealthCron] Stopped");
  }
}

/**
 * Run a full health-check sweep across all users' enabled API keys.
 * Exported so tests and manual triggers can call it directly.
 */
export async function runHealthChecks(): Promise<{
  checked: number;
  healthy: number;
  failed: number;
  autoDisabled: number;
}> {
  const db = await getDb();
  if (!db) return { checked: 0, healthy: 0, failed: 0, autoDisabled: 0 };

  const stats = { checked: 0, healthy: 0, failed: 0, autoDisabled: 0 };

  try {
    // Get all enabled keys across all users
    const enabledKeys = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.enabled, 1))
      .orderBy(asc(apiKeys.userId), asc(apiKeys.priority));

    for (const keyRecord of enabledKeys) {
      const provider = PROVIDERS[keyRecord.provider];
      if (!provider) continue;

      stats.checked++;

      const result = await healthCheckKey(provider, keyRecord.apiKey);

      if (result.healthy) {
        stats.healthy++;

        // Reset failure counter on success
        failureCounts.delete(keyRecord.id);

        // Update DB status
        await db
          .update(apiKeys)
          .set({
            status: "healthy",
            lastCheckedAt: new Date(),
            lastError: null,
          })
          .where(eq(apiKeys.id, keyRecord.id));
      } else {
        stats.failed++;

        // Increment failure counter
        const currentFailures = (failureCounts.get(keyRecord.id) ?? 0) + 1;
        failureCounts.set(keyRecord.id, currentFailures);

        // Update DB status
        await db
          .update(apiKeys)
          .set({
            status: "failed",
            lastCheckedAt: new Date(),
            lastError: (result.error ?? "Unknown error").slice(0, 500),
          })
          .where(eq(apiKeys.id, keyRecord.id));

        // Check if rotation should be suggested (before auto-disable)
        await checkKeyRotationNeeded(db, keyRecord, provider.name);

        // Auto-disable after MAX_CONSECUTIVE_FAILURES
        if (currentFailures >= MAX_CONSECUTIVE_FAILURES) {
          stats.autoDisabled++;

          await db
            .update(apiKeys)
            .set({ enabled: 0 })
            .where(eq(apiKeys.id, keyRecord.id));

          // Clean up the counter
          failureCounts.delete(keyRecord.id);

          // Create in-app notification
          const notifId = await createAutoDisableNotification(
            db,
            keyRecord.userId,
            provider.name,
            keyRecord.label ?? provider.name,
            currentFailures,
            result.error ?? "Unknown error"
          );

          // Push via WebSocket
          pushNotification(keyRecord.userId, {
            id: notifId,
            userId: keyRecord.userId,
            type: "api_key_disabled",
            title: `API Key Auto-Disabled: ${keyRecord.label ?? provider.name}`,
            message: `Your ${provider.name} API key was automatically disabled after ${currentFailures} consecutive failures. Last error: ${result.error ?? "Unknown"}`,
            severity: "error",
            createdAt: new Date().toISOString(),
          });

          // Alert superuser
          notifyOwner({
            title: `API Key Auto-Disabled for User ${keyRecord.userId}`,
            content: `${provider.name} key "${keyRecord.label ?? "unnamed"}" was auto-disabled after ${currentFailures} consecutive failures. Error: ${result.error ?? "Unknown"}`,
          }).catch(() => {});

          console.warn(
            `[HealthCron] Auto-disabled ${provider.name} key (id=${keyRecord.id}) for user ${keyRecord.userId} after ${currentFailures} failures`
          );
        }
      }
    }

    if (stats.checked > 0) {
      console.log(
        `[HealthCron] Sweep complete: ${stats.checked} checked, ${stats.healthy} healthy, ${stats.failed} failed, ${stats.autoDisabled} auto-disabled`
      );
    }
  } catch (error) {
    console.error("[HealthCron] Error during health check sweep:", error);
  }

  return stats;
}

/* ─── Helpers ─── */

async function createAutoDisableNotification(
  db: any,
  userId: number,
  providerName: string,
  keyLabel: string,
  failureCount: number,
  lastError: string
): Promise<number> {
  try {
    const result = await db.insert(notifications).values({
      userId,
      type: "api_key_disabled",
      title: `API Key Auto-Disabled: ${keyLabel}`,
      message: `Your ${providerName} API key was automatically disabled after ${failureCount} consecutive health-check failures. Last error: ${lastError}. Re-enable it from the API Keys page after resolving the issue.`,
      severity: "error",
      actionUrl: "/dashboard",
      metadata: JSON.stringify({
        providerName,
        keyLabel,
        failureCount,
        lastError,
      }),
    });
    return Number(result[0].insertId);
  } catch {
    return 0;
  }
}

/**
 * Re-enable a previously auto-disabled key and run an immediate health check.
 * Returns the health check result so the UI can show success/failure.
 */
export async function reEnableAndCheck(
  keyId: number,
  userId: number
): Promise<{ healthy: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { healthy: false, error: "Database not available" };

  // Re-enable the key
  await db
    .update(apiKeys)
    .set({ enabled: 1, status: "unchecked" })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)));

  // Fetch the key record
  const [keyRecord] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
    .limit(1);

  if (!keyRecord) return { healthy: false, error: "Key not found" };

  const provider = PROVIDERS[keyRecord.provider];
  if (!provider) return { healthy: false, error: "Unknown provider" };

  const result = await healthCheckKey(provider, keyRecord.apiKey);

  if (result.healthy) {
    failureCounts.delete(keyId);
    await db
      .update(apiKeys)
      .set({ status: "healthy", lastCheckedAt: new Date(), lastError: null })
      .where(eq(apiKeys.id, keyId));

    // Notify user of successful re-enable
    try {
      const notifResult = await db.insert(notifications).values({
        userId,
        type: "api_key_reenabled",
        title: `API Key Re-Enabled: ${keyRecord.label ?? provider.name}`,
        message: `Your ${provider.name} API key has been re-enabled and passed the health check.`,
        severity: "success" as const,
      });
      const notifId = Number(notifResult[0].insertId);
      pushNotification(userId, {
        id: notifId,
        userId,
        type: "api_key_reenabled",
        title: `API Key Re-Enabled: ${keyRecord.label ?? provider.name}`,
        message: `Your ${provider.name} API key has been re-enabled and passed the health check.`,
        severity: "success",
        createdAt: new Date().toISOString(),
      });
    } catch {}

    return { healthy: true };
  } else {
    // Disable it again
    await db
      .update(apiKeys)
      .set({
        enabled: 0,
        status: "failed",
        lastCheckedAt: new Date(),
        lastError: (result.error ?? "Unknown error").slice(0, 500),
      })
      .where(eq(apiKeys.id, keyId));

    return { healthy: false, error: result.error };
  }
}

/**
 * Check if a key is approaching rate limits or nearing expiry.
 * Called during health checks to proactively warn users.
 */
async function checkKeyRotationNeeded(
  db: any,
  keyRecord: any,
  providerName: string
): Promise<void> {
  // If key has been failing intermittently (1-2 failures), suggest rotation
  const failCount = failureCounts.get(keyRecord.id) ?? 0;
  if (failCount >= 1 && failCount < MAX_CONSECUTIVE_FAILURES) {
    // Check if we already sent a rotation reminder in the last 24h
    const recentNotifs = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, keyRecord.userId),
          eq(notifications.type, "key_rotation_reminder")
        )
      )
      .limit(1);

    const lastNotif = recentNotifs[0];
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    if (lastNotif && new Date(lastNotif.createdAt).getTime() > oneDayAgo) {
      return; // Already reminded recently
    }

    try {
      const notifResult = await db.insert(notifications).values({
        userId: keyRecord.userId,
        type: "key_rotation_reminder",
        title: `Key Rotation Suggested: ${keyRecord.label ?? providerName}`,
        message: `Your ${providerName} API key has failed ${failCount} health check(s). Consider rotating or adding a backup key to avoid service interruption.`,
        severity: "warning" as const,
        actionUrl: "/dashboard",
        metadata: JSON.stringify({
          keyId: keyRecord.id,
          providerName,
          failCount,
        }),
      });
      const notifId = Number(notifResult[0].insertId);
      pushNotification(keyRecord.userId, {
        id: notifId,
        userId: keyRecord.userId,
        type: "key_rotation_reminder",
        title: `Key Rotation Suggested: ${keyRecord.label ?? providerName}`,
        message: `Your ${providerName} API key has failed ${failCount} health check(s). Consider rotating or adding a backup key.`,
        severity: "warning",
        createdAt: new Date().toISOString(),
      });
    } catch {}
  }
}

/**
 * Get the current failure count for a key (for testing/monitoring).
 */
export function getFailureCount(keyId: number): number {
  return failureCounts.get(keyId) ?? 0;
}

/**
 * Reset all failure counters (for testing).
 */
export function resetFailureCounts(): void {
  failureCounts.clear();
}

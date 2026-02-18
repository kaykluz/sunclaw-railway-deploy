/**
 * Periodic Stripe Subscription Sync
 *
 * Runs every 6 hours. For each user with a stripeCustomerId:
 *   1. Queries Stripe for their active subscription status.
 *   2. Compares with the DB plan field.
 *   3. If mismatched, updates the DB to match Stripe (source of truth).
 *
 * This catches any webhooks that were missed due to network issues or restarts.
 */

import { getPaidUsers, updateUserSubscription, updateUserManagedKeys } from "./db";
import { getActiveSubscription, getStripe } from "./stripe";
import { ENV } from "./_core/env";

const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

let syncTimer: ReturnType<typeof setInterval> | null = null;

export function startStripeSyncCron(): void {
  if (syncTimer) return;

  // Don't start if Stripe isn't configured
  if (!ENV.stripeSecretKey) {
    console.log("[StripeSync] STRIPE_SECRET_KEY not set, skipping sync cron");
    return;
  }

  console.log(`[StripeSync] Starting periodic sync every ${SYNC_INTERVAL_MS / 1000 / 60 / 60}h`);
  syncTimer = setInterval(runStripeSync, SYNC_INTERVAL_MS);

  // Run first sync 60s after boot (let server finish starting)
  setTimeout(runStripeSync, 60_000);
}

export function stopStripeSyncCron(): void {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
    console.log("[StripeSync] Stopped");
  }
}

async function runStripeSync(): Promise<void> {
  console.log("[StripeSync] Running subscription sync...");

  let synced = 0;
  let errors = 0;

  try {
    const paidUsers = await getPaidUsers();
    if (paidUsers.length === 0) {
      console.log("[StripeSync] No users with stripeCustomerId, done.");
      return;
    }

    for (const user of paidUsers) {
      try {
        const subscription = await getActiveSubscription(user.stripeCustomerId!);

        if (subscription) {
          // User has an active subscription — ensure DB matches
          if (user.plan !== subscription.planId) {
            console.log(`[StripeSync] User ${user.id}: DB plan "${user.plan}" → Stripe plan "${subscription.planId}"`);
            await updateUserSubscription(user.id, {
              plan: subscription.planId,
              stripeSubscriptionId: subscription.subscriptionId,
            });
            synced++;
          }

          // Check managed keys add-on
          await syncManagedKeysAddOn(user);
        } else {
          // No active subscription — should be on free plan
          if (user.plan !== "free") {
            console.log(`[StripeSync] User ${user.id}: DB plan "${user.plan}" but no active Stripe subscription → downgrading to free`);
            await updateUserSubscription(user.id, {
              plan: "free",
              stripeSubscriptionId: null,
            });
            synced++;
          }

          // Deactivate managed keys if no subscription
          if (user.managedKeysActive) {
            await updateUserManagedKeys(user.id, {
              managedKeysActive: false,
              managedKeysSubscriptionId: null,
            });
            synced++;
          }
        }
      } catch (err: any) {
        console.warn(`[StripeSync] Error syncing user ${user.id}:`, err.message);
        errors++;
      }
    }
  } catch (err: any) {
    console.error("[StripeSync] Fatal error during sync:", err.message);
    return;
  }

  console.log(`[StripeSync] Done. ${synced} correction(s), ${errors} error(s).`);
}

async function syncManagedKeysAddOn(user: { id: number; stripeCustomerId: string | null; managedKeysActive: boolean | null; managedKeysSubscriptionId: string | null }): Promise<void> {
  if (!user.stripeCustomerId) return;

  try {
    const stripe = getStripe();
    const subs = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "active",
      limit: 10,
    });

    const hasActiveAddon = subs.data.some(
      (sub) =>
        sub.metadata?.addon_id === "managed_keys" ||
        sub.items.data.some((item) => item.price?.metadata?.addon_id === "managed_keys")
    );

    if (hasActiveAddon && !user.managedKeysActive) {
      console.log(`[StripeSync] User ${user.id}: activating managed keys (Stripe says active)`);
      await updateUserManagedKeys(user.id, { managedKeysActive: true, managedKeysSubscriptionId: user.managedKeysSubscriptionId });
    } else if (!hasActiveAddon && user.managedKeysActive) {
      console.log(`[StripeSync] User ${user.id}: deactivating managed keys (no active Stripe addon)`);
      await updateUserManagedKeys(user.id, { managedKeysActive: false, managedKeysSubscriptionId: null });
    }
  } catch {
    // Non-critical — skip
  }
}

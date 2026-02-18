import type { Request, Response } from "express";
import Stripe from "stripe";
import { getStripe } from "./stripe";
import { ENV } from "./_core/env";
import { getUserByStripeCustomerId, updateUserSubscription, updateUserPlanSelected, updateUserManagedKeys, getUserRailwayDeployments, markDeploymentsFailed, hasProcessedStripeEvent, markStripeEventProcessed } from "./db";
import { notifyOwner } from "./_core/notification";
import { deleteProject } from "./railway";

/**
 * Handle Stripe webhook events.
 * This endpoint receives raw body for signature verification.
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];
  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.stripeWebhookSecret
    );
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  // Idempotency: skip events we've already processed (Stripe retries)
  const alreadyProcessed = await hasProcessedStripeEvent(event.id);
  if (alreadyProcessed) {
    console.log(`[Stripe Webhook] Event ${event.id} already processed, skipping`);
    return res.json({ received: true, duplicate: true });
  }
  await markStripeEventProcessed(event.id, event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Stripe Webhook] Invoice paid: ${invoice.id}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Stripe Webhook] Invoice payment failed: ${invoice.id}`);
        // Notify owner about failed payment
        notifyOwner({
          title: "Payment Failed",
          content: `Invoice ${invoice.id} payment failed for customer ${invoice.customer}`,
        }).catch(() => {});
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, error);
    // Still return 200 to prevent Stripe from retrying
  }

  return res.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
    ? parseInt(session.metadata.user_id)
    : null;
  const planId = session.metadata?.plan_id;
  const addOnId = session.metadata?.addon_id;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  if (!userId || !customerId) {
    console.error("[Stripe Webhook] Missing userId or customerId in checkout session");
    return;
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  // Handle plan upgrade (or bundle that includes a plan)
  if (planId) {
    await updateUserSubscription(userId, {
      plan: planId,
      stripeSubscriptionId: subscriptionId ?? null,
      stripeCustomerId: customerId,
    });
    await updateUserPlanSelected(userId, true);
    console.log(
      `[Stripe Webhook] User ${userId} upgraded to ${planId} plan (subscription: ${subscriptionId})`
    );
  }

  // Handle managed keys add-on (standalone or part of bundle)
  if (addOnId === "managed_keys") {
    await updateUserManagedKeys(userId, {
      managedKeysActive: true,
      managedKeysSubscriptionId: subscriptionId ?? null,
    });
    console.log(
      `[Stripe Webhook] User ${userId} activated managed keys add-on (subscription: ${subscriptionId})`
    );
  }

  const parts = [
    planId ? `${planId} plan` : null,
    addOnId ? `${addOnId} add-on` : null,
  ].filter(Boolean).join(" + ");

  notifyOwner({
    title: addOnId && !planId ? "New Add-On Subscription" : "New Subscription",
    content: `User ${session.metadata?.customer_email ?? userId} subscribed to ${parts}.`,
  }).catch(() => {});
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) return;

  const user = await getUserByStripeCustomerId(customerId);
  if (!user) {
    console.warn(`[Stripe Webhook] No user found for Stripe customer ${customerId}`);
    return;
  }

  // Check if this is an add-on subscription
  const addOnId =
    subscription.metadata?.addon_id ??
    subscription.items.data[0]?.price?.metadata?.addon_id;

  if (addOnId === "managed_keys") {
    if (subscription.status === "active" || subscription.status === "trialing") {
      await updateUserManagedKeys(user.id, {
        managedKeysActive: true,
        managedKeysSubscriptionId: subscription.id,
      });
      console.log(`[Stripe Webhook] Managed keys add-on updated for user ${user.id}: active`);
    } else if (subscription.status === "past_due" || subscription.status === "unpaid") {
      notifyOwner({
        title: "Add-On Past Due",
        content: `User ${user.email ?? user.id} managed keys add-on is ${subscription.status}.`,
      }).catch(() => {});
    }
    return;
  }

  // Handle base plan subscription
  const planId =
    subscription.metadata?.plan_id ??
    subscription.items.data[0]?.price?.metadata?.plan_id ??
    "pro";

  if (subscription.status === "active" || subscription.status === "trialing") {
    await updateUserSubscription(user.id, {
      plan: planId,
      stripeSubscriptionId: subscription.id,
    });
    console.log(`[Stripe Webhook] Updated subscription for user ${user.id}: ${planId}`);
  } else if (
    subscription.status === "past_due" ||
    subscription.status === "unpaid"
  ) {
    notifyOwner({
      title: "Subscription Past Due",
      content: `User ${user.email ?? user.id} subscription is ${subscription.status}.`,
    }).catch(() => {});
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) return;

  const user = await getUserByStripeCustomerId(customerId);
  if (!user) return;

  // Check if this is an add-on subscription being cancelled
  const addOnId =
    subscription.metadata?.addon_id ??
    subscription.items.data[0]?.price?.metadata?.addon_id;

  if (addOnId === "managed_keys") {
    await updateUserManagedKeys(user.id, {
      managedKeysActive: false,
      managedKeysSubscriptionId: null,
    });
    console.log(`[Stripe Webhook] User ${user.id} managed keys add-on cancelled`);
    notifyOwner({
      title: "Add-On Cancelled",
      content: `User ${user.email ?? user.id} cancelled their managed keys add-on.`,
    }).catch(() => {});
    return;
  }

  // Downgrade base plan to free
  await updateUserSubscription(user.id, {
    plan: "free",
    stripeSubscriptionId: null,
  });

  // Also deactivate managed keys add-on if it was active
  if (user.managedKeysActive) {
    await updateUserManagedKeys(user.id, {
      managedKeysActive: false,
      managedKeysSubscriptionId: null,
    });
  }

  // Tear down Railway deployments — free tier doesn't include managed hosting
  try {
    const railwayDeployments = await getUserRailwayDeployments(user.id);
    if (railwayDeployments.length > 0) {
      console.log(`[Stripe Webhook] Removing ${railwayDeployments.length} Railway deployment(s) for user ${user.id}`);
      for (const dep of railwayDeployments) {
        const projectId = dep.externalId ?? (dep.metadata as any)?.railwayProjectId;
        if (projectId) {
          await deleteProject(projectId);
        }
      }
      await markDeploymentsFailed(user.id, "railway");
    }
  } catch (err: any) {
    console.error(`[Stripe Webhook] Failed to teardown Railway deployments for user ${user.id}:`, err.message);
  }

  console.log(`[Stripe Webhook] User ${user.id} downgraded to free (subscription cancelled, deployments removed)`);

  notifyOwner({
    title: "Subscription Cancelled",
    content: `User ${user.email ?? user.id} cancelled their subscription and was downgraded to the free plan. Railway deployments have been removed.`,
  }).catch(() => {});
}

import Stripe from "stripe";
import { ENV } from "./_core/env";
import { PLANS, ADD_ONS, type PlanDefinition, type AddOnDefinition } from "./stripe-products";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!ENV.stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(ENV.stripeSecretKey);
  }
  return _stripe;
}

/**
 * Find or create a Stripe Customer for a user.
 */
export async function findOrCreateCustomer(opts: {
  userId: number;
  email: string;
  name?: string | null;
  stripeCustomerId?: string | null;
}): Promise<string> {
  const stripe = getStripe();

  // If we already have a customer ID, verify it exists
  if (opts.stripeCustomerId) {
    try {
      const existing = await stripe.customers.retrieve(opts.stripeCustomerId);
      if (!existing.deleted) return opts.stripeCustomerId;
    } catch {
      // Customer doesn't exist, create a new one
    }
  }

  // Search by email
  const existing = await stripe.customers.list({
    email: opts.email,
    limit: 1,
  });
  if (existing.data.length > 0) {
    return existing.data[0].id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email: opts.email,
    name: opts.name ?? undefined,
    metadata: {
      user_id: opts.userId.toString(),
    },
  });

  return customer.id;
}

/**
 * Find or create a Stripe Price for a plan.
 * In production, use pre-created Price IDs from the Stripe Dashboard.
 */
async function findOrCreatePrice(plan: PlanDefinition): Promise<string> {
  const stripe = getStripe();

  // Search for existing product by metadata
  const products = await stripe.products.search({
    query: `metadata["plan_id"]:"${plan.id}"`,
    limit: 1,
  });

  let productId: string;
  if (products.data.length > 0) {
    productId = products.data[0].id;
  } else {
    // Create product
    const product = await stripe.products.create({
      name: `SunClaw ${plan.name}`,
      description: plan.description,
      metadata: { plan_id: plan.id },
    });
    productId = product.id;
  }

  // Search for existing price
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    type: "recurring",
    limit: 1,
  });

  if (prices.data.length > 0) {
    return prices.data[0].id;
  }

  // Create price
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: plan.monthlyPriceCents,
    currency: "usd",
    recurring: { interval: "month" },
    metadata: { plan_id: plan.id },
  });

  return price.id;
}

/**
 * Find or create a Stripe Price for an add-on product.
 */
async function findOrCreateAddOnPrice(addOn: AddOnDefinition): Promise<string> {
  const stripe = getStripe();

  const products = await stripe.products.search({
    query: `metadata["addon_id"]:"${addOn.id}"`,
    limit: 1,
  });

  let productId: string;
  if (products.data.length > 0) {
    productId = products.data[0].id;
  } else {
    const product = await stripe.products.create({
      name: `SunClaw ${addOn.name}`,
      description: addOn.description,
      metadata: { addon_id: addOn.id },
    });
    productId = product.id;
  }

  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    type: "recurring",
    limit: 1,
  });

  if (prices.data.length > 0) {
    return prices.data[0].id;
  }

  const price = await stripe.prices.create({
    product: productId,
    unit_amount: addOn.monthlyPriceCents,
    currency: "usd",
    recurring: { interval: "month" },
    metadata: { addon_id: addOn.id },
  });

  return price.id;
}

/**
 * Create a Stripe Checkout Session for a subscription plan.
 */
export async function createCheckoutSession(opts: {
  planId: string;
  userId: number;
  userEmail: string;
  userName?: string | null;
  stripeCustomerId?: string | null;
  origin: string;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  const plan = PLANS[opts.planId];

  if (!plan || plan.monthlyPriceCents === 0) {
    throw new Error("Cannot create checkout for free plan");
  }

  // Find or create customer
  const customerId = await findOrCreateCustomer({
    userId: opts.userId,
    email: opts.userEmail,
    name: opts.userName,
    stripeCustomerId: opts.stripeCustomerId,
  });

  // Find or create price
  const priceId = await findOrCreatePrice(plan);

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    client_reference_id: opts.userId.toString(),
    metadata: {
      user_id: opts.userId.toString(),
      customer_email: opts.userEmail,
      customer_name: opts.userName ?? "",
      plan_id: opts.planId,
    },
    success_url: `${opts.origin}/setup?payment=success&plan=${opts.planId}`,
    cancel_url: `${opts.origin}/pricing?payment=cancelled`,
  });

  return {
    url: session.url!,
    sessionId: session.id,
  };
}

/**
 * Create a Stripe Checkout Session for an add-on subscription.
 * The add-on is a separate subscription from the base plan.
 */
export async function createAddOnCheckoutSession(opts: {
  addOnId: string;
  userId: number;
  userEmail: string;
  userName?: string | null;
  stripeCustomerId?: string | null;
  origin: string;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  const addOn = ADD_ONS[opts.addOnId];

  if (!addOn) {
    throw new Error(`Unknown add-on: ${opts.addOnId}`);
  }

  const customerId = await findOrCreateCustomer({
    userId: opts.userId,
    email: opts.userEmail,
    name: opts.userName,
    stripeCustomerId: opts.stripeCustomerId,
  });

  const priceId = await findOrCreateAddOnPrice(addOn);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    client_reference_id: opts.userId.toString(),
    metadata: {
      user_id: opts.userId.toString(),
      customer_email: opts.userEmail,
      customer_name: opts.userName ?? "",
      addon_id: opts.addOnId,
    },
    success_url: `${opts.origin}/account?addon=success&addon_id=${opts.addOnId}`,
    cancel_url: `${opts.origin}/account?addon=cancelled`,
  });

  return {
    url: session.url!,
    sessionId: session.id,
  };
}

/**
 * Create a Stripe Checkout Session for a plan + add-on bundle.
 * Used when Free users want Pro ($29) + Managed Keys ($19) together.
 */
export async function createBundleCheckoutSession(opts: {
  planId: string;
  addOnId: string;
  userId: number;
  userEmail: string;
  userName?: string | null;
  stripeCustomerId?: string | null;
  origin: string;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  const plan = PLANS[opts.planId];
  const addOn = ADD_ONS[opts.addOnId];

  if (!plan || plan.monthlyPriceCents === 0) {
    throw new Error("Cannot create checkout for free plan");
  }
  if (!addOn) {
    throw new Error(`Unknown add-on: ${opts.addOnId}`);
  }

  const customerId = await findOrCreateCustomer({
    userId: opts.userId,
    email: opts.userEmail,
    name: opts.userName,
    stripeCustomerId: opts.stripeCustomerId,
  });

  const planPriceId = await findOrCreatePrice(plan);
  const addOnPriceId = await findOrCreateAddOnPrice(addOn);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      { price: planPriceId, quantity: 1 },
      { price: addOnPriceId, quantity: 1 },
    ],
    allow_promotion_codes: true,
    client_reference_id: opts.userId.toString(),
    metadata: {
      user_id: opts.userId.toString(),
      customer_email: opts.userEmail,
      customer_name: opts.userName ?? "",
      plan_id: opts.planId,
      addon_id: opts.addOnId,
    },
    success_url: `${opts.origin}/setup?payment=success&plan=${opts.planId}&addon=${opts.addOnId}`,
    cancel_url: `${opts.origin}/pricing?payment=cancelled`,
  });

  return {
    url: session.url!,
    sessionId: session.id,
  };
}

/**
 * Get the active subscription for a Stripe customer.
 */
export async function getActiveSubscription(
  stripeCustomerId: string
): Promise<{
  subscriptionId: string;
  planId: string;
  status: string;
  startDate: number;
} | null> {
  const stripe = getStripe();

  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "active",
    limit: 1,
  });

  if (subscriptions.data.length === 0) {
    // Also check for trialing
    const trialing = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "trialing",
      limit: 1,
    });
    if (trialing.data.length === 0) return null;
    const sub = trialing.data[0];
    const planId =
      sub.metadata?.plan_id ??
      sub.items.data[0]?.price?.metadata?.plan_id ??
      "pro";
    return {
      subscriptionId: sub.id,
      planId,
      status: sub.status,
      startDate: sub.start_date,
    };
  }

  const sub = subscriptions.data[0];
  const planId =
    sub.metadata?.plan_id ??
    sub.items.data[0]?.price?.metadata?.plan_id ??
    "pro";

  return {
    subscriptionId: sub.id,
    planId,
    status: sub.status,
    startDate: sub.start_date,
  };
}

/**
 * Create a Stripe billing portal session for managing subscriptions.
 */
export async function createBillingPortalSession(opts: {
  stripeCustomerId: string;
  origin: string;
}): Promise<string> {
  const stripe = getStripe();

  const session = await stripe.billingPortal.sessions.create({
    customer: opts.stripeCustomerId,
    return_url: `${opts.origin}/setup`,
  });

  return session.url;
}

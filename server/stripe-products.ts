/**
 * SunClaw Subscription Plans
 *
 * Three-tier model:
 *   Free  — Guided self-setup. User's own Railway, own API keys. Zero cost on our end.
 *   Pro   — Our Railway hosting. User brings own API keys (or paid add-on for managed keys).
 *           Telegram click-and-go. Configuration dashboard.
 *   Enterprise — Our Railway (dedicated). Our keys included. All channels managed.
 *               Full KIISHA integration, VATR compliance, portfolio management.
 *
 * Plans are created in Stripe on first use. Price IDs are cached after creation.
 * In production, create these in the Stripe Dashboard and reference the IDs directly.
 */

export interface PlanDefinition {
  id: string;
  name: string;
  description: string;
  /** Monthly price in cents (USD) */
  monthlyPriceCents: number;
  features: string[];
  /** Max Railway deployments allowed */
  maxDeployments: number;
  /** Whether this plan includes Railway provisioning on our infrastructure */
  includesRailway: boolean;
  /** Whether users must bring their own LLM API keys */
  byoKeys: boolean;
  /** Whether managed LLM keys are available as an add-on */
  managedKeysAddOn: boolean;
  /** Whether this plan includes guided self-setup wizard */
  guidedSetup: boolean;
  /** Short tagline for the pricing card */
  tagline: string;
}

export const PLANS: Record<string, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    description: "Self-hosted with guided setup. Your infrastructure, your keys, zero cost on our end.",
    tagline: "Get started in minutes",
    monthlyPriceCents: 0,
    features: [
      "11 renewable energy AI skills",
      "50+ OpenClaw general skills",
      "8+ deployment platform guides with pre-filled config",
      "Telegram BotFather setup wizard",
      "All channel templates (WhatsApp, Slack, Discord)",
      "Bring your own LLM API keys",
      "Railway template copy, Render, Emergent, and more",
      "Community support",
    ],
    maxDeployments: 0,
    includesRailway: false,
    byoKeys: true,
    managedKeysAddOn: false,
    guidedSetup: true,
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Managed hosting on our infrastructure. Bring your own API keys or add managed keys.",
    tagline: "Most popular for teams",
    monthlyPriceCents: 2900, // $29/mo
    features: [
      "Everything in Free",
      "Managed Railway deployment (zero-touch)",
      "Up to 3 managed bot instances",
      "Telegram click-and-go (instant setup)",
      "Configuration dashboard with live logs",
      "Persistent memory & auto-journaling",
      "Bring your own API keys",
      "Optional: Managed LLM keys add-on ($19/mo)",
      "Priority email support",
    ],
    maxDeployments: 3,
    includesRailway: true,
    byoKeys: true,
    managedKeysAddOn: true,
    guidedSetup: false,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "Dedicated infrastructure with managed keys. Full KIISHA integration and compliance.",
    tagline: "For energy companies",
    monthlyPriceCents: 9900, // $99/mo
    features: [
      "Everything in Pro",
      "Unlimited managed bot instances",
      "Managed LLM keys included",
      "Dedicated Railway infrastructure",
      "KIISHA enterprise skills suite",
      "Portfolio management & analytics",
      "Document compliance (VATR)",
      "All channels fully managed",
      "Custom system prompt & branding",
      "Dedicated account support",
    ],
    maxDeployments: -1, // unlimited
    includesRailway: true,
    byoKeys: false,
    managedKeysAddOn: false,
    guidedSetup: false,
  },
};

/**
 * Add-on definitions (purchased separately from the base plan).
 */
export interface AddOnDefinition {
  id: string;
  name: string;
  description: string;
  monthlyPriceCents: number;
  /** Which base plans can purchase this add-on */
  eligiblePlans: string[];
}

export const ADD_ONS: Record<string, AddOnDefinition> = {
  managed_keys: {
    id: "managed_keys",
    name: "Managed LLM Keys",
    description: "We provide and manage LLM API keys (OpenAI, Anthropic, etc.) so you don't have to.",
    monthlyPriceCents: 1900, // $19/mo
    eligiblePlans: ["pro"],
  },
};

/** Get plan by ID, defaults to free */
export function getPlan(planId: string): PlanDefinition {
  return PLANS[planId] ?? PLANS.free;
}

/** Get add-on by ID */
export function getAddOn(addOnId: string): AddOnDefinition | undefined {
  return ADD_ONS[addOnId];
}

/** Check if a user's plan is eligible for a specific add-on */
export function isEligibleForAddOn(planId: string, addOnId: string): boolean {
  const addOn = ADD_ONS[addOnId];
  if (!addOn) return false;
  return addOn.eligiblePlans.includes(planId);
}

/** Check if a plan allows Railway deployment on our infrastructure */
export function canDeployRailway(planId: string): boolean {
  return getPlan(planId).includesRailway;
}

/** Check if a plan has remaining deployment slots */
export function hasDeploymentSlots(
  planId: string,
  currentDeployments: number
): boolean {
  const plan = getPlan(planId);
  if (plan.maxDeployments === -1) return true; // unlimited
  return currentDeployments < plan.maxDeployments;
}

/** Check if a plan requires the user to bring their own keys */
export function requiresBYOKeys(planId: string): boolean {
  return getPlan(planId).byoKeys;
}

/** Check if a plan offers managed keys as an add-on */
export function hasManagedKeysAddOn(planId: string): boolean {
  return getPlan(planId).managedKeysAddOn;
}

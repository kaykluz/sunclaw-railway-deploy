import {
  Globe, Terminal, Server, Cloud, Cpu, Zap, Box, Layers,
  type LucideIcon,
} from "lucide-react";

export type PlatformId =
  | "railway"
  | "render"
  | "hostinger"
  | "emergent"
  | "northflank"
  | "cloudflare"
  | "alibaba"
  | "docker";

export type SetupComplexity = "beginner" | "intermediate" | "developer";

export interface PlatformDefinition {
  id: PlatformId;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  color: string;
  pricing: {
    free: boolean;
    startingPrice: string;
    note?: string;
  };
  setupTime: string;
  complexity: SetupComplexity;
  bestFor: string;
  features: string[];
  signupUrl: string;
  templateUrl?: string;
  supportsEnvPrefill: boolean;
  managedProvision: boolean;
  requiredPlan?: "pro" | "enterprise" | null;
  wizardStepCount: number;
}

export const PLATFORMS: PlatformDefinition[] = [
  {
    id: "railway",
    name: "Railway",
    tagline: "One-click cloud deploy",
    description:
      "Deploy to Railway's cloud platform. Free tier users can copy our pre-configured template. Pro/Enterprise users get zero-touch managed deployment.",
    icon: Globe,
    color: "amber",
    pricing: { free: true, startingPrice: "$0", note: "$5 free trial credit" },
    setupTime: "~2 min",
    complexity: "beginner",
    bestFor: "Beginners & teams",
    features: [
      "Auto-scaling infrastructure",
      "Free SSL certificates",
      "GitHub integration",
      "Pre-filled template with your config",
    ],
    signupUrl: "https://railway.com",
    templateUrl:
      "https://railway.com/workspace/templates/9e2a5d49-837a-40e7-b90a-c1c8b8512c87",
    supportsEnvPrefill: true,
    managedProvision: true,
    requiredPlan: "pro",
    wizardStepCount: 3,
  },
  {
    id: "render",
    name: "Render",
    tagline: "Infrastructure as code",
    description:
      "Deploy OpenClaw using Render's blueprint system. Free tier available with easy scaling options.",
    icon: Cloud,
    color: "cyan",
    pricing: { free: true, startingPrice: "$0", note: "Paid plans from $7/mo" },
    setupTime: "~5 min",
    complexity: "beginner",
    bestFor: "Developers who love clean dashboards",
    features: [
      "Free tier available",
      "Auto-deploy from GitHub",
      "Built-in SSL & CDN",
      "Easy environment variable management",
    ],
    signupUrl: "https://render.com",
    templateUrl:
      "https://render.com/deploy?repo=https://github.com/kaykluz/sunclaw",
    supportsEnvPrefill: false,
    managedProvision: false,
    requiredPlan: null,
    wizardStepCount: 3,
  },
  {
    id: "hostinger",
    name: "Hostinger",
    tagline: "Dedicated VPS hosting",
    description:
      "Deploy on a dedicated Hostinger VPS with full root access. Choose the OpenClaw Docker template for quick setup.",
    icon: Server,
    color: "violet",
    pricing: { free: false, startingPrice: "$5.99/mo" },
    setupTime: "~10 min",
    complexity: "intermediate",
    bestFor: "Long-term production use",
    features: [
      "Dedicated IP & resources",
      "99.9% uptime guarantee",
      "Full root SSH access",
      "OpenClaw Docker template",
    ],
    signupUrl: "https://www.hostinger.com/vps",
    templateUrl:
      "https://www.hostinger.com/vps/docker/openclaw",
    supportsEnvPrefill: false,
    managedProvision: false,
    requiredPlan: null,
    wizardStepCount: 3,
  },
  {
    id: "emergent",
    name: "Emergent.sh",
    tagline: "5-minute chip launch",
    description:
      "The fastest way to deploy OpenClaw. Launch a pre-built chip on Emergent.sh — no terminal required.",
    icon: Zap,
    color: "emerald",
    pricing: { free: true, startingPrice: "$0" },
    setupTime: "~5 min",
    complexity: "beginner",
    bestFor: "Absolute beginners",
    features: [
      "No terminal required",
      "Free tier available",
      "Pre-built OpenClaw image",
      "Instant provisioning",
    ],
    signupUrl: "https://emergent.sh",
    templateUrl: "https://emergent.sh/tutorial/moltbot-on-emergent",
    supportsEnvPrefill: false,
    managedProvision: false,
    requiredPlan: null,
    wizardStepCount: 3,
  },
  {
    id: "northflank",
    name: "Northflank",
    tagline: "One-click template",
    description:
      "Deploy OpenClaw with Northflank's one-click template. Persistent storage and a balance of simplicity and control.",
    icon: Layers,
    color: "blue",
    pricing: {
      free: true,
      startingPrice: "$0",
      note: "Paid plans ~$5-10/mo",
    },
    setupTime: "~7 min",
    complexity: "beginner",
    bestFor: "Balance of simplicity & control",
    features: [
      "One-click deploy stack",
      "Free tier available",
      "Persistent storage included",
      "Easy environment management",
    ],
    signupUrl: "https://northflank.com",
    templateUrl: "https://northflank.com/stacks/deploy-openclaw",
    supportsEnvPrefill: false,
    managedProvision: false,
    requiredPlan: null,
    wizardStepCount: 3,
  },
  {
    id: "cloudflare",
    name: "Cloudflare Workers",
    tagline: "Serverless edge deploy",
    description:
      "Run OpenClaw as a serverless agent on Cloudflare's global edge network using MoltWorker and the Wrangler CLI.",
    icon: Cpu,
    color: "orange",
    pricing: { free: false, startingPrice: "$5/mo", note: "Workers Paid plan" },
    setupTime: "~15 min",
    complexity: "developer",
    bestFor: "Developers & serverless fans",
    features: [
      "Global edge network",
      "Serverless architecture",
      "Cloudflare Access security",
      "Sandbox SDK integration",
    ],
    signupUrl: "https://dash.cloudflare.com/sign-up",
    supportsEnvPrefill: false,
    managedProvision: false,
    requiredPlan: null,
    wizardStepCount: 4,
  },
  {
    id: "alibaba",
    name: "Alibaba Cloud",
    tagline: "Asia-optimized cloud",
    description:
      "Deploy on Alibaba Cloud's Simple Application Server with the OpenClaw image. Best for APAC-facing enterprises.",
    icon: Box,
    color: "orange",
    pricing: {
      free: false,
      startingPrice: "$0.99/mo",
      note: "Promo for new users",
    },
    setupTime: "~10 min",
    complexity: "intermediate",
    bestFor: "APAC enterprises",
    features: [
      "Starting at $0.99/mo promo",
      "Pre-built OpenClaw image",
      "Model Studio (Qwen) integration",
      "Multi-region deployment",
    ],
    signupUrl: "https://www.alibabacloud.com",
    templateUrl:
      "https://www.alibabacloud.com/en/campaign/ai-openclaw",
    supportsEnvPrefill: false,
    managedProvision: false,
    requiredPlan: null,
    wizardStepCount: 3,
  },
  {
    id: "docker",
    name: "Self-Hosted",
    tagline: "Full control on your server",
    description:
      "One-line install on any Linux/macOS server. Auto-installs Docker, dependencies, and SunClaw with your configuration.",
    icon: Terminal,
    color: "neutral",
    pricing: { free: true, startingPrice: "$0", note: "BYO server" },
    setupTime: "~10 min",
    complexity: "intermediate",
    bestFor: "Full control & privacy",
    features: [
      "Any Linux/macOS server",
      "Auto-installs all dependencies",
      "Full filesystem access",
      "No vendor lock-in",
    ],
    signupUrl: "",
    supportsEnvPrefill: false,
    managedProvision: false,
    requiredPlan: null,
    wizardStepCount: 2,
  },
];

/**
 * Sensible defaults for the 20 Railway template variables that have static defaults.
 * The remaining 6 (LLM_API_KEY, MOONSHOT_API_KEY, ANTHROPIC_API_KEY,
 * TELEGRAM_BOT_TOKEN, OPENCLAW_CONFIG_B64, OPENCLAW_GATEWAY_TOKEN) require
 * user input and are left for the builder to fill in.
 */
const RAILWAY_TEMPLATE_DEFAULTS: Record<string, string> = {
  PORT: "18789",
  NODE_ENV: "production",
  CORS_ORIGIN: "*",
  INSTANCE_NAME: "my-sunclaw",
  WHATSAPP_ENABLED: "true",
  TELEGRAM_ENABLED: "false",
  SLACK_ENABLED: "false",
  DISCORD_ENABLED: "false",
  KIISHA_ENABLED: "false",
  DASHBOARD_PORT: "3001",
  DASHBOARD_ENABLED: "true",
  HELMET_ENABLED: "true",
  HEALTH_CHECK_ENABLED: "true",
  HEALTH_CHECK_PATH: "/health",
  OPENCLAW_VERSION: "latest",
  OPENCLAW_LOG_LEVEL: "info",
  OPENCLAW_TIMEOUT_MS: "30000",
  OPENCLAW_MAX_RETRIES: "3",
  RATE_LIMIT_WINDOW_MS: "60000",
  RATE_LIMIT_MAX_REQUESTS: "100",
};

export function getPlatformById(
  id: PlatformId,
): PlatformDefinition | undefined {
  return PLATFORMS.find((p) => p.id === id);
}

/**
 * Build a platform-specific deploy URL, optionally pre-filling env vars.
 * Currently only Railway supports URL-based env var pre-fill.
 */
export function buildDeployUrl(
  platformId: PlatformId,
  envVars?: Record<string, string>,
): string | null {
  const platform = getPlatformById(platformId);
  if (!platform?.templateUrl) return null;

  if (platformId === "railway") {
    const merged = { ...RAILWAY_TEMPLATE_DEFAULTS, ...(envVars || {}) };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
    }
    return `${platform.templateUrl}?${params.toString()}`;
  }

  return platform.templateUrl;
}

/**
 * Railway deployment environment variable defaults.
 *
 * IMPORTANT: OpenClaw reads its configuration from openclaw.json (or openclaw.json5),
 * NOT from environment variables. Only a small set of env vars are recognized:
 *   - Model API keys (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.) as fallback
 *   - OPENCLAW_TOKEN for gateway auth
 *   - PORT for the HTTP server
 *
 * Everything else (channels, skills, session, memory, gateway settings) MUST be
 * configured in openclaw.json. The old approach of setting TELEGRAM_BOT_TOKEN,
 * DISCORD_BOT_TOKEN, etc. as env vars was WRONG — OpenClaw ignores those.
 *
 * The correct flow is:
 *   1. Generate openclaw.json via generateOpenClawConfig()
 *   2. Write it to the /data volume on Railway
 *   3. Set only the minimal env vars below
 *   4. OpenClaw reads /data/openclaw.json on startup
 */

/**
 * Minimal env vars that OpenClaw actually reads from environment.
 * These are the ONLY env vars that should be set on Railway.
 */
export const RAILWAY_DEFAULT_ENV_VARS: Record<string, string> = {
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

/**
 * Merge user env vars with defaults. User values take precedence.
 * Also auto-generates a gateway token if not provided.
 */
export function mergeWithDefaults(
  userVars: Record<string, string>
): Record<string, string> {
  const merged = {
    ...RAILWAY_DEFAULT_ENV_VARS,
    ...userVars,
  };
  if (!merged.OPENCLAW_TOKEN) {
    merged.OPENCLAW_TOKEN = generateGatewayToken();
  }
  return merged;
}

/** Generate a random 32-byte hex token for OpenClaw gateway auth */
function generateGatewayToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Information about env vars that users may want to set.
 * These are the model API keys that OpenClaw reads from env as fallback.
 * Channel credentials go in openclaw.json, NOT here.
 */
export const RAILWAY_TEMPLATE_VARS_INFO = [
  // Variables with sensible defaults (pre-filled for builders)
  { key: "PORT", description: "OpenClaw gateway port", required: true, default: "18789" },
  { key: "NODE_ENV", description: "Node.js environment", required: true, default: "production" },
  { key: "CORS_ORIGIN", description: "Allowed CORS origins", required: true, default: "*" },
  { key: "INSTANCE_NAME", description: "Name for this SunClaw instance", required: true, default: "my-sunclaw" },
  { key: "WHATSAPP_ENABLED", description: "Enable WhatsApp channel", required: true, default: "true" },
  { key: "TELEGRAM_ENABLED", description: "Enable Telegram channel", required: true, default: "false" },
  { key: "SLACK_ENABLED", description: "Enable Slack channel", required: true, default: "false" },
  { key: "DISCORD_ENABLED", description: "Enable Discord channel", required: true, default: "false" },
  { key: "KIISHA_ENABLED", description: "Enable KIISHA enterprise integration", required: true, default: "false" },
  { key: "DASHBOARD_PORT", description: "Dashboard UI port", required: true, default: "3001" },
  { key: "DASHBOARD_ENABLED", description: "Enable dashboard UI", required: true, default: "true" },
  { key: "HELMET_ENABLED", description: "Enable Helmet security headers", required: true, default: "true" },
  { key: "HEALTH_CHECK_ENABLED", description: "Enable health check endpoint", required: true, default: "true" },
  { key: "HEALTH_CHECK_PATH", description: "Health check endpoint path", required: true, default: "/health" },
  { key: "OPENCLAW_VERSION", description: "OpenClaw version tag", required: true, default: "latest" },
  { key: "OPENCLAW_LOG_LEVEL", description: "Log verbosity (debug, info, warn, error)", required: true, default: "info" },
  { key: "OPENCLAW_TIMEOUT_MS", description: "Request timeout in milliseconds", required: true, default: "30000" },
  { key: "OPENCLAW_MAX_RETRIES", description: "Max retry attempts for failed requests", required: true, default: "3" },
  { key: "RATE_LIMIT_WINDOW_MS", description: "Rate limit window in milliseconds", required: true, default: "60000" },
  { key: "RATE_LIMIT_MAX_REQUESTS", description: "Max requests per rate limit window", required: true, default: "100" },
  { key: "LLM_API_KEY", description: "Primary LLM API key (works for any provider)", required: false },
  // Variables that require user input (no default)
  { key: "MOONSHOT_API_KEY", description: "Moonshot/Kimi AI API key", required: false },
  { key: "ANTHROPIC_API_KEY", description: "Anthropic Claude API key", required: false },
  { key: "TELEGRAM_BOT_TOKEN", description: "Telegram bot token (if Telegram enabled)", required: false },
  { key: "OPENCLAW_CONFIG_B64", description: "Base64-encoded OpenClaw config (auto-generated)", required: false },
  { key: "OPENCLAW_GATEWAY_TOKEN", description: "Gateway authentication token (auto-generated)", required: false },
];

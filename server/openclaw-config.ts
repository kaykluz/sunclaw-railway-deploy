/**
 * OpenClaw Configuration Generator
 *
 * Generates a valid openclaw.json config object that matches the actual
 * OpenClaw config schema (OpenClawConfig type from the OpenClaw source).
 *
 * This replaces the old env-var-only approach. OpenClaw reads its config
 * from openclaw.json (or openclaw.json5) — only a handful of env vars
 * are recognized (model API keys). Everything else must be in the config file.
 *
 * Reference: openclaw/src/config/types.openclaw.ts
 */

/* ─── Channel credential shapes (what the user provides via SunClaw UI) ─── */

export interface TelegramCredentials {
  botToken: string;
}

export interface WhatsAppCredentials {
  // WhatsApp uses Baileys (WhatsApp Web protocol) — no API keys.
  // Pairing is done via QR code at runtime. Config just enables the channel.
  // selfChatMode: true means the bot runs on the user's own phone number.
  selfChatMode?: boolean;
}

export interface SlackCredentials {
  botToken: string;    // xoxb-...
  appToken: string;    // xapp-... (required for Socket Mode)
  userToken?: string;  // xoxp-... (optional, for enhanced features)
}

export interface DiscordCredentials {
  token: string;       // Bot token from Discord Developer Portal
}

export interface SignalCredentials {
  account?: string;    // E.164 phone number
  httpUrl?: string;    // signal-cli HTTP daemon URL
}

export interface MSTeamsCredentials {
  appId: string;
  appPassword: string;
  tenantId?: string;
}

export type ChannelCredentials =
  | { channel: "telegram"; credentials: TelegramCredentials }
  | { channel: "whatsapp"; credentials: WhatsAppCredentials }
  | { channel: "slack"; credentials: SlackCredentials }
  | { channel: "discord"; credentials: DiscordCredentials }
  | { channel: "signal"; credentials: SignalCredentials }
  | { channel: "msteams"; credentials: MSTeamsCredentials };

/* ─── Model provider config (what the user provides via SunClaw UI) ─── */

export interface ModelProviderInput {
  /** Provider slug: openai, anthropic, google, venice, openrouter, xai, etc. */
  provider: string;
  /** API key for this provider */
  apiKey: string;
  /** Optional custom base URL */
  baseUrl?: string;
  /** Optional specific model to use for this provider */
  model?: string;
}

/* ─── Skill config ─── */

export interface SkillInput {
  /** Skill ID (e.g. "solar-irradiance", "lcoe-calculator") */
  id: string;
  /** Whether this skill is enabled */
  enabled: boolean;
  /** Optional env vars for the skill */
  env?: Record<string, string>;
}

/* ─── Soul.md / system prompt ─── */

export interface AgentInput {
  name?: string;
  avatar?: string;
  /** Custom system prompt / soul.md content */
  soulMd?: string;
}

/* ─── Full config generation input ─── */

export interface OpenClawConfigInput {
  /** Channels to enable with their credentials */
  channels: ChannelCredentials[];
  /** Model providers (in priority order — first is primary) */
  models: ModelProviderInput[];
  /** Active model selection: "provider/model-id" (e.g. "moonshot/kimi-k2.5") */
  activeModel?: string;
  /** Skills to enable/configure */
  skills?: SkillInput[];
  /** Agent identity and system prompt */
  agent?: AgentInput;
  /** Gateway settings */
  gateway?: {
    port?: number;
    bind?: string;
    token?: string;
  };
  /** Additional env vars to inject */
  env?: Record<string, string>;
}

/* ─── Known provider base URLs ─── */

export const PROVIDER_BASE_URLS: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com",
  google: "https://generativelanguage.googleapis.com/v1beta",
  venice: "https://api.venice.ai/api/v1",
  openrouter: "https://openrouter.ai/api/v1",
  xai: "https://api.x.ai/v1",
  groq: "https://api.groq.com/openai/v1",
  together: "https://api.together.xyz/v1",
  deepseek: "https://api.deepseek.com",
  mistral: "https://api.mistral.ai/v1",
  perplexity: "https://api.perplexity.ai",
  fireworks: "https://api.fireworks.ai/inference/v1",
  cohere: "https://api.cohere.ai/v1",
  moonshot: "https://api.moonshot.ai/v1",
  qwen: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  minimax: "https://api.minimax.io/anthropic",
  "minimax-cn": "https://api.minimaxi.com/v1",
  "kimi-coding": "https://api.kimi.com/coding",
  cerebras: "https://api.cerebras.ai/v1",
  sambanova: "https://api.sambanova.ai/v1",
  novita: "https://api.novita.ai/v3/openai",
  hyperbolic: "https://api.hyperbolic.xyz/v1",
  nebius: "https://api.studio.nebius.ai/v1",
  "amazon-bedrock": "https://bedrock-runtime.us-east-1.amazonaws.com",
  zhipu: "https://open.bigmodel.cn/api/paas/v4",
};

/* ─── Known provider model definitions ─── */

export const PROVIDER_MODELS: Record<string, Array<{
  id: string;
  name: string;
  reasoning: boolean;
  input: Array<"text" | "image">;
  contextWindow: number;
  maxTokens: number;
  cost: { input: number; output: number; cacheRead: number; cacheWrite: number };
}>> = {
  openai: [
    { id: "gpt-4o", name: "GPT-4o", reasoning: false, input: ["text", "image"], contextWindow: 128000, maxTokens: 16384, cost: { input: 2.5, output: 10, cacheRead: 1.25, cacheWrite: 2.5 } },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", reasoning: false, input: ["text", "image"], contextWindow: 128000, maxTokens: 16384, cost: { input: 0.15, output: 0.6, cacheRead: 0.075, cacheWrite: 0.15 } },
    { id: "o3-mini", name: "o3-mini", reasoning: true, input: ["text"], contextWindow: 200000, maxTokens: 100000, cost: { input: 1.1, output: 4.4, cacheRead: 0.55, cacheWrite: 1.1 } },
  ],
  anthropic: [
    { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", reasoning: false, input: ["text", "image"], contextWindow: 200000, maxTokens: 16384, cost: { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 } },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", reasoning: false, input: ["text", "image"], contextWindow: 200000, maxTokens: 8192, cost: { input: 0.8, output: 4, cacheRead: 0.08, cacheWrite: 1 } },
  ],
  venice: [
    { id: "llama-3.3-70b", name: "Llama 3.3 70B", reasoning: false, input: ["text"], contextWindow: 131072, maxTokens: 16384, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } },
  ],
  xai: [
    { id: "grok-3-mini", name: "Grok 3 Mini", reasoning: true, input: ["text"], contextWindow: 131072, maxTokens: 16384, cost: { input: 0.3, output: 0.5, cacheRead: 0.15, cacheWrite: 0.3 } },
  ],
  moonshot: [
    { id: "kimi-k2.5", name: "Kimi K2.5", reasoning: true, input: ["text", "image"], contextWindow: 256000, maxTokens: 16384, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } },
  ],
  "kimi-coding": [
    { id: "kimi-for-coding", name: "Kimi K2.5 (Coding)", reasoning: true, input: ["text", "image"], contextWindow: 262144, maxTokens: 32768, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } },
  ],
  minimax: [
    { id: "MiniMax-M2.1", name: "MiniMax M2.1", reasoning: true, input: ["text"], contextWindow: 204000, maxTokens: 16384, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } },
    { id: "MiniMax-M2", name: "MiniMax M2", reasoning: true, input: ["text"], contextWindow: 196000, maxTokens: 16384, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } },
  ],
  "minimax-cn": [
    { id: "MiniMax-M2.1", name: "MiniMax M2.1 (CN)", reasoning: true, input: ["text"], contextWindow: 204000, maxTokens: 16384, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } },
  ],
  google: [
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", reasoning: false, input: ["text", "image"], contextWindow: 1048576, maxTokens: 8192, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } },
    { id: "gemini-2.5-pro-preview-06-05", name: "Gemini 2.5 Pro", reasoning: true, input: ["text", "image"], contextWindow: 1048576, maxTokens: 65536, cost: { input: 1.25, output: 10, cacheRead: 0.31, cacheWrite: 1.25 } },
  ],
  groq: [
    { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", reasoning: false, input: ["text"], contextWindow: 128000, maxTokens: 32768, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } },
  ],
  deepseek: [
    { id: "deepseek-chat", name: "DeepSeek V3", reasoning: false, input: ["text"], contextWindow: 64000, maxTokens: 8192, cost: { input: 0.27, output: 1.1, cacheRead: 0.07, cacheWrite: 0.27 } },
    { id: "deepseek-reasoner", name: "DeepSeek R1", reasoning: true, input: ["text"], contextWindow: 64000, maxTokens: 8192, cost: { input: 0.55, output: 2.19, cacheRead: 0.14, cacheWrite: 0.55 } },
  ],
  together: [
    { id: "meta-llama/Llama-3.3-70B-Instruct-Turbo", name: "Llama 3.3 70B Turbo", reasoning: false, input: ["text"], contextWindow: 128000, maxTokens: 16384, cost: { input: 0.88, output: 0.88, cacheRead: 0, cacheWrite: 0 } },
  ],
  mistral: [
    { id: "mistral-large-latest", name: "Mistral Large", reasoning: false, input: ["text"], contextWindow: 128000, maxTokens: 16384, cost: { input: 2, output: 6, cacheRead: 0, cacheWrite: 0 } },
  ],
  cerebras: [
    { id: "llama-3.3-70b", name: "Llama 3.3 70B", reasoning: false, input: ["text"], contextWindow: 128000, maxTokens: 16384, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } },
  ],
  perplexity: [
    { id: "sonar-pro", name: "Sonar Pro", reasoning: false, input: ["text"], contextWindow: 200000, maxTokens: 8192, cost: { input: 3, output: 15, cacheRead: 0, cacheWrite: 0 } },
  ],
  fireworks: [
    { id: "accounts/fireworks/models/llama-v3p3-70b-instruct", name: "Llama 3.3 70B", reasoning: false, input: ["text"], contextWindow: 128000, maxTokens: 16384, cost: { input: 0.9, output: 0.9, cacheRead: 0, cacheWrite: 0 } },
  ],
  cohere: [
    { id: "command-r-plus", name: "Command R+", reasoning: false, input: ["text"], contextWindow: 128000, maxTokens: 4096, cost: { input: 2.5, output: 10, cacheRead: 0, cacheWrite: 0 } },
  ],
  zhipu: [
    { id: "glm-4-plus", name: "GLM-4 Plus", reasoning: false, input: ["text", "image"], contextWindow: 128000, maxTokens: 4096, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } },
  ],
  sambanova: [
    { id: "Meta-Llama-3.3-70B-Instruct", name: "Llama 3.3 70B", reasoning: false, input: ["text"], contextWindow: 128000, maxTokens: 16384, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } },
  ],
  novita: [
    { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", reasoning: false, input: ["text"], contextWindow: 128000, maxTokens: 16384, cost: { input: 0.39, output: 0.39, cacheRead: 0, cacheWrite: 0 } },
  ],
  hyperbolic: [
    { id: "meta-llama/Llama-3.3-70B-Instruct", name: "Llama 3.3 70B", reasoning: false, input: ["text"], contextWindow: 128000, maxTokens: 16384, cost: { input: 0.4, output: 0.4, cacheRead: 0, cacheWrite: 0 } },
  ],
};

/* ─── API type detection ─── */

export function getApiType(provider: string): "openai-completions" | "anthropic-messages" | "google-generative-ai" {
  if (provider === "anthropic") return "anthropic-messages";
  if (provider === "kimi-coding") return "anthropic-messages";
  if (provider === "minimax") return "anthropic-messages";
  if (provider === "google") return "google-generative-ai";
  if (provider === "openrouter") return "openai-completions";
  return "openai-completions"; // Most providers use OpenAI-compatible API
}

/* ─── Main config generator ─── */

export function generateOpenClawConfig(input: OpenClawConfigInput): Record<string, unknown> {
  const config: Record<string, unknown> = {
    meta: {
      lastTouchedVersion: "sunclaw-generated",
      lastTouchedAt: new Date().toISOString(),
    },
  };

  // ── Messages config (ack reactions, etc.) ──
  // NOTE: ackReaction must be a string (the emoji itself), NOT an object
  config.messages = {
    ackReaction: "👀",
  };

  // ── Gateway config ──
  // OpenClaw only accepts "token", "password", or "trusted-proxy" for auth.mode.
  // "none" is NOT a valid value and causes the gateway to refuse to start.
  // Always use "token" mode — auto-generate a token if one wasn't provided.
  const gatewayToken = input.gateway?.token || crypto.randomUUID();
  config.gateway = {
    port: input.gateway?.port ?? 18789,
    bind: input.gateway?.bind ?? "lan",
    controlUi: { enabled: true },
    auth: { mode: "token", token: gatewayToken },
  };

  // ── Channels ──
  const channels: Record<string, unknown> = {};

  for (const ch of input.channels) {
    switch (ch.channel) {
      case "telegram": {
        // NOTE: No "enabled" field — presence of the block means enabled
        channels.telegram = {
          botToken: ch.credentials.botToken,
          dmPolicy: "open",
          allowFrom: ["*"],
          groupPolicy: "open",
          streamMode: "partial",
          reactionLevel: "ack",
        };
        break;
      }
      case "whatsapp": {
        channels.whatsapp = {
          dmPolicy: "open",
          allowFrom: ["*"],
          groupPolicy: "open",
          selfChatMode: ch.credentials.selfChatMode ?? false,
          sendReadReceipts: true,
        };
        break;
      }
      case "slack": {
        channels.slack = {
          mode: "socket",
          botToken: ch.credentials.botToken,
          appToken: ch.credentials.appToken,
          ...(ch.credentials.userToken ? { userToken: ch.credentials.userToken } : {}),
          dm: {
            enabled: true,
            policy: "open",
            allowFrom: ["*"],
          },
          groupPolicy: "open",
          requireMention: true,
        };
        break;
      }
      case "discord": {
        channels.discord = {
          token: ch.credentials.token,
          dm: {
            enabled: true,
            policy: "open",
            allowFrom: ["*"],
          },
          groupPolicy: "open",
        };
        break;
      }
      case "signal": {
        channels.signal = {
          ...(ch.credentials.account ? { account: ch.credentials.account } : {}),
          ...(ch.credentials.httpUrl ? { httpUrl: ch.credentials.httpUrl } : {}),
          dmPolicy: "open",
          allowFrom: ["*"],
          groupPolicy: "open",
        };
        break;
      }
      case "msteams": {
        channels.msteams = {
          appId: ch.credentials.appId,
          appPassword: ch.credentials.appPassword,
          ...(ch.credentials.tenantId ? { tenantId: ch.credentials.tenantId } : {}),
          dmPolicy: "open",
          allowFrom: ["*"],
          groupPolicy: "open",
          requireMention: true,
        };
        break;
      }
    }
  }

  if (Object.keys(channels).length > 0) {
    config.channels = channels;

    // Enable bundled plugins for configured channels
    // OpenClaw requires plugins.entries.<channel>.enabled: true for bundled channel plugins
    const pluginEntries: Record<string, { enabled: boolean }> = {};
    for (const channelName of Object.keys(channels)) {
      pluginEntries[channelName] = { enabled: true };
    }
    config.plugins = {
      ...(config.plugins as Record<string, unknown> ?? {}),
      entries: {
        ...((config.plugins as Record<string, unknown>)?.entries as Record<string, unknown> ?? {}),
        ...pluginEntries,
      },
    };
  }

  // ── Env block (API keys) ──
  // OpenClaw reads API key values from the env block in openclaw.json.
  // The models.providers section references them via ${ENV_VAR_NAME} syntax.
  const envBlock: Record<string, string> = {};

  // ── Models ──
  if (input.models.length > 0) {
    const providers: Record<string, unknown> = {};

    for (const model of input.models) {
      let baseUrl = model.baseUrl ?? PROVIDER_BASE_URLS[model.provider];
      
      // Fallback for unknown providers: default to OpenAI compatible
      if (!baseUrl) {
        baseUrl = "https://api.openai.com/v1";
      }

      const api = getApiType(model.provider);
      const models = model.model ? [{
        id: model.model,
        name: model.model,
        reasoning: false,
        input: ["text", "image"] as Array<"text" | "image">,
        contextWindow: 128000,
        maxTokens: 16384,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      }] : (PROVIDER_MODELS[model.provider] ?? [{
        id: "auto",
        name: model.provider,
        reasoning: false,
        input: ["text", "image"] as Array<"text" | "image">,
        contextWindow: 128000,
        maxTokens: 16384,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      }]);

      // Get the env var name for this provider's API key
      const envKey = getProviderEnvKey(model.provider);
      if (envKey) {
        // Store the actual key value in the env block
        envBlock[envKey] = model.apiKey;
      }

      providers[model.provider] = {
        baseUrl,
        // Reference the env var — OpenClaw resolves ${VAR} from the env block
        apiKey: envKey ? `\${${envKey}}` : model.apiKey,
        api,
        models,
      };
    }

    config.models = {
      mode: "merge",
      providers,
    };
  }

  // ── Skills ──
  // Always include skills.load.extraDirs so OpenClaw loads skills from the Docker container.
  // The wrapper copies SKILL.md files to ~/.openclaw/skills/ which OpenClaw scans automatically.
  const skillEntries: Record<string, unknown> = {};
  if (input.skills && input.skills.length > 0) {
    for (const skill of input.skills) {
      skillEntries[skill.id] = {
        enabled: skill.enabled,
        ...(skill.env ? { env: skill.env } : {}),
      };
    }
  }
  config.skills = {
    entries: skillEntries,
    load: {
      // OpenClaw scans these dirs for SKILL.md files at startup
      // The wrapper's installSkills() copies from /app/skills/ to ~/.openclaw/skills/
      extraDirs: [],
    },
  };

  // ── Active Model + Agent Behavior (agents.defaults) ──
  // OpenClaw expects agents.defaults.model.primary
  // The old agent.* path is deprecated; use agents.defaults instead
  const agentsDefaults: Record<string, unknown> = {};

  if (input.activeModel) {
    agentsDefaults.model = { primary: input.activeModel };
  }

  // ── System Prompt / Soul.md ──
  // OpenClaw does NOT accept "instructions" as a config key.
  // System prompts are loaded from workspace files (SOUL.md, IDENTITY.md, etc.)
  // at ~/.openclaw/workspace/. The wrapper script handles writing SOUL.md.

  if (Object.keys(agentsDefaults).length > 0) {
    config.agents = { defaults: agentsDefaults };
  }

  // ── Agent / UI ──
  if (input.agent) {
    config.ui = {
      assistant: {
        name: input.agent.name ?? "SunClaw",
        avatar: input.agent.avatar ?? "☀️",
      },
    };
  }

  // ── Env block ──
  // OpenClaw reads API keys from the top-level env block (flat key-value).
  // Merge model API key env vars with any additional env vars from input.
  const mergedEnv: Record<string, string> = {
    ...envBlock,
    ...(input.env ?? {}),
  };
  if (Object.keys(mergedEnv).length > 0) {
    config.env = mergedEnv;
  }

  // ── Session config ──
  config.session = {
    scope: "per-sender",
    reset: {
      mode: "idle",
      idleMinutes: 30,
    },
  };

  // ── Memory config ──
  // OpenClaw's built-in memory persists across sessions in ~/.openclaw/memory/
  // "autoSave" is NOT a valid key — omit it to use defaults.
  config.memory = {
    backend: "builtin",
  };

  // ── Tools config ──
  // OpenClaw accepts: profile, allow, deny, byProvider, sandbox, elevated
  // "exec.enabled" and "exec.sandboxed" are NOT valid keys.
  config.tools = {
    profile: "coding",
  };

  return config;
}

/* ─── Extract env vars that OpenClaw actually reads from environment ─── */

/**
 * Returns the minimal set of env vars that OpenClaw recognizes.
 * These are the ONLY env vars that should be set on Railway.
 * Everything else goes in openclaw.json.
 */
export function getOpenClawEnvVars(input: OpenClawConfigInput): Record<string, string> {
  const vars: Record<string, string> = {};

  // Model API keys — OpenClaw reads these from env as fallback
  for (const model of input.models) {
    const envKey = getProviderEnvKey(model.provider);
    if (envKey) {
      vars[envKey] = model.apiKey;
    }
  }

  // Gateway token (if set)
  if (input.gateway?.token) {
    vars.OPENCLAW_TOKEN = input.gateway.token;
  }

  // Global fallback for any provider key
  if (input.models.length > 0 && !vars.LLM_API_KEY) {
    vars.LLM_API_KEY = input.models[0].apiKey;
  }

  return vars;
}

export function getProviderEnvKey(provider: string): string | null {
  const map: Record<string, string> = {
    openai: "OPENAI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    google: "GOOGLE_API_KEY",
    venice: "VENICE_API_KEY",
    openrouter: "OPENROUTER_API_KEY",
    xai: "XAI_API_KEY",
    groq: "GROQ_API_KEY",
    together: "TOGETHER_API_KEY",
    deepseek: "DEEPSEEK_API_KEY",
    mistral: "MISTRAL_API_KEY",
    perplexity: "PERPLEXITY_API_KEY",
    fireworks: "FIREWORKS_API_KEY",
    cohere: "COHERE_API_KEY",
    moonshot: "MOONSHOT_API_KEY",
    minimax: "MINIMAX_API_KEY",
    "minimax-cn": "MINIMAX_API_KEY",
    "kimi-coding": "ANTHROPIC_API_KEY",
    cerebras: "CEREBRAS_API_KEY",
    sambanova: "SAMBANOVA_API_KEY",
    novita: "NOVITA_API_KEY",
    hyperbolic: "HYPERBOLIC_API_KEY",
    nebius: "NEBIUS_API_KEY",
    zhipu: "ZHIPU_API_KEY",
    qwen: "DASHSCOPE_API_KEY",
  };
  return map[provider] ?? `${provider.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_API_KEY`;
}

/* ─── Export provider models for use in UI ─── */
export function getProviderModels(): Record<string, Array<{
  id: string;
  name: string;
  reasoning: boolean;
  input: Array<"text" | "image">;
  contextWindow: number;
}>> {
  const result: Record<string, Array<{ id: string; name: string; reasoning: boolean; input: Array<"text" | "image">; contextWindow: number }>> = {};
  for (const [provider, models] of Object.entries(PROVIDER_MODELS)) {
    result[provider] = models.map(m => ({
      id: m.id,
      name: m.name,
      reasoning: m.reasoning,
      input: m.input,
      contextWindow: m.contextWindow,
    }));
  }

  // Ensure OpenRouter is present as a generic aggregator if not already
  if (!result.openrouter) {
    result.openrouter = [{
      id: "auto",
      name: "Auto-select / Aggregator",
      reasoning: false,
      input: ["text", "image"],
      contextWindow: 128000,
    }];
  }

  return result;
}

/* ─── Convert wizard config to OpenClawConfigInput ─── */

/**
 * Converts the SunClaw setup wizard's saved config JSON
 * into the OpenClawConfigInput format for config generation.
 */
export function wizardConfigToInput(wizardConfig: Record<string, unknown>): OpenClawConfigInput {
  const input: OpenClawConfigInput = {
    channels: [],
    models: [],
    skills: [],
    agent: {
      name: "SunClaw",
      avatar: "☀️",
    },
    gateway: {
      bind: "lan",
    },
  };

  // Extract model provider
  const aiProvider = wizardConfig.aiProvider as Record<string, unknown> | undefined;
  if (aiProvider) {
    const provider = (aiProvider.provider as string) ?? "openai";
    const apiKey = (aiProvider.apiKey as string) ?? "";
    if (apiKey) {
      input.models.push({ provider, apiKey });
    }
  }

  // Extract channels
  const channels = wizardConfig.channels as Record<string, unknown> | undefined;
  if (channels) {
    // Telegram
    const telegram = channels.telegram as Record<string, unknown> | undefined;
    if (telegram?.enabled && telegram?.botToken) {
      input.channels.push({
        channel: "telegram",
        credentials: { botToken: telegram.botToken as string },
      });
    }

    // WhatsApp — Baileys-based, no API keys
    const whatsapp = channels.whatsapp as Record<string, unknown> | undefined;
    if (whatsapp?.enabled) {
      input.channels.push({
        channel: "whatsapp",
        credentials: { selfChatMode: (whatsapp.selfChatMode as boolean) ?? false },
      });
    }

    // Slack
    const slack = channels.slack as Record<string, unknown> | undefined;
    if (slack?.enabled && slack?.botToken && slack?.appToken) {
      input.channels.push({
        channel: "slack",
        credentials: {
          botToken: slack.botToken as string,
          appToken: slack.appToken as string,
          userToken: slack.userToken as string | undefined,
        },
      });
    }

    // Discord
    const discord = channels.discord as Record<string, unknown> | undefined;
    if (discord?.enabled && discord?.token) {
      input.channels.push({
        channel: "discord",
        credentials: { token: discord.token as string },
      });
    }

    // Signal
    const signal = channels.signal as Record<string, unknown> | undefined;
    if (signal?.enabled) {
      input.channels.push({
        channel: "signal",
        credentials: {
          account: signal.account as string | undefined,
          httpUrl: signal.httpUrl as string | undefined,
        },
      });
    }

    // MS Teams
    const msteams = channels.msteams as Record<string, unknown> | undefined;
    if (msteams?.enabled && msteams?.appId && msteams?.appPassword) {
      input.channels.push({
        channel: "msteams",
        credentials: {
          appId: msteams.appId as string,
          appPassword: msteams.appPassword as string,
          tenantId: msteams.tenantId as string | undefined,
        },
      });
    }
  }

  // Extract skills
  const skills = wizardConfig.skills as Array<Record<string, unknown>> | undefined;
  if (skills) {
    for (const skill of skills) {
      input.skills!.push({
        id: skill.id as string,
        enabled: (skill.enabled as boolean) ?? true,
        env: skill.env as Record<string, string> | undefined,
      });
    }
  }

  // Extract soul.md
  const soulMd = wizardConfig.soulMd as string | undefined;
  if (soulMd) {
    input.agent!.soulMd = soulMd;
  }

  return input;
}

/* ─── Validate config ─── */

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateOpenClawConfig(config: Record<string, unknown>): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check channels
  const channels = config.channels as Record<string, unknown> | undefined;
  if (channels) {
    // Telegram
    const telegram = channels.telegram as Record<string, unknown> | undefined;
    if (telegram?.enabled && !telegram?.botToken) {
      errors.push("channels.telegram: botToken is required when enabled");
    }

    // Slack
    const slack = channels.slack as Record<string, unknown> | undefined;
    if (slack?.enabled) {
      if (!slack?.botToken) errors.push("channels.slack: botToken is required when enabled");
      if (!slack?.appToken) errors.push("channels.slack: appToken is required for Socket Mode");
    }

    // Discord
    const discord = channels.discord as Record<string, unknown> | undefined;
    if (discord?.enabled && !discord?.token) {
      errors.push("channels.discord: token is required when enabled");
    }

    // MS Teams
    const msteams = channels.msteams as Record<string, unknown> | undefined;
    if (msteams?.enabled) {
      if (!msteams?.appId) errors.push("channels.msteams: appId is required when enabled");
      if (!msteams?.appPassword) errors.push("channels.msteams: appPassword is required when enabled");
    }

    // WhatsApp — no credentials needed (Baileys QR pairing)
    // Signal — optional credentials
  }

  // Check models
  const models = config.models as Record<string, unknown> | undefined;
  if (!models) {
    warnings.push("No model providers configured — OpenClaw will use defaults");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

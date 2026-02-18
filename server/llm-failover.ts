/**
 * Multi-Provider LLM Failover Engine
 * 
 * Supports ALL OpenClaw-compatible LLM providers.
 * Tries user-configured API keys in priority order.
 * If all fail, an error is thrown and the user is notified.
 * Every failover event is logged.
 */

import { eq, and, asc } from "drizzle-orm";
import { getDb } from "./db";
import { apiKeys, notifications, analyticsEvents } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";

/* ─── Provider Definitions ─── */

export type ApiFormat = "openai" | "anthropic";

export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  /** Default model to use if none specified */
  defaultModel: string;
  /** How to build the Authorization header */
  authHeader: (key: string) => string;
  /** API format: "openai" (default) or "anthropic" */
  apiFormat: ApiFormat;
  /** Environment variable name for the API key */
  envKey: string;
  /** Whether this provider offers a free tier */
  freeTier: boolean;
  /** Short description for UI */
  description: string;
  /** URL to get an API key */
  keyUrl: string;
  /** Placeholder text for key input */
  keyPlaceholder: string;
  /** Available models with display names */
  models: Array<{ id: string; name: string; tag?: string }>;
  /** Category for UI grouping */
  category: "builtin" | "custom" | "local" | "gateway";
}

export const PROVIDERS: Record<string, ProviderConfig> = {
  /* ═══════════════════════════════════════════════════════════════
   *  BUILT-IN PROVIDERS (pi-ai catalog — no custom config needed)
   * ═══════════════════════════════════════════════════════════════ */

  openai: {
    id: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
    authHeader: (key) => `Bearer ${key}`,
    apiFormat: "openai",
    envKey: "OPENAI_API_KEY",
    freeTier: false,
    description: "GPT-4o, GPT-4 Turbo, o3-mini. Industry standard.",
    keyUrl: "https://platform.openai.com/api-keys",
    keyPlaceholder: "sk-...",
    models: [
      { id: "gpt-4o", name: "GPT-4o", tag: "default" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", tag: "fast" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
      { id: "o3-mini", name: "o3-mini", tag: "reasoning" },
      { id: "gpt-5.1-codex", name: "GPT-5.1 Codex", tag: "latest" },
    ],
    category: "builtin",
  },

  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-sonnet-4-20250514",
    authHeader: (key) => key, // Uses x-api-key header
    apiFormat: "anthropic",
    envKey: "ANTHROPIC_API_KEY",
    freeTier: false,
    description: "Claude Opus, Sonnet, Haiku. Best for reasoning and safety.",
    keyUrl: "https://console.anthropic.com/settings/keys",
    keyPlaceholder: "sk-ant-...",
    models: [
      { id: "claude-opus-4-6", name: "Claude Opus 4", tag: "best" },
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", tag: "default" },
      { id: "claude-3.5-haiku-20241022", name: "Claude 3.5 Haiku", tag: "fast" },
    ],
    category: "builtin",
  },

  google: {
    id: "google",
    name: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    defaultModel: "gemini-2.0-flash",
    authHeader: (key) => `Bearer ${key}`,
    apiFormat: "openai",
    envKey: "GEMINI_API_KEY",
    freeTier: true,
    description: "Gemini 2.0 Flash, Pro. Free tier available with generous limits.",
    keyUrl: "https://aistudio.google.com/apikey",
    keyPlaceholder: "AIza...",
    models: [
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", tag: "default" },
      { id: "gemini-3-pro-preview", name: "Gemini 3 Pro Preview", tag: "latest" },
      { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", tag: "fast" },
    ],
    category: "builtin",
  },

  moonshot: {
    id: "moonshot",
    name: "Moonshot AI (Kimi)",
    baseUrl: "https://api.moonshot.ai/v1",
    defaultModel: "kimi-k2.5",
    authHeader: (key) => `Bearer ${key}`,
    apiFormat: "openai",
    envKey: "MOONSHOT_API_KEY",
    freeTier: true,
    description: "Kimi K2.5 — 500K free tokens/day. Excellent long-context and multilingual.",
    keyUrl: "https://platform.moonshot.cn/console/api-keys",
    keyPlaceholder: "sk-...",
    models: [
      { id: "kimi-k2.5", name: "Kimi K2.5", tag: "default" },
      { id: "kimi-k2-turbo-preview", name: "Kimi K2 Turbo", tag: "fast" },
      { id: "kimi-k2-thinking", name: "Kimi K2 Thinking", tag: "reasoning" },
      { id: "kimi-k2-thinking-turbo", name: "Kimi K2 Thinking Turbo" },
      { id: "kimi-k2-0905-preview", name: "Kimi K2 Preview" },
    ],
    category: "custom",
  },

  "kimi-coding": {
    id: "kimi-coding",
    name: "Kimi Code",
    baseUrl: "https://api.kimi.com/coding",
    defaultModel: "kimi-k2.5",
    authHeader: (key) => key, // Uses x-api-key header (Anthropic format)
    apiFormat: "anthropic",
    envKey: "KIMI_CODE_API_KEY",
    freeTier: true,
    description: "Kimi Code — Anthropic-compatible coding API. Separate from Moonshot. Keys start with sk-kimi-.",
    keyUrl: "https://www.kimi.com/code/en",
    keyPlaceholder: "sk-kimi-...",
    models: [
      { id: "kimi-k2.5", name: "Kimi K2.5", tag: "default" },
      { id: "kimi-k2-turbo-preview", name: "Kimi K2 Turbo", tag: "fast" },
    ],
    category: "custom",
  },

  groq: {
    id: "groq",
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    authHeader: (key) => `Bearer ${key}`,
    apiFormat: "openai",
    envKey: "GROQ_API_KEY",
    freeTier: true,
    description: "Ultra-fast inference on LPU hardware. Generous free tier.",
    keyUrl: "https://console.groq.com/keys",
    keyPlaceholder: "gsk_...",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", tag: "default" },
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", tag: "fast" },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", tag: "balanced" },
      { id: "gemma2-9b-it", name: "Gemma 2 9B" },
    ],
    category: "builtin",
  },

  cerebras: {
    id: "cerebras",
    name: "Cerebras",
    baseUrl: "https://api.cerebras.ai/v1",
    defaultModel: "llama3.3-70b",
    authHeader: (key) => `Bearer ${key}`,
    apiFormat: "openai",
    envKey: "CEREBRAS_API_KEY",
    freeTier: true,
    description: "Fastest inference available. Free tier with 30 RPM.",
    keyUrl: "https://cloud.cerebras.ai/",
    keyPlaceholder: "csk-...",
    models: [
      { id: "llama3.3-70b", name: "Llama 3.3 70B", tag: "default" },
      { id: "llama3.1-8b", name: "Llama 3.1 8B", tag: "fast" },
    ],
    category: "builtin",
  },

  mistral: {
    id: "mistral",
    name: "Mistral",
    baseUrl: "https://api.mistral.ai/v1",
    defaultModel: "mistral-large-latest",
    authHeader: (key) => `Bearer ${key}`,
    apiFormat: "openai",
    envKey: "MISTRAL_API_KEY",
    freeTier: true,
    description: "Mistral Large, Medium, Small. European AI with free tier.",
    keyUrl: "https://console.mistral.ai/api-keys",
    keyPlaceholder: "sk-...",
    models: [
      { id: "mistral-large-latest", name: "Mistral Large", tag: "default" },
      { id: "mistral-medium-latest", name: "Mistral Medium", tag: "balanced" },
      { id: "mistral-small-latest", name: "Mistral Small", tag: "fast" },
      { id: "codestral-latest", name: "Codestral", tag: "code" },
      { id: "open-mistral-nemo", name: "Mistral Nemo", tag: "free" },
    ],
    category: "builtin",
  },

  xai: {
    id: "xai",
    name: "xAI (Grok)",
    baseUrl: "https://api.x.ai/v1",
    defaultModel: "grok-2-latest",
    authHeader: (key) => `Bearer ${key}`,
    apiFormat: "openai",
    envKey: "XAI_API_KEY",
    freeTier: false,
    description: "Grok-2 by xAI. Strong at real-time knowledge.",
    keyUrl: "https://console.x.ai/",
    keyPlaceholder: "xai-...",
    models: [
      { id: "grok-2-latest", name: "Grok-2", tag: "default" },
      { id: "grok-2-mini", name: "Grok-2 Mini", tag: "fast" },
    ],
    category: "builtin",
  },

  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "anthropic/claude-sonnet-4-5",
    authHeader: (key) => `Bearer ${key}`,
    apiFormat: "openai",
    envKey: "OPENROUTER_API_KEY",
    freeTier: true,
    description: "200+ models through one API. Free models available. Pay per token.",
    keyUrl: "https://openrouter.ai/keys",
    keyPlaceholder: "sk-or-...",
    models: [
      { id: "anthropic/claude-sonnet-4-5", name: "Claude Sonnet 4.5", tag: "default" },
      { id: "openai/gpt-4o", name: "GPT-4o" },
      { id: "google/gemini-2.0-flash", name: "Gemini 2.0 Flash", tag: "fast" },
      { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B" },
      { id: "deepseek/deepseek-r1", name: "DeepSeek R1", tag: "reasoning" },
      { id: "nousresearch/hermes-3-llama-3.1-405b:free", name: "Hermes 3 405B", tag: "free" },
    ],
    category: "gateway",
  },

  venice: {
    id: "venice",
    name: "Venice AI",
    baseUrl: "https://api.venice.ai/api/v1",
    defaultModel: "llama-3.3-70b",
    authHeader: (key) => `Bearer ${key}`,
    apiFormat: "openai",
    envKey: "VENICE_API_KEY",
    freeTier: false,
    description: "Privacy-first inference. Zero data retention. Uncensored models.",
    keyUrl: "https://venice.ai/settings/api",
    keyPlaceholder: "venice-...",
    models: [
      { id: "llama-3.3-70b", name: "Llama 3.3 70B", tag: "default" },
      { id: "deepseek-r1-671b", name: "DeepSeek R1 671B", tag: "reasoning" },
    ],
    category: "builtin",
  },

  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    authHeader: (key) => `Bearer ${key}`,
    apiFormat: "openai",
    envKey: "DEEPSEEK_API_KEY",
    freeTier: false,
    description: "DeepSeek V3 and R1. Strong reasoning at low cost.",
    keyUrl: "https://platform.deepseek.com/api_keys",
    keyPlaceholder: "sk-...",
    models: [
      { id: "deepseek-chat", name: "DeepSeek V3", tag: "default" },
      { id: "deepseek-reasoner", name: "DeepSeek R1", tag: "reasoning" },
    ],
  },
  qwen: {
    id: "qwen",
    name: "Qwen (DashScope)",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    defaultModel: "qwen-max",
    authHeader: (key) => `Bearer ${key}`,
    apiFormat: "openai",
    envKey: "DASHSCOPE_API_KEY",
    freeTier: true,
    description: "Alibaba Qwen models. Strong multilingual support.",
    keyUrl: "https://dashscope.console.aliyun.com/apiKey",
    keyPlaceholder: "sk-...",
    models: [
      { id: "qwen-max", name: "Qwen Max", tag: "default" },
      { id: "qwen-plus", name: "Qwen Plus", tag: "balanced" },
      { id: "qwen-turbo", name: "Qwen Turbo", tag: "fast" },
    ],
    category: "builtin",
  },

  zai: {
    id: "zai",
    name: "Z.AI (GLM)",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    defaultModel: "glm-4.7",
    authHeader: (key) => `Bearer ${key}`,
    apiFormat: "openai",
    envKey: "ZAI_API_KEY",
    freeTier: true,
    description: "GLM-4 series by Zhipu AI. Free tier available. Strong multilingual.",
    keyUrl: "https://open.bigmodel.cn/usercenter/apikeys",
    keyPlaceholder: "sk-...",
    models: [
      { id: "glm-4.7", name: "GLM-4.7", tag: "default" },
      { id: "glm-4.6", name: "GLM-4.6" },
      { id: "glm-4-flash", name: "GLM-4 Flash", tag: "free" },
    ],
    category: "builtin",
  },

  opencode: {
    id: "opencode",
    name: "OpenCode Zen",
    baseUrl: "https://opencode.ai/api/v1",
    defaultModel: "claude-opus-4-6",
    authHeader: (key) => `Bearer ${key}`,
    apiFormat: "openai",
    envKey: "OPENCODE_API_KEY",
    freeTier: false,
    description: "Coding-focused proxy. Routes to Claude and GPT models.",
    keyUrl: "https://opencode.ai/settings",
    keyPlaceholder: "sk-...",
    models: [
      { id: "claude-opus-4-6", name: "Claude Opus 4 (via Zen)", tag: "default" },
      { id: "claude-sonnet-4", name: "Claude Sonnet 4 (via Zen)" },
    ],
    category: "builtin",
  },

  "vercel-ai-gateway": {
    id: "vercel-ai-gateway",
    name: "Vercel AI Gateway",
    baseUrl: "https://api.vercel.ai/v1",
    defaultModel: "anthropic/claude-sonnet-4",
    authHeader: (key) => `Bearer ${key}`,
    apiFormat: "openai",
    envKey: "AI_GATEWAY_API_KEY",
    freeTier: false,
    description: "Vercel's unified AI gateway. Route to multiple providers.",
    keyUrl: "https://vercel.com/dashboard/ai",
    keyPlaceholder: "vercel-...",
    models: [
      { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4", tag: "default" },
      { id: "openai/gpt-4o", name: "GPT-4o" },
    ],
    category: "gateway",
  },

  synthetic: {
    id: "synthetic",
    name: "Synthetic",
    baseUrl: "https://api.synthetic.new/anthropic",
    defaultModel: "hf:MiniMaxAI/MiniMax-M2.1",
    authHeader: (key) => key, // Uses x-api-key header (Anthropic format)
    apiFormat: "anthropic",
    envKey: "SYNTHETIC_API_KEY",
    freeTier: false,
    description: "Anthropic-compatible API. Access MiniMax and other models.",
    keyUrl: "https://synthetic.new/",
    keyPlaceholder: "syn-...",
    models: [
      { id: "hf:MiniMaxAI/MiniMax-M2.1", name: "MiniMax M2.1", tag: "default" },
    ],
    category: "custom",
  },

  minimax: {
    id: "minimax",
    name: "MiniMax",
    baseUrl: "https://api.minimax.io/anthropic",
    defaultModel: "MiniMax-M2.1",
    authHeader: (key) => key, // Uses x-api-key header (Anthropic format)
    apiFormat: "anthropic",
    envKey: "MINIMAX_API_KEY",
    freeTier: true,
    description: "MiniMax M2.1 — Anthropic-compatible API. Fast coding with 60-100 tps. Free coding plan available.",
    keyUrl: "https://platform.minimax.io",
    keyPlaceholder: "sk-cp-...",
    models: [
      { id: "MiniMax-M2.1", name: "MiniMax M2.1", tag: "default" },
      { id: "MiniMax-M2.1-lightning", name: "MiniMax M2.1 Lightning", tag: "fast" },
      { id: "MiniMax-M2", name: "MiniMax M2", tag: "reasoning" },
    ],
    category: "custom",
  },

  qwen: {
    id: "qwen",
    name: "Qwen (Alibaba)",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    defaultModel: "qwen-max",
    authHeader: (key) => `Bearer ${key}`,
    apiFormat: "openai",
    envKey: "DASHSCOPE_API_KEY",
    freeTier: true,
    description: "Alibaba's Qwen models. Free tier via DashScope. Strong multilingual.",
    keyUrl: "https://dashscope.console.aliyun.com/apiKey",
    keyPlaceholder: "sk-...",
    models: [
      { id: "qwen-max", name: "Qwen Max", tag: "default" },
      { id: "qwen-plus", name: "Qwen Plus", tag: "balanced" },
      { id: "qwen-turbo", name: "Qwen Turbo", tag: "fast" },
      { id: "qwen-vl-max", name: "Qwen VL Max", tag: "vision" },
    ],
    category: "custom",
  },

  qianfan: {
    id: "qianfan",
    name: "Qianfan (Baidu)",
    baseUrl: "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat",
    defaultModel: "ernie-bot-4",
    authHeader: (key) => `Bearer ${key}`,
    apiFormat: "openai",
    envKey: "QIANFAN_API_KEY",
    freeTier: true,
    description: "Baidu's ERNIE models. Free tier available. Strong at Chinese.",
    keyUrl: "https://cloud.baidu.com/product/wenxinworkshop",
    keyPlaceholder: "sk-...",
    models: [
      { id: "ernie-bot-4", name: "ERNIE Bot 4", tag: "default" },
      { id: "ernie-speed", name: "ERNIE Speed", tag: "fast" },
      { id: "ernie-lite", name: "ERNIE Lite", tag: "free" },
    ],
    category: "custom",
  },

  bedrock: {
    id: "bedrock",
    name: "Amazon Bedrock",
    baseUrl: "https://bedrock-runtime.us-east-1.amazonaws.com",
    defaultModel: "anthropic.claude-v2",
    authHeader: (key) => `Bearer ${key}`,
    apiFormat: "openai",
    envKey: "AWS_ACCESS_KEY_ID",
    freeTier: false,
    description: "AWS-managed models. Claude, Llama, Mistral via AWS.",
    keyUrl: "https://console.aws.amazon.com/bedrock/",
    keyPlaceholder: "AKIA...",
    models: [
      { id: "anthropic.claude-v2", name: "Claude v2", tag: "default" },
      { id: "meta.llama3-70b", name: "Llama 3 70B" },
      { id: "mistral.mistral-large", name: "Mistral Large" },
    ],
    category: "gateway",
  },

  "github-copilot": {
    id: "github-copilot",
    name: "GitHub Copilot",
    baseUrl: "https://api.githubcopilot.com/v1",
    defaultModel: "gpt-4o",
    authHeader: (key) => `Bearer ${key}`,
    apiFormat: "openai",
    envKey: "GITHUB_TOKEN",
    freeTier: false,
    description: "GitHub Copilot API. Requires Copilot subscription.",
    keyUrl: "https://github.com/settings/tokens",
    keyPlaceholder: "ghp_...",
    models: [
      { id: "gpt-4o", name: "GPT-4o (Copilot)", tag: "default" },
    ],
    category: "builtin",
  },

  ollama: {
    id: "ollama",
    name: "Ollama (Local)",
    baseUrl: "http://127.0.0.1:11434/v1",
    defaultModel: "llama3.3",
    authHeader: () => "",
    apiFormat: "openai",
    envKey: "",
    freeTier: true,
    description: "Run models locally. No API key needed. Free forever.",
    keyUrl: "https://ollama.ai",
    keyPlaceholder: "No key needed — runs locally",
    models: [
      { id: "llama3.3", name: "Llama 3.3", tag: "default" },
      { id: "llama3.1", name: "Llama 3.1" },
      { id: "codellama", name: "Code Llama", tag: "code" },
      { id: "mistral", name: "Mistral 7B", tag: "fast" },
      { id: "deepseek-r1:14b", name: "DeepSeek R1 14B", tag: "reasoning" },
      { id: "gemma2:9b", name: "Gemma 2 9B" },
    ],
    category: "local",
  },
};

/* ─── Helper: get providers sorted for display ─── */

/** Returns providers grouped by category with free-tier ones highlighted */
export function getProviderList() {
  return Object.values(PROVIDERS).map(p => ({
    id: p.id,
    name: p.name,
    defaultModel: p.defaultModel,
    freeTier: p.freeTier,
    description: p.description,
    keyUrl: p.keyUrl,
    keyPlaceholder: p.keyPlaceholder,
    models: p.models,
    category: p.category,
    envKey: p.envKey,
  }));
}

/* ─── Types ─── */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  failoverChain: string[];

}

/* ─── Core Failover Logic ─── */

/**
 * Send a chat completion request with automatic failover across providers.
 * Tries user keys in priority order with automatic failover.
 */
export async function chatWithFailover(
  userId: number,
  messages: ChatMessage[],
  options?: { preferredProvider?: string; model?: string }
): Promise<LLMResponse> {
  const db = await getDb();
  const failoverChain: string[] = [];
  let lastError = "";

  // 1. Get user's enabled API keys ordered by priority
  if (db) {
    const userKeys = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.userId, userId), eq(apiKeys.enabled, 1)))
      .orderBy(asc(apiKeys.priority));

    // If a preferred provider is specified, try it first
    const sortedKeys = options?.preferredProvider
      ? [
          ...userKeys.filter(k => k.provider === options.preferredProvider),
          ...userKeys.filter(k => k.provider !== options.preferredProvider),
        ]
      : userKeys;

    // 2. Try each key in order
    for (const keyRecord of sortedKeys) {
      let provider = PROVIDERS[keyRecord.provider];
      
      // Dynamic provider support for unknown providers
      if (!provider) {
        provider = {
          id: keyRecord.provider,
          name: keyRecord.label || keyRecord.provider,
          baseUrl: "https://api.openai.com/v1", // Default to OpenAI compatible
          defaultModel: options?.model || "gpt-4o-mini",
          authHeader: (key) => `Bearer ${key}`,
          apiFormat: "openai",
          envKey: `${keyRecord.provider.toUpperCase()}_API_KEY`,
          freeTier: false,
          description: "Dynamic provider",
          keyUrl: "",
          keyPlaceholder: "",
          models: [],
          category: "custom",
        };
      }

      failoverChain.push(provider.name);

      try {
        const result = await callProvider(
          provider,
          keyRecord.apiKey,
          messages,
          options?.model ?? provider.defaultModel
        );

        // Mark key as healthy
        await db
          .update(apiKeys)
          .set({ status: "healthy", lastCheckedAt: new Date(), lastError: null })
          .where(eq(apiKeys.id, keyRecord.id));

        // Track analytics
        await trackAnalyticsEvent(db, userId, "message_sent", {
          provider: provider.id,
          model: result.model,
        });

        return {
          content: result.content,
          model: result.model,
          provider: provider.id,
          usage: result.usage,
          failoverChain,

        };
      } catch (error: any) {
        lastError = error?.message ?? "Unknown error";

        // Mark key as failed
        await db
          .update(apiKeys)
          .set({
            status: "failed",
            lastCheckedAt: new Date(),
            lastError: lastError.slice(0, 500),
          })
          .where(eq(apiKeys.id, keyRecord.id));

        // Log the failover
        console.warn(`[LLM Failover] ${provider.name} failed: ${lastError}`);
      }
    }
  }
  // All configured providers exhausted
  if (db) {
    await db.insert(notifications).values({
      userId,
      type: "failover",
      title: "All LLM Providers Failed",
      message: `All configured LLM providers failed. Please check your API keys. Failover chain: ${failoverChain.join(" \u2192 ")}. Last error: ${lastError || "No providers configured"}`,
      severity: "error",
    });
    await trackAnalyticsEvent(db, userId, "failover_exhausted", {
      chain: failoverChain,
    });
  }
  throw new Error(
    `All LLM providers failed. Chain: ${failoverChain.join(" \u2192 ")}. Last error: ${lastError || "No providers configured"}`
  );
}
/* ─── Provider Call ─── */

async function callProvider(
  provider: ProviderConfig,
  apiKey: string,
  messages: ChatMessage[],
  model: string
): Promise<{ content: string; model: string; usage?: any }> {
  // Use Anthropic format for anthropic-format providers
  if (provider.apiFormat === "anthropic") {
    return callAnthropic(provider.baseUrl, apiKey, messages, model, provider.name);
  }

  // OpenAI-compatible API call (works for most providers)
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Ollama doesn't need auth
  if (provider.id !== "ollama" && apiKey) {
    headers["Authorization"] = provider.authHeader(apiKey);
  }

  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 4096,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const text = await res.text();
    // Provide human-readable error classification
    let errorPrefix = `${provider.name} API error ${res.status}`;
    if (res.status === 401) {
      errorPrefix = `${provider.name}: Invalid API key or authentication failed`;
    } else if (res.status === 403) {
      errorPrefix = `${provider.name}: Access forbidden — check API key permissions`;
    } else if (res.status === 429) {
      // Distinguish quota exhaustion from rate limiting
      const lower = text.toLowerCase();
      if (lower.includes("quota") || lower.includes("billing") || lower.includes("exceeded")) {
        errorPrefix = `${provider.name}: Quota exceeded — check your plan and billing`;
      } else {
        errorPrefix = `${provider.name}: Rate limited — too many requests, try again shortly`;
      }
    } else if (res.status === 404) {
      errorPrefix = `${provider.name}: Model not found — check model name "${model}"`;
    } else if (res.status >= 500) {
      errorPrefix = `${provider.name}: Server error (${res.status}) — provider may be experiencing issues`;
    }
    throw new Error(`${errorPrefix}. Details: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return {
    content: data.choices?.[0]?.message?.content ?? "",
    model: data.model ?? model,
    usage: data.usage,
  };
}

async function callAnthropic(
  baseUrl: string,
  apiKey: string,
  messages: ChatMessage[],
  model: string,
  providerName?: string
): Promise<{ content: string; model: string; usage?: any }> {
  const label = providerName ?? "Anthropic";
  // Extract system message
  const systemMsg = messages.find(m => m.role === "system");
  const nonSystemMsgs = messages.filter(m => m.role !== "system");

  const body: any = {
    model,
    max_tokens: 4096,
    messages: nonSystemMsgs.map(m => ({ role: m.role, content: m.content })),
  };
  if (systemMsg) {
    body.system = systemMsg.content;
  }

  // Build the messages endpoint URL
  // Some providers already include /messages or /v1/messages in their baseUrl
  let messagesUrl: string;
  if (baseUrl.endsWith("/messages")) {
    messagesUrl = baseUrl;
  } else if (baseUrl.endsWith("/v1")) {
    messagesUrl = `${baseUrl}/messages`;
  } else {
    // For providers like api.minimax.io/anthropic or api.kimi.com/coding
    messagesUrl = `${baseUrl}/v1/messages`;
  }

  const res = await fetch(messagesUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const text = await res.text();
    let errorPrefix = `${label} API error ${res.status}`;
    if (res.status === 401) {
      errorPrefix = `${label}: Invalid API key or authentication failed`;
    } else if (res.status === 403) {
      errorPrefix = `${label}: Access forbidden — check API key permissions`;
    } else if (res.status === 429) {
      const lower = text.toLowerCase();
      if (lower.includes("quota") || lower.includes("billing") || lower.includes("exceeded")) {
        errorPrefix = `${label}: Quota exceeded — check your plan and billing`;
      } else {
        errorPrefix = `${label}: Rate limited — too many requests, try again shortly`;
      }
    } else if (res.status === 404) {
      errorPrefix = `${label}: Endpoint not found — check API URL configuration`;
    } else if (res.status >= 500) {
      errorPrefix = `${label}: Server error (${res.status}) — provider may be experiencing issues`;
    }
    throw new Error(`${errorPrefix}. Details: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return {
    content: data.content?.[0]?.text ?? "",
    model: data.model ?? model,
    usage: data.usage
      ? {
          prompt_tokens: data.usage.input_tokens,
          completion_tokens: data.usage.output_tokens,
          total_tokens: data.usage.input_tokens + data.usage.output_tokens,
        }
      : undefined,
  };
}

/* ─── Health Checker ─── */

/**
 * Health-check a single API key by sending a minimal request.
 * Uses max_tokens=1 to minimize token consumption.
 */
export async function healthCheckKey(
  provider: ProviderConfig,
  apiKey: string
): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    await callProviderHealthCheck(provider, apiKey);
    return { healthy: true, latencyMs: Date.now() - start };
  } catch (error: any) {
    return { healthy: false, latencyMs: Date.now() - start, error: error?.message ?? "Unknown" };
  }
}

/**
 * Lightweight health check call — uses max_tokens=1 to minimize cost.
 */
async function callProviderHealthCheck(
  provider: ProviderConfig,
  apiKey: string
): Promise<void> {
  if (provider.apiFormat === "anthropic") {
    // Build the messages endpoint URL consistently
    let messagesUrl: string;
    if (provider.baseUrl.endsWith("/messages")) {
      messagesUrl = provider.baseUrl;
    } else if (provider.baseUrl.endsWith("/v1")) {
      messagesUrl = `${provider.baseUrl}/messages`;
    } else {
      // For providers like api.minimax.io/anthropic or api.kimi.com/coding
      messagesUrl = `${provider.baseUrl}/v1/messages`;
    }
    const res = await fetch(messagesUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: provider.defaultModel,
        max_tokens: 1,
        messages: [{ role: "user", content: "hi" }],
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const text = await res.text();
      let errorPrefix = `${provider.name} API error ${res.status}`;
      if (res.status === 401) errorPrefix = `${provider.name}: Invalid API key`;
      else if (res.status === 403) errorPrefix = `${provider.name}: Access forbidden — check API key permissions`;
      else if (res.status === 404) errorPrefix = `${provider.name}: Endpoint not found — check API URL`;
      else if (res.status === 429) {
        const lower = text.toLowerCase();
        errorPrefix = (lower.includes("quota") || lower.includes("billing") || lower.includes("exceeded"))
          ? `${provider.name}: Quota exceeded — check your plan and billing`
          : `${provider.name}: Rate limited — try again shortly`;
      } else if (res.status >= 500) errorPrefix = `${provider.name}: Server error`;
      throw new Error(`${errorPrefix}. Details: ${text.slice(0, 200)}`);
    }
    return;
  }

  // OpenAI-compatible health check
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (provider.id !== "ollama" && apiKey) {
    headers["Authorization"] = provider.authHeader(apiKey);
  }

  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: provider.defaultModel,
      max_tokens: 1,
      messages: [{ role: "user", content: "hi" }],
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const text = await res.text();
    let errorPrefix = `${provider.name} API error ${res.status}`;
    if (res.status === 401) errorPrefix = `${provider.name}: Invalid API key`;
    else if (res.status === 429) {
      const lower = text.toLowerCase();
      errorPrefix = (lower.includes("quota") || lower.includes("billing") || lower.includes("exceeded"))
        ? `${provider.name}: Quota exceeded — check your plan and billing`
        : `${provider.name}: Rate limited — try again shortly`;
    } else if (res.status === 404) errorPrefix = `${provider.name}: Model "${provider.defaultModel}" not found`;
    else if (res.status >= 500) errorPrefix = `${provider.name}: Server error`;
    throw new Error(`${errorPrefix}. Details: ${text.slice(0, 200)}`);
  }
}

/**
 * Health-check all of a user's API keys and update their status.
 */
export async function healthCheckAllKeys(userId: number): Promise<Array<{ provider: string; healthy: boolean; latencyMs: number; error?: string }>> {
  const db = await getDb();
  if (!db) return [];

  const userKeys = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, userId), eq(apiKeys.enabled, 1)))
    .orderBy(asc(apiKeys.priority));

  const results = [];

  for (const keyRecord of userKeys) {
    let provider = PROVIDERS[keyRecord.provider];
    if (!provider) {
      provider = {
        id: keyRecord.provider,
        name: keyRecord.label || keyRecord.provider,
        baseUrl: "https://api.openai.com/v1",
        defaultModel: "gpt-4o-mini",
        authHeader: (key) => `Bearer ${key}`,
        apiFormat: "openai",
        envKey: `${keyRecord.provider.toUpperCase()}_API_KEY`,
        freeTier: false,
        description: "Dynamic provider",
        keyUrl: "",
        keyPlaceholder: "",
        models: [],
        category: "custom",
      };
    }

    const result = await healthCheckKey(provider, keyRecord.apiKey);
    results.push({ provider: provider.id, ...result });

    await db
      .update(apiKeys)
      .set({
        status: result.healthy ? "healthy" : "failed",
        lastCheckedAt: new Date(),
        lastError: result.error ?? null,
      })
      .where(eq(apiKeys.id, keyRecord.id));
  }

  return results;
}

/* ─── Analytics Helper ─── */

async function trackAnalyticsEvent(
  db: any,
  userId: number,
  eventType: string,
  eventData: any
) {
  try {
    await db.insert(analyticsEvents).values({
      userId,
      eventType,
      eventData,
      eventTimestamp: Date.now(),
    });
  } catch {
    // Non-critical, don't fail the main operation
  }
}

/*
  DESIGN: "Command Center" — Mission Control Aesthetic
  PALETTE: Deep navy #0a0f1a, electric cyan #00d4ff, amber #f59e0b, green #10b981
  This is the MANAGED SETUP WIZARD — users configure everything through the UI.
  No CLI, no terminal, no Docker knowledge needed.
*/

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Copy, Eye, EyeOff,
  Cpu, MessageSquare, Shield, Zap, Globe, Sun,
  Loader2, CheckCircle2, ExternalLink,
  Bot, Radio, Server, Lock, Sparkles, LogOut, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import TelegramWizard from "@/components/TelegramWizard";
import { PLATFORMS, type PlatformId } from "@/lib/platforms";
import PlatformCard from "@/components/deploy-wizards/shared/PlatformCard";
import {
  RailwayWizard, RenderWizard, HostingerWizard, EmergentWizard,
  NorthflankWizard, CloudflareWizard, AlibabaWizard, DockerWizard,
} from "@/components/deploy-wizards";
import type { PlatformWizardProps } from "@/components/deploy-wizards";

/* ─── Types ─── */
interface WizardState {
  llmProvider: string;
  llmApiKey: string;
  llmModel: string;
  llmEndpoint: string;
  whatsappEnabled: boolean;
  whatsappPhone: string;
  telegramEnabled: boolean;
  telegramToken: string;
  slackEnabled: boolean;
  slackToken: string;
  discordEnabled: boolean;
  discordToken: string;
  webchatEnabled: boolean;
  kiishaEnabled: boolean;
  kiishaUrl: string;
  kiishaApiKey: string;
  webhookSecret: string;
  deployMethod: PlatformId | "";
  instanceName: string;
  showTelegramWizard: boolean;
}

const INITIAL_STATE: WizardState = {
  llmProvider: "",
  llmApiKey: "",
  llmModel: "",
  llmEndpoint: "",
  whatsappEnabled: true,
  whatsappPhone: "",
  telegramEnabled: false,
  telegramToken: "",
  slackEnabled: false,
  slackToken: "",
  discordEnabled: false,
  discordToken: "",
  webchatEnabled: true,
  kiishaEnabled: false,
  kiishaUrl: "https://app.kiisha.io",
  kiishaApiKey: "",
  webhookSecret: "",
  deployMethod: "",
  instanceName: "my-sunclaw",
  showTelegramWizard: false,
};

/* ─── Full OpenClaw Provider List ─── */
const LLM_PROVIDERS = [
  /* ── Recommended: Kimi (free tier!) ── */
  {
    id: "moonshot",
    name: "Moonshot AI (Kimi)",
    badge: "FREE TIER",
    badgeColor: "text-emerald border-emerald/30 bg-emerald/10",
    desc: "Kimi K2.5 — 500K free tokens/day. Excellent long-context and multilingual.",
    models: [
      { id: "moonshot/kimi-k2.5", label: "Kimi K2.5", tag: "default" },
      { id: "moonshot/kimi-k2-turbo-preview", label: "Kimi K2 Turbo", tag: "fast" },
      { id: "moonshot/kimi-k2-thinking", label: "Kimi K2 Thinking", tag: "reasoning" },
      { id: "moonshot/kimi-k2-thinking-turbo", label: "Kimi K2 Thinking Turbo", tag: "" },
      { id: "moonshot/kimi-k2-0905-preview", label: "Kimi K2 Preview", tag: "" },
    ],
    keyUrl: "https://platform.moonshot.cn/console/api-keys",
    keyPlaceholder: "sk-...",
  },
  {
    id: "kimi-coding",
    name: "Kimi Code",
    badge: "FREE TIER",
    badgeColor: "text-emerald border-emerald/30 bg-emerald/10",
    desc: "Kimi Code — Anthropic-compatible coding API. Separate from Moonshot. Keys start with sk-kimi-.",
    models: [
      { id: "kimi-coding/kimi-for-coding", label: "Kimi for Coding", tag: "default" },
    ],
    keyUrl: "https://www.kimi.com/code/en",
    keyPlaceholder: "sk-kimi-...",
  },
  /* ── Free Tier Providers ── */
  {
    id: "groq",
    name: "Groq",
    badge: "FREE TIER",
    badgeColor: "text-emerald border-emerald/30 bg-emerald/10",
    desc: "Ultra-fast inference on LPU hardware. Generous free tier.",
    models: [
      { id: "groq/llama-3.3-70b-versatile", label: "Llama 3.3 70B", tag: "default" },
      { id: "groq/llama-3.1-8b-instant", label: "Llama 3.1 8B", tag: "fast" },
      { id: "groq/mixtral-8x7b-32768", label: "Mixtral 8x7B", tag: "balanced" },
      { id: "groq/gemma2-9b-it", label: "Gemma 2 9B", tag: "" },
    ],
    keyUrl: "https://console.groq.com/keys",
    keyPlaceholder: "gsk_...",
  },
  {
    id: "cerebras",
    name: "Cerebras",
    badge: "FREE TIER",
    badgeColor: "text-emerald border-emerald/30 bg-emerald/10",
    desc: "Fastest inference available. Free tier with 30 RPM.",
    models: [
      { id: "cerebras/llama3.3-70b", label: "Llama 3.3 70B", tag: "default" },
      { id: "cerebras/llama3.1-8b", label: "Llama 3.1 8B", tag: "fast" },
    ],
    keyUrl: "https://cloud.cerebras.ai/",
    keyPlaceholder: "csk-...",
  },
  {
    id: "google",
    name: "Google Gemini",
    badge: "FREE TIER",
    badgeColor: "text-emerald border-emerald/30 bg-emerald/10",
    desc: "Gemini 2.0 Flash, Pro. Free tier with generous limits.",
    models: [
      { id: "google/gemini-2.0-flash", label: "Gemini 2.0 Flash", tag: "default" },
      { id: "google/gemini-3-pro-preview", label: "Gemini 3 Pro Preview", tag: "latest" },
      { id: "google/gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite", tag: "fast" },
    ],
    keyUrl: "https://aistudio.google.com/apikey",
    keyPlaceholder: "AIza...",
  },
  {
    id: "mistral",
    name: "Mistral",
    badge: "FREE TIER",
    badgeColor: "text-emerald border-emerald/30 bg-emerald/10",
    desc: "Mistral Large, Medium, Small. European AI with free tier.",
    models: [
      { id: "mistral/mistral-large-latest", label: "Mistral Large", tag: "default" },
      { id: "mistral/mistral-medium-latest", label: "Mistral Medium", tag: "balanced" },
      { id: "mistral/mistral-small-latest", label: "Mistral Small", tag: "fast" },
      { id: "mistral/codestral-latest", label: "Codestral", tag: "code" },
      { id: "mistral/open-mistral-nemo", label: "Mistral Nemo", tag: "free" },
    ],
    keyUrl: "https://console.mistral.ai/api-keys",
    keyPlaceholder: "sk-...",
  },
  {
    id: "zai",
    name: "Z.AI (GLM)",
    badge: "FREE TIER",
    badgeColor: "text-emerald border-emerald/30 bg-emerald/10",
    desc: "GLM-4 series by Zhipu AI. Free tier available. Strong multilingual.",
    models: [
      { id: "zai/glm-4.7", label: "GLM-4.7", tag: "default" },
      { id: "zai/glm-4.6", label: "GLM-4.6", tag: "" },
      { id: "zai/glm-4-flash", label: "GLM-4 Flash", tag: "free" },
    ],
    keyUrl: "https://open.bigmodel.cn/usercenter/apikeys",
    keyPlaceholder: "sk-...",
  },
  {
    id: "qwen",
    name: "Qwen (Alibaba)",
    badge: "FREE TIER",
    badgeColor: "text-emerald border-emerald/30 bg-emerald/10",
    desc: "Alibaba's Qwen models. Free tier via DashScope. Strong multilingual.",
    models: [
      { id: "qwen/qwen-max", label: "Qwen Max", tag: "default" },
      { id: "qwen/qwen-plus", label: "Qwen Plus", tag: "balanced" },
      { id: "qwen/qwen-turbo", label: "Qwen Turbo", tag: "fast" },
      { id: "qwen/qwen-vl-max", label: "Qwen VL Max", tag: "vision" },
    ],
    keyUrl: "https://dashscope.console.aliyun.com/apiKey",
    keyPlaceholder: "sk-...",
  },
  {
    id: "qianfan",
    name: "Qianfan (Baidu)",
    badge: "FREE TIER",
    badgeColor: "text-emerald border-emerald/30 bg-emerald/10",
    desc: "Baidu's ERNIE models. Free tier available. Strong at Chinese.",
    models: [
      { id: "qianfan/ernie-bot-4", label: "ERNIE Bot 4", tag: "default" },
      { id: "qianfan/ernie-speed", label: "ERNIE Speed", tag: "fast" },
      { id: "qianfan/ernie-lite", label: "ERNIE Lite", tag: "free" },
    ],
    keyUrl: "https://cloud.baidu.com/product/wenxinworkshop",
    keyPlaceholder: "sk-...",
  },
  /* ── Premium Providers ── */
  {
    id: "venice",
    name: "Venice AI",
    badge: "RECOMMENDED",
    badgeColor: "text-cyan border-cyan/30 bg-cyan/10",
    desc: "Privacy-first inference. Zero data retention. Uncensored models.",
    models: [
      { id: "venice/llama-3.3-70b", label: "Llama 3.3 70B", tag: "default" },
      { id: "venice/deepseek-r1-671b", label: "DeepSeek R1 671B", tag: "reasoning" },
    ],
    keyUrl: "https://venice.ai/settings/api",
    keyPlaceholder: "venice-...",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    badge: "",
    badgeColor: "",
    desc: "Claude Opus, Sonnet, Haiku. Best for reasoning and safety.",
    models: [
      { id: "anthropic/claude-opus-4-6", label: "Claude Opus 4", tag: "best" },
      { id: "anthropic/claude-sonnet-4-20250514", label: "Claude Sonnet 4", tag: "default" },
      { id: "anthropic/claude-3.5-haiku-20241022", label: "Claude 3.5 Haiku", tag: "fast" },
    ],
    keyUrl: "https://console.anthropic.com/settings/keys",
    keyPlaceholder: "sk-ant-...",
  },
  {
    id: "openai",
    name: "OpenAI",
    badge: "",
    badgeColor: "",
    desc: "GPT-4o, GPT-4 Turbo, Codex. Industry standard.",
    models: [
      { id: "openai/gpt-4o", label: "GPT-4o", tag: "default" },
      { id: "openai/gpt-4o-mini", label: "GPT-4o Mini", tag: "fast" },
      { id: "openai/gpt-4-turbo", label: "GPT-4 Turbo", tag: "" },
      { id: "openai/o3-mini", label: "o3-mini", tag: "reasoning" },
      { id: "openai/gpt-5.1-codex", label: "GPT-5.1 Codex", tag: "latest" },
    ],
    keyUrl: "https://platform.openai.com/api-keys",
    keyPlaceholder: "sk-...",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    badge: "",
    badgeColor: "",
    desc: "DeepSeek V3 and R1. Strong reasoning at low cost.",
    models: [
      { id: "deepseek/deepseek-chat", label: "DeepSeek V3", tag: "default" },
      { id: "deepseek/deepseek-reasoner", label: "DeepSeek R1", tag: "reasoning" },
    ],
    keyUrl: "https://platform.deepseek.com/api_keys",
    keyPlaceholder: "sk-...",
  },
  {
    id: "xai",
    name: "xAI (Grok)",
    badge: "",
    badgeColor: "",
    desc: "Grok-2 by xAI. Strong at real-time knowledge.",
    models: [
      { id: "xai/grok-2-latest", label: "Grok-2", tag: "default" },
      { id: "xai/grok-2-mini", label: "Grok-2 Mini", tag: "fast" },
    ],
    keyUrl: "https://console.x.ai/",
    keyPlaceholder: "xai-...",
  },
  /* ── Gateways & Aggregators ── */
  {
    id: "openrouter",
    name: "OpenRouter",
    badge: "MULTI-MODEL",
    badgeColor: "text-amber border-amber/30 bg-amber/10",
    desc: "200+ models through one API. Free models available. Pay per token.",
    models: [
      { id: "openrouter/anthropic/claude-sonnet-4-5", label: "Claude Sonnet 4.5", tag: "default" },
      { id: "openrouter/openai/gpt-4o", label: "GPT-4o", tag: "" },
      { id: "openrouter/google/gemini-2.0-flash", label: "Gemini 2.0 Flash", tag: "fast" },
      { id: "openrouter/meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B", tag: "" },
      { id: "openrouter/deepseek/deepseek-r1", label: "DeepSeek R1", tag: "reasoning" },
      { id: "openrouter/nousresearch/hermes-3-llama-3.1-405b:free", label: "Hermes 3 405B", tag: "free" },
    ],
    keyUrl: "https://openrouter.ai/keys",
    keyPlaceholder: "sk-or-...",
  },
  {
    id: "vercel-ai-gateway",
    name: "Vercel AI Gateway",
    badge: "",
    badgeColor: "",
    desc: "Vercel's unified AI gateway. Route to multiple providers.",
    models: [
      { id: "vercel/anthropic/claude-sonnet-4", label: "Claude Sonnet 4", tag: "default" },
      { id: "vercel/openai/gpt-4o", label: "GPT-4o", tag: "" },
    ],
    keyUrl: "https://vercel.com/dashboard/ai",
    keyPlaceholder: "vercel-...",
  },
  /* ── Specialty Providers ── */
  {
    id: "opencode",
    name: "OpenCode Zen",
    badge: "",
    badgeColor: "",
    desc: "Coding-focused proxy. Routes to Claude and GPT models.",
    models: [
      { id: "opencode/claude-opus-4-6", label: "Claude Opus 4 (via Zen)", tag: "default" },
      { id: "opencode/claude-sonnet-4", label: "Claude Sonnet 4 (via Zen)", tag: "" },
    ],
    keyUrl: "https://opencode.ai/settings",
    keyPlaceholder: "sk-...",
  },
  {
    id: "synthetic",
    name: "Synthetic",
    badge: "",
    badgeColor: "",
    desc: "Anthropic-compatible API. Access MiniMax and other models.",
    models: [
      { id: "synthetic/hf:MiniMaxAI/MiniMax-M2.1", label: "MiniMax M2.1", tag: "default" },
    ],
    keyUrl: "https://synthetic.new/",
    keyPlaceholder: "syn-...",
  },
  {
    id: "minimax",
    name: "MiniMax",
    badge: "FREE TIER",
    badgeColor: "text-emerald border-emerald/30 bg-emerald/10",
    desc: "MiniMax M2.1 — Anthropic-compatible API. Fast coding with 60-100 tps. Free coding plan available.",
    models: [
      { id: "minimax/MiniMax-M2.1", label: "MiniMax M2.1", tag: "default" },
      { id: "minimax/MiniMax-M2.1-lightning", label: "MiniMax M2.1 Lightning", tag: "fast" },
      { id: "minimax/MiniMax-M2", label: "MiniMax M2", tag: "reasoning" },
    ],
    keyUrl: "https://platform.minimax.io",
    keyPlaceholder: "sk-cp-...",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    badge: "",
    badgeColor: "",
    desc: "GitHub Copilot API. Requires Copilot subscription.",
    models: [
      { id: "github-copilot/gpt-4o", label: "GPT-4o (Copilot)", tag: "default" },
    ],
    keyUrl: "https://github.com/settings/tokens",
    keyPlaceholder: "ghp_...",
  },
  /* ── Enterprise ── */
  {
    id: "bedrock",
    name: "Amazon Bedrock",
    badge: "ENTERPRISE",
    badgeColor: "text-cyan border-cyan/30 bg-cyan/10",
    desc: "AWS-managed models. Claude, Llama, Mistral via AWS.",
    models: [
      { id: "bedrock/anthropic.claude-v2", label: "Claude v2", tag: "default" },
      { id: "bedrock/meta.llama3-70b", label: "Llama 3 70B", tag: "" },
      { id: "bedrock/mistral.mistral-large", label: "Mistral Large", tag: "" },
    ],
    keyUrl: "https://console.aws.amazon.com/bedrock/",
    keyPlaceholder: "AKIA...",
  },
  /* ── Local ── */
  {
    id: "ollama",
    name: "Ollama (Local)",
    badge: "FREE",
    badgeColor: "text-emerald border-emerald/30 bg-emerald/10",
    desc: "Run models locally. No API key needed. Free forever.",
    models: [
      { id: "ollama/llama3.3", label: "Llama 3.3", tag: "default" },
      { id: "ollama/llama3.1", label: "Llama 3.1", tag: "" },
      { id: "ollama/codellama", label: "Code Llama", tag: "code" },
      { id: "ollama/mistral", label: "Mistral 7B", tag: "fast" },
      { id: "ollama/deepseek-r1:14b", label: "DeepSeek R1 14B", tag: "reasoning" },
      { id: "ollama/gemma2:9b", label: "Gemma 2 9B", tag: "" },
    ],
    keyUrl: "",
    keyPlaceholder: "No key needed — runs locally",
  },
];

const CHANNELS = [
  { id: "whatsapp" as const, name: "WhatsApp", icon: MessageSquare, desc: "Connect via WhatsApp Web — scan QR code after deploy", color: "text-green-400", needsToken: false, needsPhone: true },
  { id: "telegram" as const, name: "Telegram", icon: Bot, desc: "Create a bot via @BotFather and paste the token", color: "text-blue-400", needsToken: true, needsPhone: false },
  { id: "slack" as const, name: "Slack", icon: Radio, desc: "Create a Slack app and paste the Bot User OAuth Token", color: "text-purple-400", needsToken: true, needsPhone: false },
  { id: "discord" as const, name: "Discord", icon: Globe, desc: "Create a Discord bot and paste the bot token", color: "text-indigo-400", needsToken: true, needsPhone: false },
  { id: "webchat" as const, name: "Web Chat", icon: MessageSquare, desc: "Built-in web chat widget — no setup needed", color: "text-cyan", needsToken: false, needsPhone: false },
];

const STEPS = [
  { id: 1, title: "AI Provider", subtitle: "Choose your LLM", icon: Cpu },
  { id: 2, title: "Channels", subtitle: "Connect messaging", icon: MessageSquare },
  { id: 3, title: "KIISHA", subtitle: "Enterprise unlock", icon: Shield },
  { id: 4, title: "Deploy", subtitle: "Go live", icon: Zap },
];

/* ─── Helpers ─── */
function generateSecret(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function SecretInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border border-border/60 bg-background/60 text-sm font-mono focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

/* ─── Step 1: LLM Provider ─── */
function StepLLM({ state, setState }: { state: WizardState; setState: (s: WizardState) => void }) {
  const selectedProvider = LLM_PROVIDERS.find((p) => p.id === state.llmProvider);
  const [showAll, setShowAll] = useState(false);

  // Show top 5 by default, all on expand
  const visibleProviders = showAll ? LLM_PROVIDERS : LLM_PROVIDERS.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Choose Your AI Provider</h3>
        <p className="text-muted-foreground text-sm">
          SunClaw uses OpenClaw's model routing. Pick a provider — your key stays on your server, never sent to us.
          Use <span className="text-cyan font-mono text-xs">provider/model</span> format.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {visibleProviders.map((provider) => (
          <button
            key={provider.id}
            onClick={() =>
              setState({
                ...state,
                llmProvider: provider.id,
                llmModel: provider.models.find((m) => m.tag === "default")?.id || provider.models[0]?.id || "",
                llmEndpoint: "",
              })
            }
            className={`text-left p-4 rounded-lg border transition-all ${
              state.llmProvider === provider.id
                ? "border-cyan/60 bg-cyan/5 ring-1 ring-cyan/20"
                : "border-border/50 bg-card/30 hover:border-border"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="font-semibold text-sm">{provider.name}</div>
              {provider.badge && (
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${provider.badgeColor}`}>
                  {provider.badge}
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{provider.desc}</div>
          </button>
        ))}
      </div>

      {!showAll && LLM_PROVIDERS.length > 6 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 text-xs font-mono text-cyan hover:text-cyan/80 transition-colors border border-border/30 rounded-lg hover:border-cyan/30"
        >
          Show {LLM_PROVIDERS.length - 6} more providers...
        </button>
      )}
      {showAll && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full py-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors border border-border/30 rounded-lg"
        >
          Show fewer
        </button>
      )}

      {state.llmProvider && selectedProvider && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-4"
        >
          {/* API Key — skip for Ollama */}
          {selectedProvider.id !== "ollama" ? (
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">API Key</label>
              <SecretInput
                value={state.llmApiKey}
                onChange={(v) => setState({ ...state, llmApiKey: v })}
                placeholder={selectedProvider.keyPlaceholder}
              />
              {selectedProvider.keyUrl && (
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Get your key from{" "}
                  <a href={selectedProvider.keyUrl} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">
                    {selectedProvider.name} Dashboard <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-emerald/20 bg-emerald/5 p-4">
              <p className="text-sm text-emerald">
                <CheckCircle2 className="w-4 h-4 inline mr-1.5" />
                No API key needed. Ollama runs locally on your machine. Make sure Ollama is installed and running on the same server as SunClaw.
              </p>
            </div>
          )}

          {/* Model Selection */}
          <div>
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">Model</label>
            <div className="flex flex-wrap gap-2">
              {selectedProvider.models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setState({ ...state, llmModel: model.id })}
                  className={`px-3 py-2 rounded-md text-xs border transition-all ${
                    state.llmModel === model.id
                      ? "border-cyan/60 bg-cyan/10 text-cyan"
                      : "border-border/50 text-muted-foreground hover:border-border"
                  }`}
                >
                  <span className="font-mono">{model.label}</span>
                  {model.tag && (
                    <span className={`ml-1.5 text-[9px] px-1 py-0.5 rounded ${
                      model.tag === "best" ? "bg-amber/10 text-amber" :
                      model.tag === "default" ? "bg-cyan/10 text-cyan" :
                      model.tag === "fast" ? "bg-emerald/10 text-emerald" :
                      model.tag === "reasoning" ? "bg-purple-400/10 text-purple-400" :
                      model.tag === "code" ? "bg-blue-400/10 text-blue-400" :
                      "bg-secondary/50 text-muted-foreground"
                    }`}>
                      {model.tag}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-mono">
              Selected: <span className="text-foreground">{state.llmModel || "none"}</span>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Step 2: Channels ─── */
function StepChannels({ state, setState }: { state: WizardState; setState: (s: WizardState) => void }) {
  const toggleChannel = (id: string) => {
    const key = `${id}Enabled` as keyof WizardState;
    setState({ ...state, [key]: !state[key as keyof WizardState] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Connect Messaging Channels</h3>
        <p className="text-muted-foreground text-sm">Enable the channels you want SunClaw to respond on. You can add more later. WhatsApp and Web Chat are enabled by default.</p>
      </div>

      <div className="space-y-3">
        {CHANNELS.map((ch) => {
          const enabled = state[`${ch.id}Enabled` as keyof WizardState] as boolean;
          return (
            <div key={ch.id} className={`rounded-lg border p-4 transition-all ${enabled ? "border-border/60 bg-card/30" : "border-border/30 bg-card/10 opacity-60"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ch.icon className={`w-5 h-5 ${ch.color}`} />
                  <div>
                    <div className="text-sm font-semibold">{ch.name}</div>
                    <div className="text-xs text-muted-foreground">{ch.desc}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleChannel(ch.id)}
                  className={`w-11 h-6 rounded-full transition-all relative ${enabled ? "bg-cyan" : "bg-secondary"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${enabled ? "left-6" : "left-1"}`} />
                </button>
              </div>

              {enabled && ch.needsToken && ch.id === "telegram" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-2">
                  {state.telegramToken ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald" />
                      <span className="text-xs text-emerald font-mono">Token configured</span>
                      <button
                        onClick={() => setState({ ...state, telegramToken: "", showTelegramWizard: true })}
                        className="text-xs text-cyan hover:underline ml-auto"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setState({ ...state, showTelegramWizard: true })}
                      className="w-full border-cyan/30 text-cyan hover:bg-cyan/5 gap-2"
                    >
                      <Bot className="w-4 h-4" />
                      Open BotFather Setup Guide
                    </Button>
                  )}
                </motion.div>
              )}

              {enabled && ch.needsToken && ch.id !== "telegram" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3">
                  <SecretInput
                    value={state[`${ch.id}Token` as keyof WizardState] as string}
                    onChange={(v) => setState({ ...state, [`${ch.id}Token`]: v })}
                    placeholder={`${ch.name} bot token`}
                  />
                </motion.div>
              )}

              {enabled && ch.needsPhone && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    <Sun className="w-3 h-3 inline mr-1" />
                    WhatsApp connects via QR code after deployment. Use a dedicated phone number for your SunClaw bot.
                  </p>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Telegram BotFather Wizard Dialog */}
      <TelegramWizard
        open={state.showTelegramWizard}
        onOpenChange={(open) => setState({ ...state, showTelegramWizard: open })}
        onConnect={({ botToken }) => {
          setState({ ...state, telegramToken: botToken, showTelegramWizard: false });
          toast.success("Telegram bot token configured!");
        }}
        isConnecting={false}
      />
    </div>
  );
}

/* ─── Step 3: KIISHA ─── */
function StepKiisha({ state, setState }: { state: WizardState; setState: (s: WizardState) => void }) {
  useEffect(() => {
    if (state.kiishaEnabled && !state.webhookSecret) {
      setState({ ...state, webhookSecret: generateSecret() });
    }
  }, [state.kiishaEnabled]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Connect to KIISHA</h3>
        <p className="text-muted-foreground text-sm">
          Optional. Link your KIISHA account to unlock enterprise features — portfolio management, document compliance, VATR, ticketing, and more. Skip this if you just want the standalone renewable energy AI.
        </p>
      </div>

      <div className={`rounded-lg border p-5 transition-all ${state.kiishaEnabled ? "border-amber/40 bg-amber/5" : "border-border/40 bg-card/20"}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className={`w-5 h-5 ${state.kiishaEnabled ? "text-amber" : "text-muted-foreground"}`} />
            <div>
              <div className="text-sm font-semibold">KIISHA Enterprise</div>
              <div className="text-xs text-muted-foreground">Unlock 8 enterprise skills</div>
            </div>
          </div>
          <button
            onClick={() => setState({ ...state, kiishaEnabled: !state.kiishaEnabled })}
            className={`w-11 h-6 rounded-full transition-all relative ${state.kiishaEnabled ? "bg-amber" : "bg-secondary"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${state.kiishaEnabled ? "left-6" : "left-1"}`} />
          </button>
        </div>

        {state.kiishaEnabled && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">KIISHA URL</label>
              <input
                type="text"
                value={state.kiishaUrl}
                onChange={(e) => setState({ ...state, kiishaUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-border/60 bg-background/60 text-sm font-mono focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">KIISHA API Key</label>
              <SecretInput
                value={state.kiishaApiKey}
                onChange={(v) => setState({ ...state, kiishaApiKey: v })}
                placeholder="Generate from KIISHA Settings → API Keys"
              />
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Go to <a href="https://app.kiisha.io/settings/api" target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">KIISHA Settings → API Keys <ExternalLink className="w-3 h-3 inline" /></a> to generate a key.
              </p>
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">Webhook Secret</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={state.webhookSecret}
                  readOnly
                  className="flex-1 px-4 py-3 rounded-lg border border-border/60 bg-background/60 text-[11px] font-mono text-muted-foreground focus:outline-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState({ ...state, webhookSecret: generateSecret() })}
                  className="border-border/60 text-xs"
                >
                  Regenerate
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">Auto-generated. Set this same value in your KIISHA Railway environment as <span className="font-mono text-foreground/70">OPENCLAW_WEBHOOK_SECRET</span>.</p>
            </div>
          </motion.div>
        )}
      </div>

      {!state.kiishaEnabled && (
        <div className="rounded-lg border border-border/30 bg-card/10 p-4">
          <p className="text-xs text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 inline mr-1.5 text-cyan" />
            Without KIISHA, you still get all 6 standalone renewable energy skills (solar irradiance, LCOE calculator, wind turbine specs, grid status, IRENA search, carbon calculator) plus all of OpenClaw's 50+ built-in skills.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Deploy Status Panel ─── */
/* ─── Platform Wizard Router ─── */
function PlatformWizardRouter({ platformId, ...props }: { platformId: PlatformId } & PlatformWizardProps) {
  switch (platformId) {
    case "railway": return <RailwayWizard {...props} />;
    case "render": return <RenderWizard {...props} />;
    case "hostinger": return <HostingerWizard {...props} />;
    case "emergent": return <EmergentWizard {...props} />;
    case "northflank": return <NorthflankWizard {...props} />;
    case "cloudflare": return <CloudflareWizard {...props} />;
    case "alibaba": return <AlibabaWizard {...props} />;
    case "docker": return <DockerWizard {...props} />;
    default: return null;
  }
}

/* ─── Step 4: Deploy ─── */
function StepDeploy({ state, setState }: { state: WizardState; setState: (s: WizardState) => void }) {
  const { data: billingStatus } = trpc.billing.status.useQuery();
  const userPlan = billingStatus?.plan ?? "free";

  // Map wizard LLM provider to the correct provider-specific env var name
  const LLM_PROVIDER_ENV_MAP: Record<string, string> = {
    openai: "OPENAI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    venice: "VENICE_API_KEY",
    google: "GOOGLE_API_KEY",
    openrouter: "OPENROUTER_API_KEY",
    xai: "XAI_API_KEY",
    "kimi-coding": "ANTHROPIC_API_KEY",
    moonshot: "MOONSHOT_API_KEY",
  };

  const buildEnvVars = (): Record<string, string> => {
    const vars: Record<string, string> = {
      WHATSAPP_ENABLED: String(state.whatsappEnabled),
      TELEGRAM_ENABLED: String(state.telegramEnabled),
      SLACK_ENABLED: String(state.slackEnabled),
      DISCORD_ENABLED: String(state.discordEnabled),
      KIISHA_ENABLED: String(state.kiishaEnabled),
      INSTANCE_NAME: state.instanceName,
    };

    if (state.llmApiKey && state.llmProvider) {
      const envKey = LLM_PROVIDER_ENV_MAP[state.llmProvider.toLowerCase()];
      if (envKey) {
        vars[envKey] = state.llmApiKey;
      } else {
        vars.LLM_API_KEY = state.llmApiKey;
        vars[`${state.llmProvider.toUpperCase()}_API_KEY`] = state.llmApiKey;
      }
    }

    if (state.telegramEnabled && state.telegramToken) vars.TELEGRAM_BOT_TOKEN = state.telegramToken;
    if (state.slackEnabled && state.slackToken) vars.SLACK_BOT_TOKEN = state.slackToken;
    if (state.discordEnabled && state.discordToken) vars.DISCORD_BOT_TOKEN = state.discordToken;
    if (state.kiishaEnabled) {
      vars.KIISHA_API_URL = state.kiishaUrl;
      if (state.kiishaApiKey) vars.KIISHA_API_KEY = state.kiishaApiKey;
      if (state.webhookSecret) vars.OPENCLAW_WEBHOOK_SECRET = state.webhookSecret;
    }
    return vars;
  };

  const envContent = `# SunClaw Configuration — Generated by Setup Wizard
# ─── AI Provider ───
LLM_PROVIDER=${state.llmProvider}
LLM_API_KEY=${state.llmApiKey || "your-api-key-here"}
LLM_MODEL=${state.llmModel}

# ─── Channels ───
WHATSAPP_ENABLED=${state.whatsappEnabled}
TELEGRAM_ENABLED=${state.telegramEnabled}
${state.telegramEnabled ? `TELEGRAM_BOT_TOKEN=${state.telegramToken}` : "# TELEGRAM_BOT_TOKEN="}
SLACK_ENABLED=${state.slackEnabled}
${state.slackEnabled ? `SLACK_BOT_TOKEN=${state.slackToken}` : "# SLACK_BOT_TOKEN="}
DISCORD_ENABLED=${state.discordEnabled}
${state.discordEnabled ? `DISCORD_BOT_TOKEN=${state.discordToken}` : "# DISCORD_BOT_TOKEN="}

# ─── KIISHA Enterprise ───
KIISHA_ENABLED=${state.kiishaEnabled}
${state.kiishaEnabled ? `KIISHA_API_URL=${state.kiishaUrl}\nKIISHA_API_KEY=${state.kiishaApiKey}\nOPENCLAW_WEBHOOK_SECRET=${state.webhookSecret}` : "# KIISHA_API_URL=\n# KIISHA_API_KEY=\n# OPENCLAW_WEBHOOK_SECRET="}

# ─── Dashboard ───
DASHBOARD_PORT=3001
GATEWAY_PORT=3000
INSTANCE_NAME=${state.instanceName}`;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Deploy SunClaw</h3>
        <p className="text-muted-foreground text-sm">Choose your deployment platform. All options use the configuration from Steps 1-3.</p>
      </div>

      <div>
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">Instance Name</label>
        <input
          type="text"
          value={state.instanceName}
          onChange={(e) => setState({ ...state, instanceName: e.target.value })}
          placeholder="my-sunclaw"
          className="w-full px-4 py-3 rounded-lg border border-border/60 bg-background/60 text-sm font-mono focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20"
        />
      </div>

      {/* Platform selection grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PLATFORMS.map((platform) => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            selected={state.deployMethod === platform.id}
            onClick={() => setState({ ...state, deployMethod: platform.id })}
            mode="wizard"
          />
        ))}
      </div>

      {/* Selected platform wizard */}
      <AnimatePresence mode="wait">
        {state.deployMethod && (
          <motion.div
            key={state.deployMethod}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <PlatformWizardRouter
              platformId={state.deployMethod}
              wizardState={state}
              buildEnvVars={buildEnvVars}
              envContent={envContent}
              userPlan={userPlan}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Wizard ─── */
export default function Setup() {
  // Check for ?platform= query param to pre-select a deployment platform
  const preSelectedPlatform = new URLSearchParams(window.location.search).get("platform") as PlatformId | null;
  const validPlatform = preSelectedPlatform && PLATFORMS.some(p => p.id === preSelectedPlatform) ? preSelectedPlatform : null;

  const [step, setStep] = useState(validPlatform ? 4 : 1);
  const [state, setState] = useState<WizardState>({
    ...INITIAL_STATE,
    deployMethod: validPlatform || "",
  });
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [savedConfigId, setSavedConfigId] = useState<number | null>(null);

  // Load existing configs
  const { data: existingConfigs } = trpc.config.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // Save config mutation
  const saveConfigMutation = trpc.config.save.useMutation({
    onSuccess: (data) => {
      setSavedConfigId(data.id);
      toast.success("Configuration saved!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save configuration");
    },
  });

  // Update config mutation
  const updateConfigMutation = trpc.config.update.useMutation({
    onSuccess: () => {
      toast.success("Configuration updated!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update configuration");
    },
  });

  // Deploy mutation
  const createDeployMutation = trpc.deploy.create.useMutation({
    onSuccess: () => {
      toast.success("Deployment recorded!");
    },
  });

  // Load most recent config on mount
  useEffect(() => {
    if (existingConfigs && existingConfigs.length > 0) {
      const latest = existingConfigs[0];
      try {
        const savedConfig = latest.config as Record<string, unknown>;
        setState((prev) => ({ ...prev, ...savedConfig }));
        setSavedConfigId(latest.id);
      } catch {
        // ignore parse errors
      }
    }
  }, [existingConfigs]);

  const handleLogout = async () => {
    await logout();
    setLocation("/auth");
  };

  const handleSaveConfig = () => {
    const configData = { ...state } as Record<string, unknown>;
    if (savedConfigId) {
      updateConfigMutation.mutate({ id: savedConfigId, config: configData });
    } else {
      saveConfigMutation.mutate({
        name: state.instanceName || "My SunClaw",
        config: configData,
      });
    }
  };

  const canAdvance = () => {
    switch (step) {
      case 1: return state.llmProvider !== "" && (state.llmProvider === "ollama" || state.llmApiKey !== "");
      case 2: return true;
      case 3: return true;
      case 4: return state.deployMethod !== "";
      default: return false;
    }
  };

  const stepComponents = [
    <StepLLM state={state} setState={setState} />,
    <StepChannels state={state} setState={setState} />,
    <StepKiisha state={state} setState={setState} />,
    <StepDeploy state={state} setState={setState} />,
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan to-amber flex items-center justify-center">
              <span className="text-background font-bold text-sm">SC</span>
            </div>
            <span className="font-bold text-lg tracking-tight">SunClaw</span>
            <span className="text-xs font-mono text-muted-foreground ml-2">Setup Wizard</span>
          </a>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-xs text-muted-foreground font-mono hidden sm:block">
                {user.email || user.name || 'User'}
              </span>
            )}
            <Button variant="outline" size="sm" className="border-border/60 gap-2" onClick={handleSaveConfig} disabled={saveConfigMutation.isPending || updateConfigMutation.isPending}>
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{saveConfigMutation.isPending || updateConfigMutation.isPending ? 'Saving...' : 'Save'}</span>
            </Button>
            <Button variant="outline" size="sm" className="border-border/60 gap-2" onClick={handleLogout}>
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-10">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => s.id <= step && setStep(s.id)}
                  className={`flex items-center gap-2.5 ${s.id <= step ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      s.id < step
                        ? "bg-emerald/20 border border-emerald/30"
                        : s.id === step
                        ? "bg-cyan/10 border border-cyan/40 ring-2 ring-cyan/20"
                        : "bg-card/30 border border-border/40"
                    }`}
                  >
                    {s.id < step ? (
                      <Check className="w-4 h-4 text-emerald" />
                    ) : (
                      <s.icon className={`w-4 h-4 ${s.id === step ? "text-cyan" : "text-muted-foreground"}`} />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className={`text-xs font-semibold ${s.id === step ? "text-foreground" : "text-muted-foreground"}`}>
                      {s.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{s.subtitle}</div>
                  </div>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`hidden sm:block w-12 lg:w-20 h-px mx-3 ${i < step - 1 ? "bg-emerald/40" : "bg-border/40"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-border/50 bg-card/20 p-6 md:p-8"
            >
              {stepComponents[step - 1]}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="gap-2 border-border/60"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="text-xs font-mono text-muted-foreground">
              Step {step} of {STEPS.length}
            </div>

            {step < STEPS.length ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canAdvance()}
                className="gap-2 bg-cyan text-background hover:bg-cyan/90"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <div className="w-20" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

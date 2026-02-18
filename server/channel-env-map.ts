/**
 * Channel configuration management for OpenClaw deployments.
 *
 * ARCHITECTURE CHANGE: OpenClaw configures channels via openclaw.json,
 * NOT via environment variables. The old approach of setting TELEGRAM_BOT_TOKEN
 * etc. as Railway env vars was incorrect — OpenClaw ignores those.
 *
 * The correct flow:
 *   1. User provides channel credentials via SunClaw UI
 *   2. SunClaw stores credentials in the channelConnections DB table
 *   3. When connecting/disconnecting, SunClaw rebuilds the full openclaw.json
 *      from all active channels + models + skills
 *   4. The config is pushed to the deployed Gateway via its control plane API
 *   5. Gateway reloads channels without a full redeploy
 *
 * Only model API keys are set as Railway env vars (OpenClaw reads those from env).
 */

import {
  type OpenClawConfigInput,
  type ChannelCredentials,
  generateOpenClawConfig,
  getOpenClawEnvVars,
} from "./openclaw-config";

export interface ChannelConfigResult {
  /** The generated openclaw.json config object */
  config: Record<string, unknown>;
  /** Minimal env vars to set on Railway (model API keys only) */
  envVars: Record<string, string>;
  /** Human-readable note about the channel setup */
  note: string;
}

/**
 * Build a complete OpenClaw config from all active channel connections,
 * model providers, and skills.
 *
 * This is called whenever a channel is connected or disconnected to
 * regenerate the full config.
 */
export function buildFullConfig(params: {
  /** All active channel connections with their credentials */
  activeChannels: Array<{
    channel: string;
    credentials: Record<string, unknown>;
  }>;
  /** Model provider configs */
  models: Array<{
    provider: string;
    apiKey: string;
    baseUrl?: string;
  }>;
  /** Active model selection: "provider/model-id" */
  activeModel?: string;
  /** Skills to enable */
  skills?: Array<{
    id: string;
    enabled: boolean;
    env?: Record<string, string>;
  }>;
  /** Agent identity */
  agent?: {
    name?: string;
    avatar?: string;
    soulMd?: string;
  };
  /** Gateway settings */
  gateway?: {
    port?: number;
    bind?: string;
    token?: string;
  };
  /** Additional env vars */
  env?: Record<string, string>;
}): ChannelConfigResult {
  // Convert active channels to the typed ChannelCredentials format
  const channelInputs: ChannelCredentials[] = [];

  for (const ch of params.activeChannels) {
    const mapped = mapToChannelCredentials(ch.channel, ch.credentials);
    if (mapped) {
      channelInputs.push(mapped);
    }
  }

  const input: OpenClawConfigInput = {
    channels: channelInputs,
    models: params.models,
    activeModel: params.activeModel,
    skills: params.skills,
    agent: params.agent ?? { name: "SunClaw", avatar: "☀️" },
    gateway: params.gateway ?? { bind: "lan" },
    env: params.env,
  };

  const config = generateOpenClawConfig(input);
  const envVars = getOpenClawEnvVars(input);

  const channelNames = channelInputs.map((c) => c.channel).join(", ");
  const note = channelInputs.length > 0
    ? `Config generated with channels: ${channelNames}. Push to Gateway to activate.`
    : "No channels enabled. Config generated with models and skills only.";

  return { config, envVars, note };
}

/**
 * Map raw channel credentials from the DB to the typed ChannelCredentials format.
 * Returns null if the channel type is unknown or credentials are insufficient.
 */
function mapToChannelCredentials(
  channel: string,
  credentials: Record<string, unknown>
): ChannelCredentials | null {
  switch (channel.toLowerCase()) {
    case "telegram": {
      const botToken = credentials.botToken as string | undefined;
      if (!botToken) return null;
      return { channel: "telegram", credentials: { botToken } };
    }

    case "whatsapp": {
      return {
        channel: "whatsapp",
        credentials: {
          selfChatMode: (credentials.selfChatMode as boolean) ?? false,
        },
      };
    }

    case "slack": {
      const botToken = credentials.botToken as string | undefined;
      const appToken = credentials.appToken as string | undefined;
      if (!botToken || !appToken) return null;
      return {
        channel: "slack",
        credentials: {
          botToken,
          appToken,
          userToken: credentials.userToken as string | undefined,
        },
      };
    }

    case "discord": {
      const token = (credentials.token as string) ?? (credentials.botToken as string);
      if (!token) return null;
      return { channel: "discord", credentials: { token } };
    }

    case "signal": {
      return {
        channel: "signal",
        credentials: {
          account: credentials.account as string | undefined,
          httpUrl: credentials.httpUrl as string | undefined,
        },
      };
    }

    case "msteams": {
      const appId = credentials.appId as string | undefined;
      const appPassword = credentials.appPassword as string | undefined;
      if (!appId || !appPassword) return null;
      return {
        channel: "msteams",
        credentials: {
          appId,
          appPassword,
          tenantId: credentials.tenantId as string | undefined,
        },
      };
    }

    default:
      return null;
  }
}

/**
 * Get a human-readable description of what each channel requires.
 * Used in the channel setup UI to guide users.
 */
export function getChannelRequirements(channel: string): {
  fields: Array<{ key: string; label: string; required: boolean; placeholder: string; helpText: string }>;
  note: string;
} {
  switch (channel.toLowerCase()) {
    case "telegram":
      return {
        fields: [
          {
            key: "botToken",
            label: "Bot Token",
            required: true,
            placeholder: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
            helpText: "Get this from @BotFather on Telegram. Send /newbot to create a bot.",
          },
        ],
        note: "OpenClaw connects to Telegram via long-polling (grammY). No webhook URL needed.",
      };

    case "whatsapp":
      return {
        fields: [
          {
            key: "selfChatMode",
            label: "Self-Chat Mode",
            required: false,
            placeholder: "false",
            helpText: "If true, the bot runs on your own phone number. Messages you send to yourself trigger the bot.",
          },
        ],
        note: "WhatsApp uses Baileys (WhatsApp Web protocol). You'll need to scan a QR code on the deployed OpenClaw instance to pair your phone. No API keys needed.",
      };

    case "slack":
      return {
        fields: [
          {
            key: "botToken",
            label: "Bot Token (xoxb-...)",
            required: true,
            placeholder: "xoxb-your-bot-token",
            helpText: "OAuth Bot Token from your Slack App's OAuth & Permissions page.",
          },
          {
            key: "appToken",
            label: "App Token (xapp-...)",
            required: true,
            placeholder: "xapp-your-app-token",
            helpText: "App-Level Token from your Slack App's Basic Information page. Required for Socket Mode.",
          },
          {
            key: "userToken",
            label: "User Token (xoxp-...)",
            required: false,
            placeholder: "xoxp-your-user-token",
            helpText: "Optional. Enables enhanced features like editing messages as the user.",
          },
        ],
        note: "OpenClaw uses Slack Socket Mode — no public webhook URL needed. Enable Socket Mode in your Slack App settings.",
      };

    case "discord":
      return {
        fields: [
          {
            key: "token",
            label: "Bot Token",
            required: true,
            placeholder: "your-discord-bot-token",
            helpText: "Bot token from the Discord Developer Portal → Bot → Token.",
          },
        ],
        note: "OpenClaw connects to Discord via the Bot Gateway (WebSocket). No webhook URL needed.",
      };

    case "signal":
      return {
        fields: [
          {
            key: "account",
            label: "Phone Number (E.164)",
            required: false,
            placeholder: "+1234567890",
            helpText: "The phone number registered with Signal. Format: +[country code][number].",
          },
          {
            key: "httpUrl",
            label: "signal-cli HTTP URL",
            required: false,
            placeholder: "http://localhost:8080",
            helpText: "URL of the signal-cli REST API daemon. Required if running signal-cli separately.",
          },
        ],
        note: "Signal requires signal-cli to be running alongside OpenClaw. See OpenClaw docs for setup.",
      };

    case "msteams":
      return {
        fields: [
          {
            key: "appId",
            label: "App ID",
            required: true,
            placeholder: "12345678-1234-1234-1234-123456789012",
            helpText: "Application (client) ID from Azure AD App Registration.",
          },
          {
            key: "appPassword",
            label: "App Password",
            required: true,
            placeholder: "your-client-secret",
            helpText: "Client secret from Azure AD App Registration → Certificates & secrets.",
          },
          {
            key: "tenantId",
            label: "Tenant ID",
            required: false,
            placeholder: "12345678-1234-1234-1234-123456789012",
            helpText: "Azure AD Tenant ID. Leave empty for multi-tenant apps.",
          },
        ],
        note: "MS Teams requires an Azure Bot Service registration. See OpenClaw docs for setup.",
      };

    default:
      return {
        fields: [],
        note: `Channel "${channel}" is not yet supported.`,
      };
  }
}

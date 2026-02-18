/**
 * Maps SunClaw channel credentials to OpenClaw connector format.
 * 
 * OpenClaw expects connectors in a specific format depending on the channel type.
 * This utility translates the user-provided credentials into the correct payload
 * for OpenClaw's /api/connectors or /api/settings/connectors endpoints.
 */

export interface OpenClawConnectorPayload {
  type: string;
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
  webhookUrl?: string;
}

export function mapToOpenClawConnector(
  channel: string,
  credentials: Record<string, unknown>,
  webhookUrl: string
): OpenClawConnectorPayload {
  const base = {
    enabled: true,
    webhookUrl,
  };

  switch (channel.toLowerCase()) {
    case "whatsapp":
      return {
        ...base,
        type: "whatsapp",
        name: `WhatsApp - ${credentials.phoneNumberId ?? "Business"}`,
        config: {
          phoneNumberId: credentials.phoneNumberId,
          accessToken: credentials.accessToken,
          verifyToken: credentials.verifyToken ?? `sunclaw_${Date.now()}`,
          webhookUrl,
        },
      };

    case "telegram":
      return {
        ...base,
        type: "telegram",
        name: `Telegram - ${credentials.botUsername ?? "Bot"}`,
        config: {
          botToken: credentials.botToken,
          webhookUrl,
        },
      };

    case "slack":
      return {
        ...base,
        type: "slack",
        name: `Slack - ${credentials.workspaceName ?? "Workspace"}`,
        config: {
          botToken: credentials.botToken,
          signingSecret: credentials.signingSecret,
          appToken: credentials.appToken,
          webhookUrl,
        },
      };

    case "discord":
      return {
        ...base,
        type: "discord",
        name: `Discord - ${credentials.guildId ?? "Server"}`,
        config: {
          botToken: credentials.botToken,
          applicationId: credentials.applicationId,
          guildId: credentials.guildId,
        },
      };

    case "signal":
      return {
        ...base,
        type: "signal",
        name: `Signal - ${credentials.phoneNumber ?? "Number"}`,
        config: {
          phoneNumber: credentials.phoneNumber,
          apiUrl: credentials.apiUrl,
          webhookUrl,
        },
      };

    case "teams":
      return {
        ...base,
        type: "teams",
        name: `Teams - ${credentials.tenantId ?? "Tenant"}`,
        config: {
          appId: credentials.appId,
          appPassword: credentials.appPassword,
          tenantId: credentials.tenantId,
          webhookUrl,
        },
      };

    case "email":
      return {
        ...base,
        type: "email",
        name: `Email - ${credentials.smtpUser ?? "SMTP"}`,
        config: {
          smtpHost: credentials.smtpHost,
          smtpPort: credentials.smtpPort,
          smtpUser: credentials.smtpUser,
          smtpPass: credentials.smtpPass,
          imapHost: credentials.imapHost,
          imapPort: credentials.imapPort,
          useTls: credentials.useTls ?? true,
        },
      };

    case "webchat":
      return {
        ...base,
        type: "webchat",
        name: "Web Chat Widget",
        config: {
          allowedOrigins: credentials.allowedOrigins ?? ["*"],
          webhookUrl,
        },
      };

    case "rcs":
      return {
        ...base,
        type: "rcs",
        name: `RCS - ${credentials.agentId ?? "Agent"}`,
        config: {
          agentId: credentials.agentId,
          serviceAccountKey: credentials.serviceAccountKey,
          webhookUrl,
        },
      };

    default:
      return {
        ...base,
        type: channel,
        name: `${channel} Connector`,
        config: { ...credentials, webhookUrl },
      };
  }
}

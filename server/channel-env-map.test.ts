import { describe, it, expect } from "vitest";
import { buildFullConfig, getChannelRequirements } from "./channel-env-map";

/**
 * ARCHITECTURE CHANGE: Channels are now configured via openclaw.json,
 * NOT via environment variables. The old mapChannelToEnvVars and
 * getChannelEnvVarsToRemove functions have been removed.
 *
 * These tests verify the new config-based approach.
 */

describe("Channel Config-Based Mapping", () => {
  describe("buildFullConfig", () => {
    it("generates Telegram config under channels.telegram (not plugins.entries)", () => {
      const result = buildFullConfig({
        activeChannels: [{ channel: "telegram", credentials: { botToken: "123:ABC" } }],
        models: [{ provider: "openai", apiKey: "sk-test" }],
      });

      const channels = result.config.channels as any;
      expect(channels.telegram).toBeDefined();
      expect(channels.telegram.botToken).toBe("123:ABC");
      // enabled is NOT set on channel config (OpenClaw doesn't recognize it)
      expect(channels.telegram.enabled).toBeUndefined();
      expect(channels.telegram.dmPolicy).toBe("open");

      // Bundled plugins like Telegram need explicit plugins.entries.telegram.enabled
      expect(result.config.plugins).toBeDefined();
      expect(result.config.plugins.entries.telegram.enabled).toBe(true);
    });

    it("uses 'token' (not 'botToken') for Discord", () => {
      const result = buildFullConfig({
        activeChannels: [{ channel: "discord", credentials: { token: "dc-token" } }],
        models: [],
      });

      const discord = (result.config.channels as any).discord;
      expect(discord.token).toBe("dc-token");
      expect(discord.botToken).toBeUndefined();
      // enabled is NOT set on channel config
      expect(discord.enabled).toBeUndefined();
    });

    it("maps legacy Discord 'botToken' field to 'token'", () => {
      // Old DB records might have 'botToken' instead of 'token'
      const result = buildFullConfig({
        activeChannels: [{ channel: "discord", credentials: { botToken: "dc-legacy" } }],
        models: [],
      });

      const discord = (result.config.channels as any).discord;
      expect(discord.token).toBe("dc-legacy");
    });

    it("generates Slack config with Socket Mode (botToken + appToken)", () => {
      const result = buildFullConfig({
        activeChannels: [{
          channel: "slack",
          credentials: { botToken: "xoxb-123", appToken: "xapp-456" },
        }],
        models: [],
      });

      const slack = (result.config.channels as any).slack;
      expect(slack.botToken).toBe("xoxb-123");
      expect(slack.appToken).toBe("xapp-456");
      expect(slack.mode).toBe("socket");
      // Must NOT have signingSecret
      expect(slack.signingSecret).toBeUndefined();
    });

    it("WhatsApp needs no credentials (Baileys QR pairing)", () => {
      const result = buildFullConfig({
        activeChannels: [{ channel: "whatsapp", credentials: {} }],
        models: [],
      });

      const whatsapp = (result.config.channels as any).whatsapp;
      // enabled is NOT set on channel config
      expect(whatsapp.enabled).toBeUndefined();
      // Must NOT have Business API fields
      expect(whatsapp.accessToken).toBeUndefined();
      expect(whatsapp.phoneNumberId).toBeUndefined();
    });

    it("returns model API keys as envVars (not channel tokens)", () => {
      const result = buildFullConfig({
        activeChannels: [{ channel: "telegram", credentials: { botToken: "tg-secret" } }],
        models: [{ provider: "openai", apiKey: "sk-openai" }],
      });

      expect(result.envVars.OPENAI_API_KEY).toBe("sk-openai");
      // Channel tokens must NOT be in envVars
      expect(Object.values(result.envVars)).not.toContain("tg-secret");
    });

    it("filters out channels with insufficient credentials", () => {
      const result = buildFullConfig({
        activeChannels: [
          { channel: "telegram", credentials: {} }, // Missing botToken
          { channel: "discord", credentials: { token: "dc-token" } }, // Valid
        ],
        models: [],
      });

      const channels = result.config.channels as any;
      expect(channels.telegram).toBeUndefined();
      expect(channels.discord).toBeDefined();
    });

    it("handles empty channels gracefully", () => {
      const result = buildFullConfig({
        activeChannels: [],
        models: [{ provider: "openai", apiKey: "sk-test" }],
      });

      expect(result.config.channels).toBeUndefined();
      expect(result.note).toContain("No channels enabled");
    });

    it("is case-insensitive for channel names", () => {
      const result = buildFullConfig({
        activeChannels: [{ channel: "Telegram", credentials: { botToken: "123:ABC" } }],
        models: [],
      });

      const channels = result.config.channels as any;
      expect(channels.telegram).toBeDefined();
    });
  });

  describe("getChannelRequirements", () => {
    it("Telegram requires only botToken", () => {
      const req = getChannelRequirements("telegram");
      expect(req.fields).toHaveLength(1);
      expect(req.fields[0].key).toBe("botToken");
      expect(req.fields[0].required).toBe(true);
    });

    it("Discord requires 'token' (not 'botToken' or 'applicationId')", () => {
      const req = getChannelRequirements("discord");
      expect(req.fields).toHaveLength(1);
      expect(req.fields[0].key).toBe("token");
      expect(req.fields.some(f => f.key === "botToken")).toBe(false);
      expect(req.fields.some(f => f.key === "applicationId")).toBe(false);
    });

    it("Slack requires botToken + appToken, no signingSecret", () => {
      const req = getChannelRequirements("slack");
      const keys = req.fields.map(f => f.key);
      expect(keys).toContain("botToken");
      expect(keys).toContain("appToken");
      expect(keys).not.toContain("signingSecret");
    });

    it("WhatsApp has no required fields", () => {
      const req = getChannelRequirements("whatsapp");
      const required = req.fields.filter(f => f.required);
      expect(required).toHaveLength(0);
      const keys = req.fields.map(f => f.key);
      expect(keys).not.toContain("accessToken");
      expect(keys).not.toContain("phoneNumberId");
    });

    it("returns empty fields for unknown channels", () => {
      const req = getChannelRequirements("unknown-channel");
      expect(req.fields).toHaveLength(0);
    });
  });
});

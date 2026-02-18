import { describe, expect, it } from "vitest";
import { buildFullConfig, getChannelRequirements } from "./channel-env-map";
import { RAILWAY_DEFAULT_ENV_VARS, mergeWithDefaults, RAILWAY_TEMPLATE_VARS_INFO } from "./railway-defaults";

/* ═══════════════════════════════════════════════════════════════════════════
 * 1. Channel Config Building (channel-env-map.ts)
 * ═══════════════════════════════════════════════════════════════════════════ */

describe("buildFullConfig", () => {
  it("generates config with Telegram channel under channels.telegram", () => {
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
  });

  it("maps Discord 'botToken' legacy field to 'token'", () => {
    // Some old DB records might have 'botToken' instead of 'token'
    const result = buildFullConfig({
      activeChannels: [{ channel: "discord", credentials: { botToken: "dc-legacy-token" } }],
      models: [],
    });

    const discord = (result.config.channels as any).discord;
    expect(discord.token).toBe("dc-legacy-token");
    // Must NOT have botToken in the output config
    expect(discord.botToken).toBeUndefined();
  });

  it("returns model API keys as envVars (not channel tokens)", () => {
    const result = buildFullConfig({
      activeChannels: [{ channel: "telegram", credentials: { botToken: "tg-secret" } }],
      models: [
        { provider: "openai", apiKey: "sk-openai" },
        { provider: "anthropic", apiKey: "sk-ant" },
      ],
    });

    expect(result.envVars.OPENAI_API_KEY).toBe("sk-openai");
    expect(result.envVars.ANTHROPIC_API_KEY).toBe("sk-ant");
    // Channel tokens must NOT be in envVars
    expect(Object.values(result.envVars)).not.toContain("tg-secret");
  });

  it("handles empty channels gracefully", () => {
    const result = buildFullConfig({
      activeChannels: [],
      models: [{ provider: "openai", apiKey: "sk-test" }],
    });

    expect(result.config.channels).toBeUndefined();
    expect(result.note).toContain("No channels enabled");
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

  it("includes skills config when provided", () => {
    const result = buildFullConfig({
      activeChannels: [],
      models: [],
      skills: [
        { id: "solar-irradiance", enabled: true },
        { id: "lcoe-calculator", enabled: true },
      ],
    });

    const skills = result.config.skills as any;
    expect(skills.entries["solar-irradiance"].enabled).toBe(true);
    expect(skills.entries["lcoe-calculator"].enabled).toBe(true);
  });

  it("includes agent config with SunClaw defaults", () => {
    const result = buildFullConfig({
      activeChannels: [],
      models: [],
    });

    const ui = result.config.ui as any;
    expect(ui.assistant.name).toBe("SunClaw");
    expect(ui.assistant.avatar).toBe("☀️");
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * 2. Channel Requirements (channel-env-map.ts)
 * ═══════════════════════════════════════════════════════════════════════════ */

describe("getChannelRequirements", () => {
  it("Telegram requires botToken only", () => {
    const req = getChannelRequirements("telegram");
    expect(req.fields).toHaveLength(1);
    expect(req.fields[0].key).toBe("botToken");
    expect(req.fields[0].required).toBe(true);
  });

  it("Discord requires 'token' (not 'botToken')", () => {
    const req = getChannelRequirements("discord");
    expect(req.fields).toHaveLength(1);
    expect(req.fields[0].key).toBe("token");
    expect(req.fields[0].required).toBe(true);
    // Must NOT ask for botToken, applicationId, or guildId
    expect(req.fields.some(f => f.key === "botToken")).toBe(false);
    expect(req.fields.some(f => f.key === "applicationId")).toBe(false);
    expect(req.fields.some(f => f.key === "guildId")).toBe(false);
  });

  it("Slack requires botToken + appToken (Socket Mode), no signingSecret", () => {
    const req = getChannelRequirements("slack");
    const keys = req.fields.map(f => f.key);
    expect(keys).toContain("botToken");
    expect(keys).toContain("appToken");
    // Must NOT ask for signingSecret (that's Events API mode)
    expect(keys).not.toContain("signingSecret");
  });

  it("WhatsApp has no required credential fields (Baileys QR pairing)", () => {
    const req = getChannelRequirements("whatsapp");
    const required = req.fields.filter(f => f.required);
    expect(required).toHaveLength(0);
    // Must NOT ask for accessToken, phoneNumberId, businessAccountId
    const keys = req.fields.map(f => f.key);
    expect(keys).not.toContain("accessToken");
    expect(keys).not.toContain("phoneNumberId");
    expect(keys).not.toContain("businessAccountId");
    expect(keys).not.toContain("verifyToken");
  });

  it("MS Teams requires appId + appPassword", () => {
    const req = getChannelRequirements("msteams");
    const keys = req.fields.map(f => f.key);
    expect(keys).toContain("appId");
    expect(keys).toContain("appPassword");
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * 3. Railway Defaults (railway-defaults.ts)
 * ═══════════════════════════════════════════════════════════════════════════ */

describe("RAILWAY_DEFAULT_ENV_VARS", () => {
  it("only contains PORT and NODE_ENV (minimal set)", () => {
    const keys = Object.keys(RAILWAY_DEFAULT_ENV_VARS);
    expect(keys).toContain("PORT");
    expect(keys).toContain("NODE_ENV");
    // Must NOT contain channel-specific env vars that OpenClaw ignores
    expect(keys).not.toContain("TELEGRAM_BOT_TOKEN");
    expect(keys).not.toContain("DISCORD_BOT_TOKEN");
    expect(keys).not.toContain("SLACK_BOT_TOKEN");
    expect(keys).not.toContain("WHATSAPP_ACCESS_TOKEN");
    expect(keys).not.toContain("WHATSAPP_PHONE_NUMBER_ID");
    // Must NOT contain fake env vars
    expect(keys).not.toContain("SUNCLAW_SOUL_MD");
    expect(keys).not.toContain("SUNCLAW_AGENT_NAME");
    expect(keys).not.toContain("SUNCLAW_KIISHA_TOKEN");
  });

  it("sets PORT to 18789 (OpenClaw's default gateway port)", () => {
    expect(RAILWAY_DEFAULT_ENV_VARS.PORT).toBe("18789");
  });
});

describe("mergeWithDefaults", () => {
  it("auto-generates OPENCLAW_TOKEN when not provided", () => {
    const result = mergeWithDefaults({});
    expect(result.OPENCLAW_TOKEN).toBeDefined();
    expect(result.OPENCLAW_TOKEN.length).toBeGreaterThan(0);
  });

  it("preserves user-provided OPENCLAW_TOKEN", () => {
    const result = mergeWithDefaults({ OPENCLAW_TOKEN: "my-custom-token" });
    expect(result.OPENCLAW_TOKEN).toBe("my-custom-token");
  });

  it("user values override defaults", () => {
    const result = mergeWithDefaults({ PORT: "3000" });
    expect(result.PORT).toBe("3000");
  });
});

describe("RAILWAY_TEMPLATE_VARS_INFO", () => {
  it("only contains model API keys and OPENCLAW_TOKEN", () => {
    const keys = RAILWAY_TEMPLATE_VARS_INFO.map(v => v.key);
    // Should contain model API keys
    expect(keys).toContain("OPENAI_API_KEY");
    expect(keys).toContain("ANTHROPIC_API_KEY");
    expect(keys).toContain("OPENCLAW_TOKEN");
    // Must NOT contain channel-specific vars
    expect(keys).not.toContain("TELEGRAM_BOT_TOKEN");
    expect(keys).not.toContain("DISCORD_BOT_TOKEN");
    expect(keys).not.toContain("SLACK_BOT_TOKEN");
  });
});

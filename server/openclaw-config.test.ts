import { describe, expect, it } from "vitest";
import {
  generateOpenClawConfig,
  getOpenClawEnvVars,
  validateOpenClawConfig,
  wizardConfigToInput,
  type OpenClawConfigInput,
} from "./openclaw-config";

/* ═══════════════════════════════════════════════════════════════════════════
 * 1. Config Generation — Channel Correctness
 * ═══════════════════════════════════════════════════════════════════════════ */

describe("generateOpenClawConfig — channels", () => {
  it("places Telegram under channels.telegram (NOT plugins.entries.telegram)", () => {
    const input: OpenClawConfigInput = {
      channels: [{ channel: "telegram", credentials: { botToken: "123:ABC" } }],
      models: [],
    };
    const config = generateOpenClawConfig(input);

    // Must be under channels.telegram
    const channels = config.channels as Record<string, unknown>;
    expect(channels).toBeDefined();
    expect(channels.telegram).toBeDefined();

    // Bundled plugins like Telegram need explicit plugins.entries.telegram.enabled
    expect(config.plugins).toBeDefined();
    expect((config.plugins as any).entries.telegram.enabled).toBe(true);
  });

  it("sets dmPolicy to 'open' for Telegram (not 'pairing')", () => {
    const input: OpenClawConfigInput = {
      channels: [{ channel: "telegram", credentials: { botToken: "123:ABC" } }],
      models: [],
    };
    const config = generateOpenClawConfig(input);
    const telegram = (config.channels as any).telegram;

    expect(telegram.dmPolicy).toBe("open");
    // enabled is NOT set on channel config (OpenClaw doesn't recognize it)
    // presence of the channel config itself means it's enabled
    expect(telegram.enabled).toBeUndefined();
    expect(telegram.botToken).toBe("123:ABC");
  });

  it("uses 'token' (not 'botToken') for Discord config", () => {
    const input: OpenClawConfigInput = {
      channels: [{ channel: "discord", credentials: { token: "MTIz.AbCdEf.GhIjKl" } }],
      models: [],
    };
    const config = generateOpenClawConfig(input);
    const discord = (config.channels as any).discord;

    expect(discord.token).toBe("MTIz.AbCdEf.GhIjKl");
    // Must NOT have botToken field
    expect(discord.botToken).toBeUndefined();
    // enabled is NOT set on channel config
    expect(discord.enabled).toBeUndefined();
  });

  it("uses Socket Mode for Slack (botToken + appToken, no signingSecret)", () => {
    const input: OpenClawConfigInput = {
      channels: [{
        channel: "slack",
        credentials: { botToken: "xoxb-123", appToken: "xapp-456" },
      }],
      models: [],
    };
    const config = generateOpenClawConfig(input);
    const slack = (config.channels as any).slack;

    expect(slack.mode).toBe("socket");
    expect(slack.botToken).toBe("xoxb-123");
    expect(slack.appToken).toBe("xapp-456");
    // Must NOT have signingSecret (that's for Events API mode, not Socket Mode)
    expect(slack.signingSecret).toBeUndefined();
    // enabled is NOT set on channel config
    expect(slack.enabled).toBeUndefined();
  });

  it("WhatsApp has no API credentials (Baileys QR pairing)", () => {
    const input: OpenClawConfigInput = {
      channels: [{ channel: "whatsapp", credentials: {} }],
      models: [],
    };
    const config = generateOpenClawConfig(input);
    const whatsapp = (config.channels as any).whatsapp;

    // enabled is NOT set on channel config
    expect(whatsapp.enabled).toBeUndefined();
    // Must NOT have accessToken, phoneNumberId, businessAccountId, verifyToken
    expect(whatsapp.accessToken).toBeUndefined();
    expect(whatsapp.phoneNumberId).toBeUndefined();
    expect(whatsapp.businessAccountId).toBeUndefined();
    expect(whatsapp.verifyToken).toBeUndefined();
  });

  it("generates Signal config with optional fields", () => {
    const input: OpenClawConfigInput = {
      channels: [{
        channel: "signal",
        credentials: { account: "+1234567890", httpUrl: "http://localhost:8080" },
      }],
      models: [],
    };
    const config = generateOpenClawConfig(input);
    const signal = (config.channels as any).signal;

    // enabled is NOT set on channel config
    expect(signal.enabled).toBeUndefined();
    expect(signal.account).toBe("+1234567890");
    expect(signal.httpUrl).toBe("http://localhost:8080");
  });

  it("generates MS Teams config with appId and appPassword", () => {
    const input: OpenClawConfigInput = {
      channels: [{
        channel: "msteams",
        credentials: { appId: "app-123", appPassword: "secret", tenantId: "tenant-456" },
      }],
      models: [],
    };
    const config = generateOpenClawConfig(input);
    const msteams = (config.channels as any).msteams;

    // enabled is NOT set on channel config
    expect(msteams.enabled).toBeUndefined();
    expect(msteams.appId).toBe("app-123");
    expect(msteams.appPassword).toBe("secret");
    expect(msteams.tenantId).toBe("tenant-456");
  });

  it("generates config with multiple channels simultaneously", () => {
    const input: OpenClawConfigInput = {
      channels: [
        { channel: "telegram", credentials: { botToken: "tg-token" } },
        { channel: "discord", credentials: { token: "dc-token" } },
        { channel: "slack", credentials: { botToken: "xoxb-1", appToken: "xapp-1" } },
      ],
      models: [],
    };
    const config = generateOpenClawConfig(input);
    const channels = config.channels as Record<string, unknown>;

    expect(Object.keys(channels)).toHaveLength(3);
    expect(channels.telegram).toBeDefined();
    expect(channels.discord).toBeDefined();
    expect(channels.slack).toBeDefined();
  });

  it("omits channels key when no channels are provided", () => {
    const input: OpenClawConfigInput = {
      channels: [],
      models: [{ provider: "openai", apiKey: "sk-test" }],
    };
    const config = generateOpenClawConfig(input);

    expect(config.channels).toBeUndefined();
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * 2. Config Generation — Models
 * ═══════════════════════════════════════════════════════════════════════════ */

describe("generateOpenClawConfig — models", () => {
  it("generates OpenAI model config with correct API type", () => {
    const input: OpenClawConfigInput = {
      channels: [],
      models: [{ provider: "openai", apiKey: "sk-test" }],
    };
    const config = generateOpenClawConfig(input);
    const models = config.models as any;

    expect(models.mode).toBe("merge");
    expect(models.providers.openai).toBeDefined();
    expect(models.providers.openai.apiKey).toBe("${OPENAI_API_KEY}");
    // Actual key value should be in the env block
    expect(config.env).toBeDefined();
    expect((config.env as any).OPENAI_API_KEY).toBe("sk-test");
    expect(models.providers.openai.api).toBe("openai-completions");
    expect(models.providers.openai.baseUrl).toBe("https://api.openai.com/v1");
  });

  it("generates Anthropic model config with correct API type", () => {
    const input: OpenClawConfigInput = {
      channels: [],
      models: [{ provider: "anthropic", apiKey: "sk-ant-test" }],
    };
    const config = generateOpenClawConfig(input);
    const models = config.models as any;

    expect(models.providers.anthropic.api).toBe("anthropic-messages");
    expect(models.providers.anthropic.baseUrl).toBe("https://api.anthropic.com");
  });

  it("generates Google model config with correct API type", () => {
    const input: OpenClawConfigInput = {
      channels: [],
      models: [{ provider: "google", apiKey: "AIza-test" }],
    };
    const config = generateOpenClawConfig(input);
    const models = config.models as any;

    expect(models.providers.google.api).toBe("google-generative-ai");
  });

  it("uses custom baseUrl when provided", () => {
    const input: OpenClawConfigInput = {
      channels: [],
      models: [{ provider: "openai", apiKey: "sk-test", baseUrl: "https://custom.api.com/v1" }],
    };
    const config = generateOpenClawConfig(input);
    const models = config.models as any;

    expect(models.providers.openai.baseUrl).toBe("https://custom.api.com/v1");
  });

  it("handles unknown providers with openai-completions API type", () => {
    const input: OpenClawConfigInput = {
      channels: [],
      models: [{ provider: "custom-provider", apiKey: "key-123", baseUrl: "https://custom.ai/v1" }],
    };
    const config = generateOpenClawConfig(input);
    const models = config.models as any;

    expect(models.providers["custom-provider"]).toBeDefined();
    expect(models.providers["custom-provider"].api).toBe("openai-completions");
    expect(models.providers["custom-provider"].apiKey).toBe("key-123");
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * 3. Config Generation — Skills, Session, Memory
 * ═══════════════════════════════════════════════════════════════════════════ */

describe("generateOpenClawConfig — skills, session, memory", () => {
  it("generates skills config with extraDirs pointing to /data/skills", () => {
    const input: OpenClawConfigInput = {
      channels: [],
      models: [],
      skills: [
        { id: "solar-irradiance", enabled: true },
        { id: "lcoe-calculator", enabled: true, env: { IRENA_KEY: "abc" } },
      ],
    };
    const config = generateOpenClawConfig(input);
    const skills = config.skills as any;

    expect(skills.entries["solar-irradiance"].enabled).toBe(true);
    expect(skills.entries["lcoe-calculator"].enabled).toBe(true);
    expect(skills.entries["lcoe-calculator"].env).toEqual({ IRENA_KEY: "abc" });
    // extraDirs is now empty — the wrapper's installSkills() copies skills to ~/.openclaw/skills/
    expect(skills.load.extraDirs).toEqual([]);
  });

  it("sets session scope to per-sender with idle reset", () => {
    const config = generateOpenClawConfig({ channels: [], models: [] });

    expect((config.session as any).scope).toBe("per-sender");
    expect((config.session as any).reset.mode).toBe("idle");
    expect((config.session as any).reset.idleMinutes).toBe(30);
  });

  it("sets memory backend to builtin", () => {
    const config = generateOpenClawConfig({ channels: [], models: [] });

    expect((config.memory as any).backend).toBe("builtin");
  });

  it("generates gateway config with control UI enabled", () => {
    const input: OpenClawConfigInput = {
      channels: [],
      models: [],
      gateway: { port: 18789, bind: "lan", token: "my-secret" },
    };
    const config = generateOpenClawConfig(input);
    const gw = config.gateway as any;

    expect(gw.port).toBe(18789);
    expect(gw.bind).toBe("lan");
    expect(gw.controlUi.enabled).toBe(true);
    expect(gw.auth.mode).toBe("token");
    expect(gw.auth.token).toBe("my-secret");
  });

  it("auto-generates gateway auth token when no token provided", () => {
    const config = generateOpenClawConfig({ channels: [], models: [] });
    const gw = config.gateway as any;

    expect(gw.auth.mode).toBe("token");
    expect(typeof gw.auth.token).toBe("string");
    expect(gw.auth.token.length).toBeGreaterThan(0);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * 4. Env Var Extraction
 * ═══════════════════════════════════════════════════════════════════════════ */

describe("getOpenClawEnvVars", () => {
  it("extracts model API keys as env vars", () => {
    const input: OpenClawConfigInput = {
      channels: [],
      models: [
        { provider: "openai", apiKey: "sk-openai" },
        { provider: "anthropic", apiKey: "sk-ant" },
      ],
    };
    const vars = getOpenClawEnvVars(input);

    expect(vars.OPENAI_API_KEY).toBe("sk-openai");
    expect(vars.ANTHROPIC_API_KEY).toBe("sk-ant");
  });

  it("does NOT include channel credentials as env vars", () => {
    const input: OpenClawConfigInput = {
      channels: [{ channel: "telegram", credentials: { botToken: "tg-token" } }],
      models: [],
    };
    const vars = getOpenClawEnvVars(input);

    // Channel tokens must NOT be in env vars — they go in openclaw.json
    expect(vars.TELEGRAM_BOT_TOKEN).toBeUndefined();
    expect(vars.TELEGRAM_TOKEN).toBeUndefined();
    expect(Object.keys(vars).some(k => k.includes("TELEGRAM"))).toBe(false);
  });

  it("includes OPENCLAW_TOKEN when gateway token is set", () => {
    const input: OpenClawConfigInput = {
      channels: [],
      models: [],
      gateway: { token: "gw-secret" },
    };
    const vars = getOpenClawEnvVars(input);

    expect(vars.OPENCLAW_TOKEN).toBe("gw-secret");
  });

  it("returns empty object when no models and no gateway token", () => {
    const vars = getOpenClawEnvVars({ channels: [], models: [] });

    expect(Object.keys(vars)).toHaveLength(0);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * 5. Config Validation
 * ═══════════════════════════════════════════════════════════════════════════ */

describe("validateOpenClawConfig", () => {
  it("flags Telegram without botToken as error", () => {
    const config = { channels: { telegram: { enabled: true } } };
    const result = validateOpenClawConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("channels.telegram: botToken is required when enabled");
  });

  it("flags Discord without token as error", () => {
    const config = { channels: { discord: { enabled: true } } };
    const result = validateOpenClawConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("channels.discord: token is required when enabled");
  });

  it("flags Slack without botToken as error", () => {
    const config = { channels: { slack: { enabled: true } } };
    const result = validateOpenClawConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("slack") && e.includes("botToken"))).toBe(true);
  });

  it("flags Slack without appToken as error", () => {
    const config = { channels: { slack: { enabled: true, botToken: "xoxb-1" } } };
    const result = validateOpenClawConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("slack") && e.includes("appToken"))).toBe(true);
  });

  it("WhatsApp without credentials is valid (Baileys QR pairing)", () => {
    const config = { channels: { whatsapp: { enabled: true } } };
    const result = validateOpenClawConfig(config);

    // WhatsApp needs no credentials — should be valid
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("warns when no models are configured", () => {
    const config = { channels: { telegram: { enabled: true, botToken: "123:ABC" } } };
    const result = validateOpenClawConfig(config);

    expect(result.warnings.some(w => w.includes("model"))).toBe(true);
  });

  it("valid config passes without errors", () => {
    const input: OpenClawConfigInput = {
      channels: [{ channel: "telegram", credentials: { botToken: "123:ABC" } }],
      models: [{ provider: "openai", apiKey: "sk-test" }],
    };
    const config = generateOpenClawConfig(input);
    const result = validateOpenClawConfig(config);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * 6. Wizard Config Conversion
 * ═══════════════════════════════════════════════════════════════════════════ */

describe("wizardConfigToInput", () => {
  it("converts wizard config with Telegram channel", () => {
    const wizard = {
      aiProvider: { provider: "openai", apiKey: "sk-test" },
      channels: {
        telegram: { enabled: true, botToken: "123:ABC" },
      },
    };
    const input = wizardConfigToInput(wizard);

    expect(input.models).toHaveLength(1);
    expect(input.models[0].provider).toBe("openai");
    expect(input.channels).toHaveLength(1);
    expect(input.channels[0].channel).toBe("telegram");
    expect((input.channels[0].credentials as any).botToken).toBe("123:ABC");
  });

  it("converts wizard config with Discord using 'token' field", () => {
    const wizard = {
      aiProvider: { provider: "anthropic", apiKey: "sk-ant" },
      channels: {
        discord: { enabled: true, token: "dc-token" },
      },
    };
    const input = wizardConfigToInput(wizard);

    expect(input.channels).toHaveLength(1);
    expect(input.channels[0].channel).toBe("discord");
    expect((input.channels[0].credentials as any).token).toBe("dc-token");
  });

  it("converts wizard config with WhatsApp (no credentials needed)", () => {
    const wizard = {
      aiProvider: { provider: "openai", apiKey: "sk-test" },
      channels: {
        whatsapp: { enabled: true },
      },
    };
    const input = wizardConfigToInput(wizard);

    expect(input.channels).toHaveLength(1);
    expect(input.channels[0].channel).toBe("whatsapp");
  });

  it("ignores disabled channels", () => {
    const wizard = {
      aiProvider: { provider: "openai", apiKey: "sk-test" },
      channels: {
        telegram: { enabled: false, botToken: "123:ABC" },
      },
    };
    const input = wizardConfigToInput(wizard);

    expect(input.channels).toHaveLength(0);
  });

  it("extracts soul.md", () => {
    const wizard = {
      aiProvider: { provider: "openai", apiKey: "sk-test" },
      soulMd: "You are SunClaw, a renewable energy AI assistant.",
    };
    const input = wizardConfigToInput(wizard);

    expect(input.agent?.soulMd).toBe("You are SunClaw, a renewable energy AI assistant.");
  });
});

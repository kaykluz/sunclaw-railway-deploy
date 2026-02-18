import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { getProviderModels, generateOpenClawConfig } from "./openclaw-config";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("apiKeys.providers (expanded list)", () => {
  it("returns a non-empty list of providers", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const providers = await caller.apiKeys.providers();

    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBeGreaterThan(15);
  });

  it("includes Kimi (Moonshot) provider", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const providers = await caller.apiKeys.providers();
    const moonshot = providers.find(p => p.id === "moonshot");

    expect(moonshot).toBeDefined();
    expect(moonshot!.name).toBe("Kimi (Moonshot)");
    expect(moonshot!.models.length).toBeGreaterThan(0);
  });

  it("includes MiniMax provider", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const providers = await caller.apiKeys.providers();
    const minimax = providers.find(p => p.id === "minimax");

    expect(minimax).toBeDefined();
    expect(minimax!.name).toBe("MiniMax");
    expect(minimax!.models.length).toBeGreaterThan(0);
  });

  it("each provider has required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const providers = await caller.apiKeys.providers();

    for (const p of providers) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(Array.isArray(p.models)).toBe(true);
    }
  });

  it("includes new providers: cerebras, perplexity, sambanova", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const providers = await caller.apiKeys.providers();
    const ids = providers.map(p => p.id);

    expect(ids).toContain("cerebras");
    expect(ids).toContain("perplexity");
    expect(ids).toContain("sambanova");
  });
});

describe("getProviderModels (openclaw-config)", () => {
  it("returns models grouped by provider", () => {
    const models = getProviderModels();

    expect(typeof models).toBe("object");
    expect(Object.keys(models).length).toBeGreaterThan(5);
  });

  it("includes moonshot provider with kimi-k2.5", () => {
    const models = getProviderModels();

    expect(models.moonshot).toBeDefined();
    const kimi = models.moonshot.find(m => m.id === "kimi-k2.5");
    expect(kimi).toBeDefined();
    expect(kimi!.name).toBe("Kimi K2.5");
  });

  it("includes minimax provider", () => {
    const models = getProviderModels();

    expect(models.minimax).toBeDefined();
    expect(models.minimax.length).toBeGreaterThan(0);
  });

  it("each model has required fields", () => {
    const models = getProviderModels();

    for (const [provider, modelList] of Object.entries(models)) {
      for (const m of modelList) {
        expect(m.id, `${provider}/${m.id} should have id`).toBeTruthy();
        expect(m.name, `${provider}/${m.id} should have name`).toBeTruthy();
        expect(typeof m.reasoning, `${provider}/${m.id} should have reasoning boolean`).toBe("boolean");
        expect(Array.isArray(m.input), `${provider}/${m.id} should have input array`).toBe(true);
        expect(typeof m.contextWindow, `${provider}/${m.id} should have contextWindow`).toBe("number");
        expect(m.contextWindow, `${provider}/${m.id} contextWindow should be positive`).toBeGreaterThan(0);
      }
    }
  });
});

describe("generateOpenClawConfig with activeModel", () => {
  it("includes agent.model when activeModel is set", () => {
    const config = generateOpenClawConfig({
      channels: [],
      models: [{ provider: "moonshot", apiKey: "test-key" }],
      activeModel: "moonshot/kimi-k2.5",
      agent: { name: "SunClaw", avatar: "☀️" },
      gateway: { bind: "lan" },
    });

    // agents.defaults is used instead of agent (OpenClaw migration)
    expect((config as any).agents).toBeDefined();
    expect((config as any).agents.defaults.model).toEqual({ primary: "moonshot/kimi-k2.5" });
  });

  it("does not include agent.model when activeModel is not set", () => {
    const config = generateOpenClawConfig({
      channels: [],
      models: [{ provider: "moonshot", apiKey: "test-key" }],
      agent: { name: "SunClaw", avatar: "☀️" },
      gateway: { bind: "lan" },
    });

    // agents block should not exist since only activeModel creates it
    expect((config as any).agents).toBeUndefined();
  });

  it("includes plugins.entries for enabled channels", () => {
    const config = generateOpenClawConfig({
      channels: [
        { channel: "telegram", credentials: { botToken: "test-token" } },
      ],
      models: [],
      agent: { name: "SunClaw", avatar: "☀️" },
      gateway: { bind: "lan" },
    });

    expect(config.channels).toBeDefined();
    expect((config.channels as any).telegram).toBeDefined();
    // enabled is NOT set on channel config (OpenClaw doesn't recognize it)
    expect((config.channels as any).telegram.enabled).toBeUndefined();

    expect(config.plugins).toBeDefined();
    expect((config.plugins as any).entries.telegram.enabled).toBe(true);
  });

  it("includes moonshot provider in models config", () => {
    const config = generateOpenClawConfig({
      channels: [],
      models: [{ provider: "moonshot", apiKey: "sk-test-moonshot" }],
      agent: { name: "SunClaw", avatar: "☀️" },
      gateway: { bind: "lan" },
    });

    expect(config.models).toBeDefined();
    const providers = (config.models as any).providers;
    expect(providers.moonshot).toBeDefined();
    expect(providers.moonshot.apiKey).toBe("${MOONSHOT_API_KEY}");
    // Actual key value should be in the env block
    expect(config.env).toBeDefined();
    expect((config.env as any).MOONSHOT_API_KEY).toBe("sk-test-moonshot");
    expect(providers.moonshot.models.length).toBeGreaterThan(0);
  });

  it("includes minimax provider in models config", () => {
    const config = generateOpenClawConfig({
      channels: [],
      models: [{ provider: "minimax", apiKey: "test-minimax-key" }],
      agent: { name: "SunClaw", avatar: "☀️" },
      gateway: { bind: "lan" },
    });

    expect(config.models).toBeDefined();
    const providers = (config.models as any).providers;
    expect(providers.minimax).toBeDefined();
    expect(providers.minimax.apiKey).toBe("${MINIMAX_API_KEY}");
    // Actual key value should be in the env block
    expect(config.env).toBeDefined();
    expect((config.env as any).MINIMAX_API_KEY).toBe("test-minimax-key");
  });

  it("supports multiple providers simultaneously", () => {
    const config = generateOpenClawConfig({
      channels: [],
      models: [
        { provider: "moonshot", apiKey: "sk-moonshot" },
        { provider: "minimax", apiKey: "sk-minimax" },
        { provider: "deepseek", apiKey: "sk-deepseek" },
      ],
      activeModel: "moonshot/kimi-k2.5",
      agent: { name: "SunClaw", avatar: "☀️" },
      gateway: { bind: "lan" },
    });

    const providers = (config.models as any).providers;
    expect(Object.keys(providers)).toHaveLength(3);
    expect(providers.moonshot).toBeDefined();
    expect(providers.minimax).toBeDefined();
    expect(providers.deepseek).toBeDefined();

    // Active model should be set under agents.defaults
    expect((config as any).agents.defaults.model).toEqual({ primary: "moonshot/kimi-k2.5" });
  });

  it("generates correct base URLs for new providers", () => {
    const config = generateOpenClawConfig({
      channels: [],
      models: [
        { provider: "moonshot", apiKey: "key1" },
        { provider: "cerebras", apiKey: "key2" },
        { provider: "sambanova", apiKey: "key3" },
      ],
      agent: { name: "SunClaw", avatar: "☀️" },
      gateway: { bind: "lan" },
    });

    const providers = (config.models as any).providers;
    expect(providers.moonshot.baseUrl).toContain("moonshot");
    expect(providers.cerebras.baseUrl).toContain("cerebras");
    expect(providers.sambanova.baseUrl).toContain("sambanova");
  });
});

describe("kimi-coding provider support", () => {
  it("includes kimi-coding in providers list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const providers = await caller.apiKeys.providers();
    const kimiCoding = providers.find(p => p.id === "kimi-coding");

    expect(kimiCoding).toBeDefined();
    expect(kimiCoding!.name).toBe("Kimi Coding");
    expect(kimiCoding!.models.length).toBeGreaterThanOrEqual(1);
    expect(kimiCoding!.models.some(m => m.id === "kimi-for-coding")).toBe(true);
  });

  it("includes kimi-coding in PROVIDER_MODELS", () => {
    const models = getProviderModels();

    expect(models["kimi-coding"]).toBeDefined();
    expect(models["kimi-coding"].length).toBeGreaterThanOrEqual(1);
    const kimiForCoding = models["kimi-coding"].find(m => m.id === "kimi-for-coding");
    expect(kimiForCoding).toBeDefined();
    expect(kimiForCoding!.name).toBe("Kimi K2.5 (Coding)");
  });

  it("generates config with kimi-coding using anthropic-messages API type", () => {
    const config = generateOpenClawConfig({
      channels: [],
      models: [{ provider: "kimi-coding", apiKey: "sk-kimi-test" }],
      activeModel: "kimi-coding/k2p5",
      agent: { name: "SunClaw", avatar: "☀️" },
      gateway: { bind: "lan" },
    });

    const providers = (config.models as any).providers;
    expect(providers["kimi-coding"]).toBeDefined();
    expect(providers["kimi-coding"].apiKey).toBe("${ANTHROPIC_API_KEY}");
    // Actual key value should be in the env block
    expect(config.env).toBeDefined();
    expect((config.env as any).ANTHROPIC_API_KEY).toBe("sk-kimi-test");
    expect(providers["kimi-coding"].api).toBe("anthropic-messages");
    expect(providers["kimi-coding"].baseUrl).toBe("https://api.kimi.com/coding");
    expect((config as any).agents.defaults.model).toEqual({ primary: "kimi-coding/k2p5" });
  });

  it("generates config with moonshot using openai-completions API type", () => {
    const config = generateOpenClawConfig({
      channels: [],
      models: [{ provider: "moonshot", apiKey: "sk-moonshot-test" }],
      agent: { name: "SunClaw", avatar: "☀️" },
      gateway: { bind: "lan" },
    });

    const providers = (config.models as any).providers;
    expect(providers.moonshot.api).toBe("openai-completions");
    expect(providers.moonshot.baseUrl).toBe("https://api.moonshot.ai/v1");
  });

  it("generates config with minimax using correct international endpoint", () => {
    const config = generateOpenClawConfig({
      channels: [],
      models: [{ provider: "minimax", apiKey: "test-minimax-key" }],
      agent: { name: "SunClaw", avatar: "☀️" },
      gateway: { bind: "lan" },
    });

    const providers = (config.models as any).providers;
    expect(providers.minimax.baseUrl).toBe("https://api.minimax.io/anthropic");
    expect(providers.minimax.api).toBe("anthropic-messages");
  });

  it("generates config with anthropic using anthropic-messages API type", () => {
    const config = generateOpenClawConfig({
      channels: [],
      models: [{ provider: "anthropic", apiKey: "sk-ant-test" }],
      agent: { name: "SunClaw", avatar: "☀️" },
      gateway: { bind: "lan" },
    });

    const providers = (config.models as any).providers;
    expect(providers.anthropic.api).toBe("anthropic-messages");
  });

  it("generates config with google using google-generative-ai API type", () => {
    const config = generateOpenClawConfig({
      channels: [],
      models: [{ provider: "google", apiKey: "AIza-test" }],
      agent: { name: "SunClaw", avatar: "☀️" },
      gateway: { bind: "lan" },
    });

    const providers = (config.models as any).providers;
    expect(providers.google.api).toBe("google-generative-ai");
  });

  it("supports kimi-coding and minimax together with correct active model", () => {
    const config = generateOpenClawConfig({
      channels: [
        { channel: "telegram", credentials: { botToken: "test-bot-token" } },
      ],
      models: [
        { provider: "minimax", apiKey: "minimax-key" },
        { provider: "kimi-coding", apiKey: "kimi-key" },
      ],
      activeModel: "minimax/MiniMax-M2.1",
      agent: { name: "SunClaw", avatar: "☀️" },
      gateway: { bind: "lan" },
    });

    const providers = (config.models as any).providers;
    expect(providers.minimax).toBeDefined();
    expect(providers["kimi-coding"]).toBeDefined();
    expect(providers["kimi-coding"].api).toBe("anthropic-messages");
    expect(providers.minimax.api).toBe("anthropic-messages");
    expect((config as any).agents.defaults.model).toEqual({ primary: "minimax/MiniMax-M2.1" });

    // Telegram channel should be configured (enabled is NOT on channel config)
    expect((config.channels as any).telegram.enabled).toBeUndefined();
    expect((config.plugins as any).entries.telegram.enabled).toBe(true);
  });
});

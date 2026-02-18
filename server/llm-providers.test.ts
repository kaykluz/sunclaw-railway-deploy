import { describe, expect, it } from "vitest";
import { PROVIDERS, getProviderList } from "./llm-failover";
import type { ProviderConfig } from "./llm-failover";

describe("LLM Provider Registry", () => {
  it("contains all expected providers", () => {
    const expectedProviders = [
      "openai",
      "anthropic",
      "google",
      "moonshot",
      "kimi-coding",
      "groq",
      "cerebras",
      "mistral",
      "xai",
      "openrouter",
      "venice",
      "deepseek",
      "zai",
      "opencode",
      "vercel-ai-gateway",
      "synthetic",
      "minimax",
      "qwen",
      "qianfan",
      "bedrock",
      "github-copilot",
      "ollama",
    ];

    for (const id of expectedProviders) {
      expect(PROVIDERS[id], `Provider "${id}" should exist`).toBeDefined();
    }
  });

  it("has at least 22 providers registered", () => {
    const count = Object.keys(PROVIDERS).length;
    expect(count).toBeGreaterThanOrEqual(22);
  });

  it("every provider has required fields", () => {
    for (const [id, provider] of Object.entries(PROVIDERS)) {
      expect(provider.id, `${id} should have matching id`).toBe(id);
      expect(provider.name, `${id} should have a name`).toBeTruthy();
      expect(provider.baseUrl, `${id} should have a baseUrl`).toBeTruthy();
      expect(provider.defaultModel, `${id} should have a defaultModel`).toBeTruthy();
      expect(typeof provider.authHeader, `${id} should have authHeader function`).toBe("function");
      expect(["openai", "anthropic"], `${id} should have valid apiFormat`).toContain(provider.apiFormat);
      expect(typeof provider.freeTier, `${id} should have freeTier boolean`).toBe("boolean");
      expect(provider.description, `${id} should have a description`).toBeTruthy();
      expect(Array.isArray(provider.models), `${id} should have models array`).toBe(true);
      expect(provider.models.length, `${id} should have at least 1 model`).toBeGreaterThanOrEqual(1);
      expect(["builtin", "custom", "local", "gateway"], `${id} should have valid category`).toContain(provider.category);
    }
  });

  it("Moonshot/Kimi provider has correct configuration", () => {
    const moonshot = PROVIDERS["moonshot"];
    expect(moonshot).toBeDefined();
    expect(moonshot.name).toBe("Moonshot AI (Kimi)");
    expect(moonshot.baseUrl).toBe("https://api.moonshot.ai/v1");
    expect(moonshot.defaultModel).toBe("kimi-k2.5");
    expect(moonshot.apiFormat).toBe("openai");
    expect(moonshot.freeTier).toBe(true);
    expect(moonshot.models.length).toBeGreaterThanOrEqual(3);

    // Check that kimi-k2.5 is in the models list
    const kimiModel = moonshot.models.find(m => m.id === "kimi-k2.5");
    expect(kimiModel, "Should have kimi-k2.5 model").toBeDefined();
    expect(kimiModel!.name).toBe("Kimi K2.5");
  });

  it("Kimi Code provider has correct configuration (Anthropic format)", () => {
    const kimiCoding = PROVIDERS["kimi-coding"];
    expect(kimiCoding).toBeDefined();
    expect(kimiCoding.name).toBe("Kimi Code");
    expect(kimiCoding.baseUrl).toBe("https://api.kimi.com/coding");
    expect(kimiCoding.defaultModel).toBe("kimi-k2.5");
    expect(kimiCoding.apiFormat).toBe("anthropic");
    expect(kimiCoding.freeTier).toBe(true);
    // Should have kimi-k2.5 model
    const model = kimiCoding.models.find(m => m.id === "kimi-k2.5");
    expect(model, "Should have kimi-k2.5 model").toBeDefined();
    // Auth should return raw key (for x-api-key header)
    expect(kimiCoding.authHeader("test-key")).toBe("test-key");
  });

  it("MiniMax provider has correct Anthropic configuration", () => {
    const minimax = PROVIDERS["minimax"];
    expect(minimax).toBeDefined();
    expect(minimax.baseUrl).toBe("https://api.minimax.io/anthropic");
    expect(minimax.defaultModel).toBe("MiniMax-M2.1");
    expect(minimax.apiFormat).toBe("anthropic");
    expect(minimax.freeTier).toBe(true);
    expect(minimax.models.length).toBeGreaterThanOrEqual(3);
    // Auth should return raw key (for x-api-key header)
    expect(minimax.authHeader("test-key")).toBe("test-key");
  });

  it("Groq provider has correct free-tier configuration", () => {
    const groq = PROVIDERS["groq"];
    expect(groq).toBeDefined();
    expect(groq.baseUrl).toBe("https://api.groq.com/openai/v1");
    expect(groq.freeTier).toBe(true);
    expect(groq.apiFormat).toBe("openai");
  });

  it("Cerebras provider has correct free-tier configuration", () => {
    const cerebras = PROVIDERS["cerebras"];
    expect(cerebras).toBeDefined();
    expect(cerebras.baseUrl).toBe("https://api.cerebras.ai/v1");
    expect(cerebras.freeTier).toBe(true);
  });

  it("Mistral provider has correct free-tier configuration", () => {
    const mistral = PROVIDERS["mistral"];
    expect(mistral).toBeDefined();
    expect(mistral.baseUrl).toBe("https://api.mistral.ai/v1");
    expect(mistral.freeTier).toBe(true);
    // Should include Codestral
    const codestral = mistral.models.find(m => m.id === "codestral-latest");
    expect(codestral, "Should have Codestral model").toBeDefined();
  });

  it("Anthropic provider uses anthropic API format", () => {
    const anthropic = PROVIDERS["anthropic"];
    expect(anthropic).toBeDefined();
    expect(anthropic.apiFormat).toBe("anthropic");
    expect(anthropic.authHeader("test-key")).toBe("test-key");
  });

  it("Synthetic provider uses anthropic API format", () => {
    const synthetic = PROVIDERS["synthetic"];
    expect(synthetic).toBeDefined();
    expect(synthetic.apiFormat).toBe("anthropic");
    expect(synthetic.baseUrl).toContain("anthropic");
    // Auth should return raw key (for x-api-key header)
    expect(synthetic.authHeader("test-key")).toBe("test-key");
  });

  it("OpenAI-compatible providers use Bearer auth", () => {
    const openaiCompatible = ["openai", "google", "moonshot", "groq", "cerebras", "mistral", "xai", "openrouter", "venice", "deepseek"];
    for (const id of openaiCompatible) {
      const provider = PROVIDERS[id];
      expect(provider, `${id} should exist`).toBeDefined();
      expect(provider.authHeader("test-key"), `${id} should use Bearer auth`).toBe("Bearer test-key");
    }
  });

  it("Ollama provider does not require auth", () => {
    const ollama = PROVIDERS["ollama"];
    expect(ollama).toBeDefined();
    expect(ollama.freeTier).toBe(true);
    expect(ollama.category).toBe("local");
    expect(ollama.authHeader("")).toBe("");
  });

  it("free-tier providers are correctly marked", () => {
    const freeTierIds = ["google", "moonshot", "kimi-coding", "groq", "cerebras", "mistral", "zai", "qwen", "qianfan", "ollama", "openrouter", "minimax"];
    for (const id of freeTierIds) {
      const provider = PROVIDERS[id];
      expect(provider, `${id} should exist`).toBeDefined();
      expect(provider.freeTier, `${id} should be marked as free tier`).toBe(true);
    }
  });

  it("paid providers are correctly marked", () => {
    const paidIds = ["openai", "anthropic", "xai", "venice", "deepseek", "synthetic"];
    for (const id of paidIds) {
      const provider = PROVIDERS[id];
      expect(provider, `${id} should exist`).toBeDefined();
      expect(provider.freeTier, `${id} should NOT be marked as free tier`).toBe(false);
    }
  });
});

describe("getProviderList()", () => {
  it("returns all providers with display-safe fields", () => {
    const list = getProviderList();
    expect(list.length).toBeGreaterThanOrEqual(22);

    for (const item of list) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.defaultModel).toBeTruthy();
      expect(typeof item.freeTier).toBe("boolean");
      expect(item.description).toBeTruthy();
      expect(Array.isArray(item.models)).toBe(true);
      expect(["builtin", "custom", "local", "gateway"]).toContain(item.category);
    }
  });

  it("does not expose authHeader function", () => {
    const list = getProviderList();
    for (const item of list) {
      expect((item as any).authHeader).toBeUndefined();
    }
  });

  it("includes Kimi/Moonshot in the list", () => {
    const list = getProviderList();
    const moonshot = list.find(p => p.id === "moonshot");
    expect(moonshot).toBeDefined();
    expect(moonshot!.name).toContain("Kimi");
  });
});
